# TODO

Open work, newest first. Tick items off and delete them once done.

## Build plan

The game is built in portions from `docs/spec.md`, one at a time, in this
order. Each portion ends with the game playable, tested (`node --test
tests/` plus a look in the browser) and committed. A portion is planned in
detail when it starts, not before.

- [ ] **8. Sound.** Sounds are sample data, as art is pixel data: a pure
      synthesizer (`src/synth.js`: pulse with duty, triangle, noise, pitch
      and volume envelopes) renders effects and music into sample arrays,
      and `src/audio.js`, the thin Web Audio layer, only plays them as
      buffers. So tests check every sound the way the asset factory
      checks its own (peak under full scale, no click at the end, length,
      loudness within its group), a loop is seamless by construction and
      the music's timing never depends on a scheduler. The factory is not
      used here: it delivers short WAV effects only (music only as
      stingers, nothing over 3 s); its sounds can replace effects later,
      by id, as its sheets replace the art. One commit per step:
  - [ ] 8.2 The world's sounds: hurt, shielded, life lost (by cause:
        pit, water, clock), game over, stomp, struck, wounded, crate
        opened, each power-up its own (the spec) and its end, promoted,
        helped, read, lifted, tossed, secret found, checkpoint, boss
        awake, gates opened, level complete; a warning as the clock runs
        low. A test fails when the world emits an event type that has
        neither a cue nor a place on the list of silent ones.
  - [ ] 8.3 The screens' sounds: `stepGame` returns the screens' events
        too (menu moved, chosen, greyed out, paused, letter typed, the
        time bonus counted in, a new high score), with their cues.
  - [ ] 8.4 Music: songs as text in `src/music/` (a tracker's rows: two
        pulse voices, triangle bass, noise drums; tempo and loop point),
        parsed and rendered by pure modules, a test parsing every song
        (equal channel lengths, notes in range, the loop seamless). The
        title theme first, looped, starting on the first key press.
  - [ ] 8.5 World 1's theme, the prosecutor's (from `bossAwake` until
        `gatesOpened`), and jingles: level complete, game over, the
        reports, a high score. `musicFor(game)` (pure, tested) says what
        plays on each screen; audio.js crossfades between them. Pause
        lowers the music; leaving the window silences everything.
  - [ ] 8.6 Mute and volume: M turns all sound off and on (a small icon
        shows it off); a LJUD screen on the title and pause menus sets
        music and effects (0–10, ← →); the controls screen lists M.
        The settings are saved with the high scores only when the player
        has allowed saving (never asked for them alone): save version 2,
        a migration from 1 with a test loading a version 1 save.
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
