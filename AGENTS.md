# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository. Read this
before making changes. Keep it up to date as the project evolves.

## Project overview

- **What it is:** Blenke Husis & Urinjakten — a satirical platformer. Run, jump
  and collect urine samples through levels full of absurd obstacles, satire
  and criticism of the system. One of the game ideas in `../GAMES.md`.
- **Tech stack:** HTML5 + plain JavaScript (ES modules), CSS, drawn on a
  `<canvas>`. No framework, no bundler, no build step — the files in the repo
  are what the browser loads. Node.js 18 (`node:test`) runs the tests.
- **No dependencies.** There is no npm on this machine and nothing to install.
  Don't add a package, CDN script or build tool without asking first.
- **Entry point:** `index.html`, which loads `src/main.js` as a module. ES modules
  don't load from `file://`, so serve the repo root over HTTP (see Common commands).

## Repository layout

```
index.html  The page — static markup and the game canvas
src/        JavaScript modules
  main.js       Page wiring: loads the delivered sprite sheets, canvas scaling, the system's wish for less motion (no shake), keyboard and touch events (and pausing when the window loses focus), fullscreen and the sideways lock at the first touch, the screen asking an upright phone to turn, the frame loop handing each step's events to the cues (the only DOM code besides render.js and audio.js)
  render.js     Turns the art (sheets where delivered, code-drawn otherwise) into canvases once and draws backdrop, tiles, platforms, items, enemies, Blenke, the grass's fringe in front of them and text onto the screen canvas, scaled, secret walls in front of everything, and the screens over it (or over the bare backdrop); the touch controls over the play, on the screen rather than the view
  fringe.js     The grass in front of what stands on it: which lawn tiles grow a fringe (not under a hazard), how many top rows it is, how far raised, pickups lifted above it; only the picture, never the collision
  backdrop.js   A backdrop layer's rows in bands: one-colour rows filled across the view, the rest drawn in columns with empty ones skipped (the same picture, far less to scale)
  projection.js World to screen: round((position - camera) * scale), the one rule everything is placed by
  palette.js    The master palette, the asset factory's (../../gameassetfactory, games/blenkehusis/game.toml)
  sprites.js    The factory's delivered sheets: what each replaces (Blenke, the checkpoint, tiles, enemies, what they throw, items, HUD icons, scenery, the goal, props, the sign, the platform and the leak, citizens, the station, power-up effects, backdrop layers), and reading their TexturePacker JSON
  synth.js      The chip synthesizer: renders a sound's voices (pulse, triangle, noise; slides, arpeggios, envelopes) into samples
  sounds.js     The sound effects as data: their voices, the channel that cuts them off and the gap before they repeat
  settings.js   The sound settings: the music's and effects' volume in ten steps (squared into gains) and whether sound is off
  soundcheck.js The rules every effect and song is held to (peak, onset, tail, length, level; a loop's seam), as checks that report what they measured: the tests assert them, the listening page shows them
  cues.js       Which song plays now and how loud (musicFor: by screen, the level's own, the boss's while he fights, jingles at the goal and the end, quieter paused), and events to sounds: which plays, at what pitch (the combo climbs a scale) and how loud; enemies off screen aren't heard, and every event the game sends is cued or listed silent
  music.js      Songs written as text (a bar of notes per string), parsed into voices and rendered a few at a time into one seamless loop
  music/        The songs (index.js lists them by id): band.js (the shared instruments and patterns), title.js, suburbs.js (world 1), prosecutor.js (the boss), jingles.js (goal, game over, high score, and the reports' muzak)
  audio.js      Web Audio: started on the first key press; renders the effects and then the songs a few milliseconds a frame from the page's start, plays the cues, and plays the song musicFor names (looped, or once for a jingle) at its volume, fading out the one before; silent while the tab is hidden or the window left
  pixels.js     Pixel images as data: text pixel maps, stamping, mirroring, outlines, deterministic noise
  art/          The art drawn in code, as pixel images: player.js (Blenke's frames and animations), enemies.js (enemies and what they throw, the hippie's notes, the skater's board), citizens.js, tiles.js (with the villas' panelling, the greenhouse glass, the hazards, crates, platform and sewage), backgrounds.js (parallax layers, and where the horizon's landmark stands), items.js (collectibles, power-ups and their glow, HUD icons), props.js (the cone and the sign), scenery.js (the suburb's furniture, the station's name board with each level's name written on it, the runestone, the checkpoint and the goal), station.js (the police station, its pump and gauge's needle, the hose), effects.js (power-ups at work), sound.js (the loudspeaker shown while sound is off, the volume bars), touch.js (the touch controls' pad, knob and buttons, the turn-the-phone picture), font.js (bitmap font with å, ä, ö), cover.js (the fade's dithered ink), logo.js (big arcade lettering from the font blown up: the title's logo, the game over's heading, the tag's letters); the font has arrows for the arrow keys
  animation.js  Which of Blenke's animations plays, and which frame
  config.js     Internal resolution, tile size, step length and Blenke's movement tuning
  loop.js       The fixed-step clock: frame time to whole steps plus an interpolation fraction, with jittery frame times snapped to the display's rate
  diagnostics.js The F2 measuring panel: reported frame times, display rate, steps per frame, the time spent stepping and drawing, canvas size
  input.js      Key codes to actions (a key can mean several: up is jump and the menus' up), the touch controls' own codes, and the keys' names; pressed/held/released per step; typed text for the tag; taps on the screens, as their targets
  touch.js      The touch controls: where the pad, jump, act and pause sit on the screen (a thumb's size), and which each finger holds, fed to the input as touch keys; the pad runs when pushed far
  game.js       The screens as a state machine (title, controls, the sound settings, playing, paused, game over, level and year reports, the time bonus counted in, name entry, the consent question, high scores; it saves through save.js) and the sound settings (M mutes on any screen but the name entry, where it is a letter), and the run of levels, carrying score and lives from one to the next; each step returns the world's events and the screens' own
  transitions.js How screens give way: the iris on Blenke worked out from the world's own clocks (a level opening, a lost life, the goal, the game over) and the fade as a screen around the play comes up; pausing comes at once
  menu.js       A menu's choices and the marked one, moved by up/down and taken by confirm or a tap (each told as an event, for its sound)
  screens.js    The screens around the play laid out as data (text and pictures at view positions, what can be tapped with its box, touch wording when played by touch); render.js draws them, tapAt says what a tap hit; the turn-the-phone screen on its own small view
  level.js      Parses text levels (one character per tile, sections side by side; crates and what they hold, signs and their texts) and answers tile questions
  levels/       The levels as text (index.js lists them in playing order, numbers each in its world and finds one by id; finish.js is the goal and filling station every level ends with; cast.js places characters in levels by column, outside their rows; forort1.js is the suburbs, villastad.js Södertörns villastad in the 1970s and 80s, vasterhaninge.js Västerhaninge and krigslida.js Krigslida in 1980, testbana.js the engine's test level, figurer.js the characters' try-out level; ?bana=<id> starts at any of them)
  physics.js    Moves a box through the tile grid, X then Y, with one-way and moving platforms
  player.js     Blenke's movement: acceleration, friction, variable jump, coyote time, jump buffering, crouching, puddles; knockback and the stomp bounce
  enemies.js    The enemies as data: level character, size, speed, points, what they carry and throw, a boss's health, their lines and the brochure's sign a subculture gives away; a deck an enemy carries (a roof, a banner, a board) and where it is; the slogans and the prosecutor's lines
  scenery.js    The suburb's furniture as data: level character and size; drawn behind everything, stops nothing
  landmarks.js  Checkpoints (phone booths, where a lost life starts again) and the goal (its pole completes the level)
  station.js    The filling station past the goal: Blenke walks to it by himself, plugs in and pours the samples he carries while the gauge's needle climbs towards MAX (all the level holds)
  citizens.js   Citizens to help: level character, size, their pleas and thanks
  props.js      What Blenke can pick up and throw (a traffic cone): level character, size, the throw
  powerups.js   What each power-up does and for how long; the boosts and movement it gives
  ai.js         How each enemy moves and attacks, with its own seeded random numbers; what it says as Blenke comes near; when landing on it hurts (isSpiky), whether it is there to touch (isPresent), the skater's board rolling on
  projectiles.js What enemies throw: paperwork, test tubes, shouts, binders, the synth's square waves, the raver's glow sticks (harmless; they land and show what is hidden near them)
  particles.js  Dust, stars, splinters, smoke, sparkles, splashes and paperwork as data: which world event throws up which burst (or is listed without one), and the surroundings near the view stirring on the world's clock (slime bubbles, water glints, pipes spraying and dripping, power-ups glittering); stepped with the world on their own seed
  impact.js     The hit-stop (steps the world stands still) and the view's shake, by world event (or listed without one); the shake offsets where the camera is drawn, never the camera
  hazards.js    What hazard tiles do: water drowns, slime and syringes hurt, puddles are slippery, pipes leak on a cycle
  platforms.js  Moving platforms: joined from H or V in a level, positioned by time, carrying riders
  camera.js     Camera on a critically damped spring, with look-ahead, clamped to the level
  world.js      One level being played (and tallying what is found on it): steps Blenke, enemies, projectiles, platforms, props and the camera, picks up items, opens crates, stomps and hits, the act key (help, read, lift, throw), the power-up at work, lives, respawn and game over, runs the clock
  items.js      The collectibles as data: level character, category, points, samples, hidden, their remarks
  highscores.js The ten best (seeded with made-up officers' tags), where a score goes, the three-letter tag being signed (turned, moved, typed) and older names cut to tags
  report.js     The police performance report: a level's totals to be found (items, crates' and enemies' contents, secret rooms, enemies, citizens), found of total, the time and urine bonuses (a full tank doubles the urine bonus), cost per gram; the year's report adds the levels up
  save.js       The high scores and the sound settings between visits, in the storage passed in: consent (asked once), the versioned save, validation, the migration chain, broken saves kept
  score.js      Points, the combo multiplier (and the power-ups' boosts), counts, citizens helped and the ranks points earn
  messages.js   The message line: the level's name, then satirical remarks, one at a time
  hud.js        The HUD laid out as data (text and icons at view positions; a changed number hops, a lost heart shakes); render.js draws it
  version.js    The game's version, released by pushing its tag
  build.js      When this copy was built: null in the repo, written by the Dockerfile and release.yml
css/        Stylesheets
assets/     Source art, fonts and audio; sprites/ is the asset factory's delivery (sheets, JSON, delivered.json), as delivered; favicon.png is Blenke's HUD head at 3×, the delivered one (a test keeps it so)
tests/      node:test test files (*.test.js), one per pure module, and subcultures.test.js for the ten subculture characters; helpers.js holds shared helpers, png.js reads the delivered sheets
docs/       The game specification (spec.md), reviews and server deployment (Markdown)
tools/      Developer scripts, not part of the game (not in the image or the release): audition.js renders every sound and song and writes a page to listen to them on; balance.js prints a level's numbers for balancing it
TODO.md     The build plan, in portions, and other open work between sessions
docker/     nginx config for the Docker image (Dockerfile, docker-compose.yml and docker-compose.server.yml at the root)
```

