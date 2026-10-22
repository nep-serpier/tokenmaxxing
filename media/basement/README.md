# Basement net cafe: media

Captured at HEAD 2caed88 (branch feat/tavern) on my own server (port 8812, engine port 6452, `RAID_START_WEEK=2026-10-19` so a raid is live), with headless Chromium at 1440x900 and Playwright, plus bot players (15 seeded players: 8 standing or sitting in the basement, 6 in three live matches, 2 browsers). Many shots hide the HUD with `#hud{visibility:hidden}` set from the test script (no source touched) so the room is clear; the panel shots keep the HUD. Every image was opened and looked at before being listed.

## Stills
- `01-tavern-stairs.png`: the Tavern whole room (zoomed out), stairs `S` visible in the bottom wall at the left, the exit door to the right of it, player standing in front.
- `02-basement-whole.png`: the whole basement: racks, big screen with 3 live matches, two wall terminals, neon, 5 cabinets, vending, foosball, PC desks, sofa, stairs. Also shows problem 1 (aisle avatars cut off by the monitors).
- `03-bigscreen-live.png`: big screen close-up (zoomed in) with Hype Cycle, Due Diligence and Ship, Pivot, Raise rows (headline plus player names).
- `04-cabinets-row.png`: the five cabinets, each with its own marquee glow colour, zoomed in.
- `05a-cabinet-spr-new-table.png`: E on the left cabinet (spr) with no open table: "Open a table" panel with Ship, Pivot, Raise preselected.
- `05b-cabinet-sprint-open-table-first.png`: E on the sprint cabinet while someone has an open sprint table: "Waiting for players" with the Join row listed first, Sprint preselected below.
- `06a-terminal-left-leaderboard.png`: E on the left wall terminal opens the leaderboard.
- `06b-terminal-right-raid.png`: E on the right wall terminal opens the raid panel (boss HP 524.8M of 2.0B).
- `06c-terminals-closeup.png`: the two terminals at 8x: left has three coloured bars (top three today), right a boss HP bar (about 27%, yellow).
- `07a-normal-lighting.png` and `07b-lan-party-lighting.png`: same spot and zoom, normal evening vs Friday 20:00 Copenhagen (client `Date.now` shifted by an init script). LAN: magenta big screen text and glow, pink desk glows, faster neon.
- `08-busy-basement.png`: 8 avatars (sitting at PCs and on the sofa, at the foosball, in front of the cabinets and vending, one just arrived at the stairs), plus an open Sprint table label.
- `09-spectate-hype.png`, `09-spectate-dice.png`, `09-spectate-spr.png`: matches opened by clicking their row on the big screen, seen by a non-player (see "Spectator check").
- `10a-stairs-from-tavern-side.png`: the stairs from the Tavern side at 4x with the player standing in front of them.
- `10b-basement-arrival-after-stairs.png`: just after going down: the player stands directly above the basement stairs, as designed (stairs up at (10,12), arrival (10,11)). Coming back up lands at (3,12) in the Tavern, in front of `S`.

## GIFs
- `gif-a-stairs-down.gif` (4.4 s, 1.1 MB): walks down the Tavern stairs into the basement, walks around.
- `gif-b-bigscreen-updating.gif` (10 s, 3.7 MB): big screen crop; rows go from "Starting…" to "Round 2/3" and "Round 2 · 1-0" as the matches progress.
- `gif-c-walk-to-cabinet.gif` (5.3 s, 1.5 MB): walk to the sprint cabinet, press E, the new-table panel opens.
- `gif-d-lan-glow.gif` (4 s, 1.7 MB): LAN-party glow pulsing (neon and screen glows).

## Spectator check (no hidden info on the wall or for non-players)
Checked on screen (non-player `bo` opened each match from the wall) and over the API (`match.frame()` for a non-player, plus the world snapshot's `games`):
- Wire `WorldGame` (what the wall uses): only id, game, spot, players, seats, status, board, watchers, headline, endsAt. No `view` and no state.
- Hype: current round shows only the live multiplier curve and the provably-fair hash. Seed and crash are `null` until the round ends; past rounds show crash (shown on screen as the burst icon), as in the square.
- Dice: dice counts per player (public), the claim history and whose turn; `mine: null`, no faces. Panel says "Watching, side bets are closed".
- Ship, Pivot, Raise: wins and `picked` booleans only; `mine: null`; picks show only after the round resolves.
- Sprint (API only; the wall shows 3 rows and the sprint was the 4th): `mine: null`, only the word list (public to all), scores and timing; no typed text.

## Problems found
1. Avatars standing in the aisle directly above a PC row are cut off by the monitors: only the head and hat show (cy, dee, finn, ned in `02-basement-whole.png`; the row-8 and row-5 aisles). The desk sprites are about two tiles tall and drawn in front of whoever stands on the tile behind them. Repro: walk to y=8 (below desk row y=6 chairs) or y=5 (above the desk row at y=6) in the basement. Sitting at the chairs is fine (`08-busy-basement.png`).
2. In my running build (bundled at server start) the Tavern was called "The Inn" in the HUD: the room banner, the chat panel header and the minimap title (seen while walking to the stairs; I did not keep that screenshot). `roomName` in the working tree now says `TAVERN ? "The Tavern" : "The Inn"` (changed after my server started), so it is probably fixed; `web/src/game/render.ts:227` ("🛏 The Inn") and `input.ts:315` still say Inn (not checked on screen).
3. Big screen rows say "Starting…" until the first move or round change. Dice and Ship, Pivot, Raise stay "Starting…" until the first claim or pick (`game.headline` is null at start; `gif-b` shows it clearly). Suggest filling the headline when the match starts.
4. The five cabinets look identical except for the marquee glow colour, and nothing labels which game each one is; you only learn it by pressing E (`04-cabinets-row.png`).
5. The big screen shows 3 matches, so a 4th live match has no row and no "+1 more" hint: it can't be spectated from the wall (a Sprint race was the 4th in my test).
6. LAN-party lighting is keyed on `Date.now()`, not the dev `?sky=` clock (`web/src/game/basement.ts`: `isLanParty(Date.now())`), so `?sky=...Friday 20:00` does not preview it; I had to shift `Date.now` in the page. Code reading only, not tried with `?sky=`.
7. Terminal live values are very small at the default zoom (bars only, no numbers; by design per `terminals()`), so the wall terminals read as decoration unless you zoom in (`06c`).
Not a bug (so you don't chase it): stairs round trip, spawn tiles, E on cabinets, terminals and the wall rows all worked; the browser console had no errors or warnings in any run. The "Pick a company" modal opens for players without a company and eats arrow keys until closed (Escape).
Server log: no `[uncaughtException]`/`[unhandledRejection]`. It has many rivetkit `level=error` lines ("sqlite transaction coordinator is closed", "Connection event sender is not configured") when match actors sleep after a match ends and when my bots drop match connections; looks like engine noise from my harness churn, not the basement. I also hit the proxy's 429 once (too many requests from one IP) when 15 bots and browsers polled from localhost.

## Could not capture
- A Sprint spectate screenshot: the wall only lists 3 matches and the sprint was the 4th (the API check is above).
- Real clock evening shots: this machine's date is Thursday, so LAN needed the `Date.now` shift. `?clock=` and `?sky=` do not affect the basement (constant dim light).
- A watcher count (the 👀 N chip) on the wall: the bot watcher (a plain client without the panel open) doesn't count, and the one browser spectator closed the panel before the next frame; the code only draws the chip when watchers is above 0. Not confirmed on screen.
- Foosball, the vending machine and the neon sign are in the shots but E on them was not exercised (not part of the design).
