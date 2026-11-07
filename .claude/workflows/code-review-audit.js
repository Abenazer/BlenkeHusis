export const meta = {
  name: 'code-review-audit',
  description: 'Full or diff-scoped multi-agent code audit of Blenke Husis & Urinjakten (review → adversarial verify → synthesize), per docs/code-review-playbook.md',
  whenToUse: 'Periodic full repo audit (run infrequently) or a diff-scoped pass since the last review or release, uncommitted work included. Args: {mode:"full"|"diff", since?:"<git ref>"}. Default mode=full.',
  phases: [
    { title: 'Discover', model: 'main thread', effort: 'inherit', detail: 'the interpreter itself globs the repo (and git diff in diff mode) to derive the review units + carry-forward findings' },
    { title: 'Review', model: 'sonnet', effort: 'inherit', detail: 'one reviewer per unit, grouped by role, across the five dimensions' },
    { title: 'Verify', model: 'sonnet', effort: 'medium', detail: 'one independent skeptic per unit rules on all of that unit\'s findings in a single pass' },
    { title: 'Synthesize', model: 'sonnet', effort: 'medium', detail: 'dedup, assign BUG-/QUAL- IDs, roll up, write docs/code-review-<date>-findings.md' },
  ],
}

// ---- args ----------------------------------------------------------------
// The slash command forwards $ARGUMENTS verbatim, so args arrives as a bare
// string like "diff" or "diff a1b2c3d" — not only as an object or JSON.
const opts = (() => {
  if (args && typeof args === 'object') return args
  const raw = String(args || '').trim()
  if (!raw) return {}
  if (raw.startsWith('{')) {
    try { return JSON.parse(raw) } catch (_) { /* not JSON — fall through to tokens */ }
  }
  const [m, s] = raw.split(/\s+/)
  return { mode: m, since: s }
})()
const mode = opts.mode === 'diff' ? 'diff' : 'full'
const since = opts.since || ''

// ---- schemas -------------------------------------------------------------
const UNIT = {
  type: 'object',
  properties: {
    key: { type: 'string' },
    label: { type: 'string' },
    paths: { type: 'array', items: { type: 'string' } },
  },
  required: ['key', 'label', 'paths'],
  additionalProperties: false,
}

const CARRY = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    family: { type: 'string', enum: ['BUG', 'QUAL'] },
    severity: { type: 'string' },
    status: { type: 'string' },
    topic: { type: 'string' },
    location: { type: 'string' },
  },
  required: ['id', 'topic', 'location'],
  additionalProperties: false,
}

const DISCOVERY_SCHEMA = {
  type: 'object',
  properties: {
    date: { type: 'string', description: 'today, YYYY-MM-DD (from `date +%F`)' },
    mode: { type: 'string' },
    since: { type: 'string', description: 'the ref/date diff was taken against (diff mode), else ""' },
    priorReview: { type: 'string', description: 'path of the latest docs/code-review-*-findings.md, or ""' },
    reason: { type: 'string', description: 'why there are zero units, shown to the user; "" otherwise' },
    units: { type: 'array', items: UNIT },
    carryForward: { type: 'array', items: CARRY, description: 'still-open (⬜) / partial (🟡) findings from the prior review' },
  },
  required: ['date', 'mode', 'units'],
  additionalProperties: false,
}

const FINDING = {
  type: 'object',
  properties: {
    dimension: { type: 'string', enum: ['crash', 'logic-bug', 'code-smell', 'optimization', 'simplification'] },
    severity: { type: 'string', enum: ['crash', 'high', 'medium', 'low'] },
    topic: { type: 'string' },
    location: { type: 'string', description: 'file:line' },
    why: { type: 'string' },
  },
  required: ['dimension', 'severity', 'topic', 'location', 'why'],
  additionalProperties: false,
}

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    unit: { type: 'string' },
    findings: { type: 'array', items: FINDING },
  },
  required: ['unit', 'findings'],
  additionalProperties: false,
}

