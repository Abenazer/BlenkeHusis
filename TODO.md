# TODO

Open work, newest first. Tick items off and delete them once done.

## Build plan

The game is built in portions from `docs/spec.md`, one at a time, in this
order. Each portion ends with the game playable, tested (`node --test
tests/` plus a look in the browser) and committed. A portion is planned in
detail when it starts, not before.

No portion is under way: portions 1–10 are done and released in 0.4.0.
The next is planned when it starts, from the open work below.

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

- [ ] The police station, its pump with the gauge and the hose for the
      factory to draw (today drawn in code, `src/art/station.js`).

- [ ] World 1's new pieces for the factory to draw (today drawn in
      code): the villas' yellow wooden panelling (tile `W`, with a white
      trim on top), a greenhouse's glass (tile `g`, seen through), a
      runestone (`runestone`, 16×28) and the station's name board
      (`stationSign`, 128×40, in `src/art/scenery.js`), delivered blank:
      the game writes each level's station name on it.

- [ ] A backdrop per level? Villastad, Västerhaninge and Krigslida are
      set in the 1970s and 80s, but the suburb's backdrop shows the
      Globe, built 1986–89, and Krigslida is fields and greenhouses, not
      blocks of flats. A level could name the layers it shows (and leave
      out the horizon); Krigslida might want the countryside planned for
      "Landet".

- [ ] Order the rest of the art from `../../gameassetfactory`
      (`games/blenkehusis/`): Blenke, the tiles, the backdrop layers,
      the checkpoint's phone booth, the police car, the horizon (the
      Globe behind the flats), the enemies and what they throw, the
      items and power-ups, the HUD's hearts and Blenke's head, the
      suburb's scenery, the goal, the cone, the sign, the gate, a room's
      inside, the moving platform, the sewage stream, the pensioner and
      the station's house and pump and the power-up effects are delivered
      and drawn: all of Förorten. The station's name board, the
      runestone, the villas' panelling and the greenhouse glass (other
      levels) are still drawn in code. Each new sheet needs its entry in
      `src/sprites.js` and the renderer's use of it; `tests/sprites.test.js`
      checks every delivery. Förorten's share was ordered on 2026-11-10,
      in six batches at the game's current sizes in `src/art/`, each
      wired up as it is delivered:
      - [x] 1 items and power-ups (all 18; the power-ups double as HUD
            icons), delivered and wired up 2026-11-10
      - [x] 2 the HUD: Blenke's head for lives (the favicon follows it)
            and the heart, whole and lost, delivered and wired up
            2026-11-10
      - [x] 3 the suburb's scenery (bus stop, swings, slide, bench,
            street lamp, bin shed, parking sign), the goal, the cone and
            the sign, delivered and wired up 2026-11-10
      - [x] 4 the level's mechanics: the gate, a room's inside, the
            moving platform and the sewage leak, delivered and wired up
            2026-11-10
      - [x] 5 the pensioner (on the enemies' 20×25 frame) and the
            station's house and pump (its dial without the needle),
            delivered and wired up 2026-11-10
      - [x] 6 the power-up effects (rotor, steam, shield, note, bag,
            sparkle), delivered and wired up 2026-11-10

      The game keeps drawing the power-ups' glow, the gauge's needle and
      the hose itself. Not yet ordered: the station's name board and
      the runestone, the villas' panelling and the greenhouse glass
      (other levels).

- [ ] Decide, now that the code-review audit is done, whether to drop the
      code-drawn fallback for art the factory has delivered. Until then
      it is kept but not kept in step with the deliveries (decided
      2026-11-08): Blenke's sheet has him in a dark uniform with a white
      strap, while his fallback (`src/art/player.js`) and the spec still
      give him a reflective vest, and that is left as it is. Dropping it
      would make a failed delivery a plain error instead of old art.
