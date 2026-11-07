# Changelog

All notable changes to this project are documented here. The format is based
on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Blenke can walk, run, jump, crouch and crawl on a test level. The jump goes
  higher the longer the button is held, and still works a moment after
  running off an edge or when pressed just before landing. Down and jump
  drop through thin platforms.
- The game is drawn at a fixed retro resolution and scaled to the window
  without stretching; the camera follows Blenke smoothly and looks ahead.
- Up arrow (and W) jump too.
- Pixel art: Blenke in uniform, cap and reflective vest, with his clipboard
  and urine sample bag, breathes and blinks standing still, and walks,
  runs, jumps, falls, ducks and crawls. The suburb has lawns, red brick,
  concrete, asphalt with kerbs, balconies and planks, in front of a sky
  with clouds, blocks of flats with a water tower, and row houses and trees
  that scroll past at different speeds.
- The level's name shows when it starts, in the game's own pixel font,
  which has å, ä and ö.
- Things to collect: urine samples in three sizes (a big jar counts as
  five samples, for the statistics), minor possession worth more than
  anything else, evidence (a plastic bag, an empty tin, a spoon, a test
  tube) and bonus items (police coffee, paperwork, a government directive,
  taxpayers' money). Some are hidden and only show when Blenke comes close.
- Pickups in quick succession raise a combo multiplier, up to ×5, and each
  pickup's points float up from where it was.
- Samples earn police ranks, from Polisaspirant up, and pickups, ranks and
  long spells of finding nothing earn satirical remarks under the HUD.
- A HUD with the rank and score, lives, samples, minor possession, the
  level, the time left (red when it runs short) and a slot for power-ups.
- Enemies: the stoner, who harms no one and hands out samples; the dealer,
  who runs when Blenke comes near; party people dancing about at random;
  the bureaucrat, who throws paperwork; the laboratory technician, who
  lobs test tubes; and the political ideologue, who paces and shouts
  slogans. Landing on one puts it out of action ("ÄNNU EN FARLIG
  MEDBORGARE OSKADLIGGJORD!") for fewer points than a crumb of cannabis,
  and some drop what they carry.
- Hazards: deep water, toxic slime, giant syringes, slippery urine
  puddles, police tape to jump over, leaking sewer pipes that spray on and
  off, and moving platforms that carry Blenke across water and up to
  ledges.
- Health and lives: Blenke has three hearts, shown over his lives. A hit
  knocks him back and leaves him blinking and safe for a moment; the last
  heart, a pit, deep water or the clock running out cost a life, with a
  remark, and he starts again at the start of the level. Losing the last
  life ends the game, which then starts over.
- Crates: jump into one from below, or hit it with a thrown cone, and what
  it holds pops out on top.
- Six power-ups, one at work at a time, shown in the HUD with the seconds
  left (blinking as they run out) and around Blenke: police coffee (faster
  running), the paperwork shield (takes one hit), mandatory testing (shows
  every hidden item), a budget increase (double points), the super bladder
  (every sample counts twice) and the police helicopter (hold jump to fly).
- C or E picks up a traffic cone and throws it: it puts an enemy out of
  action and opens crates. The same key helps citizens in need, for five
  points ("MEDBORGARE HJÄLPT. SYNS INTE I STATISTIKEN."), and reads signs.

### Changed

- Blenke and the suburb's ground, walls, platforms, hazards and crates
  are now the asset factory's pixel art, with a six-frame walk and run
  and animated water and slime.
- The game is now called Blenke Husis & Urinjakten.
- The police officer is now called Blenke Husis, Blenke for short.

### Fixed

- Blenke no longer shakes back and forth while running, and the view
  scrolls smoothly instead of in jerky steps: positions land on screen
  pixels rather than whole art pixels, and the camera eases its speed up
  and down instead of changing it at once.
- The scenery no longer judders while scrolling, at any window size, browser
  zoom or display scaling: each tile is drawn at its own place on screen
  instead of the whole scene being stretched, and the game uses every
  pixel of the screen exactly.
- Movement no longer judders in browsers that report uneven frame times
  (whatever moved on screen, Blenke or the scenery, stuttered): the game
  learns the screen's refresh rate and keeps to it.
- F2 shows a measuring panel with frame times, the screen's refresh rate
  and the canvas size, for tracking down stutter.

### Development

- The asset factory's first delivery: Blenke and the suburb's tiles as
  sprite sheets in `assets/sprites/`, drawn by the game, with the
  code-drawn art as a fallback; every delivery is checked by the tests
  (checksums, palette, sizes, pivots, animations, hazard surfaces).
- Crates, power-ups, props, citizens and signs as pure modules with tests;
  the test level gained a section with all of them.
- Engine: fixed-step loop with interpolation, keyboard input, text levels,
  tile collision with one-way platforms, player movement and camera, with
  tests.
- Art as pixel data in the asset factory's palette (`src/art/`), with tests
  of its colours, sizes and animations and of which animation plays.
- Enemies, their AI and projectiles, hazard tiles, moving platforms, health
  and lives, with tests; the test level gained a stretch of enemies and
  one of hazards.
- The game's address, blenke.narkotikafritt.se, recorded for the server.
- Items, score, messages and the HUD layout as pure modules with tests;
  items placed on the test level.

- Project scaffold: HTML5 canvas page, node:test setup, CI and Docker image,
  agent conventions (`AGENTS.md`), review workflow, verify skill and safety
  hooks.
