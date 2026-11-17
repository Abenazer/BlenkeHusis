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
sample) and a clock that follows each level's length; the asset factory
has drawn them since (batches 13–22).

### Portion 11: world 2, the city after dark

Planned 2026-11-17 (the design in `docs/spec.md`, section 6): Stockholm's
inner city one night in the late 1990s, Blenke in the rave commission;
four levels, VÄRLD 2 BANA 1 Slussen, 2 Sergels torg, 3 Stureplan, 4
Frihamnen's rave at dawn. Started on its own from the title once world 1
has been played through. The factory's batches 23–29 (under Art) are
ordered first, as the long pole; until one is delivered, what the
portion needs of it is drawn in `src/art/` and deleted on delivery. In
steps, each playable, tested and committed:

- [ ] 11a. Night: a level's `night: true` draws its tiles from their
      night sheets (`night_<sheet>`; a test holds every night level to
      tiles that have one), the city's backdrop (`city` in `BACKDROPS`),
      and pools of light in dark passages, from street lamps and the
      torch (its light code shared), drawn per tile so scrolling stays
      smooth. New materials as tiles of their own characters: Plattan's
      paving, cobbles, the tunnelbana's wall tiles.
- [ ] 11b. Escalators: steps moving up (or down) a diagonal, each a
      moving platform carrying its riders (`src/platforms.js` taught a
      diagonal track, on the world's clock); running against one works.
      Tested in `tests/platforms.test.js`.
- [ ] 11c. Sergels torg as the template level, built first and played by
      its id (`?bana=sergel`): Plattan, T-Centralen's passages with an
      escalator, Kulturhuset's chess players to test, the new enemies
      (bouncer, ticket inspector, tagger, Stureplan brat), its boss and
      a song of its own (trip-hop).
- [ ] 11d. Worlds in the game: `PLAYING_ORDER` becomes a list of worlds
      (id, name, levels); titles "VÄRLD 2 BANA 1: SLUSSEN"; the title's
      Starta asks which world once world 2 is open; finishing world 1
      opens it; each world has its own high scores and its own year's
      report (the rave commission's for 1997, its wording to write). The
      save goes to version 4 (open worlds, a high-score list per world;
      version 3's list becomes world 1's), with its migration and a test
      loading a version 3 save; the consent question is asked at the
      first of a high score or world 2 opening.
- [ ] 11e. Slussen (eurodance), Stureplan (house) and Frihamnen
      (acid techno, the sky paling towards dawn), one per step, each
      with its boss, citizens and song; the finish's police car a
      police van in world 2.
- [ ] 11f. The pages in `../narko-sites`, AGENTS.md's status, and a
      release when the owner says so.

Open questions, settled as each step comes: the worlds' Swedish names
(world 1 perhaps SÖDERTÖRN, world 2 NATTSTAN), the rave commission's
years and what it did (check sources before writing its texts), whether
Förorten joins world 2 or a world of its own.

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

- [ ] The suburb perhaps without the red cottages: lower blocks of
      flats, two or three storeys, in their place (the cottages move to
      "Landet", see Features).

- [ ] Batches 23–29, world 2's art, to order from
      `../../gameassetfactory` (portion 11). Stockholm's inner city at
      night in the late 1990s, in the master palette (`ink`, `blue_1`,
      `blue_2`, `purple_1`, `purple_2` for the dark; `urine_3`,
      `urine_4` for lamplight and lit windows; `purple_4`, `slime_4`,
      `hivis_3`, `red_4` for neon). Characters keep their daylight
      colours, as in world 1.
  - Batch 23, the city's backdrop, as the other layers (one sprite per
    layer, wrapping sideways, its bottom row the fill): `night_sky`
    16×216 (factor 0, deep blue to `ink` at the top, a few stars);
    `skyline` 448×56 (factor 0.15, top on row 70): the city across the
    water, Stadshuset's tower with its three crowns, Riddarholmskyrkan's
    iron spire, Katarinahissen, lit windows, solid below its line;
    `city_blocks` 320×104 (factor 0.25, top on row 72): the inner
    city's stone houses of five or six storeys, lit and dark windows,
    a neon sign or two on the roofs; `street` 256×72 (factor 0.5, top
    on row 120): parked cars, lamp posts throwing yellow pools on the
    pavement, the fill asphalt. A `dawn_sky` 16×216 as well (the sky
    paling towards the morning, for Frihamnen).
  - Batch 24, night tiles, as the day's (`top_<n>`, `fill_<n>`):
    `night_brick`, `night_concrete`, `night_asphalt`, `night_plaster`,
    `night_glass` (lit from inside), `night_balcony`, `night_plank`,
    `night_pipe`; and new materials, day and night alike: `plattan`
    (Sergels torg's black and white triangles), `cobbles` (Gamla stan's
    and Slussen's), `metro_tiles` (the tunnelbana's wall tiles, pale
    with a coloured band).
  - Batch 25, the escalator: `escalator_step` (pieces, 16×6, a ribbed
    metal step, its top row the tread) and `escalator_rail` (scenery,
    the balustrade, a 16×16 piece laid along the diagonal).
  - Batch 26, scenery (standing on the frame's bottom edge): `neon_sign`
    64×20, delivered blank (the game writes each club's name on it, as
    on the station's board); `hotdog_stand` 48×40 (a night grill, "KORV
    & MOS"); `taxi` 56×24 (a yellow Volvo 740 with its roof sign);
    `night_bus` 96×40; `metro_sign` 16×40 (the tunnelbana's blue T on
    its post); `velvet_rope` 40×16 (brass posts, a red rope);
    `graffiti` 48×24, three frames (tags and a piece, laid on a wall);
    `police_van` 64×32 (a 1990s piketbuss, the finish's police car in
    world 2).
  - Batch 27, enemies on the enemies' 20×25 frame, pivot `[8, 25]`,
    facing right, `move` (two frames), `act` and `defeated`:
    `ticket_inspector` (an SL inspector, `act` showing his card),
    `tagger` (hooded, `act` spraying; projectile `paint` 6×6, two
    frames), `brat` (a Stureplan brat in a blazer, `act` popping
    champagne; projectile `cork` 4×4); and `bouncer` 24×30, pivot
    `[11, 30]` (broad, black bomber jacket, arms folded; `act` an arm
    out, stopping the way).
  - Batch 28, bosses on the bosses' 26×33 frame, pivot `[12, 33]`, as
    `judge`: `inspector_chief` (SL's chief inspector, Slussen),
    `social_commissioner` (the city's commissioner for social affairs,
    who wants Plattan cleared, Sergels torg), `club_king` (Stureplan's
    club owner behind his rope), `rave_chief` (the rave commission's
    own chief, Blenke's boss, Frihamnen).
  - Batch 29, citizens to test as the pensioner (20×25, standing on
    `[8, 25]`, `stand` and `wave`): `night_walker` (a parent night
    walking in a yellow vest, Slussen), `chess_player` (by Kulturhuset,
    a pocket chess set, Sergels torg), `clubber` (dressed up in the
    queue, Stureplan), `dancer` (at the rave, Frihamnen).

  Once delivered, each as its kind before: into the sprite lists, and
  what was drawn in `src/art/` meanwhile deleted with its fallbacks.