const VERDICT = {
  type: 'object',
  properties: {
    index: { type: 'integer', description: 'the [N] marker of the finding this verdict rules on' },
    verdict: { type: 'string', enum: ['real', 'refuted', 'needs-info'] },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    evidence: { type: 'string', description: 'file:line proof' },
    correctedSeverity: { type: 'string', enum: ['crash', 'high', 'medium', 'low'] },
  },
  required: ['index', 'verdict', 'confidence'],
  additionalProperties: false,
}

const VERDICTS_SCHEMA = {
  type: 'object',
  properties: {
    verdicts: { type: 'array', items: VERDICT, description: 'exactly one entry per numbered finding, none skipped' },
  },
  required: ['verdicts'],
  additionalProperties: false,
}

const SYNTH_SCHEMA = {
  type: 'object',
  properties: {
    path: { type: 'string', description: 'the report path actually written' },
    summary: { type: 'string', description: 'one paragraph: the path and the counts' },
  },
  required: ['path', 'summary'],
  additionalProperties: false,
}

// ---- prompts -------------------------------------------------------------
// Reviewers and verifiers are judged against the playbook plus the AGENTS.md
// sections that actually encode enforced code rules — referenced by heading,
// never by line number, since those drift on every edit.
const METHOD = `Read docs/code-review-playbook.md in full — it is short, and both its "Project rules" and its "Do NOT flag" list are binding.

Judge findings against this repo's own HTML5/JavaScript conventions, NOT generic programming advice. Do NOT read AGENTS.md end to end. Read only these sections, located by their heading text: "Coding standards", "Testing", "Logging", "Documentation", "Security & safety". If a claim turns on a convention outside those sections, grep AGENTS.md for the rule text rather than reading the file whole — a rule you never read is a finding you will wrongly raise or wrongly dismiss.

This project deliberately has NO dependencies and NO build step (see "Project overview" in AGENTS.md). Never raise a finding whose fix is adding a framework, npm package, bundler, transpiler or TypeScript.`

const METHOD_SYNTH = `Read docs/code-review-playbook.md in full — it is short. You need its findings convention (BUG-/QUAL- IDs, severity, status legend) and report table format. You are not judging code here, so do not re-review sources.`

const discoveryPrompt = `Enumerate the review units for ${mode === 'diff' ? 'a DIFF-SCOPED' : 'a FULL'} audit of Blenke Husis & Urinjakten, by inspecting the real filesystem (Glob for files, git for what changed).

Group by role, not file by file, so that a bug between two files that work together lands in front of one reviewer. Do not hardcode the file lists; discover them from the files present. Leave out a unit with no files:
- key "simulation": the src/ modules that step the game — physics, collision, the player, enemies, level logic, scoring (find them by what they do: pure modules main.js calls once per fixed step) — plus the data modules they import directly (read their import lines). Level and entity data belong here because their ids, tile codes and effect types only mean something to the rules that read them.
- key "save": src/save.js, if it exists
- key "page": src/main.js plus every src/ module that touches document, window, the canvas, input events or audio (rendering, input, sound)
- key "markup": index.html + css/ (check element ids/classes against what src/ looks up, script loading, viewport/meta, canvas sizing)
- key "helpers": every remaining .js file under src/, subfolders included
- key "tests": every .js file under tests/
- key "other": any remaining .js files not covered above

Never create a unit for node_modules/, vendor/ (third-party code), .claude/, .github/ or assets/.

If src/ has no .js files beyond the scaffold entry point (a src/main.js under ~10 lines that only marks the page ready), return ZERO units with that as the reason — that is a valid result for a scaffolded-but-empty project, not a reason to review the documentation instead.

Also: find the latest docs/code-review-*-findings.md (priorReview) and return its still-open (⬜) and partial (🟡) findings as carryForward. If there is no prior review, or it has none, return an empty carryForward — that is a valid result.

Note that IDs are scoped to their own report and are not globally unique — carry a finding forward by its topic + location, not by assuming its ID means the same thing across files.

Return today's date from \`date +%F\`.

${mode === 'diff'
  ? `DIFF MODE: the baseline \`since\` MUST be a git COMMIT SHA, never a calendar date. ${since ? `Use the caller-supplied ref "${since}" (resolve it to a SHA with \`git rev-parse\`).` : 'Resolve it in this order: (1) the commit of the latest docs/code-review-*-findings.md, `git log -1 --format=%H -- <that-file>`, which is empty if there is no report or it was never committed; (2) the latest release tag, `git rev-parse "$(git describe --tags --abbrev=0)"`.'} The changed files are everything that differs from the baseline in the working tree, committed or not: \`git diff --name-only <sha>\` plus the untracked files from \`git ls-files --others --exclude-standard\`. Cut each unit's paths down to its changed files and drop any unit left with none. If the baseline cannot be resolved to a commit, STOP and return zero units with that as the reason — do NOT fall back to full mode. If nothing has changed, return zero units with that as the reason. Set since to the SHA you used.`
  : `FULL MODE: return every unit. Set since to "".`}

