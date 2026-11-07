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

### Fixed

- Lelle no longer shakes back and forth while running, and the view
  scrolls smoothly instead of in jerky steps: positions land on screen
  pixels rather than whole art pixels, and the camera eases its speed up
  and down instead of changing it at once.
- The scenery no longer judders while scrolling, at any window size, browser
  zoom or display scaling: each tile is drawn at its own place on screen
  instead of the whole scene being stretched, and the game uses every
  pixel of the screen exactly.

### Development

- Engine: fixed-step loop with interpolation, keyboard input, text levels,
  tile collision with one-way platforms, player movement and camera, with
  tests.

- Project scaffold: HTML5 canvas page, node:test setup, CI and Docker image,
  agent conventions (`AGENTS.md`), review workflow, verify skill and safety
  hooks.
