# TODO

Open work, newest first. Tick items off and delete them once done.

## Build plan

The game is built in portions from `docs/spec.md`, one at a time, in this
order. Each portion ends with the game playable, tested (`node --test
tests/` plus a look in the browser) and committed. A portion is planned in
detail when it starts, not before.

- [ ] **3. Collectibles and score.** Urine samples in several sizes, minor
      possession, evidence and bonus items; hidden collectibles; combo
      multiplier; ranks unlocked by samples; satirical messages; the HUD
      (score, lives, samples, possession, level, time, power-up).
- [ ] **4. Enemies and hazards.** Health, damage, invulnerability, lives and
      respawning; stomping; the stoner, the dealer, the party people, the
      bureaucrat, the laboratory technician and the political ideologue;
      deep water, slime, syringes, police tape, urine puddles, moving
      platforms and leaking sewer pipes.
- [ ] **5. Power-ups and interaction.** Crates to bump open; police coffee,
      paperwork shield, mandatory testing, budget increase, super bladder
      and police helicopter; picking up and throwing objects; helping
      citizens (worth less than a suspicious container); signs to read.
- [ ] **6. The level.** World 1-1, the suburbs, complete: bus stop, parking
      lot, playground, apartment block with a secret room, checkpoint,
      canal, cordoned-off area; the prosecutor as a miniboss; the goal.
- [ ] **7. Menus and flow.** Title screen, controls, pause menu, game over,
      level complete with the police performance report, high scores with
      name entry (stored only with consent, versioned save).
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
      sprite drawn at its `toScreen` place. Lelle's frames there have the
      same size, pivot and animation names as the code-drawn ones; their
      crouch must stay within 16 pixels to fit a one-tile tunnel, as
      `tests/art.test.js` checks for the code-drawn frames.

## Repo

- [ ] Make the ghcr.io image public after the first build, like
      urinecollector's.
- [ ] Choose the address (`<name>.narkotikafritt.se`) and set up the server
      (`docs/deployment.md`).
