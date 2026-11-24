---
paths:
  - "src/levels/**"
  - "src/level.js"
  - "tools/editor.html"
  - "tools/editor/**"
  - "exports/**"
---

# Levels

How levels are written, whether by hand in `src/levels/`, in the level
editor or imported from its exports (the `level-import` skill). Moved out
of `AGENTS.md` so it loads only for level work; the rest of `AGENTS.md`
still applies.

- **Levels are text.** The level editor (`tools/editor.html`) draws them and writes them out in the same shape. One character per 16×16 tile, the legend in
  `TILE_TYPES` and `MARKERS` in `src/level.js`, each item's, enemy's,
  citizen's and prop's `char` in `src/items.js`, `src/enemies.js`,
  `src/citizens.js`, `src/props.js` and `src/scenery.js`, and
  `PLATFORM_CHARS` in `src/platforms.js` and `ESCALATOR_CHARS` in
  `src/escalators.js` (a test keeps them all
  distinct). Free are `( )` and the digits, then
  Latin-1 characters such as `é` or `ü` (`å ä ö Å Ä Ö` are the facades;
  the quotes, the backslash and the backtick don't sit well in a string)
  (a test holds them to one code unit each, precomposed, with no
  look-alikes such as `×` or `·`, and the levels to NFC). Scenery and
  citizens have no character: they stand in the level's `cast`, a list
  of `{ type, col, row }` at the end of its file, from the top row down
  and left to right (the order the game reads them in, which picks a
  citizen's lines). An enemy can stand there too, as every boss does;
  without a `row` a member stands on its column's highest floor. The
  editor draws the cast into the rows while it edits (each type a
  character of its own from Unicode's private use area, never stored) and
  writes it out as a cast again. An item written right above a crate (`?`) is inside it. A
  secret wall (`:`), or secret asphalt (`[`, drawn as asphalt with no
  tell), hides the room joined to it until Blenke steps in; a
  room's inside is `;`, and a marker in a room stands on the room. A gate
  (`|`) stands until every boss left of it is beaten; each level of the
  game ends with its own boss (in its cast) in an `arena` section, a
  gate after it, before the finish (a test holds them to it, the boss within
  the arena's 28 tiles before the gate). A section put in or taken out before the arena
  moves it: the boss's column in the cast and the clock move with it (the
  editor moves the cast with the columns it puts in or takes out). The filling station's
  pump (`M`) stands on the goal's row a few tiles past it; every level of
  the game ends with the same section, `finish(height)` from
  `src/levels/finish.js`, and the finish's lamp and its world's police
  vehicle, `finishCast(width, height, vehicle)`, in its cast (a test
  holds them to it). The playing order is
  `PLAYING_ORDER` in `src/levels/index.js` and nothing else: a level's
  title ("BANA 2: …", shown as it starts and heading its report) is
  numbered there from its place in the order,
  with its `place` (or its `name`, which the HUD shows). A station's name
  board (`9`) shows the level's `stationName`. A level sets its
  clock (`time`, in seconds; a level of the game gets `clockFor(width)` from
  `src/level.js`, 0.75 s a tile to the nearest ten, and a test holds it so), its song (`music`, an id in
  `src/music/index.js`; a test holds every level to one, and every level of the game to a song of its own), its backdrop (`backdrop`, one of
  `BACKDROPS` in `src/backdrop.js`, the suburb's if left out; every level
  of the game names one, none of them showing the Globe), whether it is
  night (`night: true` draws its tiles by night) and its signs' texts (`signs`, in the order
  the signs come from the left; one per sign or it fails). A level can be written in
  sections of equal height joined side by side (`joinSections`). An unknown
  character, uneven rows, a missing start, a second goal or a second
  filling station fail loudly, a test parses every level in `src/levels/`,
  and every level of the game needs a goal, a checkpoint and a filling
  station.
