# TODO

Open work, newest first. Tick items off and delete them once done.

## Build plan

The game is built in portions from `docs/spec.md`, one at a time, in this
order. Each portion ends with the game playable, tested (`node --test
tests/` plus a look in the browser) and committed. A portion is planned in
detail when it starts, not before.

- [ ] **7. Menus and flow.** Title screen, controls, pause menu, game over
      (in place of today's, which only starts the game again:
      `isGameOverDone`), level complete with the police performance report
      and end-of-level statistics (the counts in `score.js`, found out of
      the level's total, secrets and enemies defeated included; the
      world's `levelComplete` event carries the time left), high
      scores with name entry (stored only with consent, versioned save).
- [ ] **8. Sound.** Sound effects and chiptune music (title, world 1,
      boss), mute and volume. Each power-up needs its own sound (the
      spec), and the world's events (`crateOpened`, `powerUp`,
      `shielded`, `tossed`, `struck`, `helped`, …) say when. Web Audio
      synthesis, or sounds built in `../../gameassetfactory` (its audio
      pipeline) if that turns out better.
- [ ] **9. Polish.** Particles, screen shake, hit-stop, bounce animations,
      screen transitions, balancing, performance, a code-review audit, then
      the first release (0.0.1) and the game's page in `../narko-sites`.

## Art

- [ ] Order the rest of the art from `../../gameassetfactory`
      (`games/superlelle/`): Blenke and the tiles are delivered and drawn;
      the backdrop layers, enemies and what they throw, items and
      power-ups, the HUD's hearts and Blenke's head (still drawn in code,
      so it can differ from his sheet), the pensioner, the cone, the
      sign, the power-up effects, the moving platform and the sewage
      stream are still drawn in code. Each new sheet needs its entry in
      `src/sprites.js` and the renderer's use of it; `tests/sprites.test.js`
      checks every delivery.

## Repo

- [ ] Make the ghcr.io image public after the first build, like
      urinecollector's.
- [ ] Set up the server for https://blenke.narkotikafritt.se/ (the DNS
      record is in place): nginx site, certificate and container, as in
      `../urinecollector/docs/deployment.md` (`docs/deployment.md`).
