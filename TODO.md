# TODO

Open work, newest first. Tick items off and delete them once done.

## Build plan

The game is built in portions from `docs/spec.md`, one at a time, in this
order. Each portion ends with the game playable, tested (`node --test
tests/` plus a look in the browser) and committed. A portion is planned in
detail when it starts, not before.

- [ ] **5. Power-ups and interaction.** Crates to bump open; police coffee,
      paperwork shield, mandatory testing, budget increase, super bladder
      and police helicopter; picking up and throwing objects; helping
      citizens (worth less than a suspicious container); signs to read.
- [ ] **6. The level.** World 1-1, the suburbs, complete: bus stop, parking
      lot, playground, apartment block with a secret room, checkpoint,
      canal, cordoned-off area; the prosecutor as a miniboss; the goal.
      A lost life starts Blenke at the last checkpoint passed instead of
      the start (`respawn` in `world.js`).
- [ ] **7. Menus and flow.** Title screen, controls, pause menu, game over
      (in place of today's, which only starts the game again:
      `isGameOverDone`), level complete with the police performance report
      and end-of-level statistics (the counts in `score.js`, found out of
      the level's total, secrets and enemies defeated included), high
      scores with name entry (stored only with consent, versioned save).
- [ ] **8. Sound.** Sound effects and chiptune music (title, world 1,
      boss), mute and volume. Web Audio synthesis, or sounds built in
      `../../gameassetfactory` (its audio pipeline) if that turns out
      better.
- [ ] **9. Polish.** Particles, screen shake, hit-stop, bounce animations,
      screen transitions, balancing, performance, a code-review audit, then
      the first release (0.0.1) and the game's page in `../narko-sites`.

## Art

- [ ] Switch to the asset factory's sprites once the author approves them:
      `../../gameassetfactory` (`games/superlelle/`) delivers PNG sheets
      with TexturePacker JSON to `assets/sprites/<category>/<id>.png` and
      `.json`, with `assets/sprites/delivered.json` as a manifest (schema:
      `gameassetfactory/docs/architecture/sprite-spec.md`). Slice each
      sheet into the same frame names `src/art/` uses now, and keep each
      sprite drawn at its `toScreen` place. Blenke's frames there
      (`exports/sprites/characters/player/player.json`, spec in
      `sprites/characters/player/spec.toml`) have the same size, pivot and
      animation names as the code-drawn ones; their crouch must stay
      within 16 pixels to fit a one-tile tunnel, as
      `tests/art.test.js` checks for the code-drawn frames.

## Repo

- [ ] Make the ghcr.io image public after the first build, like
      urinecollector's.
- [ ] Set up the server for https://blenke.narkotikafritt.se/ (the DNS
      record is in place): nginx site, certificate and container, as in
      `../urinecollector/docs/deployment.md` (`docs/deployment.md`).