Return the structured unit list, carryForward, date, mode, since, priorReview, reason.`

const reviewPrompt = (u, disco) => `${METHOD}

Review ONE unit: ${u.label}
Paths: ${u.paths.join(', ')}

Read the real source under those paths and trace control flow — never review from summaries or file names. In data files, check ids, references and effect types rather than the copy. Bugs live between files as often as inside them, so read any other file a value crosses on its way, wherever it belongs, and cite the file:line where the bug is. Report findings across five dimensions: crash, logic-bug, code-smell, optimization, simplification.
${disco.mode === 'diff' ? `
DIFF MODE: this review covers what changed since ${disco.since}, committed or not. Read the change with \`git diff ${disco.since} -- <path>\`; a file that prints nothing is untracked, and all of it is new. Then read the whole file around it. Report what the change introduces or makes reachable, including in code it calls or that calls it. Leave alone what was already wrong and is untouched.
` : ''}
Hunt specifically for these browser/JavaScript patterns:
- **crash**: property access on a null from getElementById/querySelector/getContext whose element or id doesn't exist; JSON.parse of a localStorage save with no try/catch or shape check; uncaught promise rejections (image/audio loading, AudioContext.resume); a tile or level lookup out of range (the player past the level's edge) used as an object
- **logic-bug**: NaN or Infinity entering the simulation (0/0 in a normalised vector, a missing save field read as undefined) and then being drawn or saved; a requestAnimationFrame delta that isn't clamped after a background tab, or a fixed-step accumulator with no cap (the spiral of death); logic stepped by the frame delta instead of the fixed step, so physics change with the frame rate; event listeners, timers or a second requestAnimationFrame loop registered again on every restart or level load; keys left held after the window loses focus (no blur/visibilitychange reset); lost \`this\` in callbacks; floating-point drift in a value compared with ===; a save format change with no migration of older saves
- **code-smell**: DOM lookups inside the game loop instead of cached once; game logic that touches document/window (it must stay importable by node:test); unused exports, functions or variables; deeply nested conditionals that could be early-returned; mixing game logic with rendering/input in one function
- **optimization**: rebuilding innerHTML or whole DOM subtrees every frame instead of updating text; layout thrashing (reading layout right after writing styles in a loop); per-frame object/array/string allocation in hot paths; redundant recalculation of values that don't change frame-to-frame
- **simplification**: multi-step expressions reducible to a built-in (Math, Array, Intl.NumberFormat); repeated code blocks that should share a helper; long functions with a single caller

This game is a platformer — a fixed-step simulation of a player running, jumping and colliding with a tile level. In that code also watch for: collision resolved on both axes at once instead of one axis at a time, so the player snags on tile seams or is pushed out the wrong side; a move per step larger than a tile, so a fast fall tunnels through thin floors; the grounded flag set or cleared a step late, so a jump is lost or doubled; coyote time and jump buffering counted in frames instead of fixed steps; a pickup collected twice or a kill counted twice when two collisions land in the same step; level data whose tile codes, spawn points or exits reference nothing the rules know; and state that a restart or level change fails to reset (score, timers, velocity, held keys).

