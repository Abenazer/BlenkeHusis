---
name: factory-delivery
description: Wire up a new delivery from the asset factory (../../gameassetfactory) in Blenke Husis & Urinjakten — new or changed sheets under assets/sprites/ and a changed delivered.json. Use when the owner says "ny leverans", "new delivery", "wire it up", or git status shows untracked files in assets/sprites/.
---

# Wiring up a factory delivery

The factory writes sheets (PNG + TexturePacker JSON) into `assets/sprites/`
and lists them, with checksums, in `assets/sprites/delivered.json`. The
sheets are the game's only pictures of what they draw: something drawn in
code (`src/art/`) until its sheet comes has that code deleted once the
sheet is wired up, and a missing sheet is an error. Never edit a delivered
file: if one is wrong, say so and the owner asks the factory for a new
delivery.

## 1. See what came

```bash
git status --short assets/sprites/
node tools/sheetinfo.js                  # new and redelivered sheets: frames, origins, opaque boxes, animations
node tools/sheetinfo.js --since HEAD~1   # the same, if the delivery is already committed
node tools/sheetinfo.js --pixels <sprite> [frame]   # a frame as text, a letter per colour, the origin marked
```

`TODO.md` (Art) usually has the order the delivery answers: the names,
sizes, origins and animations asked for. Read it first, and compare what
came with it.

To look at a sheet, enlarge it into the scratchpad and Read the PNG:
`convert assets/sprites/<category>/<name>.png -filter point -resize 600% <scratchpad>/<name>.png`.

## 2. Map every sheet to what it replaces

All in `src/sprites.js`; each list says in a comment what it maps:

| Category | Map | Key → value |
| --- | --- | --- |
| characters (enemies) | `ENEMY_SPRITES` | sheet → `{ type, variant }` |
| characters (citizens) | `CITIZEN_SPRITES` | sheet = type |
| tiles | `TILE_SPRITES` | sheet → level character (`TILE_TYPES` in `src/level.js`) |
| items | `ITEM_SPRITES` | sheet → item type |
| projectiles | `PROJECTILE_SPRITES` | sheet → projectile type |
| props | `PROP_SPRITES` | sheet → prop type |
| scenery | `SCENERY_SPRITES` | sheet → piece, or `{ frame: piece }` for several |
| effects (power-ups) | `EFFECT_SPRITES` | sheet → effect |
| effects (enemies' extras) | `ENEMY_EXTRA_SPRITES` | sheet → renderer look |
| one-offs | `PLAYER_SPRITE`, `CHECKPOINT_SPRITE`, `GOAL_SPRITE`, `SIGN_SPRITE`, `STATION_SIGN_SPRITE`, `PLATFORM_SPRITE`, `LEAK_SPRITE`, `HORIZON_SPRITE`, `STATION_SPRITES`, `HUD_SPRITES`, `BACKGROUND_SPRITES` | |

Sheet names are snake_case (`beer_crate`) and the game's types camelCase
(`beerCrate`): map them, don't rename. A sheet of a new kind needs its
branch in `loadSprites` (`src/sheets.js`), its look built in
`createRenderer` (`src/render.js`, usually `singleLook` or a `*Looks`
function, with `needed` so a missing sheet fails) and the draw call placed by
the frame's `originX`/`originY`, never by the picture's width or height. Add
it to the test that everything the game draws is delivered. The level editor builds on the same
renderer, so keep it on the renderer's looks rather than its own.

The category folder doesn't decide the map: `effects/music_note` is the
hippie's note, not a power-up effect.

## 3. Run the sprite tests and read what fails

```bash
node --test tests/sprites.test.js
```

`tests/sprites.test.js` holds each sheet to the game: palette, 15 colours,
checksums, every file mapped, everything the game draws delivered, sizes the
game needs (its bodies, tiles, the HUD's `ICON_SIZES`, the enemies' standing
height), origins where the game places things. A failure means one of two
things:

- **The sheet is wrong** (wrong size, origin off, a frame missing, a deck
  that doesn't line up): leave the file alone and report it for the factory.
  Where code still draws the thing, keep it and leave the sheet unmapped;
  a redelivery of something with no code behind it can only wait for the
  factory's fix (or `git checkout` the old files).
- **The rule was written for the sheets so far** and the new art
  legitimately differs (a figure sitting or diving, a board delivered blank):
  change the rule to compare with what the game really does, and say in the
  summary which rule changed and why.

Report factory inconsistencies you let through (for example an odd width's
origin at `floor(w/2)` in one batch and `ceil(w/2)` in another) so the owner
can ask for a redelivery.

Where the sheet carries something the game uses in play — a deck to stand on
(`deck` in `src/enemies.js`: the raggare's roof, the progg activist's
banner), a hazard's surface (`HAZARD_BOXES`), a lens the torch's beam starts
from — check it lines up with `--pixels`, and add a test if none covers it.

Then add tests for what is new (a new map, a new kind of sheet) and run the
other touched modules' tests (`tests/art.test.js`, `tests/editor.test.js`,
`tests/pixels.test.js`, the gameplay tests of what the art belongs to).

## 4. Look at it

Follow the verify skill. The level editor (`tools/editor.html`) is the
quickest look: its palette shows every tile, item, enemy, subculture, prop and
piece of scenery through the game's renderer, and a level opened from
"Öppna en bana…" shows them in place. Then a level in the game for what
moves.

## 5. Docs

- `AGENTS.md`: the paragraph listing what is delivered (under the art
  convention), and the layout line for `sprites.js` if a new kind came.
- `TODO.md`: take the delivered batch off Art; keep anything still awaited.
- Delete the code that drew what was delivered, and its tests in
  `tests/art.test.js`.
- `CHANGELOG.md`, under `[Unreleased]`: what players see under `Changed`
  ("… drawn by the asset factory now"), the wiring and test changes under
  `Development`.

Commit the delivered files together with their wiring, one commit per
delivery, only when the owner asks.
