import { join } from "node:path";

/**
 * `/install.sh` and `/install.ps1`: install the CLI on a linked computer (ARCHITECTURE.md, "Linked
 * computers"), pointing it at this server. The app hands out
 * `curl -fsSL <server>/install.sh | sh -s -- link <code>` for macOS and Linux, and
 * `& ([scriptblock]::Create((irm <server>/install.ps1))) link '<code>'` for Windows.
 */
const SH = await Bun.file(join(import.meta.dir, "install.sh")).text();
const PS1 = await Bun.file(join(import.meta.dir, "install.ps1")).text();

/** An origin that's safe to put inside a shell or PowerShell string. */
const ORIGIN = /^https?:\/\/[A-Za-z0-9.-]+(:\d{1,5})?$/;

/** The origin the request came in on. Railway terminates TLS, so the scheme is in `x-forwarded-proto`. */
export function publicOrigin(req: Request): string | null {
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || url.protocol.slice(0, -1);
  const origin = `${proto}://${url.host}`;
  return ORIGIN.test(origin) ? origin : null;
}

const script = (template: string, contentType: string) => (req: Request) => {
  const origin = publicOrigin(req);
  if (!origin) return new Response("Bad host", { status: 400 });
  return new Response(template.replaceAll("__SERVER__", origin), {
    headers: { "content-type": `${contentType}; charset=utf-8`, "cache-control": "no-cache" },
  });
};

export const installScript = script(SH, "text/x-shellscript");

/** PowerShell's `irm` hands back a plain-text body as a string, ready for `[scriptblock]::Create`. */
export const installPowerShell = script(PS1, "text/plain");