Rendering adds its own: the canvas backing size not following devicePixelRatio or the window size; interpolation between steps reading state already advanced; and per-frame work that belongs at level load (building paths, measuring text, decoding images).

Skip the "Do NOT flag" patterns in the playbook. For each finding give dimension, severity, topic, location (file:line), and why. An empty findings list is a valid, good result.`

const verifyPrompt = (findings, u) => `${METHOD}

You are a SKEPTICAL verifier. Below are ALL ${findings.length} findings raised against unit "${u.label}". Try to REFUTE each one.

${findings.map((f, i) => `[${i}] severity: ${f.severity} · dimension: ${f.dimension}
    topic: ${f.topic}
    location: ${f.location}
    claim: ${f.why}`).join('\n\n')}

Work file by file: findings in the same file share context, so read each file ONCE and rule on all of that file's findings from that single read. For each finding, confirm the cited lines actually say what the claim says, trace the control flow, and check whether it is one of the playbook's intentional "Do NOT flag" patterns.

Default to verdict "refuted" unless the code proves the bug is real. If real, set correctedSeverity. Cite file:line evidence.

Return EXACTLY one verdict per finding — ${findings.length} verdicts, indices 0 through ${findings.length - 1}, none skipped and none invented. A finding you cannot resolve is "needs-info", not an omission.`

const synthPrompt = (confirmed, unresolved, disco, counts) => `${METHOD_SYNTH}

You are the synthesis stage. Below are the VERIFIED-REAL findings (JSON) plus carry-forward findings from the prior review (${disco.priorReview || 'none'}). Produce the dated report.

CONFIRMED FINDINGS:
${JSON.stringify(confirmed, null, 1)}

UNRESOLVED (the verifier could neither confirm nor refute these; they are not findings and get no ID):
${JSON.stringify(unresolved, null, 1)}

CARRY-FORWARD (prior still-open / partial — re-check each is still present in the code; keep its ID if so, mark ✅ if now fixed, drop if gone):
${JSON.stringify(disco.carryForward || [], null, 1)}

PIPELINE COUNTS — use these numbers VERBATIM in the roll-up. You only see the survivors, so you cannot derive them; do NOT recompute, estimate, or invent them:
- raw findings raised by reviewers: ${counts.raw}
- confirmed real by adversarial verification: ${counts.confirmed}
- unresolved (needs-info): ${counts.unresolved}
- rejected (refuted / unruled): ${counts.rejected}

Steps:
1. DEDUP by file + root cause (same issue found in multiple units gets one entry).
2. Assign IDs: BUG-N for crash/logic-bug findings, QUAL-N for code-smell/optimization/simplification. RESTART BOTH SEQUENCES AT 1 for this report — do NOT continue from the previous report's highest ID. IDs are scoped to their own file (see "IDs are scoped to their report" in the playbook), so a carry-forward finding is re-listed here and takes a NEW number; its identity is its topic + location, not its old ID. When citing a finding from an earlier cycle anywhere in the report, qualify it with that report's date (e.g. "QUAL-7/2026-08-05") — a bare ID from another file is ambiguous.
3. Roll up: raw → confirmed (unresolved and rejected counts), by severity (crash/high/medium/low), and by family (BUG/QUAL).
4. Status legend: ✅ fixed · 🟡 partial · ⏸️ deferred-by-design · ❌ won't-fix · ⬜ open. New findings are ⬜.
5. Choose the output path: docs/code-review-${disco.date}-findings.md — but FIRST check whether that file already exists. NEVER overwrite: if it exists, write to docs/code-review-${disco.date}-rerun-findings.md instead (or -rerun2, -rerun3 …), and note the collision. WRITE the report to the chosen path using the table format from docs/code-review-playbook.md: title "# Code review ${disco.date} — findings"; intro (scope, unit count, review pipeline, raw→confirmed count, severity roll-up); "## Status summary" with legend + BUG/QUAL roll-up lines; "### Bugs" table and "### Code quality" table, columns: ID | Sev | Status | Topic | Location; then, if there are any, "### Unresolved", a table of the unresolved findings with columns: Sev | Topic | Location | What is missing.

