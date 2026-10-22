# Tavern (new features): media

Code: local branch `feat/tavern` at 646e5f7, no source changed. Own server (PORT 8820, engine 7620, storage /tmp/media-tavern-new), 7 seeded players
(hugo, mira, jonas, sofie, tobias, freja, emil), played as hugo at 1440x900, zoomed out two steps (key `-`) so the whole room fits.
Seeding: `town.tavernMinutes` called through an internal client from a `bun --preload` outside the repo (this week: hugo 5.0h, mira 4.0h, jonas 2.1h, sofie 1.5h,
tobias 1.0h; last week jonas won, so he wears the crown). The award remark was sent through `world.announceTown(text, undefined, remark)`, the same call `town` makes.
For the empty-room line the preload swapped the barkeep's pool to his empty-room lines only (the real line pool is random); hugo was alone in the room.

## Files
- 01-tavern-full.png: whole Tavern. Jukebox on the west wall, bar tab chalkboard on the north wall (4 tiles, top left) with the 5 regulars, crown beside JONAS, plaques by the hearth (HUG MIR JON / SOF TOB).
- 01b-tavern-full-at-jukebox.png: same, hugo standing at the jukebox facing it.
- 02-bar-tab-chalkboard-closeup.png: chalkboard at 3x. 02b-jukebox-tile-closeup.png: jukebox tile at 4x.
- 03-jukebox-panel-idle.png: Jukebox panel, "Nothing playing", six track cards (name, length, Play), Mute checkbox, volume slider.
- 04-jukebox-panel-playing.png: after pressing Play (Merge Conflict Polka): now-playing line "on by hugo", Skip (0/1), the playing card outlined.
- 05-tavern-jukebox-playing.png: room after closing the panel with the track playing (no visual change on the jukebox, audio only).
- 06-regulars-panel-via-plaque.png: Regulars panel with the crown on jonas and the "had the most time last week" footer (opened from the hearth plaque, see problem 1).
- 07-barkeep-award-remark.png: barkeep bubble "mira just hit gold in Shipper" plus the town toast.
- 08-barkeep-empty-room-line.png, 08b-barkeep-empty-room-closeup.png: bubble "Empty room. More special for me." (3x crop).
- 09-tavern-stairs-up-tile.png: hugo above the stairs-up tile; 09b-tavern-stairs-tiles-closeup.png: the two stair tiles (basement left, up right) at 3x.
- 10-upstairs-dorm-arrival.png: Upstairs dorm after climbing: two rows of beds, six sleepers (name, Lv4, computer badge) in the top row, rug, stairs down at the bottom. 10b-upstairs-stairs-down-closeup.png: stairs-down tile at 3x.
- 11-gif-stairs-down-to-tavern.gif: starts upstairs, walks down the stairs into the Tavern (about 5 s; the climb back up did not trigger, the held key was swallowed on arrival, which is the intended anti-bounce).
- 12-shop-grid.png, 12b-shop-grid-hats.png, 12c-shop-grid-furniture.png: Shop grid; price/lock/raid-drop buttons sit on one line at the bottom of every card, also in rows with 1-line and 4-line descriptions and in the Furniture tab.

## Problems seen
1. The bar tab chalkboard cannot be opened. It hangs over tiles `J` (y=2) which are only reachable from the barkeep's rug (y=3, nobody but him can step there); clicking it and walking up to the bar does nothing, E at the bar opens Quests. The Regulars panel is only reachable through the hearth plaques (`P`).
2. The barkeep's name plate ("Bent the Barkeep . Lv30") is drawn over the bottom row of the chalkboard, covering TOBIAS's hours (reads cut off).
3. Barkeep speech bubbles (07, 08) sit on top of the chalkboard rows (hours of MIRA/JONAS/SOFIE hidden while a bubble shows). The 5th row is tight against the board's bottom edge.
4. Jukebox panel: while a track plays all Play buttons stay fully lit although they are disabled (only the playing card gets an outline). The volume slider has no visible label and sits on its own line under Mute.
5. The jukebox tile gives no sign it is playing (no notes, glow); audio only.
6. The two stair tiles on the south wall (basement and up) look identical, no label or arrow.
7. Upstairs: sleeper name chips sit over the sleepers' heads; the HUD side panels cover the top-right beds at 1440x900.
8. Shop: with 9 coins the price pills for unaffordable items look the same as affordable ones (cosmetic, not tested by clicking).
