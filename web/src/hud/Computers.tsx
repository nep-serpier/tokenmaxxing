import type { DeviceInfo } from "@tokenmaxxing/server/registry";
import { useEffect, useState } from "react";
import { connectPlayer, withPlayer } from "../net.ts";
import { tauri } from "./AppUpdate.tsx";
import { PhonePairing } from "./PhonePairing.tsx";
import { useRun } from "./ui.tsx";

const PLATFORMS: Record<string, string> = { darwin: "macOS", linux: "Linux", win32: "Windows" };

const devices = () => withPlayer((p) => p.devices());

/** The lines that link another computer: one for a macOS or Linux terminal, one for PowerShell. */
interface Lines {
  command: string;
  windowsCommand: string | null;
}

/** Both lines from the app; an app from before Windows had only the one. */
async function linkLines(): Promise<Lines> {
  const invoke = tauri!.core.invoke;
  try {
    return await invoke<Lines>("link_computer_lines");
  } catch {
    return { command: await invoke<string>("link_computer"), windowsCommand: null };
  }
}

/** "just now", "5 min ago", "3 h ago", "2 days ago". */
function ago(at: number, now: number): string {
  const min = Math.floor((now - at) / 60_000);
  if (min < 2) return "just now";
  if (min < 60) return `${min} min ago`;
  if (min < 48 * 60) return `${Math.floor(min / 60)} h ago`;
  return `${Math.floor(min / (24 * 60))} days ago`;
}

/**
 * On my own card: the computers whose usage counts for me (ARCHITECTURE.md, "Linked computers"). The app makes the line that
 * links another one; a plain browser can't, as only the app may.
 */
export function Computers() {
  const [list, setList] = useState<DeviceInfo[] | null>(null);
  const [lines, setLines] = useState<Lines | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const { error, busy, run } = useRun();

  useEffect(() => {
    void devices().then(setList, () => {});
  }, []);
  // While a line is out, watch for the new computer to show up, over one connection for the while.
  useEffect(() => {
    if (!lines) return;
    const player = connectPlayer();
    // Every 5 s, so a computer shows up within a few seconds of linking.
    const id = setInterval(() => void player.devices().then(setList, () => {}), 5000);
    return () => {
      clearInterval(id);
      player.dispose();
    };
  }, [lines]);

  const link = run(async () => {
    setLines(await linkLines());
    setCopied(null);
  });
  const copy = (line: string) =>
    run(async () => {
      await navigator.clipboard.writeText(line);
      setCopied(line);
    });
  const line = (label: string, text: string) => (
    <>
      <p className="small">{label}</p>
      <div className="command">
        <code>{text}</code>
        <button type="button" onClick={copy(text)}>
          {copied === text ? "Copied" : "Copy"}
        </button>
      </div>
    </>
  );
  const remove = (id: number) =>
    run(async () => {
      await withPlayer((p) => p.revokeDevice(id));
      setList(await devices());
    });

  const now = Date.now();
  return (
    <>
      <h3>Computers</h3>
      <p className="muted small">Tokens from every computer you link count for you.</p>
      {list && (
        <ul className="members">
          {list.map((d) => (
            <li key={d.id}>
              <span>
                {d.kind === "app" ? "💻" : "🖥"} {d.name}{" "}
                <small className="muted">
                  {d.kind === "app" ? "this Mac" : (PLATFORMS[d.platform] ?? d.platform)}
                  {d.kind === "linked" && ` · synced ${ago(d.lastSeenAt, now)}`}
                </small>
              </span>
              {d.kind === "linked" && (
                <button type="button" className="link" disabled={busy} onClick={remove(d.id)}>
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {!tauri ? (
        <p className="muted small">To link another computer, open the world from the app.</p>
      ) : lines ? (
        <>
          {line("On macOS or Linux, run this in a terminal:", lines.command)}
          {lines.windowsCommand && line("On Windows, run this in PowerShell:", lines.windowsCommand)}
          <p className="muted small">
            It works once, for 10 minutes. The computer shows up here once it's linked.
          </p>
        </>
      ) : (
        <button type="button" className="primary" disabled={busy} onClick={link}>
          Link a computer
        </button>
      )}
      {error && <p className="error">{error}</p>}
      <PhonePairing />
    </>
  );
}
