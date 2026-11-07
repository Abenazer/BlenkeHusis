# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository. Read this
before making changes. Keep it up to date as the project evolves.

## Project overview

- **What it is:** Super Lelle: Urine Hunt — a satirical platformer. Run, jump
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
  main.js       Page wiring: canvas scaling, keyboard events, the frame loop (the only DOM code besides render.js)
  render.js     Draws the world straight onto the screen canvas, scaled (placeholder shapes until the pixel art)
  projection.js World to screen: round((position - camera) * scale), the one rule everything is placed by
  config.js     Internal resolution, tile size, step length and Lelle's movement tuning
  loop.js       The fixed-step clock: frame time to whole steps plus an interpolation fraction
  input.js      Key codes to actions; pressed/held/released per step
  level.js      Parses text levels (one character per tile, sections side by side) and answers tile questions
  levels/       The levels as text (index.js lists them in playing order; testbana.js is the engine's test level)
  physics.js    Moves a box through the tile grid, X then Y, with one-way platforms
  player.js     Lelle's movement: acceleration, friction, variable jump, coyote time, jump buffering, crouching
  camera.js     Camera on a critically damped spring, with look-ahead, clamped to the level
  world.js      One level being played: steps Lelle and the camera, respawns after a fall
  version.js    The game's version, released by pushing its tag
  build.js      When this copy was built: null in the repo, written by the Dockerfile and release.yml
css/        Stylesheets
assets/     Source art, fonts and audio
tests/      node:test test files (*.test.js), one per pure module; helpers.js holds shared helpers
docs/       The game specification (spec.md), reviews and server deployment (Markdown)
TODO.md     The build plan, in portions, and other open work between sessions
docker/     nginx config for the Docker image (Dockerfile, docker-compose.yml at the root)
```

> **Status: engine (portion 1 of `TODO.md`).** A 384×216 view scaled to the
> window; a 60 Hz fixed-step simulation with interpolated drawing; Lelle
> walks, runs (Shift/X), jumps (↑/W/Space/Z, higher the longer it's held, with
> coyote time and jump buffering), crouches and crawls (↓/S) and drops
> through one-way platforms (↓ + jump) on a test level drawn with
> placeholder shapes. Falling into a pit puts him back at the start.

- **Smooth scrolling is a rule, not a nicety.** Art is drawn at 384×216
  pixel size, but positions go to the screen in screen pixels through
  `toScreen` in `src/projection.js`, so the camera can move by a fraction of
  an art pixel. Never round an object and the camera separately (it made
  Lelle shake while running), and keep the camera's speed changing gradually
  (a test holds it under Lelle's own acceleration).
- **Levels are text.** One character per 16×16 tile, the legend in
  `TILE_TYPES` and `MARKERS` in `src/level.js`. A level can be written in
  sections of equal height joined side by side (`joinSections`). An unknown
  character, uneven rows or a missing start fail loudly, and a test parses
  every level in `src/levels/`.

- **Player-facing text is Swedish** (`<html lang="sv">`); code, comments and
  commits are English. The title stays in English.
- **Once the game saves anything** (progress, settings), these hold:
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
`ghcr.io/abenazer/superlelle:x.y.z` and creates a GitHub release with a
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
