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

- [x] 11a. Night, in four steps:
  - [x] 11a1. Night tiles (2026-11-17): a level's `night: true` draws
        its tiles by night, each palette colour turned to a darker,
        bluer one (`src/art/night.js`) until batch 24 delivers the
        night sheets (then a test holds every night level to tiles that
        have one); the level editor has a Natt box and draws by it.
  - [x] 11a2. The city's backdrop (2026-11-17, `city` in `BACKDROPS`):
        the starry night sky, the skyline (Stadshuset, Riddarholmskyrkan,
        Katarinahissen), the inner city's stone houses with lit windows
        and a neon sign, and the street with lamps and parked cars, drawn
        in `src/art/city.js` until batch 23.
  - [x] 11a3. Darkness and light (2026-11-17): a dark passage (`&`, a
        tile of its own, what stands in it standing in the dark) is drawn
        over in the fade's dithered ink, lit per 4×4 block by Blenke's
        own round, a street lamp, a lit torch's beam and glow sticks
        (`src/darkness.js`); one under the test level's walkway.
  - [x] 11a4. New materials (2026-11-17), solid tiles of their own:
        Plattan's paving (`*`), cobbles (`+`) and the tunnelbana's wall
        tiles (`J`), drawn in `src/art/materials.js` until batch 24.
- [x] 11b. Escalators (2026-11-17): a diagonal run of `/` (up) or `z`
      (down) is a slope that carries, not steps as platforms: Blenke
      stands on it, walks up and down it smoothly and its belt carries
      him at 30 px/s; the steps are only drawn, moving along it
      (`src/escalators.js`, `tests/escalators.test.js`; one up and one
      down on the test level). Drawn in `src/art/escalator.js` until
      batch 25.
- [x] 11c. Sergels torg as the template level, built first and played by
      its id (`?bana=sergel`), not yet in the playing order (11d puts it
      in world 2). Planned 2026-11-17, in steps. What the factory hasn't
      delivered (batches 27–29) is drawn in code in `src/art/` and hung
      as its sheet would be; the delivery test leaves it out until it is
      delivered, and fails once it is and the code should go.
  - [x] 11c1. The tagger (2026-11-17, `tagger`, `m`), and drawing a
        character in code (`src/art/drawn.js`, `framed.js`): a hooded
        graffiti painter who paces and, with Blenke within 72 px, stops
        and sprays a short cloud of paint (`paint`) at him, which hurts;
        stomped as usual; carries a spray can (`sprayCan`). One among the
        test level's enemies.
  - [x] 11c2. The other three (2026-11-17), drawn in code: the ticket
        inspector (`ticketInspector`, `j`) paces and, with Blenke within
        64 px, stops and shows his card; touching him costs a fine of 120
        points (never below nothing) and holds Blenke 0.6 s, not a heart,
        then a spell of blinking safety. The Stureplan brat (`brat`, `l`)
        paces and lobs champagne corks (`cork`); stomped, he has nothing
        on him. The bouncer (`bouncer`, `<`, 24×30) stands facing Blenke,
        an arm out when he is close, and can't be beaten: touching him
        from the side or above shoves Blenke back unhurt; he is jumped
        over (a jump rises some 73 px). All three among the test level's
        enemies.
  - [x] 11c3. Kulturhuset's chess players to test (2026-11-17,
        `chessPlayer`: an old man in a flat cap with a white king), and
        the boss, the city's commissioner for social affairs
        (`socialCommissioner`, "SOCIALBORGARRÅDET", grey bob, glasses,
        red scarf), who wants Plattan cleared: throws paper, skims
        briefs, carries money. Both drawn in code, in the editor's
        palette; they first stand in Sergels torg (11c5).
  - [x] 11c4. Sergels torg's song (2026-11-17, `src/music/sergel.js`,
        `sergel`): trip-hop in C minor at 84 bpm, a broken beat, a deep
        bass that holds and pushes, slow chords and a sparse tune; two
        bars in, sixteen that loop. On the listening page for the owner.
  - [x] 11c5. The level (2026-11-17, `src/levels/sergel.js`, `?bana=sergel`,
        344 tiles, night, `city`, 260 s): T-Centralen's tiled platform
        and its live track (a pit), the unlit service passage with a
        raver, the escalator up to the square's upper level and the
        glass obelisk climbed by planks, Kulturhuset's glass front with
        its chess players and a cellar under secret asphalt, the
        escalator down to Plattan past a club and its bouncer, Plattan
        and the arena on it. 127 samples, the extra life 42 % and the
        heart 81 % of the way to the gate, three checkpoints. Held to
        the game's rules by the tests (`GAME_LEVELS` in
        `tests/helpers.js`) though not yet in a playing order. Played
        through the platform, the passage, the escalator and the street
        on a virtual display; the owner to play the rest and balance it.
