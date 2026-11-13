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

- [ ] Batch 13, Tungelsta IF on its pitch, to order from
      `../../gameassetfactory` (drawn in code in `src/art/tif.js` until
      delivered). The club plays in orange and black (`orange_2`,
      `orange_1`, `grey_1`, `ink`). `junior` (characters, a citizen like
      the pensioner): one of the club's juniors, about eleven, in an
      orange shirt, black shorts, orange socks and black boots; 20×25
      frames standing on [8, 25], his feet on the bottom row, `stand`
      (one frame, 2 fps) and `wave` (two frames, 4 fps, an arm up). He
      faces right. `football_goal` (scenery, 64×32, origin on its bottom
      left corner [0, 32]): a seven-a-side goal, white posts and
      crossbar, the net behind. `club_banner` (scenery, 80×32, origin
      [0, 32]): a black banner with an orange border on two wooden
      poles, TUNGELSTA IF across it in orange. Once delivered: the
      junior into `CITIZEN_SPRITES`, the goal and banner into
      `SCENERY_SPRITES` (`footballGoal`, `clubBanner`), and
      `src/art/tif.js` deleted with its fallbacks in `src/render.js`.

- [ ] The suburb perhaps without the red cottages: lower blocks of
      flats, two or three storeys, in their place (the cottages move to
      "Landet", see Features).
