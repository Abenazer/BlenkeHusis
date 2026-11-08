# Code Review — Blenke Husis & Urinjakten

The audit *method* lives in the **`code-review-audit` workflow**
(`.claude/workflows/code-review-audit.js`): it derives the review units from the
filesystem, runs review → adversarial-verify → synthesize, and writes
`docs/code-review-<date>-findings.md`. This file is the human-facing companion —
**what reviewers must not flag**, and **which tool to reach for** — that the
workflow's agents read.

## Which tool

| You want to… | Use |
|---|---|
| Review the working-tree diff / a PR | `/code-review` (can post comments / apply fixes) |
| Audit everything since the last release, before tagging the next | `/code-review-audit diff <last tag>` |
| Diff-scoped audit since the last review | `/code-review-audit diff` |
| Full repo audit (the periodic backstop) | `/code-review-audit full` |

Lean on `/code-review` per change and on diff mode at a release; reserve the
full pass for when the whole code base hasn't been looked at in a long time.

Diff mode covers what differs from its baseline in the working tree, so
uncommitted and untracked files count. Without a ref the baseline is the commit
of the latest committed report, and failing that the latest release tag.

## Pipeline cost policy

The workflow file is the source of truth; this section must match it.

| Stage | Model | Effort | Fan-out |
|---|---|---|---|
| Discover | Main thread | inherits the session's | No agent |
| Review | Sonnet | inherits the session's | 1 agent **per unit** |
| Verify | Sonnet | medium | 1 agent **per unit** (not per finding) |
| Synthesize | Sonnet | medium | 1 agent total |

- **Units are grouped by role, not by file.** About six: the simulation with the
  data it reads, the save, the page (rendering, input, audio), the markup, the
  helpers and the tests. That costs far fewer agents than one per file, and a
  bug between the collision code and a level's data lands in front of one
  reviewer. Reviewers still follow a value
  into files outside their unit.
- **Every subagent runs on the mid-tier model.** Sonnet is near-frontier on code
  review at a fraction of the price. Escalate a stage to the top tier only if a
  real run demonstrably misses findings without it — and never for verify or
  synthesize, which are mechanical. If a stage is escalated, update this table
  and `meta.phases` in the same change.
- **Verification is batched per review unit.** One skeptic receives *all* of a
  unit's findings, numbered `[0]`, `[1]`, …, and returns exactly one verdict per
  index. Findings in the same file get ruled on from a single read of that file,
  instead of N agents each re-reading this playbook, the conventions, and the
  same source.
- **Verification fails closed.** A finding is promoted only on an explicit
  `"real"` verdict matched by index. A missing, skipped, or unparseable verdict
  drops the finding — silence is never a pass. A `"needs-info"` verdict isn't a
  finding either, but it is listed under "Unresolved" in the report.
- **Reading is scoped, not skipped.** Reviewers and verifiers read this playbook
  in full, plus the AGENTS.md sections that encode enforced code rules —
  "Coding standards", "Testing", "Logging", "Documentation", "Security &
  safety" — located by heading, never by line number. Anything else in AGENTS.md
  is reached by targeted grep when a specific claim turns on it.

## Project rules

These live in "Project overview" in AGENTS.md, which reviewers don't read whole.
Breaking one is a finding.

- **Nothing is saved without consent.** Until the player allows storage, the
  save is neither read nor written; only the choice itself is stored.
- **A save that fails to load is kept** under its own key, never silently
  overwritten.
- **The save is versioned.** A change to its shape needs a version bump, a
  migration step and a test loading an old save.
- **The simulation stays free of the DOM and the clock.** Only the page layer
  (`main.js` and the rendering/input/audio modules) touches the page, and the
  fixed time step and any random seed are passed in.
- **The simulation steps at a fixed rate.** Logic advanced by the frame's own
  delta, or a loop that doesn't clamp the elapsed time, is a finding.
- **Player-facing text is Swedish; code, comments and commits are English.** Text
  from a save or the player goes into the page with `textContent`, never
  `innerHTML`.
- **Easter eggs are never written down.** Don't describe one in a finding or a
  report: list it as a location and a neutral topic, or leave it out.

## Do NOT flag — these are intentional here

- **No framework, bundler, npm package or TypeScript.** The project has no
  dependencies and no build step by design (see "Project overview" in
  AGENTS.md). A finding whose fix is adding one is out of scope by construction.
- **`getElementById` / `querySelector` without a null check, for an element that
  is in `index.html`.** The page is static, so the element is there. Only flag
  when the id/selector doesn't match `index.html`, or the element is created
  dynamically and can be missing.
- **`Math.random()` in the page layer** — fine for cosmetic randomness
  (particles, screen shake). In the simulation, randomness comes from a seed
  passed in so tests are deterministic; flag `Math.random()` there.
- **`console.log()` / `console.debug()` calls** — acceptable in a
  development-stage game. Flag only when they land in the game loop, where
  repeated string building every frame is a measurable concern.
- **Single-letter loop variables (`i`, `j`, `k`)** — idiomatic for index loops.
- **Positions and velocities in plain floats.** Sub-pixel drift is expected and
  harmless. Flag only NaN/Infinity, a float compared with `===`, or drift a
  player could see (a player that slowly sinks into the floor).
- **`preventDefault` on every printable key, on every screen** (the keydown
  listener in `src/main.js`). Letting letters through outside name entry
  would let the browser act on game keys, e.g. Firefox's "search when you
  start typing" opening its find bar mid-play. Ctrl/Alt/Meta shortcuts
  stay the browser's. Won't-fix in the 2026-11-08 audit (BUG-3/2026-11-08).

## Findings convention

`BUG-N` for correctness issues (crashes, wrong behavior, silent data corruption).
`QUAL-N` for code-quality issues (code-smell, optimization, simplification).

Severity: **crash** · **high** · **medium** · **low**

Status legend: ✅ fixed · 🟡 partial · ⏸️ deferred-by-design · ❌ won't-fix · ⬜ open

Still-`⬜`/`🟡` findings carry forward into the next review.

### IDs are scoped to their report — do not treat them as global

**`BUG-N`/`QUAL-N` are unique only within the findings file that defines them.**
Every report restarts at `BUG-1`/`QUAL-1` and renumbers, so the same ID names
different findings in different files. Rules that follow from this:

- **Restart at 1 in each new report.** This is the settled scheme — do not
  continue from the previous file's maximum.
- **Always qualify an ID with its report** when referencing one in a commit,
  comment, or another finding: write `QUAL-7/2026-08-05`, never a bare
  `QUAL-7`. A bare ID from another file is genuinely ambiguous.
- **Carrying a finding forward means re-listing it in the new report**, where it
  takes a new number. Its identity is its topic + location, not its ID.

As reports accumulate, keep an index of their ID ranges here so a stale
reference can be traced back to the file that defined it:

| Report | Range |
|---|---|
| — | No reports yet |
