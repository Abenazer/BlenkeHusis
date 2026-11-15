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
(`?bana=forort-1`). 0.6.0 released Tungelsta IF, extra lives and hearts
on every level and the asset factory's subcultures, props and facades;
0.7.0 released citizens to test on every level (each test a urine
sample, drawn in code until batches 13 to 21 are delivered) and a clock
that follows each level's length. The next portion is planned when it starts, from the
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

- [ ] Batch 14, Jordbro's children, to order from
      `../../gameassetfactory` (drawn in code in `src/art/jordbro.js`
      until delivered). `jordbro_child` (characters, a citizen like the
      pensioner): one of class 1D at Lundaskolan in 1972, the children of
      Rainer Hartleb's Jordbro films, seven years old, with a brown bowl
      cut down to the eyes, a red and yellow striped knitted jumper,
      flared jeans and brown shoes; 20×25 frames standing on [8, 25], his
      feet on the bottom row, `stand` (one frame, 2 fps) and `wave` (two
      frames, 4 fps, an arm up). He faces right; a girl in a frame of her
      own would be welcome. Once delivered: `jordbro_child` into
      `CITIZEN_SPRITES`, and `src/art/jordbro.js` deleted with its
      fallback in `src/render.js`.

- [ ] Batch 15, Fredrika Bremergymnasiet's pupils, to order from
      `../../gameassetfactory` (drawn in code in `src/art/bremer.js`
      until delivered). `bremer_pupil` (characters, a citizen like the
      pensioner): a gymnasium pupil in Handen in the early 1970s, about
      seventeen, long fair hair past the shoulders, an open army-green
      parka, bell-bottom jeans and brown clogs; 20×25 frames standing on
      [8, 25], the feet on the bottom row, `stand` (one frame, 2 fps) and
      `wave` (two frames, 4 fps, an arm up). Faces right; a second pupil
      in a frame of their own would be welcome. Once delivered:
      `bremer_pupil` into `CITIZEN_SPRITES`, and `src/art/bremer.js`
      deleted with its fallback in `src/render.js`.

- [ ] Batch 16, Skogås centrum in the early 1980s, to order from
      `../../gameassetfactory` (drawn in code in `src/art/skogas.js`
      until delivered). `skogas_youth` (characters, a citizen like the
      pensioner): a youngster of about fifteen hanging about the centre,
      feathered brown hair, a denim jacket open over a white T-shirt,
      straight jeans and white trainers; 20×25 frames standing on
      [8, 25], `stand` (one frame, 2 fps) and `wave` (two frames, 4 fps,
      an arm up), facing right. `fornborg_sign` (scenery, 96×32, origin
      [0, 32]): the sign on the roof of Fornborgs Färg och Parfym on two
      posts, white with a red border, the shop's orange castle tower on
      the left, FORNBORGS in red over FÄRG & PARFYM in purple. Once
      delivered: the youngster into `CITIZEN_SPRITES`, the sign into
      `SCENERY_SPRITES` (`fornborgSign`), and `src/art/skogas.js`
      deleted with its fallbacks in `src/render.js`.

- [ ] Batch 17, Krigslida's larpers, to order from
      `../../gameassetfactory` (drawn in code in `src/art/larp.js` until
      delivered). Youngsters larping fantasy by the fields in 1980, in
      home-made costumes, five citizens like the pensioner, each facing
      right, `stand` (one frame, 2 fps) and `wave` (two frames, 4 fps):
      `larp_wizard` (a purple pointed hat with a yellow star, a
      cotton-wool beard, a blue bedsheet robe, a potion at the belt, a
      broomstick staff with a tinfoil ball), `larp_elf` (long fair hair
      with a pointed ear through it, a green tunic, a pouch of herbs, a
      bow in the hand behind), `larp_orc` (a black mop of hair, the face
      painted green, cardboard armour, grey trousers, a foam club),
      `larp_thief` (a dark hood, a mask over the eyes, a cloak, a coin
      purse) in 20×25 frames standing on [8, 25]; and `larp_warrior` (a
      painted cardboard helmet, a red tabard with a yellow cross over a
      knitted "chain mail" jumper, and a foam sword taller than he is,
      over his shoulder standing, held up straight and swung forward as
      he waves) in 32×32 frames standing on [19, 32]. Once delivered: the
      five into `CITIZEN_SPRITES`, and `src/art/larp.js` deleted with its
      fallback in `src/render.js`.

