# Changelog

All notable changes to this project are documented here. The format is based
on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- Blenke, the enemies, the citizens and everything else on a lawn now
  stand in the grass: its blades reach up in front of their feet. Pickups
  lie on top of the blades, so even the small ones show whole.
- The backdrop draws far faster on large screens: on a 4K canvas without
  a graphics card the game went from about 32 to 53 frames a second.
- The F2 panel shows how long the game spends stepping and drawing each
  frame.
- Power-ups stand out from the plain finds: they glow round their outline
  in shifting hi-vis yellow and blue light, and glitter in the same
  colours (the police coffee no longer looks like any cup of coffee).
- The parking lot in world 1-1 has one police car instead of three.

### Development

- `src/fringe.js` says which lawn tiles grow a fringe, how many rows it
  takes and how far pickups are lifted above it; a test holds the delivered and the code-drawn lawn to leaving no
  gap under it.
- `src/backdrop.js` splits each backdrop layer into bands to fill or draw
  in columns; a test redraws every layer from its bands, pixel for pixel.
- `outline` in `src/pixels.js` rings a picture in a colour; tests hold the
  power-ups' glow to their outlines and their glitter to themselves.
- The verify skill's Chromium profile folder is named after blenkehusis.
- TODO.md plans a filling station at the end of each level, with a urine bonus.
- TODO.md plans fewer police cars, a countryside level and lower flats for the suburb.
- TODO.md plans portion 10: playing on a phone, with touch controls.
- World 1-1's balance is accepted as it is for now, after the owner played it.

## [0.3.0] - 2026-11-08

### Added

- Sound, chiptune style: Blenke's jumps, landings (harder the further he
  falls) and bumps of the head, and a sound for each kind of find:
  urine samples ping, evidence beeps, bonus items arpeggiate and minor
  possession gets a small fanfare. A combo of pickups climbs the scale.
  Sound starts with the first key press and stops while the tab is
  hidden.
- Sounds for the rest of the level: getting hurt, the paperwork shield
  taking a hit, a life lost (a sad tune, a slide whistle into a pit, a
  sinking wobble in the water, a buzzer when time is up), stomping and
  striking enemies, the prosecutor's gavel as he wakes and the thud of
  each hit, crates splitting, every power-up with its own sound (coffee
  rush, stamp, scanner, ka-ching, gurgle, rotor) and one as it runs out,
  promotions, helping a citizen (half-hearted), signs, cones, secret
  rooms, checkpoints and the barrier lifting. Enemies throwing, dropping
  and shouting are heard when they are on screen.
- The clock sounds an alarm at 30 seconds left and ticks through the
  last ten.
- Sounds on the screens: the menus' mark moving and a choice taken,
  pausing and going on, moving on from a report or the game over, each
  letter typed for the high scores (and a buzz for one the name won't
  take), and the time bonus ticking into the score with a ka-ching at
  the end.
- Music: the title screens play a jaunty chiptune march, the police band
  at a ribbon cutting, with a bridge stamping its notes in triplicate.
- World 1 has its own bouncy theme, and the prosecutor a courtroom drama
  far too grand for 0.02 grams while he fights. Reaching the goal plays a
  short fanfare, the reports come with lift music, the game over slides
  sadly down, and a score that makes the list gets a fanfare of its own.
  The music stops while a lost life passes and starts again with Blenke.
- Pausing turns the music down, and leaving the window silences the game
  until you come back.
- M turns all sound off and on, on any screen but the name entry; a
  struck-through loudspeaker in the corner shows it is off.
- LJUD on the title and pause menus sets the music's and the effects'
  volume, ten steps each, with ← and →. The controls screen lists M.
- The sound settings are saved with the high scores, once you have said
  yes to saving; you are never asked for them alone.
- Particles: dust from Blenke's feet as he jumps, lands hard and skids
  round at a run; stars and a puff of smoke from a stomped enemy,
  splinters from a crate, a sparkle in each find's colours, stars when
  he is hurt, shredded forms when
  the paperwork shield takes a hit, a ring of sparkles at a promotion and
  confetti at the goal. The prosecutor sheds paperwork with every hit
  and goes out in a storm of forms.
- Anything falling into the canal or the slime splashes, with a sound:
  Blenke, a cone, a dropped bag.
- The surroundings stir: slime bubbles, the canal glints, and a leaking
  pipe sprays where its stream lands and drips between leaks.
- Blows land with weight: the world stops for a split second when Blenke
  stomps or strikes an enemy or is hurt, longer for each hit on the
  prosecutor and longest when he is beaten. A jump pressed in that
  moment still counts.
- The view shakes when the prosecutor is hit and beaten, as the barrier
  lifts, when Blenke is hurt, as a crate splits and on the hardest
  landings. It stays still if your system is set to reduce motion.
- A find leaps up from where it was and blinks out instead of vanishing.
  The score and the count it adds to hop on the HUD, a heart lost
  shakes as it greys, a life lost hops the lives, and a phone booth
  jolts as it lights up.
- Screen transitions: a level opens with an iris on Blenke, and the iris
  closes on him after a lost life (opening again where he starts over),
  at the goal before the report and before the game over. The menus,
  reports and lists fade in from black in a pixel dither; pausing is
  still at once.

### Changed

- Blenke has a new look from the asset factory: a dark blue uniform with
  a white strap across it.
- The parked police cars are the asset factory's: a white saloon with
  POLIS along its side and the blue and yellow stripes.
- The Globe rises on the horizon behind the blocks of flats, drifting
  past slower than they do; the water tower among the flats is gone.
