# Basement: tournament board, big screen, champion crown, company merch

Branch `feat/tavern` at 646e5f7 (local branch `media/basement-new`, no source changes). Own server on port 8795, engine 7690, storage `/tmp/media-basement-new`. Browser: Playwright Chromium, 1800x1200 for whole-room views (the room only fits whole at that size with the camera centred), 1440x900 for the merch panels. Test users: hero (owner of "Pixel Forge"), ada, bram (members), cleo, dax, elio, fenn, gus.

The tournament board is tile `i` on the back wall (the small bracket icon left of the pink "SHIP IT" neon). The big screen is the `E` run on the back wall.

## Files

### 1. Basement full view, board and big screen
- `01-basement-whole-no-bracket.png`: whole basement, no tournament, big screen idle ("No matches live"), board icon top right, hero at the board.
- `02-tournament-board-closeup.png`: the board icon beside the "SHIP IT" neon, 3x zoom (crop of 01).
- `04-basement-whole-livestream.png`: whole room with two live matches on the big screen (Hype Cycle cleo vs dax, Due Diligence elio vs fenn).
- `05-bigscreen-livestream-closeup.png`: big screen close-up, livestream rows (crop of 04, 2x).

### 2. Tournament panel (hero's client, opened by clicking the board)
- `03-panel-no-bracket-open.png`: nothing open: pick game (4 tournament games) and size (4 or 8), "Open a 4-player bracket".
- `06-panel-open-signups.png`: open 8-player Ship, Pivot, Raise bracket, 6/8 signed up (names as links), start time, "Leave the bracket".
- `07-quarterfinals-start-panel.png` (+ `-scene.png` without the panel): bracket running, 8 players, Round 1 pairings, empty Semifinal/Final slots.
- `08-round1-two-played-panel.png` (+ scene): two Round 1 matches played, winners in yellow and carried into the Semifinal column.
- `09-semifinals-panel.png` (+ scene): semifinals, one decided.
- `10-final-panel.png` (+ scene): final elio vs gus.
- `11-champion-panel.png` (+ scene): finished: "elio won the Ship, Pivot, Raise tournament. Their name stays up until the next one", the open form is back, the crown name sits under the board.

### 3. Big screen: live bracket vs livestream
- `20-bigscreen-bracket-round1-closeup.png`: screen while a bracket runs (trophy header "Ship, Pivot, Raise · Round 1", 3 matches).
- `21-bigscreen-bracket-final-closeup.png`: same screen at the final (one row).
- `04-...` and `05-...`: the same screen as livestream (see above).
- `gif-a-bracket-on-bigscreen.gif`: 28 frames of the big screen: idle, a 4-player bracket opens (toast), starts, Semifinal rows update with a check mark, Final, then the screen returns to "No matches live" and the champion name appears under the board (gus).

### 4. Champion crown
- `12-champion-crown-match-chat.png`: hero spectating Hype Cycle elio vs dax; the match chat shows a crown before "elio" ("gg everyone...") and plain "dax" ("rematch tomorrow?"). The crown is only in match chat (Chat.tsx), not in the town chat.
- `22-board-champion-name-closeup.png`: the crown name label under the board (3x).
- `11-champion-scene.png`: same label in the room.

### 5. Company merch (Merch.tsx)
- `13-merch-shop-before-design.png`: shop before anything is bought: tee, hoodie, cap, mug in brand/pair colours with "PF" initials, "Design the merch" button for a member.
- `14-merch-shop-bought-before-design.png`: tee, cap and mug taken (free for members), hoodie "Free 160" with the price struck.
- `15-avatar-merch-before-design.png`: hero in open floor wearing the initials merch (cap, tee, mug), zoomed.
- `16-merch-designer-empty.png`: designer opened with no saved design: 8x6 grid, 4 live previews, brushes, Shirt/Accent colour pickers, Save / Back to brand colours / Cancel.
- `17-merch-designer-drawn.png`: orange blob with white core and dark base, navy shirt colour; the previews and the avatar behind the panel already update.
- `18-merch-shop-after-save.png`: after Save, the shop items and the avatar use the new design.
- `19-avatar-merch-after-design.png`: hero wearing the saved design.

## Visual problems and bugs

1. Finished bracket is not viewable. When the final is played the whole bracket disappears: the panel shows only the champion line and the open form (`11`), and the big screen goes straight back to "No matches live". No way to see the final bracket or the runner-up. (Probably by design: `current` becomes null.)
2. Big screen shows only the first 3 matches of a round (`FEED_ROWS`): in the 8-player Round 1 (4 matches) hero vs bram is missing from the screen (`07-...-scene.png`), with no "+1 more" strip as the livestream has.
3. Toasts for "tournament open / on / won" are drawn over the big screen and hide its rows while they show (visible in the GIF).
4. The board icon is tiny, unlabelled, and dark against the neon "SHIP IT" sign (its glow dims it, `02`). Easy to miss; no hover hint.
5. Bracket panel: column headings "Round 1 / Semifinal / Final" sit at different heights (each centred over its column), and the first round of 8 is called "Round 1" not "Quarterfinal". Empty slots show a tiny "…". Losers are not dimmed, only winners are yellow.
6. "Starts at 04:41 PM" in the signup panel uses the browser locale (12 hour) while the HUD uses 24 hour times ("sunset 17:52", "Mon 08:00").
7. A player standing at the board (where a click on it walks you) overlaps the champion name label under it (`11-champion-scene.png`).
8. Players in a tournament match are moved to the town square for it (hero was pulled out of the basement in my first GIF attempt). Expected from the design, but you cannot watch the big screen from inside the room while you are in the bracket.
9. The big screen row for a started match shows "Starting…" while the match view already shows Round 1/3 (`12`): stale headline.
10. Merch designer: opening it with no saved design shows blank shirts, mug and cap, while the shop before shows "PF" initials, so the editor starts from a blank print instead of the initials. The empty grid is hard to see on a red shirt colour (`16`). The Shirt and Accent pickers are thin sliver swatches with a big gap between them. The hoodie preview has a stray white pixel.
11. The 8x6 print shrinks to a few pixels on the tee/cap/mug: the blob design reads as an orange dot, the white core and dark base are lost (`17`, `19`). On the avatar the "PF" logo before the design is a white blob (`15`).
12. Camera: at 1440x900 or smaller the basement does not fit whole and the top rows (racks, big screen, board) are cut when the player is at the bottom. The HUD cards at the right cover the vending machine. Avatars standing in the desk rows are hidden behind the desks (already known from earlier basement notes).
13. Not reproduced: a second member (ada/bram) editing the design; only hero was driven through the UI.
