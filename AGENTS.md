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
index.html  The page: static markup and the game canvas; loads src/main.js
src/        The game as ES modules, each opening with a comment on what it
            is for; only main.js, render.js, sheets.js and audio.js touch
            the DOM
  levels/   The levels as text; index.js holds the worlds and PLAYING_ORDER
  music/    The songs as text; index.js lists them by id
  art/      What the asset factory never drew, as pixel data in its palette
css/        Stylesheets
assets/     Source art, fonts and audio; sprites/ is the asset factory's
            delivery, as delivered; favicon.png is Blenke's delivered HUD
            head at 3× (a test keeps it so)
tests/      node:test files (*.test.js), one per pure module; helpers.js
            holds shared helpers, png.js reads the delivered sheets
docs/       The game specification (spec.md), reviews, server deployment
tools/      Developer scripts, not in the image or the release: audition.js,
            sheetinfo.js, balance.js, and editor.html, the level editor
            (editor/model.js is its pure part, editor/play.js its play-test)
TODO.md     The build plan, in portions, and other open work between sessions
exports/    Level files the owner exports from the level editor, to be
            copied into src/levels/ (ignored by git)
docker/     nginx config for the Docker image (Dockerfile, docker-compose.yml
            and docker-compose.server.yml at the root)
```

> **Status:** what each release brought is in `CHANGELOG.md`, the game as
> designed in `docs/spec.md`, the build plan in `TODO.md`. World 2,
> Nattstan, is still marked `preview` (see Releases).

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
- **Levels are text.** The rules for writing one (the tile legend and the
  free characters, the cast, crates and secret rooms, the boss's arena and
  gate, the finish, the clock, song and backdrop, what fails loudly) are in
  `.claude/rules/levels.md`, which Claude Code loads when level files are
  touched; read it before writing or changing a level by hand.
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
- **Art is the asset factory's sheets.** Every picture of the world is a
  sheet delivered to `assets/sprites/` (`src/sprites.js` says what each
  replaces). A picture has one source: there is no code-drawn stand-in, so
  a sheet that is missing or fails to load is an error, and
  `tests/sprites.test.js` holds every picture the game draws to being
  delivered, every delivery to the palette, the sizes and origins the game
  needs, and its manifest's checksums. A frame is placed by its own origin.
  Never edit the delivered files: ask the factory for a new delivery. What
  the factory never drew is pixel data in the master palette in `src/art/`
  (`src/pixels.js`, no DOM, tested by `tests/art.test.js`). Something new
  can be drawn there until the factory delivers it; once delivered, its
  code is deleted. A citizen's `height` is its delivered figure's over its
  feet (a test holds it so).

- **Player-facing text is Swedish** (`<html lang="sv">`); code, comments and
  commits are English. The title, "Blenke Husis & Urinjakten", is Swedish too.
- **The game saves each world's high scores, the worlds opened and the sound settings** (`src/save.js`, keys
  `blenkehusis.consent`, `blenkehusis.save`, `blenkehusis.save.broken`…),
  and anything it saves later follows the same rules:
  - **Nothing is saved without consent.** Until the player allows storage, the
    save is neither read nor written; only the choice itself is stored, so a
    "no" isn't asked again.
  - **A save that fails to load is kept** under its own key before a new game
    starts — never silently overwritten.
  - **The save is versioned.** A change to its shape needs a version bump and a
    migration step from the previous version, with a test loading an old save.

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
| Sheets     | `node tools/sheetinfo.js [all \| <sprite>… \| --since <commit> \| --pixels <sprite> [frame]]`: the delivered sheets, the new ones by default |
| Balance    | `node tools/balance.js [level id]`: what a level holds and is worth, the ranks, the clock, the checkpoints against the dangers |
| Edit levels | Serve the repo (Run (dev)), open http://127.0.0.1:8000/tools/editor.html: open a level or start one, draw it, play-test it (Provspela opens the game on the draft, `?bana=editor`), export it as a file for `src/levels/` |

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

## AI model usage (cost & token discipline)

Do most work in the main session: reading a few modules, editing them and
running their tests is quicker there than briefing a subagent, which starts
cold. The three agents in `.claude/agents/` are for when handing off pays:
`quick-task` (Haiku) for large mechanical sweeps, `feature-implementer`
(Sonnet) for well-specified, self-contained work in the background, and
`architect` (Opus) for a hard design question or a subtle bug, when the
owner asks for one. Don't delegate work that needs the session's context,
and don't split small work into agents for its own sake. Read the files a
task touches and their tests, not the whole repo.

## Prompt feedback

- After every prompt, Claude gives brief feedback on the prompt itself, in addition
  to doing the task. This is to sharpen prompting over time.
- If a prompt is short, simple, and nothing would meaningfully improve it, just
  acknowledge it. If it's longer and/or could be improved, note what's good and what
  could be better. Keep feedback proportional — don't over-coach a fine prompt.

## Coding standards

- **Match the surrounding code:** two-space indentation, semicolons, single
  quotes, `const` by default; comments explain why, not what.
- **ES modules only.** `import`/`export`, no globals on `window`, no inline
  `<script>` logic in `index.html` beyond loading `src/main.js`.
- **Keep game logic free of the DOM.** Physics, collision, levels, scoring
  and save/load live in modules that never touch `document`, `window` or
  the canvas, so `node --test` can import them directly. Rendering, input
  and audio are a thin layer on top.
- **The simulation steps at a fixed rate.** Game logic advances by a fixed
  time step passed in, never by the frame's own delta, so physics behave
  the same at 30, 60 or 144 Hz and a test can step it exactly. The loop in
  `main.js` clamps the elapsed time after a background tab or a hitch.
- **Fail loudly** with actionable messages, and validate input at
  boundaries (a save read back from `localStorage` is external input).
- **No dead code or commented-out blocks**, and duplicate twice before
  extracting a shared helper.

## Testing

`node:test` and `node:assert/strict`, in `tests/` as `*.test.js`; one file
runs with `node --test tests/version.test.js`.

- **Pure logic is tested first, TDD where it fits:** movement and jump
  physics, collision, level data, scoring, save migration, state machines.
  Write the test, watch it fail, then implement. Rendering and UI code get
  their tests afterwards. Stepping Blenke through a level with given input
  is deterministic and DOM-free, and should be the best-covered part of the
  code.
- **A bug fix comes with a test** that fails before the fix and passes
  after.
- **No wall-clock time or `Math.random()` inside the logic:** pass the time
  step and any seed in.
- **Run the tests related to the change, not the whole suite:** the touched
  modules' test files, every test file that imports them
  (`grep -l "<module>.js" tests/*.js`), and those that scan all of `src`
  (the cue, particle and impact event registries, level parsing) when
  events or levels change. This holds before an ordinary commit too. The
  whole suite, `node --test tests/`, runs at a release. Say which files
  ran, and report failures with their output.

## Validation checklist (before finishing)

- [ ] The related tests pass (see Testing); the whole suite at a release
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

[Conventional Commits](https://www.conventionalcommits.org/):
`<type>(<optional scope>): <subject>` with the standard types (`feat`,
`fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`,
`revert`). The subject is imperative, lowercase after the colon, with no
trailing period and under ~72 characters; the scope names the area
(`feat(physics): …`). The body, after a blank line and wrapped at ~72
columns, explains why and any trade-offs, not just what. A breaking change
gets a `BREAKING CHANGE:` footer or a `!` after the type.

## Before committing

The commit is the review artifact, so: one purpose per commit; its
CHANGELOG entry under `[Unreleased]` in the same commit (see
Documentation); a body saying what, why and how it was tested, with any
follow-ups or limitations; and a self-reviewed diff, green and free of
debug output or stray changes.

## Releases

The version lives in `src/version.js` (shown on the page) and
`package.json`, and follows semver. The owner decides when to release and
as what version; agents never bump the version or push a tag unless asked.
The `release` skill walks through a release: the version in every file
that carries it, the changelog, the tag (which runs
`.github/workflows/release.yml` to publish the image and a GitHub release)
and the game's pages in `../narko-sites`. `tests/version.test.js` fails if
the version, `package.json`, the changelog and the server's compose file
disagree. Pushes to `main` only update `:latest`.

A world still being built is marked `preview` in `src/levels/index.js`
(Nattstan, while it is built): it plays on localhost and in `:latest`, and
a release leaves it out (`RELEASED` in `src/build.js`, written by
`release.yml`). Take the mark off when it is ready to go out.

## Logging

Use the fitting level (`console.debug`/`info`/`warn`/`error`) with an
object as the second argument, make messages actionable, never log
personal data, and keep noisy logs out of the game loop.

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

- **The asset factory's delivery** in `assets/sprites/`: ask the factory
  for a new delivery instead.
- **Secrets and credential files**: never commit or modify these casually.
- **Untracked files in `assets/`**: the user drops art there before it's
  committed. Delete asset files by exact name only, never by glob.

## Context & token hygiene

Never Read, Grep or Glob into binary paths: images and audio under
`assets/` are binary, so check their size or dimensions with a command
(`node tools/sheetinfo.js` for the sheets) instead of opening them, unless
you actually need to look at one. Keep `AGENTS.md` and `CHANGELOG.md`
concise: they are read in full when an agent orients itself.

## Security & safety

- **Never commit secrets** (API keys, tokens, passwords).
- **Validate and sanitize all external input** (user input, files, saved
  games). Never put unescaped text into `innerHTML`: use `textContent`.
- **Be cautious with destructive or outward-facing actions** (deletes,
  deploys, publishing). Confirm intent before running them.

## Maintaining this file

Keep AGENTS.md accurate. When commands, structure, or conventions change, update
this file in the same commit so future agents start from the truth.
