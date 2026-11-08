# TODO

Open work, newest first. Tick items off and delete them once done.

## Build plan

The game is built in portions from `docs/spec.md`, one at a time, in this
order. Each portion ends with the game playable, tested (`node --test
tests/` plus a look in the browser) and committed. A portion is planned in
detail when it starts, not before.

- [ ] **9. Polish.** The game feel of spec §11 (particles, screen shake,
      hit-stop, bounces, transitions), then balancing and performance,
      a code-review audit, a release and the game's page. Every effect
      follows the rules the game already keeps: it is data in a pure
      module, stepped by the fixed step from the world's own clock and
      seed (so a test sees what the player sees), and drawn through
      `toScreen`, each particle at its own place, never a scaled picture.
      Which event makes which effect is one table per kind, as `cues.js`
      is for sound, with a test that every world event has an entry or a
      place on the list of those without. Effects change nothing in the
      simulation but the hit-stop. One commit per step:
  - [ ] 9.3 Hit-stop and screen shake: `src/impact.js` says which events
        stop the world and for how many steps (a stomp 3, a heart lost
        4, a boss hit 6, a life lost 8, the boss beaten 12) and which
        shake it, how hard (at most 3 art pixels) and how long. During
        a stop nothing in the world moves (clock, platforms, pipes, the
        level's time), but sound plays at once and a jump pressed then
        is kept for the first step after (a test: buffered, not lost).
        The shake is a decaying offset added to the camera where it is
        drawn, never to the camera itself (its speed test still holds),
        and the HUD and screens stand still. `prefers-reduced-motion`
        turns the shake off; no setting, so no save change.
  - [ ] 9.4 Bounces: a collected item leaps up in a short arc and blinks
        out instead of vanishing (from its collected time, in the
        world); the HUD's counter it went to hops (hud.js gives the
        element an offset from when its number last changed, tested), a
        lost heart shakes out, the power-up's icon blinks as it runs
        out, and a checkpoint's booth gives a little jolt as it lights.
  - [ ] 9.5 Screen transitions: `game.js` holds a transition (kind,
        time): a cover closes over the old screen, the screen changes at
        its middle, the cover opens on the new one. An iris onto Blenke
        when a level starts, at the goal before the report and after a
        lost life (in place of the cut back to the checkpoint); a quick
        dither fade in the palette's ink between the screens around the
        play, short enough (about 0.2 s) not to slow the menus. Pausing
        stays instant. Keys are ignored while the cover closes, so
        nothing is skipped or taken twice; the music changes with the
        screen. Drawn in whole art pixels on the view. Tests step the
        game through each kind.
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
  - [ ] 9.9 Release and the page: the owner picks the version (0.3.0
        by the changelog); release as in AGENTS.md, check the workflow
        published the image and the server runs it. Then
        `../narko-sites/sites/blenkehusis/`: the version in the lede,
        "I spelet" with sound and music and the polish, a new section
        in `uppdateringar.html` from the changelog written for players,
        a fresh `share.jpg` if the look has changed, and the landing
        page's card if its text no longer fits; committed there as
        `docs(blenkehusis): update the pages for x.y.z`.

## Art

- [ ] Order the rest of the art from `../../gameassetfactory`
      (`games/superlelle/`): Blenke, the tiles, the backdrop layers and
      the checkpoint's phone booth are delivered and drawn; enemies and what they throw, items and
      power-ups, the HUD's hearts and Blenke's head (still drawn in code,
      so it can differ from his sheet), the pensioner, the cone, the
      sign, the power-up effects, the moving platform and the sewage
      stream are still drawn in code. Each new sheet needs its entry in
      `src/sprites.js` and the renderer's use of it; `tests/sprites.test.js`
      checks every delivery.