> **Status: polish and mobile done and released in 0.4.0 (portions 9 and 10 of `TODO.md`; mobile tried on Android), and running on the server. Unreleased since: world 1-2 to 1-4, Förorten drawn entirely by the asset factory, and ten subculture characters (in the try-out level only, drawn in code).** A 384×216 view scaled
> to the window; a 60 Hz fixed-step simulation with interpolated drawing;
> Blenke walks, runs (Shift/X), jumps (↑/W/Space/Z, higher the longer it's
> held, with coyote time and jump buffering), crouches and crawls (↓/S) and
> drops through one-way platforms (↓ + jump) on a test level. He is
> animated (idle, walk, run, jump, fall, crouch) in front of a suburb
> backdrop in four parallax layers; the level's name shows at the start in
> the game's bitmap font. He collects urine samples, minor possession,
> evidence and bonus items (some hidden until he is close), with a combo
> multiplier, ranks earned by points and satirical remarks. He has three
> hearts and three lives: enemies, thrown things, slime, syringes and
> leaking sewage cost a heart (knockback, then a blinking spell of
> safety); pits, deep water, the last heart and the clock cost a life, and
> the last life ends the game. Landing on an enemy defeats it (the stoner, the dealer who
> flees, party people, the bureaucrat throwing paperwork, the technician
> lobbing tubes, the ideologue shouting slogans), and some drop what they
> carry. Ten subcultures, so far only on the try-out level
> `?bana=figurer`, each give away the police brochure's "sign" when beaten
> and drop their own evidence: the hippie (Blenke slows near him), the
> headbanger (stage-dives), the punk (sharp on the way up), the synth
> (square waves), the breakdancer (stomped only in his freeze), the raver
> (harmless glow sticks that show hidden things), the goth (unseen until
> near), the raggare (his car roof is a platform; he can't be beaten),
> the progg activist (her banner is a platform; only a cone beats her)
> and the skater (ollies; his board rolls on, rideable). Urine puddles are slippery, police tape is a cordon, and moving
> platforms carry him. A HUD shows rank, score, health, lives, samples,
> possession, level, time and the power-up at work. Crates open when he
> jumps into them from below (or a thrown cone hits them), and what they
> hold pops out on top: six power-ups (police coffee, paperwork shield,
> mandatory testing, budget increase, super bladder, police helicopter),
> glowing and glittering in yellow and blue as they lie, one at work at a time. The act key (C/E) picks up and throws a cone,
> helps a citizen (worth less than an empty tin) and reads a sign. World
> 1 has four levels. 1-1, the suburbs: bus stop, parking lot,
> playground, a block of flats cut open with a secret room, the canal, a
> cordoned-off area, the prosecutor (a miniboss with three hits who lifts
> a barrier when beaten) and the goal, with two checkpoints. 1-2,
> Södertörns villastad in the 1970s and 80s: the station still named
> after the villa town, an underpass under the tracks, a 1960s slab
> block, the wooden villas left by Magelungen with a grow room in a
> cellar, the bathing place with its jetty, pedal boats and diving tower,
> and the tunnelbana's last stop with a live track to jump. 1-3,
> Västerhaninge: the station house half pulled down, the centre of 1969
> cut open, Nynäsvägen's roadworks and trenches, a laundry in Håga with
> the money laundered in a secret office, Ribbyskolan's drug education
> and the prosecutor at the old courthouse. 1-4, Krigslida in 1980: the
> new halt, the grave field's hill with its runestone and the gravel pit,
> Tungelsta's greenhouses (glass), the fields of the referendum's three
> lines, Krigslida farm searched, and the front of the war on drugs. Every level
> ends the same way: past the goal Blenke walks by himself to the police station's filling station,
> plugs in his hose and pours the samples he carries while the gauge's
> needle swings towards MAX; then it moves on to the next level, with the score and lives carried along, and
> after the last the game is over. The game opens on a title screen with
> the logo over the drifting backdrop and a menu (Starta, Kontroller, and
> Topplista, greyed out until 7.5); the controls screen is read from the
> key map. Esc or P pauses, and
> so does leaving the window, with Fortsätt and Avsluta (to the title).
> The last life ends in a game over screen that closes the case file
> (rank, score, what was collected, where he was last seen) and goes on
> to the title. The goal brings up the police performance report (found
> of total, the time bonus counted into the score, the operation's cost
> per gram seized, a verdict), then the next level; after the last, the
> year's report adds the game up. A score that makes the top ten is
> signed with a three-letter tag, arcade style, then the high scores
> show, the new entry picked out; Topplista on the title shows them too.
> The first time a score makes the list the player is asked whether it
> may be saved (in localStorage); yes saves it for later visits, no is
> stored alone and never asked again. Everything that happens in the
> level makes a chip sound, synthesized in code: Blenke's moves, pickups
> (a combo climbs the scale), hits, lost lives by cause, enemies, crates,
> each power-up its own, and the clock warning and ticking as it runs out;
> the menus, pausing, typing a name and the time bonus counting in too.
> Chiptune music plays throughout: a march on the title screens, world
> 1's theme, the prosecutor's while he fights, jingles at the goal, the
> game over and a high score, and lift music under the reports; pausing
> turns it down, and leaving the window silences the game. M turns all
> sound off and on (a struck-through loudspeaker shows it off), and LJUD
> on the title and pause menus sets the music's and the effects' volume;
> both are saved with the high scores once saving is allowed. Particles
> fly: dust from his feet, stars and smoke from what he stomps, splinters
> from crates, sparkles from pickups, splashes into water and slime and
> the prosecutor's forms; slime bubbles, the canal glints and the pipes
> spray and drip. The big blows stop the world for a few steps (a
> stomp, a hit, the prosecutor beaten) and the heavy ones shake the
> view, unless the system asks for less motion. On a touch screen a pad
> walks, crouches and runs, and buttons jump, act and pause, drawn over
> the play; the menus and screens are tapped, and a phone goes
> fullscreen and sideways (or, held upright where it can't, is asked to
> turn). A find is gone at
> once, the HUD's numbers hop as they change, a lost heart shakes
> and a phone booth jolts as it lights. A level opens with an iris on
> Blenke and closes on him after a lost life, at the goal and at the
> game over; the screens around the play fade in, and pausing is at
> once.

- **Smooth scrolling is a rule, not a nicety.** Art is drawn at 384×216
  pixel size, but positions go to the screen in screen pixels through
  `toScreen` in `src/projection.js`, so the camera can move by a fraction of
  an art pixel. Never round an object and the camera separately (it made
  Blenke shake while running), and keep the camera's speed changing gradually
  (a test holds it under Blenke's own acceleration). Never scale up a
  pre-drawn picture of the moving world as a whole: at a fractional scale
  its pixels change width from frame to frame and the scenery crawls. Each
  tile or sprite, and each tile-wide column of a backdrop layer, is drawn
  on its own at its `toScreen` place. The canvas has
  exactly the screen's device pixels (`device-pixel-content-box`), and
  nothing on the page takes height from it. Browsers can report frame times
  with a couple of milliseconds of jitter while the display runs steadily;
  the clock learns the display's rate and snaps frame times to it, or
  whatever moves on screen judders. When motion judders on someone's
  machine, ask them to press F2 and read out the panel. The game's own
  motion measures even at 50, 60, 75 and 144 Hz (run the loop, clock and
  projection in Node to check). On the author's machine a display set to
  50 Hz still juddered and 60 Hz cured it, most likely the browser drawing
  at 60 Hz with the display dropping frames, which the game can't fix.
- **Levels are text.** One character per 16×16 tile, the legend in
  `TILE_TYPES` and `MARKERS` in `src/level.js`, each item's, enemy's,
  citizen's and prop's `char` in `src/items.js`, `src/enemies.js`,
  `src/citizens.js`, `src/props.js` and `src/scenery.js`, and
  `PLATFORM_CHARS` in `src/platforms.js` (a test keeps them all
  distinct). An enemy or citizen can instead be placed by column in
  `src/levels/cast.js`, the level's cast, which makes moving it between
  levels a one-line change. An item written right above a crate (`?`) is inside it. A
  secret wall (`:`) hides the room joined to it until Blenke steps in; a
  room's inside is `;`, and a marker in a room stands on the room. A gate
  (`|`) stands until the level's boss is beaten. The filling station's
  pump (`M`) stands on the goal's row a few tiles past it; every level of
  the game ends with the same section, `finish(height)` from
  `src/levels/finish.js` (a test holds them to it). The playing order is
  `PLAYING_ORDER` in `src/levels/index.js` and nothing else: a level
  names its `world`, and its title ("VÄRLD 1-2: …", shown as it starts
  and heading its report) is numbered there from its place in the order,
  with its `place` (or its `name`, which the HUD shows). A station's name
  board (`9`) shows the level's `stationName`. A level sets its
  clock (`time`, in seconds), its song (`music`, an id in
  `src/music/index.js`; a test holds every level to one) and its signs' texts (`signs`, in the order
  the signs come from the left; one per sign or it fails). A level can be written in
  sections of equal height joined side by side (`joinSections`). An unknown
  character, uneven rows, a missing start, a second goal or a second
  filling station fail loudly, a test parses every level in `src/levels/`,
  and every level of the game needs a goal, a checkpoint and a filling
  station.
- **Sounds are sample data.** `src/synth.js` renders each sound's voices
  into samples with no Web Audio, so tests measure what is heard (it
  starts at once, stays under full scale, ends without a click);
  `src/audio.js` only plays the rendered buffers. Which event plays what is
  `src/cues.js`, pure. The asset factory's sounds can replace effects by
  id later, as its sheets replace the art.
- **Music is text.** A song in `src/music/` gives each channel (lead,
  harmony, bass, drums) one string per bar: notes (`C5`, `F#4`), `-` to
  hold, `.` for silence, drum letters from `DRUMS` in `src/music.js`; a
  bar splits into 1, 2, 4, 8 or 16 equal steps. Repeated sections are
  plain JavaScript arrays spread together. A test parses and renders every
  song (equal bar counts, notes in each channel's range, under full
  scale, seamless at the loop). Rendering takes over a tenth of a second,
  so the page renders songs a few milliseconds per frame.
- **The simulation is deterministic.** Enemies' randomness comes from
  their own seed (`nextRandom` in `src/ai.js`), moving platforms and
  leaking pipes from the world's clock, so a test sees exactly what the
  player does.
- **Art is pixel data in the master palette.** `src/art/` makes every
  picture as a pixel image (`src/pixels.js`), from text pixel maps or small
  drawing functions, with no DOM, so tests check it: palette colours only,
  at most 15 colours per sprite (one SNES palette), the right sizes, every
  animation frame present. Where the asset factory has delivered a sheet
  (`assets/sprites/`, today Blenke, the tiles, the backdrop's layers, the
  checkpoint's phone booth, the enemies and what they throw, the items and
  power-ups, the HUD's hearts and head, the suburb's scenery, the goal,
  the cone, the sign, the gate, rooms, the moving platform, the leak, the
  pensioner, the station's house and pump, the power-up effects, and the
  landmark on the horizon, which has no code-drawn stand-in), the game
  draws that instead (`src/sprites.js` says what each replaces); the
  code-drawn art stays as the fallback if a sheet fails to load. The
  villas' panelling, the greenhouse glass, the runestone and the
  station's name board are still drawn only in code, and so are the
  subcultures and what they carry and throw (`AWAITING` in
  `src/sprites.js`, which the tests hold to no sheet yet). `tests/sprites.test.js`
  holds every delivery to the same rules, and to its manifest's checksums.
  Never edit the delivered files: ask the factory for a new delivery. A
  frame is placed by its own origin (Blenke's run frames have their own),
  and a tile sheet with one look uses it as fill under solid tiles.

- **Player-facing text is Swedish** (`<html lang="sv">`); code, comments and
  commits are English. The title, "Blenke Husis & Urinjakten", is Swedish too.
- **The game saves the high scores and the sound settings** (`src/save.js`, keys
  `blenkehusis.consent`, `blenkehusis.save`, `blenkehusis.save.broken`…),
  and anything it saves later follows the same rules:
  - **Nothing is saved without consent.** Until the player allows storage, the
    save is neither read nor written; only the choice itself is stored, so a
    "no" isn't asked again.
  - **A save that fails to load is kept** under its own key before a new game
    starts — never silently overwritten.
  - **The save is versioned.** A change to its shape needs a version bump and a
    migration step from the previous version, with a test loading an old save.

## Setup

```bash
# Node.js 18+ and Python 3 (for the dev server) are all that's needed.
node --version
```

No `.env` file is required — there are no external services or secrets.

## Common commands

| Task       | Command                                                          |
| ---------- | ---------------------------------------------------------------- |
| Install    | Nothing to install                                               |
| Run (dev)  | `python3 -m http.server 8000 --bind 127.0.0.1`, open http://127.0.0.1:8000/ |
| Run (Docker) | `docker compose up --build -d`, open http://localhost:8085/ (8080, 8082, 8083 and 8084 belong to other containers) |
| Build      | None — the repo is the build                                     |
| Test       | `node --test tests/`                                             |
| Syntax     | `find src tests -name '*.js' -print0 \| xargs -0 -rn1 node --check` |
| Lint       | Not yet implemented (ESLint needs npm)                           |
| Release    | Bump the version, then push the tag `vx.y.z` (see Releases)      |
| Format     | Not yet implemented (Prettier needs npm)                         |
| Listen     | `node tools/audition.js ~/Dropbox/audio/blenkehusis`, then open `ljud.html` there (no server needed) |
| Balance    | `node tools/balance.js [level id]`: what a level holds and is worth, the ranks, the clock, the checkpoints against the dangers |

> Keep this table accurate — agents rely on it to verify their work. Every
> command here must either run today or be marked as not-yet-implemented.

> **Never open the game on `DISPLAY=:0` for agent-driven runs.** `:0` is the
> user's live desktop session, not a sandbox — a browser window launched there
> grabs real keyboard/mouse focus, and `xdotool` there types and clicks on their
> actual machine. Use `chromium --headless` for screenshots, or a virtual display
> (`Xvfb :99 &` then `DISPLAY=:99 chromium ...`) when input must be driven, and
> close the browser gracefully rather than `kill -9`. Prefer a `node:test` test
> whenever the behavior can be covered by one. The recipes are in
> `.claude/skills/verify/SKILL.md`.

## How to work in this repo

1. **Understand before changing.** Read the relevant code and nearby tests first.
   Match the conventions you find rather than introducing new ones.
2. **Make the smallest change that solves the problem.** Avoid drive-by refactors
   unless they're the point of the task. Touch only what's necessary.
3. **Plan non-trivial work.** For multi-step changes, outline the approach before
   editing so the path is clear and reviewable.
4. **Keep changes focused.** One logical change per commit. Don't mix
   refactoring with behavior changes.

## AI model usage (cost & token discipline)

Pick the cheapest model that can do the job well. Most coding work does **not**
need the largest model. Escalate only when the task genuinely demands it, and
drop back down as soon as it doesn't.

**This is enforced, not just advisory.** `.claude/agents/` defines three
project subagents, each pinned to a model via frontmatter, so delegating to
the right one via the Agent tool actually runs on that tier instead of
relying on the person/agent driving to remember to switch:

- **`quick-task`** → Haiku. High-volume, low-ambiguity work: mechanical edits,
  renames, find-and-replace, boilerplate/scaffolding, formatting, quick file
  reads, short factual lookups, simple bug fixes with an obvious cause.
- **`feature-implementer`** → Sonnet. The default workhorse for everyday
  engineering: feature implementation against a clear spec, standard
  refactors, test writing, code review, debugging across a few files. Default
  to this one when unsure.
- **`architect`** → Opus. Reserve for where it clearly excels: complex
  system/architecture design and hard trade-off decisions, subtle
  cross-cutting bugs that resist ordinary debugging, large ambiguous tasks
  needing deep planning before any code is written, gnarly algorithmic or
  concurrency problems.

The main thread itself (whatever model is running this session) still does
most direct work — delegate via the Agent tool specifically when a subtask
is clearly mechanical (push to `quick-task`) or clearly hard (push to
`architect`), rather than doing everything on the main thread's model.

### Rules of thumb

1. **Start low, escalate on evidence.** Begin with Sonnet (or Haiku for trivial
   work). Move up only when the model is visibly struggling — not preemptively.
2. **Use Opus for thinking, cheaper models for typing.** Have the top tier design
   the approach, then let Sonnet/Haiku carry out the well-defined steps.
3. **Split the task, not just the model.** Decompose big jobs so each piece runs on
   the smallest sufficient tier instead of doing everything on Opus.
4. **Don't pay for Opus on simple work.** Renames, boilerplate, and obvious fixes on
   Opus are wasted tokens — drop to Haiku/Sonnet.
5. **Match context to need.** Don't load the whole repo when a few files suffice;
   smaller context is cheaper and sharper regardless of model.

## Working with Claude

How to get reliable, cost-effective results from Claude (Claude Code) on this repo.

### Set up context

- **Keep this file accurate.** Claude relies on the commands, layout, and
  conventions here to verify its own work. Stale guidance produces wrong work.
- **Point at the right files.** Naming the relevant files/dirs is cheaper, faster,
  and more accurate than asking Claude to find them. Let it search only when the
  location is genuinely unknown.
- **Keep context lean.** Read only the files you need and prefer targeted search
  over loading the whole repo — smaller context is sharper and cheaper. Start a
  fresh session for unrelated tasks instead of letting one balloon.
- **Don't redo work.** Reuse results already established rather than re-deriving
  them, and keep responses and intermediate output concise.

### Frame the task

- **State intent and constraints, not just the ask** — e.g. "fix X without changing
  the public API" steers far better than "fix X."
- **Give a definition of done** so Claude can self-check and stop at the right point
  (see the validation checklist).
- **Ask for a plan before big changes.** For multi-step or risky work, have Claude
  propose the approach first, approve it, then let it execute (use plan mode).
- **Provide examples.** Point to an existing pattern to mirror so it matches our
  conventions rather than inventing new ones.

### Work in tight loops

- **Small, verifiable steps.** One logical change, run tests, confirm, then move on.
- **Make it verify, don't trust blindly.** Have Claude run the build/tests and
  report real output. Review the diff before committing.
- **Course-correct early.** If it drifts, interrupt and redirect rather than letting
  it run — cheaper than unwinding later.

### Leverage the harness

- **Subagents** for parallel or independent work (searches, reviews) — keep the
  conclusion, not the file dumps.
- **Skills / slash commands** for repeatable workflows (code review, verify, etc.).
- **Let it use tools.** Running commands and checking results beats describing what
  it should do.

### Verify what matters

- For load-bearing changes (security, data migrations), confirm results
  independently — don't take "done" on faith.
- If results are off, fix the prompt or the context first; that's usually the cause,
  not the model.

### Prompt feedback

- After every prompt, Claude gives brief feedback on the prompt itself, in addition
  to doing the task. This is to sharpen prompting over time.
- If a prompt is short, simple, and nothing would meaningfully improve it, just
  acknowledge it. If it's longer and/or could be improved, note what's good and what
  could be better. Keep feedback proportional — don't over-coach a fine prompt.

## Coding standards

- **Match existing style.** Mirror the surrounding code's naming, structure, and
  patterns. Two-space indentation, semicolons, single quotes, `const` by default.
- **ES modules only.** `import`/`export`, no globals on `window`, no inline
  `<script>` logic in `index.html` beyond loading `src/main.js`.
- **Keep game logic free of the DOM.** Physics, collision, levels, scoring and
  save/load live in modules that never touch `document`, `window` or the
  canvas, so `node --test` can import them directly. Rendering, input and audio
  are a thin layer on top.
- **The simulation steps at a fixed rate.** Game logic advances by a fixed time
  step passed in, never by the frame's own delta, so physics behave the same at
  30, 60 or 144 Hz and a test can step it exactly. The loop in `main.js` clamps
  the elapsed time after a background tab or a hitch.
- **Names communicate intent.** Prefer clear, descriptive names over abbreviations.
- **Comment the "why," not the "what."** Code shows what; comments explain reasons,
  trade-offs, and non-obvious decisions.
- **Handle errors explicitly.** Don't silently swallow exceptions. Fail loudly with
  actionable messages; validate inputs at boundaries (a save read back from
  `localStorage` is external input).
- **No dead code or commented-out blocks.** Delete unused code; version control
  remembers it.
- **Avoid premature abstraction.** Duplicate twice before extracting a shared
  helper. Keep functions small and single-purpose.

## Testing

- **Prefer TDD where it makes sense.** For pure logic (movement and jump physics,
  collision resolution, level data, scoring, save migration, state machines),
  write the test first, watch it fail, then implement. Skip TDD for rendering/UI
  code where the feedback loop is too slow, and for exploratory spikes — but
  write the tests afterward.
- **The simulation is pure logic — test it first.** Stepping the player through
  a level with given input is deterministic with no DOM dependency. It should be
  the best-covered part of this codebase.
- **Write tests for new behavior and bug fixes.** A bug fix should include a test
  that fails before the fix and passes after.
- **Run the full test suite before declaring work done.** Report results honestly —
  if tests fail or were skipped, say so with the output.
- **Test behavior, not implementation details.** Tests should survive refactors
  that preserve behavior.
- **Keep tests fast and deterministic.** No reliance on network, wall-clock time,
  or test ordering — pass the time step and any random seed in rather than
  calling `Date.now()` or `Math.random()` inside the logic.

**Framework:** Node's built-in `node:test` + `node:assert/strict`. No install.

**Tests live in:** `tests/`, named `*.test.js`.

**Run a single test file:**
```
node --test tests/version.test.js
```

## Validation checklist (before finishing)

Run these and confirm they pass before considering a task complete:

- [ ] Tests pass: `node --test tests/`
- [ ] Syntax clean: `find src tests -name '*.js' -print0 | xargs -0 -rn1 node --check`
- [ ] The page loads without console errors (see the verify skill)
- [ ] No secrets, credentials, or debug output left in the diff
- [ ] Documentation updated if behavior or interfaces changed

## Git & commits

- Work directly on `main` — commit and push there. This is a solo project, so
  don't create feature branches and never open a pull request or suggest one.
- Commit or push only when asked. Don't force-push.
- Keep diffs reviewable: no unrelated formatting churn.
- See **Commit message conventions** below for subject/body formatting.

## Commit message conventions

Use [Conventional Commits](https://www.conventionalcommits.org/). Format:

```
<type>(<optional scope>): <subject>

<optional body>

<optional footer>
```

### Types

| Type       | Use for                                                      |
| ---------- | ------------------------------------------------------------ |
| `feat`     | A new feature                                                |
| `fix`      | A bug fix                                                    |
| `docs`     | Documentation only                                           |
| `style`    | Formatting/whitespace; no code-behavior change               |
| `refactor` | Code change that neither fixes a bug nor adds a feature      |
| `perf`     | Performance improvement                                      |
| `test`     | Adding or correcting tests                                   |
| `build`    | Build system or dependency changes                           |
| `ci`       | CI configuration and scripts                                 |
| `chore`    | Maintenance that doesn't touch src or tests                  |
| `revert`   | Reverts a previous commit                                    |

### Subject line

- Imperative, present tense: `add`, not `added`/`adds`.
- Lowercase after the colon; no trailing period.
- Keep under ~72 characters.
- The scope is optional and names the affected area: `feat(physics): ...`.

### Body (optional)

- Separate from the subject with a blank line; wrap at ~72 columns.
- Explain **why** the change was made and any trade-offs — not just what changed.

### Footer (optional)

- Reference issues: `Closes #123`, `Refs #456`.
- Breaking changes: start a line with `BREAKING CHANGE:` and describe the impact
  (or append `!` after the type/scope, e.g. `feat(save)!: drop v1 save format`).

### Examples

```
feat(physics): add coyote time to the jump

fix(collision): stop the player tunnelling through thin platforms

At high fall speeds one fixed step moved the player further than a
platform is thick, so the overlap test never saw it. Sweep the move
along the axis instead of testing only the end position.

Closes #12
```

Keep one logical change per commit so history stays bisectable and reviewable.

## Before committing

This project doesn't use pull requests (see **Git & commits** above), so the
commit itself is the review artifact — hold it to the same bar:

- **One purpose per commit.** Keep it small and focused; split unrelated changes.
- **Add its CHANGELOG entry** under `[Unreleased]` (see Documentation).
- **Describe what and why** in the body — and how it was tested. Note any
  follow-ups, known limitations, or breaking changes.
- **Link related issues** (`Closes #123`).
- **Self-review the diff first.** Ensure it's green (tests/syntax) and free of
  debug output or stray changes before committing.

## Releases

The version lives in `src/version.js` (shown on the page) and `package.json`,
and follows semver. It is `0.0.0` until the first release, which is 0.0.1.
The owner decides when to release and as what version; agents never bump the
version or push a tag unless asked. To release:

1. Bump `VERSION` in `src/version.js` and `version` in `package.json`.
2. In `CHANGELOG.md`, rename `[Unreleased]` to `[x.y.z] - YYYY-MM-DD` and
   start a new empty `[Unreleased]` above it.
3. Commit (`chore(release): x.y.z`) and push to `main`.
4. Tag that commit and push the tag: `git tag vx.y.z && git push origin vx.y.z`.

`tests/version.test.js` fails if the version, `package.json` and the
changelog disagree. Pushing the tag runs `.github/workflows/release.yml`,
which refuses a tag that doesn't match `VERSION`, then publishes
`ghcr.io/abenazer/blenkehusis:x.y.z` and creates a GitHub release with a
zip of the game and the changelog section as notes. Pushes to `main` only
update `:latest`.

## Logging

- **Use appropriate log levels** (`console.debug`/`info`/`warn`/`error`) — don't
  log everything at one level.
- **Prefer structured logging** (an object as the second argument) so logs are
  readable in the devtools console.
- **Never log secrets or PII** — tokens, passwords, keys, personal data. Redact
  before logging.
- **Make messages actionable.** Include enough context to diagnose, but avoid noisy
  logs in the game loop.

## Documentation

- **Update docs in the same change** as the behavior they describe — never leave
  them stale.
- Touch the README when setup, usage, or commands change, and
  comments for non-obvious code.
- **Every commit adds an entry under `[Unreleased]` in `CHANGELOG.md`, in the
  same commit** — the changelog is how development is followed, not just
  release notes. What a player can see comes first, under `Added` /
  `Changed` / `Fixed` / `Removed`, written for players; everything else
  (tooling, tests, CI, docs) goes last, under `Development`, as brief
  one-liners — related commits can share a line. The one exception is the
  easter-egg rule below.
- **Never document or log easter eggs.** Hidden levels, secret inputs, joke
  responses, and similar surprises must not appear in the CHANGELOG, commit
  messages, or code comments — writing them down defeats the point of a
  hidden feature. Implement them in code only.
- Keep **this file (AGENTS.md)** current when commands, structure, or conventions
  change (see "Maintaining this file").

## Do not touch (without explicit instruction)

Some files should not be hand-edited — changing them by hand causes breakage or is
overwritten on the next build. Treat these as off-limits unless the task is
specifically about them:

- **Generated files** — sprite atlases, spritesheets, minified output; only source
  assets are versioned.
- **Dependency lockfiles** — change them via the package manager, not by hand.
- **Vendored / third-party code** — patch upstream or wrap it instead.
- **Secrets and credential files** — never commit or modify these casually.
- **Untracked files in `assets/`** — the user drops art there before it's
  committed. Delete asset files by exact name only, never by glob.

## Context & token hygiene

Never Read, Grep, or Glob into generated/binary paths — they're huge, non-text,
and add nothing an agent can use. Large images and audio under `assets/` are
binary: check their size/dimensions with a command instead of opening them,
unless you actually need to look at one.

General practice:
- Point at specific files/dirs instead of asking an agent to search the whole
  repo when the location is already known (see "Point at the right files"
  under Working with Claude).
- Prefer `Grep`/`Glob` with a narrow path over an unscoped repo-wide search.
- Keep long-lived docs (`AGENTS.md`, `CHANGELOG.md`) concise — they get read in
  full when an agent orients itself, so bloat there is a recurring cost, not a
  one-time one.

## Security & safety

- **Never commit secrets** (API keys, tokens, passwords). Use env vars / a secrets
  manager. Add sensitive paths to `.gitignore`.
- **Validate and sanitize all external input** (user input, network, files, saved
  games). Never put unescaped text into `innerHTML` — use `textContent`.
- **Use parameterized queries** — never build SQL/commands via string concatenation.
- **Keep dependencies current** and avoid adding new ones without good reason.
- **Be cautious with destructive or outward-facing actions** (deletes, deploys,
  publishing). Confirm intent before running them.

## What to do when stuck or unsure

- If requirements are ambiguous, ask a clarifying question rather than guessing.
- If a change is risky or far-reaching, propose the approach before implementing.
- If you discover the task description conflicts with the actual code, surface the
  discrepancy instead of forcing the change.

## Maintaining this file

Keep AGENTS.md accurate. When commands, structure, or conventions change, update
this file in the same commit so future agents start from the truth.
