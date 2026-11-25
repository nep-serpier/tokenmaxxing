import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { dirname, join, win32 } from "node:path";
import { typedSwitch } from "hanzio";

/**
 * Keeps `tokenmaxxing run` going on a linked computer: a LaunchAgent on macOS, a systemd user unit on
 * Linux, a Scheduled Task at sign-in on Windows. All restart it when it crashes but not when it exits
 * cleanly, which it does once its token is revoked.
 */

const LABEL = "dk.hanskristoffer.tokenmaxxing.cli";
const UNIT = "tokenmaxxing.service";
const TASK = "Tokenmaxxing CLI";

/**
 * A service starts with a bare environment, so it gets the variables that decide where logs are and
 * where `gh` is, as they were when the computer was linked.
 */
const PASSED_ENV = [
  "PATH",
  "CLAUDE_CONFIG_DIR",
  "CODEX_HOME",
  "CURSOR_DATA_DIR",
  "CLAUDE_COWORK_DIR",
  "TOKENMAXXING_CLI_DIR",
  "POSTHOG_DESKTOP_DIR",
  "XDG_CONFIG_HOME",
];

/**
 * The CLI's own folder on Windows: its token, read positions, service script and log. Local, not
 * Roaming: the token belongs to this one computer, and so do the positions in its logs.
 */
export const windowsDir = (env: NodeJS.ProcessEnv = process.env, home = homedir()): string =>
  win32.join(env.LOCALAPPDATA || win32.join(home, "AppData", "Local"), "Tokenmaxxing CLI");

/** `$XDG_CONFIG_HOME`, or `~/.config` without one. */
export const configHome = (env: NodeJS.ProcessEnv = process.env): string =>
  env.XDG_CONFIG_HOME || join(homedir(), ".config");

export const serviceEnv = (env: NodeJS.ProcessEnv = process.env): Record<string, string> => {
  const passed = PASSED_ENV.flatMap((key) => {
    const value = env[key];
    return value ? [[key, value] as const] : [];
  });
  return Object.fromEntries(passed);
};

/** How to run `tokenmaxxing run`: the compiled binary itself, or Bun and this script from source. */
export function runCommand(): string[] {
  // A compiled Bun binary runs its entry from a virtual path: under `/$bunfs/` on Unix, and in a
  // `~BUN` folder on Windows.
  const compiled = Bun.main.startsWith("/$bunfs/") || Bun.main.includes("~BUN");
  return compiled ? [process.execPath, "run"] : [process.execPath, Bun.main, "run"];
}

const launchAgentPath = () => join(homedir(), "Library", "LaunchAgents", `${LABEL}.plist`);

const macLogPath = () => join(homedir(), "Library", "Logs", "Tokenmaxxing", "cli.log");

