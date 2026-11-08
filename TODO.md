# TODO

Open work, newest first. Tick items off and delete them once done.

## Build plan

The game is built in portions from `docs/spec.md`, one at a time, in this
order. Each portion ends with the game playable, tested (`node --test
tests/` plus a look in the browser) and committed. A portion is planned in
detail when it starts, not before.

- [ ] **9. Polish.** The game feel of spec §11 (particles, screen
      shake, hit-stop, bounces, transitions) is done and released in
      0.3.0. Left, one commit per step:
  - [ ] 9.6 Balancing, with the owner playing: `tools/balance.js`
        prints a level's numbers (points to find by kind, samples to
        each rank, the time bonus at a few finishing times, the boss's
        hits, the distance between checkpoints). Then the owner plays
        world 1-1 a few times and says what is too hard, too easy or
        too slow; the tuning goes into the data (config, enemies,
        items, ranks, the level's text and clock), and the tests that
        pin numbers follow. Questions to answer: is the clock enough
        for a run that looks for secrets, do two or three promotions
        come in one level, is the prosecutor fair, are the checkpoints
        where a life is likely lost, is the combo's window right.
  - [ ] 9.7 Performance, measured before anything changes: the F2 panel
        shows the time spent stepping and drawing each frame (median
        and 95th percentile), and a headless Chrome trace of 1-1 at
        1080p and 4K canvas sizes. Likely suspects, changed only where
        the numbers point: drawImage calls per frame (tiles, backdrop
        columns, particles), per-frame allocations (events arrays, the
        bumps' Map), the text cache clearing, the music rendering at
        start, the first load's size. Goal: step plus draw under 4 ms
        at 1080p on the author's machine, no long frames as the songs
        render; the game's motion still measures even (AGENTS.md).
  - [ ] 9.8 Code-review audit: `/code-review-audit full` (the first in
        this repo; about six reviewers, so on the owner's go-ahead). Its
        report goes to `docs/` in a `docs:` commit, and each confirmed
        finding is fixed in its own commit with its test.
  - [ ] 9.9 The next release, as the owner decides, and the game's
        page in `../narko-sites/sites/blenkehusis/` with it.

## Art

- [ ] Order the rest of the art from `../../gameassetfactory`
      (`games/superlelle/`): Blenke, the tiles, the backdrop layers,
      the checkpoint's phone booth, the police car and the horizon (the
      Globe behind the flats) are delivered and drawn; enemies and what they throw, items and power-ups, the
      HUD's hearts and Blenke's head (still drawn in code, so it can
      differ from his sheet), the pensioner, the cone, the sign, the
      rest of the scenery, the power-up effects, the moving platform and
      the sewage stream are still drawn in code. Blenke's sheet now has
      him in a dark uniform with a white strap; his code-drawn fallback
      (`src/art/player.js`) and the spec still give him a reflective
      vest. Each new sheet needs its entry in
      `src/sprites.js` and the renderer's use of it; `tests/sprites.test.js`
      checks every delivery.
