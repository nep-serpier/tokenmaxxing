// Sends horus a small burst of real-looking token events every 1.2 s for N seconds, so the counter ticks live.
import { createClient } from "rivetkit/client";
import type { registry } from "../src/actors/registry.ts";

const token = process.env.HORUS_TOKEN!;
const seconds = Number(process.argv[2] ?? 18);
const client = createClient<typeof registry>({ endpoint: "http://localhost:8815/api/rivet" });
const player = client.player.get(["1"], { params: { token } });
const run = Date.now().toString(36);
const end = Date.now() + seconds * 1000;
for (let n = 0; Date.now() < end; n++) {
  const t = Date.now();
  await player.ingest([
    {
      source: "claude_code",
      sessionId: `live-${run}`,
      agentId: null,
      messageId: `live-${run}-${n}`,
      requestId: null,
      timestamp: t,
      model: "claude-opus-4-1",
      messageType: "assistant",
      inputTokens: 12_000,
      outputTokens: 3_000,
      cacheCreationTokens: 0,
      cacheReadTokens: 250_000,
      reasoningTokens: null,
    },
  ]);
  await new Promise((r) => setTimeout(r, 1200));
}
process.exit(0);
