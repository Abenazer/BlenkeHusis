# Changelog

All notable changes to this project are documented here. The format is based
on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Lelle can walk, run, jump, crouch and crawl on a test level. The jump goes
  higher the longer the button is held, and still works a moment after
  running off an edge or when pressed just before landing. Down and jump
  drop through thin platforms.
- The game is drawn at a fixed retro resolution and scaled to the window
  without stretching; the camera follows Lelle smoothly and looks ahead.
- Up arrow (and W) jump too.
- Pixel art: Lelle in uniform, cap and reflective vest, with his clipboard
  and urine sample bag, breathes and blinks standing still, and walks,
  runs, jumps, falls, ducks and crawls. The suburb has lawns, red brick,
  concrete, asphalt with kerbs, balconies and planks, in front of a sky
  with clouds, blocks of flats with a water tower, and row houses and trees
  that scroll past at different speeds.
- The level's name shows when it starts, in the game's own pixel font,
  which has å, ä and ö.

### Fixed

- Lelle no longer shakes back and forth while running, and the view
  scrolls smoothly instead of in jerky steps: positions land on screen
  pixels rather than whole art pixels, and the camera eases its speed up
  and down instead of changing it at once.
- The scenery no longer judders while scrolling, at any window size, browser
  zoom or display scaling: each tile is drawn at its own place on screen
  instead of the whole scene being stretched, and the game uses every
  pixel of the screen exactly.
- Movement no longer judders in browsers that report uneven frame times
  (whatever moved on screen, Lelle or the scenery, stuttered): the game
  learns the screen's refresh rate and keeps to it.
- F2 shows a measuring panel with frame times, the screen's refresh rate
  and the canvas size, for tracking down stutter.

### Development

- Engine: fixed-step loop with interpolation, keyboard input, text levels,
  tile collision with one-way platforms, player movement and camera, with
  tests.
- Art as pixel data in the asset factory's palette (`src/art/`), with tests
  of its colours, sizes and animations and of which animation plays.

- Project scaffold: HTML5 canvas page, node:test setup, CI and Docker image,
  agent conventions (`AGENTS.md`), review workflow, verify skill and safety
  hooks.