const xml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function launchAgent(program: string[], env: Record<string, string>, logPath: string): string {
  const strings = (xs: string[]) => xs.map((x) => `    <string>${xml(x)}</string>`).join("\n");
  const vars = Object.entries(env)
    .map(([k, v]) => `    <key>${xml(k)}</key>\n    <string>${xml(v)}</string>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
${strings(program)}
  </array>
  <key>EnvironmentVariables</key>
  <dict>
${vars}
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <dict>
    <key>SuccessfulExit</key>
    <false/>
  </dict>
  <key>ThrottleInterval</key>
  <integer>30</integer>
  <key>ProcessType</key>
  <string>Background</string>
  <key>StandardOutPath</key>
  <string>${xml(logPath)}</string>
  <key>StandardErrorPath</key>
  <string>${xml(logPath)}</string>
</dict>
</plist>
`;
}

const systemdUnitPath = () => join(configHome(), "systemd", "user", UNIT);

/**
 * systemd's own quoting: each word in double quotes, with `\`, `"`, `%` and `$` escaped. In a replacement
 * string `$$` writes one `$`, so `$$$$` writes the `$$` that systemd reads as a literal `$`.
 */
const quote = (s: string) => `"${s.replace(/[\\"]/g, "\\$&").replace(/%/g, "%%").replace(/\$/g, "$$$$")}"`;

export function systemdUnit(program: string[], env: Record<string, string>): string {
  const vars = Object.entries(env)
    .map(([k, v]) => `Environment=${quote(`${k}=${v}`)}`)
    .join("\n");
  return `[Unit]
Description=Tokenmaxxing: sends this computer's AI agent token usage to your account
Wants=network-online.target
After=network-online.target

[Service]
ExecStart=${program.map(quote).join(" ")}
${vars}
Restart=on-failure
RestartSec=30

[Install]
WantedBy=default.target
`;
}

async function sh(cmd: string[]): Promise<{ ok: boolean; out: string }> {
  try {
    const p = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
    const [out, err, code] = await Promise.all([
      new Response(p.stdout).text(),
      new Response(p.stderr).text(),
      p.exited,
    ]);
    return { ok: code === 0, out: `${out}${err}`.trim() };
  } catch (err) {
    return { ok: false, out: String(err) };
  }
}

/** One argument as `CommandLineToArgvW` reads it back: quoted when it has spaces, backslashes before a quote doubled. */
export const winQuote = (s: string): string => {
  if (s !== "" && !/[\s"]/.test(s)) return s;
  return `"${s.replace(/(\\*)"/g, '$1$1\\"').replace(/(\\+)$/, "$1$1")}"`;
};

/**
 * The batch file the task runs, as a Scheduled Task has no environment or log of its own: it sets the
 * variables from when the computer was linked, appends the output to the log, and runs `run` again 30
 * seconds after it fails, like the other two (Task Scheduler's own restart only covers a task that
 * can't start). A clean exit, once the token is revoked, ends it. Inside quotes cmd only reads `%`,
 * doubled here; a value with a `"` can't be set that way, and is left out.
 */
export function serviceScript(program: string[], env: Record<string, string>, log: string): string {
  const pct = (s: string) => s.replace(/%/g, "%%");
  // Outside quotes, cmd would read these as syntax.
  const word = (w: string) => {
    const q = winQuote(w);
    return /[&^|<>()]/.test(w) && !q.startsWith('"') ? `"${q}"` : q;
  };
  const lines = [
    "@echo off",
    ...Object.entries(env)
      .filter(([k, v]) => !/["=\r\n]/.test(k) && !/["\r\n]/.test(v))
      .map(([k, v]) => `set "${pct(k)}=${pct(v)}"`),
    ":run",
    `${program.map((w) => pct(word(w))).join(" ")} >> "${pct(log)}" 2>&1`,
    "if not errorlevel 1 exit /b 0",
    // cmd's way to wait 30 seconds without a keyboard (`timeout` needs one).
    "ping -n 31 127.0.0.1 >nul",
    "goto run",
  ];
  return `${lines.join("\r\n")}\r\n`;
}

/**
 * The task: at this user's sign-in, run `script` with no window (`conhost --headless`; a task's own
 * `Hidden` only hides it from Task Scheduler's list), with no time limit and one at a time. A task ends
 * when its user signs out. `user` is DOMAIN\name.
 */
export function taskXml(script: string, user: string | null): string {
  const who = user ? `\n      <UserId>${xml(user)}</UserId>` : "";
  // `/s /c ""…""`: cmd drops the outer quotes and keeps the ones round the path, whatever else is in
  // it (a Windows path can't hold a `"`).
  const args = `--headless cmd.exe /d /s /c ""${script}""`;
  return `<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>Tokenmaxxing: sends this computer's AI agent token usage to your account</Description>
  </RegistrationInfo>
  <Triggers>
    <LogonTrigger>
      <Enabled>true</Enabled>${who}
    </LogonTrigger>
  </Triggers>
  <Principals>
    <Principal id="Author">${who}
      <LogonType>InteractiveToken</LogonType>
      <RunLevel>LeastPrivilege</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <ExecutionTimeLimit>PT0S</ExecutionTimeLimit>
    <Priority>7</Priority>
    <RestartOnFailure>
      <Interval>PT1M</Interval>
      <Count>999</Count>
    </RestartOnFailure>
  </Settings>
  <Actions Context="Author">
    <Exec>
      <Command>conhost.exe</Command>
      <Arguments>${xml(args)}</Arguments>
    </Exec>
  </Actions>
</Task>
`;
}

const taskUser = (env: NodeJS.ProcessEnv = process.env): string | null =>
  env.USERNAME ? (env.USERDOMAIN ? `${env.USERDOMAIN}\\${env.USERNAME}` : env.USERNAME) : null;

const windowsScriptPath = () => win32.join(windowsDir(), "service.cmd");
const windowsLogPath = () => win32.join(windowsDir(), "cli.log");

/** schtasks reads UTF-16 with a byte order mark. */
const utf16 = (s: string) => Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(s, "utf16le")]);

/** Single-quoted for PowerShell. */
const psQuote = (s: string) => `'${s.replace(/'/g, "''")}'`;

async function installWindows(program: string[], env: Record<string, string>): Promise<ServiceResult> {
  const script = windowsScriptPath();
  await mkdir(dirname(script), { recursive: true });
  // A task left from an earlier link would ignore the new start (one at a time).
  await sh(["schtasks", "/End", "/TN", TASK]);
  await writeFile(script, serviceScript(program, env, windowsLogPath()));
  const definition = join(await mkdtemp(join(tmpdir(), "tokenmaxxing-")), "task.xml");
  try {
    await writeFile(definition, utf16(taskXml(script, taskUser())));
    const r = await sh(["schtasks", "/Create", "/TN", TASK, "/XML", definition, "/F"]);
    if (!r.ok) return { ok: false, why: `schtasks: ${r.out}` };
  } finally {
    await rm(dirname(definition), { recursive: true, force: true });
  }
  const started = await sh(["schtasks", "/Run", "/TN", TASK]);
  if (!started.ok) return { ok: false, why: `schtasks: ${started.out}` };
  return { ok: true, note: "It runs while you're signed in to Windows, and starts again at every sign-in." };
}

const gui = () => `gui/${process.getuid?.() ?? 0}`;

/**
 * `launchctl`, `systemctl --user` and `schtasks` reach this user's real service whatever `HOME` is, so tests and
 * runs from source set `TOKENMAXXING_NO_SERVICE=1` to keep their hands off it.
 */
const noService = () => process.env.TOKENMAXXING_NO_SERVICE === "1";

type ServiceResult = { ok: true; note?: string } | { ok: false; why: string };

/** Installs and starts the service. Where there's no service manager, says how to run it instead. */
export async function installService(): Promise<ServiceResult> {
  if (noService()) return { ok: false, why: "TOKENMAXXING_NO_SERVICE is set" };
  const program = runCommand();
  const env = serviceEnv();
  if (process.platform === "darwin") {
    const path = launchAgentPath();
    await mkdir(dirname(path), { recursive: true });
    await mkdir(dirname(macLogPath()), { recursive: true });
    await writeFile(path, launchAgent(program, env, macLogPath()));
    await sh(["launchctl", "bootout", `${gui()}/${LABEL}`]);
    const r = await sh(["launchctl", "bootstrap", gui(), path]);
    return r.ok ? { ok: true } : { ok: false, why: `launchctl: ${r.out}` };
  }
  if (process.platform === "linux" && Bun.which("systemctl")) {
    const path = systemdUnitPath();
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, systemdUnit(program, env));
    await sh(["systemctl", "--user", "daemon-reload"]);
    const r = await sh(["systemctl", "--user", "enable", "--now", UNIT]);
    if (!r.ok) return { ok: false, why: `systemctl: ${r.out}` };
    // Without lingering, user services stop at logout and don't start at boot: a workhorse nobody
    // logs in to would never sync.
    const user = process.env.USER ?? "";
    const linger = await sh(["loginctl", "enable-linger", user]);
    return linger.ok
      ? { ok: true }
      : { ok: true, note: `To keep syncing while you're logged out: sudo loginctl enable-linger ${user}` };
  }
  if (process.platform === "win32") return installWindows(program, env);
  return { ok: false, why: "no launchd, systemd or Task Scheduler here" };
}