- The title menu has LJUD, before Topplista, and the pause menu has it
  between Fortsätt and Avsluta. The consent question says the sound
  settings are saved too.
- The checkpoints are phone booths, where Blenke calls in his status
  report: dark until he passes, then lit.

### Development

- A chip synthesizer that renders sounds as sample data, with tests on
  every sound's start, peak, end and level; cues map the game's events to
  them, and a test fails on an event that is neither cued nor listed
  silent. Songs are written as text and rendered into seamless loops,
  a few voices a frame.
- A listening page, like the asset factory's for sprites:
  `node tools/audition.js <dir>` writes every effect and song as WAV
  files at the game's levels, with a page showing each one's waveform,
  numbers and checks (now shared with the tests in `src/soundcheck.js`).
- The save is version 2, with the sound settings; a migration brings a
  version 1 save up with the default settings, and a test loads one.
- Particles are data in the world (`src/particles.js`), on their own
  seed; a test fails on a world event that neither bursts nor is listed
  without one. The world's events say where they happened; the
  surroundings stir tile by tile on the world's clock, only near the view.
- A test holds a finished pickup's leap ended however far behind the
  world the drawing is.
- `node tools/balance.js` prints a level's numbers for balancing it:
  finds and points, how far the samples go up the ranks, the clock and
  the time bonus, the boss, and the checkpoints against the dangers.
- The hit-stop and the shake are a table by event in `src/impact.js`,
  held to every world event like the particles and the cues; the tests
  share one scan of the events the modules send.

## [0.2.0] - 2026-11-08

### Added

- A title screen: BLENKE HUSIS & URINJAKTEN in big arcade letters over the
  suburb drifting past, with a menu: Starta, Kontroller and Topplista.
- A controls screen, "enligt tjänsteföreskrift 1992:4", listing every
  key.
- A favicon: Blenke's head in his cap, as on the HUD.
- A game over screen: SPELET ÄR SLUT, the investigation is dropped, and
  the case file shows your rank, score, samples, possession, evidence,
  citizens neutralised and helped (not in the statistics) and where you
  were last seen.
- The police performance report after each level: samples, possession,
  evidence, secret rooms and citizens neutralised and helped, each found
  out of how many there were; the time bonus (10 points a second left)
  counting into your score; what the operation cost, what was seized and
  the cost per gram; and a verdict.
- The year's report after the last level adds the whole game up and
  names the officer of the year.
- High scores: a score that makes the top ten is signed with your name
  (typed, up to ten characters, å, ä and ö included), and the list shows
  with your entry picked out. Ten made-up officers start the list.
  Topplista on the title menu opens it.
- The high scores can be saved in your browser. The first time a score
  makes the list, the game asks first; say no and only that answer is
  kept, and you won't be asked again. A save that can't be read is kept
  aside rather than overwritten.
- Pause with Esc or P: the game stands still under a menu with Fortsätt and
  Avsluta. It also pauses by itself when you leave the window.

### Changed

- The score and lives now carry over from one level to the next.
- The game no longer starts over by itself: after the game over, or the
  last level, it goes on to the high scores and then the title. The game
  over line shows for two seconds before its screen, and the goal's for
  three before the report.

### Development

- The game's screens run as a state machine in `game.js`, with menus in
  `menu.js` and the screens laid out as data in `screens.js`; a key can mean
  several actions.
- The controls screen reads the key map, so it can't go stale; the font
  has arrows.
- `save.js` holds the save rules: consent first, a versioned and
  validated save, broken saves kept, and a tested migration chain.
- `report.js` counts what each level holds to be found (crates' and
  enemies' contents included) and the world tallies what was found.
- The README lists the menu keys and how the high scores are saved.

## [0.1.0] - 2026-11-08

### Added

- World 1-1, the suburbs, a complete level: the bus stop, the parking
  lot, the playground, a block of flats cut open (with a secret room
  somewhere), the canal, a cordoned-off area, the prosecutor's courtroom
  and the goal, furnished with a bus shelter, police cars, swings, a
  slide, benches, street lamps, a bin shed and parking signs.
- The prosecutor, a miniboss: he waits for Blenke, lobs binders of charges
  and skims documents along the floor, takes three hits (angrier after
  each, and he throws Blenke off his head) and lifts the barrier when
  beaten. He is worth half a crumb of cannabis.
- Checkpoints: once Blenke has passed one, a lost life starts him there.
- Reaching the goal's flagpole completes the level ("UPPDRAGET SLUTFÖRT.
  SKATTEPENGAR VÄL ANVÄNDA."), and the game goes on to the next one.
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
- The backdrop is now the asset factory's pixel art too: sky, clouds,
  the blocks of flats with the water tower, and the falu-red row houses,
  their roofs the right way up and their windows evenly spaced up to the
  door.
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

- The repository is now BlenkeHusis on GitHub, and the Docker image
  `ghcr.io/abenazer/blenkehusis` (the local container `blenkehusis`).
- Level format: checkpoints (C), the goal (G), scenery (1–8), a gate (|),
  secret walls (:) and rooms' insides (;), a level's title; markers in a
  room stand on the room. `?bana=<id>` starts at a level, the test level
  included. Tests for all of it and the prosecutor.
- The asset factory's first delivery: Blenke and the suburb's tiles as
  sprite sheets in `assets/sprites/`, drawn by the game, with the
  code-drawn art as a fallback; every delivery is checked by the tests
  (checksums, palette, sizes, pivots, animations, hazard surfaces).
  The second delivery adds the four backdrop layers, checked for their
  layer's size and the colour under them.
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
