# TODO

Open work, newest first. Tick items off and delete them once done.

## Build plan

The game is built in portions from `docs/spec.md`, one at a time, in this
order. Each portion ends with the game playable, tested (`node --test
tests/` plus a look in the browser) and committed. A portion is planned in
detail when it starts, not before.

No portion is under way: portions 1–10 are done and released in 0.4.0.
Since then, unreleased: world 1 has grown to four levels (1-2
Södertörns villastad, 1-3 Västerhaninge, 1-4 Krigslida) and Förorten is
drawn entirely from the factory's sheets. The next portion is planned
when it starts, from the open work below; world 2, "The City After
Dark" (`docs/spec.md`, section 6), is the next world.

## Release

- [ ] Release 0.5.0 when the owner says so: play 1-2, 1-3 and 1-4
      through to the end first (neither 1-3 nor 1-4 has been), then
      update the game's page in `../narko-sites` (it still describes
      0.4.0's one level).

## Features

- [ ] Try the game on an iPhone when one is at hand: upright it should
      say VÄND TELEFONEN, and play once turned by hand (Android was
      tried on a Pixel 8, 2026-11-08).

- [ ] A new level, "Landet" (the countryside), where the red cottages
      now in the suburb's backdrop belong.

## Art

- [ ] Order world 1's last pieces from `../../gameassetfactory`
      (`games/blenkehusis/`), today drawn in code: the villas' yellow
      wooden panelling (tile `W`, with a white trim on top, in
      `src/art/tiles.js`), a greenhouse's glass (tile `g`, seen through),
      a runestone (`runestone`, 16×28) and the station's name board
      (`stationSign`, 128×40, in `src/art/scenery.js`), delivered blank:
      the game writes each level's station name on it. Each new sheet
      needs its entry in `src/sprites.js` and the renderer's use of it;
      `tests/sprites.test.js` checks every delivery. Everything else
      that is drawn is delivered (Förorten's six batches, ordered and
      wired up 2026-11-10); the game keeps drawing the power-ups' glow,
      the gauge's needle and the hose itself.

- [ ] A backdrop per level? Villastad, Västerhaninge and Krigslida are
      set in the 1970s and 80s, but the suburb's backdrop shows the
      Globe, built 1986–89, and Krigslida is fields and greenhouses, not
      blocks of flats. A level could name the layers it shows (and leave
      out the horizon); Krigslida might want the countryside planned for
      "Landet".

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
