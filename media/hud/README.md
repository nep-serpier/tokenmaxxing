# Tavern HUD and offices: media

Code: branch `feat/tavern` at 7fd91a6 (2caed88 plus the "room is called The Tavern" fix; the server was restarted onto it).
Own server on port 8813, seeded with 13 players (levels 1 to 40, 150 days of history for the richest), 2 companies. 1440x900 unless noted.

Important: the quest UI only exists from `LEGACY_FROM = 2026-10-26` (core/src/quests.ts). The machine date is 2026-10-22, so on the real
clock there are no quests, no tracker and an empty `wallet.quests`. The quest shots (01, 02, 04, a, a2) were taken with the server's JS clock shifted
+5 and +6 days through a `bun --preload` Date override outside the repo (no source touched). Everything else ran on the real clock.

## Stills
- 01-quest-tracker-pips-beside-coins.png: the three pips beside the coin counter, partly filled (3x crop).
- 01b-quest-tracker-full-screen.png: same, whole screen.
- 01c-quest-tracker-coffee-quest-day.png: tracker on a day with a coffee quest (crop).
- 02-quests-panel-today-mixed-progress.png: Quests panel, three bars at 48%, 50%, 28%, plus the weekly row below.
- 02b-quests-panel-with-town-quest.png: panel with the in-town coffee quest at 0/1.
- 02c-quests-panel-coffee-done.png: same after coffee at the machine: 1/1 done, weekly 2/8.
- 04-quest-done-toast.png: quest-done toast (token quest completed by an ingest) with the panel open.
- 04b-quest-done-toast-coffee.png: quest-done toast after coffee, with the "fresh cup" dialog.
- 05a-collection-overview.png: Collection log, All tab.
- 05b-collection-usage-group.png: Usage group, tier frames, progress bars, greyed unearned entries with "how to earn".
- 06-hall-of-fame.png: Hall of Fame: rarest honours with holders, this week's firsts, winners of the week (empty).
- 06b-hall-of-fame-not-ready-fresh-server.png: the "wall is being polished" state, from a second fresh server (port 8814, since stopped) before its first sweep.
- 07-award-toast-town-wide.png: "mira earned Shipper gold: 250 PRs" seen by another player (jonas) in the Tavern.
- 08a-card-rich-mira-01/02.png: v2 card of a level 40 player, top and bottom (header, XP bar, badges with progress bars, shelf slot, heatmap, How they work, stats, Computers).
- 08b-card-light-sofie-01.png: light-usage player (Apprentice, almost empty heatmap).
- 08c-card-offline-tobias-01.png: offline player (no green dot, "last active today", Pair Programmer).
- 08d-card-barkeep-01.png: the barkeep bot card.
- 09-card-3-pins-jonas-01/02.png: card with bio, Report link, 3 pins on the shelf.
- 09a-showcase-picker.png: the picker grid. 09b-card-3-pins-mira.png: after pinning 3 via the GIF flow.
- 10a-bio-editing.png, 10b-bio-saved.png: bio editor and result. 10c-report-button.png, 10d-report-sent.png: Report link and the "an admin will take a look" reply.
- 11-regulars-panel.png: Regulars panel (top 5 after 30+ minutes parked in the Tavern). 11a: Tavern at default zoom. 11b: whole room with plaques. 11c: plaque close-up.
- 12-open-offices-list.png: Open offices list with sizes and visitor counts.
- 13a, 13b-decor-panel-*-freja-lv10.png: Decor panel wallpapers and floors for a level 10 owner (prices, locked Lv 25 and Lv 40). 13c: for a level 40 owner.
- 14a-14b: 12x9 office at level 10 (plain, then Jacobsen plus Fiskebenet). 14c-14e: 14x10 at level 25 (plain, Hygge plus Linoleum, Tivoli plus Linoleum).
  14f-14i: 16x12 at level 40 (plain, Tivoli plus Bornholm, Nyhavn plus Parquet, Rundetaarn plus Checker). Whole room visible after zooming out twice (key `-`).
- 15-card-badges-and-collection-link.png: badge chips with progress underlines and the Collection link (crop of the card, before the bio was saved).
- 16a-16d: 1280x720 checks: card top, Collection, Open offices, Hall of Fame.

## GIFs
- a-quest-progress-bar-fills.gif: panel open, token quest bar fills to done after an ingest (cropped to the panel).
- a2-coffee-quest-in-town.gif: panel, walk to the Tavern machine, coffee, toast, panel shows 1/1 (3.3 MB).
- b-pin-badge-to-showcase.gif: picker, three pins, Save, shelf filled (cropped to the card).
- c-decor-switch-wallpaper-floor.gif: Decor panel, switching wallpapers then floors, panel closes on the final look.

## Problems found
1. Quests are invisible on the real clock (before 2026-10-26): no tracker, no panel content. Expected per the `LEGACY_FROM` note, but anything shown before that date will look as if the feature is missing.
2. Quests panel has no Today / Weekly / Done tabs (design quests.md): it is one list, the weekly quest is a section below, and there is no "Done" history. There is no company quest row either.
3. Regulars panel rows are glued: "1ida32m", "2emil32m" (rank, name and minutes with no spacing) (11-regulars-panel.png).
4. Regulars plaques in the room (11c): plates stack tightly and overlap each other and the hearth; the right plaque's "4.KASPER" runs past the plaque edge and is cut under the HUD at the default zoom.
5. Bio editor input is too narrow: a 76 character bio is clipped to its tail, and Cancel wraps onto its own line (10a-bio-editing.png). The first-visit "Pick a company" modal also opens over everything for new players (expected, but it blocks the Tavern on first load).
6. Showcase picker tiles have no visible names (icons only; trophies have no text at all), so you can't tell which is which without hovering (09a).
7. Heatmap: 30 days with all days within the same band render as the same colour, so the shading steps are barely visible for steady users (08a, 09). Tooltips are native `title` attributes.
8. Office minimap ignores size and decor (always the small plain beige room, see 14*). Cost on the card is the last stats tile, same style as the others (not visibly muted).
9. At 1280x720 the first-open office hint dialog ("Drop furniture...") overlaps the chat box and the card modal is cut off at the bottom (scrolls, 16a); the whole Tavern does not fit at default zoom.
10. Server log: every run prints `SQLite transaction coordinator is closed` plus `failed to sync scheduled actor alarm` at error level (21 pairs in one run), from player actors going to sleep or on restart. No console errors in any browser session. Guestbook is not present in the build (not captured).
11. Open offices: all show "0 visitors this week" even after visits (only owners visited, so probably right).

## Could not capture
- Heatmap hover tooltip GIF (d): the tooltip is a native `title` attribute, which headless Chromium never paints. No GIF made.
- Winners of the week in the Hall (raid, games, races): needs a raid kill or finished games; the section shows "Nobody has won anything yet."
- Fountain toss quest: no draw I could reach contained it (coffee was used for the in-town GIF).
- "Done" tab of Quests: does not exist.
- Hall of Fame not-ready state on the main server: the sweep had already run by the time I looked, so it comes from the fresh second server.
- Basement, guestbook: out of scope or absent.