- [ ] Batch 18, Ribbyskolan's pupils, to order from
      `../../gameassetfactory` (drawn in code in `src/art/ribby.js` until
      delivered). `ribby_pupil` (characters, a citizen like the
      pensioner): a högstadium pupil in Västerhaninge at the end of the
      1970s, about thirteen, dark blond hair to the collar, a light blue
      college sweater, brown corduroy trousers, white trainers and a
      square red school backpack on his back; 20×25 frames standing on
      [8, 25], `stand` (one frame, 2 fps) and `wave` (two frames, 4 fps,
      an arm up), facing right; a second pupil in a frame of their own
      would be welcome. Once delivered: `ribby_pupil` into
      `CITIZEN_SPRITES`, and `src/art/ribby.js` deleted with its fallback
      in `src/render.js`.

- [ ] Batch 19, the Jehovah's Witnesses at Rikets sal in Farsta strand,
      to order from `../../gameassetfactory` (drawn in code in
      `src/art/witness.js` until delivered). `witness` (characters, a
      citizen like the pensioner): a witness of the 1980s going door to
      door, short parted brown hair, a dark grey suit, a white shirt and
      a red tie, a brown briefcase in the far hand and the Watchtower
      (white and blue) in the near one; 20×25 frames standing on [8, 25],
      `stand` (one frame, 2 fps) and `wave` (two frames, 4 fps, the
      Watchtower held up), facing right; a woman in a skirt and blouse in
      a frame of her own would be welcome. Once delivered: `witness` into
      `CITIZEN_SPRITES`, and `src/art/witness.js` deleted with its
      fallback in `src/render.js`.

- [ ] Batch 20, the Skogsmulle children in the woods by Trångsund, to
      order from `../../gameassetfactory` (drawn in code in
      `src/art/mulle.js` until delivered). `mulle_child` (characters, a
      citizen like the pensioner): a child of five out with
      Friluftsfrämjandet around 1970, a red bobble hat with a white
      bobble pulled down to the eyes, a yellow anorak, blue rain trousers
      and green rubber boots, small (about 14 pixels tall); 20×25 frames
      standing on [8, 25], `stand` (one frame, 2 fps) and `wave` (two
      frames, 4 fps, an arm up), facing right; a second child in a frame
      of their own would be welcome. Skogsmulle himself stays out. Once
      delivered: `mulle_child` into `CITIZEN_SPRITES`, and
      `src/art/mulle.js` deleted with its fallback in `src/render.js`.

- [ ] Batch 21, Paus bagarstuga's customers in Västerhaninge, to order
      from `../../gameassetfactory` (drawn in code in `src/art/paus.js`
      until delivered). `paus_customer` (characters, a citizen like the
      pensioner): a woman of the 1970s out for her fika, a brown
      permanent wave, a belted beige coat, stockings and brown shoes, a
      white paper bag of poppy-seed buns in the near hand; 20×25 frames
      standing on [8, 25], `stand` (one frame, 2 fps) and `wave` (two
      frames, 4 fps, the bag held up), facing right; a man with a cap in
      a frame of his own would be welcome. Once delivered:
      `paus_customer` into `CITIZEN_SPRITES`, and `src/art/paus.js`
      deleted with its fallback in `src/render.js`.

- [ ] Batch 22, the Latter-day Saints at the temple in Västerhaninge, to
      order from `../../gameassetfactory` (drawn in code in
      `src/art/mormon.js` until delivered), citizens like the pensioner,
      20×25 frames standing on [8, 25], `stand` (one frame, 2 fps) and
      `wave` (two frames, 4 fps, the book held up), facing right.
      `mormon_elder`: a young American missionary of the 1980s, short
      neat hair, a white short-sleeved shirt, a dark tie, a black name
      tag on his chest, dark trousers, the blue Book of Mormon in the
      near hand. `mormon_sister`: a sister missionary, hair to the
      shoulders, a white blouse with the black name tag, a long blue
      skirt, flat shoes, the book in her hand. Once delivered: both into
      `CITIZEN_SPRITES`, and `src/art/mormon.js` deleted with its
      fallback in `src/render.js`.

- [ ] The suburb perhaps without the red cottages: lower blocks of
      flats, two or three storeys, in their place (the cottages move to
      "Landet", see Features).
