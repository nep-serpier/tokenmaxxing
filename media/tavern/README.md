# Tavern room media

Captured headless (Chromium, 1440x900 unless noted) against a local server running `feat/tavern` at 7fd91a6
(the first pass ran on 2caed88; the room-name fix landed meanwhile, so everything here was re-shot on 7fd91a6).
Seed: 6 players (Lv 2 to Lv 32), company "Arox" with HQ, two open offices, agents running today.
Avatars in the room are real sessions (Claude-driven browsers), time-of-day shots use `?sky=` (client only).
The day shots are the real Copenhagen morning (about 10:30). Night is `?sky=2026-10-22T22:30`/`T23:00`, dusk `T17:40`.
Scale 3 shows the whole 24x14 room; scale 4 and up are zoomed (the HUD then covers the east side, so many shots also exist with the HUD hidden).

## Stills

- 01-town-inn-door.png: town square with the Inn building, its "🛏 The Inn" sign and the chalkboard A-frame, avatar standing at the door.
- 02-tavern-day-whole.png: whole room by day, HUD hidden: bar and cell, boards, Hall of Fame wall, beds, stage, tables, hearth with plaques, sofa, stairs, exit.
- 02b-tavern-day-whole-hud.png: same with the HUD on.
- 03-tavern-night-whole.png: whole room at night: hearth glow, table and bar lamps, wall sconces, notes over the stage.
- 03b-tavern-night-whole-b.png: same, a second later (different notes and flicker).
- 03c-tavern-dusk-whole.png: whole room at 17:40 (12 min before sunset).
- 04-barkeep-closeup-bubble.png: Bent the Barkeep with a speech bubble (HUD on), player at the tap.
- 04b-barkeep-closeup-clean.png: same, HUD hidden.
- 05-bar-tap-stools.png: the bar, the gold tap and mug, three stools, player at the tap.
- 06-quest-board-panel.png: E on the quest board opens the Quests panel (3 dailies, weekly).
- 06a-quest-board-wall.png: the quest board and the indoor chalkboard on the north wall.
- 07-hall-of-fame-panel.png: Hall of Fame panel (rarest honours with holders, week's firsts, winners).
- 07a-hall-of-fame-wall.png: the Hall of Fame frames on the wall.
- 08-hearth-plaques-panel.png: E on the plaque opens "The regulars" with the weekly top 3.
- 08a-hearth-plaques-wall.png: hearth between its two plaques, with the first plaque's names showing (see Problems 1).
- 08b-plaques-names-closeup.png: zoomed (x8) on the same, names "1.BJORNF1U 2.CLARAF1U 3.DORTEF1U".
- 09-stage-night-notes.png: stage at night, player on the boards, music notes rising.
- 09b-hearth-night-closeup.png: hearth at night with the glow, notes in the background.
- 10-busy-room-sleepers-sign.png: room with 4 players, the barkeep and the "2 asleep" sign (HUD on).
- 10b-busy-room-clean.png: same, HUD hidden.
- 11-open-offices-panel.png: E on the west-wall board opens "Open offices" (my office, two Visit rows).
- 11a-open-offices-board-wall.png: the board on the west wall (row 6), player facing it.
- 11b-stairs-down.png: stairs down at the bottom-left, player beside them.
- 12-tap-before-serving.png: player at the tap, no special active yet.
- 12a-special-served-notice.png: after E at the tap: "From the salad bar: lettuce rebase. On the house. You buzz for 15 minutes."
- 12b-special-already-active.png: second E while active: "You've still got the last one in you."
- 12c-special-effect-closeup.png: x8 on the player while buzzing (jitter is a shake, best seen in gif-c).
- 13-sitting-on-stool.png: player seated on a bar stool.
- 14-coffee-machine.png: coffee at (22,3): "A fresh cup. You feel a little buzz." (player hidden under the HUD column at this zoom).
- 15-sitting-on-sofa.png: player seated on the sofa below the hearth.
- 16-sitting-at-table.png: player seated on a table chair.
- 17-tavern-1280x720-hud.png / 17b-tavern-1280x720-clean.png: the whole room at 1280x720 (scale 3), HUD on and off.

## GIFs (720 px wide, 9-10 fps)

- gif-a-walk-in.gif: out of the town square through the Inn door and across the room to the hearth (7 s).
- gif-b-hearth-night-glow.gif: hearth flicker, glow and stage notes at night (4 s).
- gif-c-special-at-tap.gif: E at the tap, the notice, then the jitter (8 s, HUD on).
- gif-d-barkeep-talking.gif: the barkeep's speech bubble appearing and fading (7 s).
- gif-e-sit-on-stool.gif: walking up and sitting on a stool (5 s).

## Problems found

1. Plaque plates are bigger than the plaque and float over the room (08a, 08b, 10). The three plates ("1.BJORNF1U" etc.)
   are drawn as one stack, about 2.7 tiles wide, above the left plaque: they cover the top of the hearth/chimney and hide the
   body of anyone standing at (15..17,8) (dortef1u disappears behind them in 08b). The right plaque stays blank (only 3 regulars,
   so expected, but it reads as if nothing is on it). Repro: be a top-5 regular (30+ min), stand at (16,10), look up.
2. Regulars panel rows are mashed together (08-hearth-plaques-panel.png): "1bjornf1u36m", "2claraf1u36m": no gap between the
   rank, the name and the minutes inside the chip, and the rank is shown twice (the list number "1." plus the digit in the chip).
3. The "N asleep" sign sits on top of the indoor chalkboard (all room shots, e.g. 06a): it covers the chalkboard's right edge.
4. Name labels of neighbours overlap ("bjornf1u · Lv2|dortef1u · Lv4" in 02, 03, 10, 17); a general label issue, but the room's
   hearth corner is where people cluster.
5. Open offices panel layout (11): the "visitors this week" text wraps mid-phrase ("0 visitors this / week") and the buttons are
   different widths ("My office" is taller and sits further left than the two "Visit" buttons), so the rows do not line up.
6. Hall of Fame panel (07): the holder links render as "astridf1u , bjornf1u ," with a space before each comma.
7. The first time the Hall of Fame is opened on a fresh server it says "The wall is being polished. Look again in a little while."
   (seen on the first run, filled within a minute or two; fine, but the empty state has no retry or hint).
8. Night and dusk are subtle: at 22:30 the room is only slightly darker than by day (03 vs 02), the glows carry the effect;
   at 17:40 (03c) it is indistinguishable from day. The "night dim" in the design reads weak, and a clear dusk step is missing.
9. HUD cards (leaderboard, games, raid) cover the east third of the room at scale 4 and up: the stage, beds and coffee machine
   are hidden when you stand there (14-coffee-machine.png shows no avatar at all).
10. The sign above the Inn door in the town (01) still reads "🛏 The Inn" while the room, minimap and chat now say
    "The Tavern" (7fd91a6 fixed the room name; the sign is hard-coded at `web/src/game/render.ts:227`). On 2caed88 the
    minimap and chat also said "The Inn".

Not a bug but worth knowing: the barkeep says "Early one. The fire's just warming up." at 10:38, which is a bit late for "early".

## Could not capture

- The `glow` variant of the daily special: the special rotates by Copenhagen day on the server and today's is the jitter one
  (`?sky=`/`?clock=` do not move the server's day). The jitter variant is in 12a, 12c and gif-c.
- The Tavern in rain/snow: not asked, skipped.
- The barkeep line for a given crowd or weather: the line is random per bubble, so only the morning lines were caught.
- Sleepers in the dorm beds: sleepers are only a count (the sign); no avatars are drawn in beds by design.
