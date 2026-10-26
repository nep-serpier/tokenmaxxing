import { expect, test } from "bun:test";
import { installHeadlessGlobals } from "../src/render3d/perf/stubs.ts";

// The hotbar subscribes to the furnishing mode as soon as it loads. The game's modules import each other in a
// circle (furniture, input, the hotbar), so which one loads first decides whether that subscription finds its target.
// Loading them the way the app does must not throw: it once blanked the whole page.
test("the hotbar and the furnishing mode load in the app's order without throwing", async () => {
  installHeadlessGlobals();
  Object.assign((globalThis as unknown as { location: object }).location, { origin: "http://localhost:1" });
  await import("../src/game/input.ts");
  const { useHotbar, inMyOffice } = await import("../src/game/hotbar-state.ts");
  const { ghostListeners } = await import("../src/game/furniture-events.ts");
  expect(typeof useHotbar).toBe("function");
  expect(inMyOffice()).toBe(false);
  expect(ghostListeners.size).toBeGreaterThan(0);
});
