# TODO

Open work, newest first. Tick items off and delete them once done.

## Build plan

The game is built in portions from `docs/spec.md`, one at a time, in this
order. Each portion ends with the game playable, tested (`node --test
tests/` plus a look in the browser) and committed. A portion is planned in
detail when it starts, not before.

- [ ] **9. Polish.** The game feel of spec §11 (particles, screen
      shake, hit-stop, bounces, transitions) is done and released in
      0.3.0, performance measured and the backdrop sped up, and world
      1-1's balance accepted as it is for now (`node tools/balance.js`
      prints its numbers for later). Left, one commit per step:
  - [ ] 9.8 Code-review audit: `/code-review-audit full` (the first in
        this repo; about six reviewers, so on the owner's go-ahead). Its
        report goes to `docs/` in a `docs:` commit, and each confirmed
        finding is fixed in its own commit with its test.
  - [ ] 9.9 The next release, as the owner decides, and the game's
        page in `../narko-sites/sites/blenkehusis/` with it.
- [ ] **10. Mobile.** Playable on a phone. Settled 2026-11-08: the
      controls show when the main pointer is a finger (`pointer:
      coarse`) or on the first touch, and hide on a key; they are pixel
      art on the canvas; the phone is locked sideways where the browser
      allows it, else a screen asks to turn it; the high scores' names
      become three-letter arcade tags. Touch play (10.1), the screens by touch (10.2), the tags (10.3) and
      sideways (10.4) are done. One
      commit per step:
  - [ ] 10.5 The game's page in `../narko-sites/sites/blenkehusis/`
        (today "dator med tangentbord"), the spec and AGENTS.md.

## Features

- [ ] A new level, "Landet" (the countryside), where the red cottages
      now in the suburb's backdrop belong.

## Art

- [ ] The suburb perhaps without the red cottages: lower blocks of
      flats, two or three storeys, in their place (the cottages move to
      "Landet", see Features).

- [ ] The police station, its pump with the gauge and the hose for the
      factory to draw (today drawn in code, `src/art/station.js`).

- [ ] Order the rest of the art from `../../gameassetfactory`
      (`games/blenkehusis/`): Blenke, the tiles, the backdrop layers,
      the checkpoint's phone booth, the police car, the horizon (the
      Globe behind the flats), the enemies and what they throw are
      delivered and drawn; items and power-ups, the
      HUD's hearts and Blenke's head (still drawn in code, so it can
      differ from his sheet), the pensioner, the cone, the sign, the
      rest of the scenery, the power-up effects, the moving platform and
      the sewage stream are still drawn in code. Each new sheet needs its entry in
      `src/sprites.js` and the renderer's use of it; `tests/sprites.test.js`
      checks every delivery. Planned (2026-11-08, not yet sent), in
      batches at the game's current sizes in `src/art/`: 1 items and
      power-ups, 2 the HUD's hearts and Blenke's head (the favicon
      follows it), 3 the scenery, the goal, the cone and the sign, 4
      the pensioner (proposed on the enemies' 20×25 frame) and the
      station's house and pump (its dial without the needle), 5 the
      power-up effects, the moving platform and the sewage leak. The
      game keeps drawing the power-ups' glow, the gauge's needle and
      the hose itself.

- [ ] Decide, after the code-review audit (9.8), whether to drop the
      code-drawn fallback for art the factory has delivered. Until then
      it is kept but not kept in step with the deliveries (decided
      2026-11-08): Blenke's sheet has him in a dark uniform with a white
      strap, while his fallback (`src/art/player.js`) and the spec still
      give him a reflective vest, and that is left as it is. Dropping it
      would make a failed delivery a plain error instead of old art;
      `tests/favicon.test.js` builds on Blenke's code-drawn HUD head.
