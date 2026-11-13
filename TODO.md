# TODO

Open work, newest first. Tick items off and delete them once done.

## Build plan

The game is built in portions from `docs/spec.md`, one at a time, in this
order. Each portion ends with the game playable, tested (`node --test
tests/` plus a look in the browser) and committed. A portion is planned in
detail when it starts, not before.

No portion is under way: portions 1–10 are done and released in 0.4.0.
0.5.0 and 0.5.1 released the eight levels along the commuter line (BANA
1 Tungelsta, 2 Krigslida, 3 Västerhaninge, 4 Jordbro, 5 Handen, 6
Skogås, 7 Trångsund, 8 Södertörns villastad), each with its own boss,
the ten subcultures, the period scenery, the new facades and the four
new props spread over them; Förorten rests out of the game
(`?bana=forort-1`). The next portion is planned when it starts, from the
open work below; world 2, "The City After Dark" (`docs/spec.md`, section
6), is the next world.

## Balancing

- [ ] Balance the eight levels. The owner has played all of them through
      (2026-11-13) and begun balancing in the level editor; more is
      needed. `node tools/balance.js <id>` gives each level's numbers;
      exports land in `exports/` and are copied into `src/levels/`.

## Features

- [ ] Try the game on an iPhone when one is at hand: upright it should
      say VÄND TELEFONEN, and play once turned by hand (Android was
      tried on a Pixel 8, 2026-11-08).

- [ ] A new level, "Landet" (the countryside), where the red cottages
      now in the suburb's backdrop belong.

## Art

- [ ] Batch 10, the subcultures, ordered from `../../gameassetfactory`
      2026-11-13 (drawn in code until delivered, listed in `AWAITING`
      in `src/sprites.js`). Enemies on the enemies' 20×25 frame, pivot
      `[8, 25]`, facing right, `move` (two frames), `defeated`
      (squashed), and `act` where the game has one: `hippie` (`act`
      sitting cross-legged playing the guitar), `headbanger` (`move`
      standing and banging, `act` diving flat through the air), `punk`,
      `synth` (`act` the keytar raised), `breakdancer` (`move` spinning
      upside down on cardboard, `act` the freeze, arms crossed;
      `defeated` from standing), `raver` (`act` a glow stick raised),
      `goth`, `skater` (`move` riding and pushing; `defeated` lying
      without the board). Frames of their own size: `raggare`, his car
      48×24 (roof a 36 px deck, `move` with the wheels turned), and
      `progg_activist`, 32×36 under her banner (a 30 px deck 14 px over
      her head). Also the skater's `skateboard` 14×3 rolling alone, the
      hippie's `music_note` 7×8; their evidence as `items`
      (`herbal_tea` 7×10, `cassette` 9×6, `fanzine` 7×8, `floppy` 8×8,
      `mixtape` 9×6, `water_bottle` 5×9, `candle` 5×9, `leaflet` 7×9,
      `spray_can` 5×9); what they throw as `projectiles` (`wave` 8×5
      and `glow_stick` 8×4, two frames each); and the props besides the
      cone as `props` (`beer_crate` 14×10, `thermos` 6×12, `torch`
      10×5, `megaphone` 12×9, one frame each: the game wears them by
      its throws itself). Once delivered: off `AWAITING`, into the
      sprite lists, the renderer's use of each.

- [ ] Batch 11, world 1's last pieces, ordered from
      `../../gameassetfactory` 2026-11-13 (drawn in code in
      `src/art/tiles.js` and `src/art/scenery.js` until delivered).
      Tiles, `top_<n>` (a white trim on top) and `fill_<n>`: wooden
      panelling `wood` (`W`, yellow), `red_wood` (`Ä`, Falu red),
      `green_wood` (`Ö`), `blue_wood` (`Å`), `brown_wood` (`ä`, brown
      stain), `plaster` (`ö`, a light render), `sheet_metal` (`å`,
      orange, corrugated) and `glass` (`g`, a greenhouse's pane in a
      white frame, seen through). Scenery: `runestone` 16×28 and the
      station's name board `station_sign` 128×40, delivered blank (the
      game writes each level's station name on it, in the middle 120
      px). Once delivered: entries in `TILE_SPRITES` and
      `SCENERY_SPRITES`, the board's text kept by the game. Everything
      else drawn is then delivered; the game keeps drawing the
      power-ups' glow, the gauge's needle and the hose itself.

- [ ] A countryside layer for Tungelsta and Krigslida: they now show
      the countryside backdrop (`BACKDROPS` in `src/backdrop.js`: sky,
      clouds, red cottages and trees, no flats), which leaves an empty
      band of sky where the flats stood. A far layer of fields and
      Hanveden's forest edge in its place (ordered from the factory, or
      drawn in code until then) would fit them and the planned "Landet".

- [ ] The suburb perhaps without the red cottages: lower blocks of
      flats, two or three storeys, in their place (the cottages move to
      "Landet", see Features).

- [ ] Decide, now that the code-review audit is done, whether to drop the
      code-drawn fallback for art the factory has delivered. Until then
      it is kept but not kept in step with the deliveries (decided
      2026-11-08): Blenke's sheet has him in a dark uniform with a white
      strap, while his fallback (`src/art/player.js`) and the spec still
      give him a reflective vest, and that is left as it is. Dropping it
      would make a failed delivery a plain error instead of old art.