- [x] 11d. Worlds in the game (decided 2026-11-17: a world card and
      "BANA n" within each world; the worlds are SÖDERTÖRN and NATTSTAN;
      world 2 can be chosen as soon as it is built, with Sergels torg
      alone for now, but no release until 11e), in three steps:
  - [x] 11d1. The worlds in the level index (2026-11-17): `WORLDS` (id,
        number, name, levels), each level numbered in its world and
        knowing it (`world`); `nextLevel` ends at a world's last;
        Sergels torg is world 2's first level. Nothing yet changes for
        the player.
  - [x] 11d2. The flow (2026-11-17): Starta asks which world once more
        than one is open (VÄLJ VÄRLD); a world's first level opens with
        its card (VÄRLD 2 in big lettering, NATTSTAN, a tagline, over
        the level's backdrop, the level's song), a few seconds or a key;
        finishing a world opens the next, told on the year's report
        (open for the page's life until 11d3 keeps it). A level asked
        for in the address starts at once (a world's first with its
        card). The rave commission's own year's report is left for 11e.
  - [x] 11d3. The save, version 4 (2026-11-17): a high-score list per
        world and the worlds opened (version 3's list becomes
        Södertörn's, Södertörn open), migrated and tested loading a
        version 3 save; a world the game doesn't know is kept for later.
        Topplista shows each open world's list, left and right to turn;
        after a game the world played. The consent question ("FÅR
        SPELET SPARAS?") comes at the first of a high score or a world
        opening.
- [ ] 11e. The other three levels and the year's report (planned
      2026-11-17, the facts in `docs/spec.md`, section 6). World 2's
      order becomes BANA 1 Slussen, 2 Sergels torg, 3 Stureplan, 4
      Finnboda varv. Each level as Sergels torg was built (a generator
      for its sections, held to the game's rules by the tests, played
      on a virtual display as far as it goes), its new characters drawn
      in code until the factory's batches 27–29, in steps:
  - [ ] 11e1. Slussen, 22.00: up from the lock by the water (deep water,
        a pit) over the cloverleaf's ramps to Södermalmstorg, the bus
        terminal in the rock (dark, an escalator), Saltsjöbanan's
        terminus, and Katarinahissen ridden up as a lift (a moving
        platform) to the walkway and Gondolen hanging under it, its
        crate hidden there. Night walkers in yellow vests to test
        (`nightWalker`). The boss SL's chief inspector
        (`inspectorChief`, "KONTROLLANTCHEFEN": throws binders, fines on
        contact like his men). Its song: eurodance, a four-to-the-floor
        beat, a minor riff, a big chorus.
  - [ ] 11e2. Stureplan, 02.00: the queue along the street (clubbers to
        test, `clubber`, dressed up and waiting), Svampen's concrete
        roof to stand on, a club's doors with their bouncer and a velvet
        rope (scenery, `velvetRope`), the VIP room behind it hidden
        (a secret room: champagne, cash, and nothing tested), brats,
        taggers on the side streets. The boss the club king
        (`clubKing`, "KROGKUNGEN": throws corks, carries money). Its
        song: house, a piano riff over a four-to-the-floor beat. The
        clubs stay unnamed.
  - [ ] 11e3. Finnboda varv, 04.30, the sky paling to dawn (a `dawn`
        backdrop: the city's with a paler sky): the shipyard's quay and
        cranes (moving platforms over the water), the slipway, the hall
        where the rave goes on (dark, lit by glow sticks, ravers),
        dancers to test (`dancer`). The boss the rave commission's own
        chief (`raveChief`, "RAVEKOMMISSIONENS CHEF", made up: throws
        binders of reports, carries urine samples). Its song: acid
        techno, a squelching bass line and a long build.
  - [ ] 11e4. The rave commission's year's report for world 2:
        "RAVEKOMMISSIONENS ÅRSRAPPORT 1997", its closing line "ENHETEN
        GÖRS PERMANENT."; and world 2's finish has a police van (the
        piketbuss) for the police car.
- [ ] 11f. The pages in `../narko-sites`, AGENTS.md's status, and a
      release when the owner says so.

Open questions, settled as each step comes: whether Förorten joins a
world of its own.

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
    192×216 (factor 0, deep blue to `ink` at the top, stars in its upper
    half, so it is wider than the day's sky);
    `skyline` 448×56 (factor 0.15, top on row 46, so its roofs show over
    the houses in front): the city across the
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
    (`*`, Sergels torg's black and white triangles as paving seen low
    across, over concrete), `cobbles` (`+`, Gamla stan's and Slussen's),
    `metro_tiles` (`J`, the tunnelbana's wall tiles, pale, with a blue
    band on the top tile only). Drawn in code in `src/art/materials.js`
    until delivered, the review's `compare`.
  - Batch 25, the escalator, rising to the right (the game mirrors it):
    `escalator_step` (pieces, 8×16, a ribbed metal step seen from the
    side, its tread on the top row, its riser reaching down past the
    next step; the game moves it along the slope two to a tile) and
    `escalator_side` (pieces, 16×52, one tile's side panel and handrail,
    the slope leaving column 0 by row 35 and column 15 by row 20, the handrail 20 px
    above it and the panel 8–16 px below it). Drawn in code in
    `src/art/escalator.js` until delivered, the review's `compare`.
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