/** Stops and removes the service. `running` false: called from the service itself, which exits next. */
export async function uninstallService(running = true): Promise<void> {
  if (noService()) return;
  if (process.platform === "darwin") {
    if (running) await sh(["launchctl", "bootout", `${gui()}/${LABEL}`]);
    await rm(launchAgentPath(), { force: true });
  } else if (process.platform === "linux" && Bun.which("systemctl")) {
    await sh(["systemctl", "--user", "disable", ...(running ? ["--now"] : []), UNIT]);
    await rm(systemdUnitPath(), { force: true });
    await sh(["systemctl", "--user", "daemon-reload"]);
  } else if (process.platform === "win32") {
    if (running) await sh(["schtasks", "/End", "/TN", TASK]);
    await sh(["schtasks", "/Delete", "/TN", TASK, "/F"]);
    // Not from the service itself: cmd is still reading its batch file until it exits.
    if (running) await rm(windowsScriptPath(), { force: true });
  }
}

/** Whether the service is running, as the service manager sees it; null where there's none. */
export async function serviceRunning(): Promise<boolean | null> {
  if (noService()) return null;
  if (process.platform === "darwin") {
    const r = await sh(["launchctl", "print", `${gui()}/${LABEL}`]);
    return r.ok && /state = running/.test(r.out);
  }
  if (process.platform === "linux" && Bun.which("systemctl"))
    return (await sh(["systemctl", "--user", "is-active", UNIT])).out === "active";
  if (process.platform === "win32") {
    // The state's name, unlike schtasks' output, isn't translated.
    const r = await sh([
      "powershell",
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      `(Get-ScheduledTask -TaskName ${psQuote(TASK)} -ErrorAction Stop).State`,
    ]);
    return r.ok && r.out === "Running";
  }
  return null;
}

/** Follows the service's log. */
export function logsCommand(): string[] | null {
  return typedSwitch(
    process.platform,
    {
      darwin: () => ["tail", "-n", "50", "-F", macLogPath()],
      linux: () => ["journalctl", "--user", "-u", UNIT, "-n", "50", "-f"],
      win32: () => [
        "powershell",
        "-NoProfile",
        "-Command",
        `Get-Content -LiteralPath ${psQuote(windowsLogPath())} -Tail 50 -Wait`,
      ],
    },
    () => null,
  );
}