Return the path you actually wrote and a one-paragraph summary with the counts.`

// ---- pipeline ------------------------------------------------------------
phase('Discover')
const disco = await inline(discoveryPrompt, { schema: DISCOVERY_SCHEMA, label: 'discover-units' })
if (!disco || !disco.units || !disco.units.length) {
  const reason = (disco && disco.reason) || 'No review units discovered.'
  log(`${reason} Nothing to do.`)
  return { error: 'no units', mode, reason }
}
log(`mode=${disco.mode} · ${disco.units.length} units${disco.since ? ` · since ${disco.since}` : ''} · ${(disco.carryForward || []).length} carry-forward`)

phase('Review')
const reviewed = await pipeline(
  disco.units,
  // No `effort` — the review stage inherits the session's effort; it is the one
  // stage where thinking budget buys findings.
  (u) => agent(reviewPrompt(u, disco), { schema: REVIEW_SCHEMA, phase: 'Review', label: `review:${u.key}`, model: 'sonnet' }),
  (r, u) => {
    const findings = (r && r.findings) || []
    if (!findings.length) return { unit: u.key, raw: 0, confirmed: [], unresolved: [] }
    // ONE skeptic per unit rules on every finding in that unit — a single read
    // of the playbook, the conventions, and each source file.
    return agent(verifyPrompt(findings, u), { schema: VERDICTS_SCHEMA, phase: 'Verify', label: `verify:${u.key}`, model: 'sonnet', effort: 'medium' })
      .then((res) => {
        // Fail closed: a finding is promoted only on an explicit "real" verdict.
        // A missing, malformed, or out-of-range index drops the finding, while
        // "needs-info" is listed apart so a doubt isn't lost in silence.
        const byIndex = new Map(((res && res.verdicts) || []).map((v) => [v.index, v]))
        const ruled = findings.map((f, i) => ({ f, v: byIndex.get(i) }))
        return {
          unit: u.key,
          raw: findings.length,
          confirmed: ruled
            .filter((x) => x.v && x.v.verdict === 'real')
            .map((x) => ({ ...x.f, unit: u.key, verdict: x.v, severity: x.v.correctedSeverity || x.f.severity })),
          unresolved: ruled
            .filter((x) => x.v && x.v.verdict === 'needs-info')
            .map((x) => ({ ...x.f, unit: u.key, verdict: x.v })),
        }
      })
  }
)

const results = reviewed.filter(Boolean)
const confirmed = results.flatMap((r) => r.confirmed)
const rawCount = results.reduce((n, r) => n + (r.raw || 0), 0)
const unresolved = results.flatMap((r) => r.unresolved)
const counts = {
  raw: rawCount,
  confirmed: confirmed.length,
  unresolved: unresolved.length,
  rejected: rawCount - confirmed.length - unresolved.length,
}
log(`${counts.raw} raw → ${counts.confirmed} confirmed, ${counts.unresolved} unresolved (${counts.rejected} rejected) after adversarial verification`)

if (!confirmed.length && !unresolved.length && !(disco.carryForward || []).length) {
  log('No confirmed or unresolved findings and nothing carried forward — no report written.')
  return { mode: disco.mode, units: disco.units.length, confirmed: 0 }
}

phase('Synthesize')
const report = await agent(synthPrompt(confirmed, unresolved, disco, counts), { schema: SYNTH_SCHEMA, label: 'synthesize-report', model: 'sonnet', effort: 'medium' })

return {
  mode: disco.mode,
  date: disco.date,
  units: disco.units.length,
  raw: counts.raw,
  confirmed: counts.confirmed,
  unresolved: counts.unresolved,
  rejected: counts.rejected,
  report: report && report.path,
  summary: report && report.summary,
}
