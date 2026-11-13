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

- [ ] Batch 12, the countryside's two backdrop layers, ordered from
      `../../gameassetfactory` 2026-11-13 (drawn in code in
      `src/art/backgrounds.js` until delivered; the code's version is the
      review page's `compare`). Backgrounds as the factory's other
      layers: one sprite per layer, its id the layer's name and its one
      frame named after it, at the layer's size, wrapping sideways
      seamlessly, its bottom row the colour the game fills under it.
      `hanveden` 448×40 (factor 0.15, its top on the view's row 74 at
      the lowest camera): Hanveden's long forested ridge far off, hazy
      blue with distance (`water_3`, a darker fold `water_2` lower
      down), its line rising and falling, ragged with spruce tops, solid
      below its line. `fields` 320×72 (factor 0.3, top on row 100): the
      forest's edge across its top 20 rows (spruce and round leafy
      crowns, dark green, solid below), then strips of fields towards
      the view, deeper as they come nearer, patched with pasture, ripe
      rye, green oats, ploughed and stubble, parted by hedgerows, and a
      red barn with white corners, its gable to the view; the bottom
      strip pasture (`grass_3`, the fill). Both are shown by Tungelsta
      and Krigslida (`countryside` in `src/backdrop.js`) and suit the
      planned "Landet". Once delivered: into `BACKGROUND_SPRITES`, and
      the code-drawn layers deleted.

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
