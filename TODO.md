# TODO

Open work, newest first. Tick items off and delete them once done.

## Build plan

The game is built in portions from `docs/spec.md`, one at a time, in this
order. Each portion ends with the game playable, tested (`node --test
tests/` plus a look in the browser) and committed. A portion is planned in
detail when it starts, not before.

- [ ] **1. Engine.** Fixed internal resolution (384×216) scaled to the window
      without distortion; a fixed-step game loop with interpolation; keyboard
      input; tile levels written as text; collision with solid tiles and
      one-way platforms; Lelle's movement (acceleration, friction, gravity,
      variable jump height, coyote time, jump buffering, running, crouching);
      a smooth camera. Simple rectangles for graphics, on a test level.
- [ ] **2. Pixel art.** A bitmap font with å, ä and ö; Lelle animated (idle,
      walking, running, jumping, crouching); suburb tiles; parallax
      backgrounds.
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

## Repo

- [ ] Make the ghcr.io image public after the first build, like
      urinecollector's.
- [ ] Choose the address (`<name>.narkotikafritt.se`) and set up the server
      (`docs/deployment.md`).
