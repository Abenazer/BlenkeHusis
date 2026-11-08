# TODO

Open work, newest first. Tick items off and delete them once done.

## Build plan

The game is built in portions from `docs/spec.md`, one at a time, in this
order. Each portion ends with the game playable, tested (`node --test
tests/` plus a look in the browser) and committed. A portion is planned in
detail when it starts, not before.

- [ ] **7. Menus and flow.** `src/game.js` runs the screens as a state
      machine stepped like the world, and a run carries score and lives
      from level to level. After the last level the game is over, with a
      yearly report, and goes on to the high scores. One commit per step:
  - [ ] 7.4 Level complete: `src/report.js` counts the level's totals
        (items, crates' and enemies' contents, secret rooms, enemies) for
        "found of total", the police performance report in bureaucratic
        prose, a time bonus counted into the score; the yearly report
        after the last level.
  - [ ] 7.5 `src/highscores.js`: the top ten, seeded with made-up
        officers, name entry typed on the keyboard (up to 10 characters,
        A–Ö, digits, space) after game over or the last level, then the
        list. Kept in memory only.
  - [ ] 7.6 `src/save.js`: consent asked the first time a score makes
        the list; only the choice is stored on "no". A versioned save,
        validated on load, a broken one kept under its own key, and the
        migration chain in place (with its test) for the first bump.
- [ ] **8. Sound.** Sound effects and chiptune music (title, world 1,
      boss), mute and volume. Each power-up needs its own sound (the
      spec), and the world's events (`crateOpened`, `powerUp`,
      `shielded`, `tossed`, `struck`, `helped`, …) say when. Web Audio
      synthesis, or sounds built in `../../gameassetfactory` (its audio
      pipeline) if that turns out better.
- [ ] **9. Polish.** Particles, screen shake, hit-stop, bounce animations,
      screen transitions, balancing, performance, a code-review audit, then
      a release and the game's page in `../narko-sites`.

## Art

- [ ] Order the rest of the art from `../../gameassetfactory`
      (`games/superlelle/`): Blenke, the tiles and the backdrop layers are
      delivered and drawn; enemies and what they throw, items and
      power-ups, the HUD's hearts and Blenke's head (still drawn in code,
      so it can differ from his sheet), the pensioner, the cone, the
      sign, the power-up effects, the moving platform and the sewage
      stream are still drawn in code. Each new sheet needs its entry in
      `src/sprites.js` and the renderer's use of it; `tests/sprites.test.js`
      checks every delivery.
