---
description: Run the code-review-audit workflow (discover → review → verify → synthesize)
argument-hint: [full|diff] [since-ref]
allowed-tools: Read, Bash(git:*), Bash(date:*), Agent, Glob, Grep
---

Execute the workflow defined in `.claude/workflows/code-review-audit.js`. That file
is the source of truth — read it in full before doing anything else, since its
prompts, schemas, and phases can change over time and must not be duplicated or
guessed here.

The file is a pipeline DSL, not literal Node.js — there is no runtime that executes
it as JS. You are the interpreter. Walk through it top to bottom and carry out each
step yourself:

- **Args**: `$ARGUMENTS` maps to the file's `args` — a bare string such as `diff` or
  `diff a1b2c3d`, which the file's own parser splits into `mode` (`full` or `diff`,
  default `full`) and `since` (a git ref, diff mode only). It also accepts a JSON
  object. Run that parser as written; don't re-derive it.
- **`inline(prompt, { schema, label })`**: do this step yourself, in this session,
  with no subagent, and produce data matching the schema. It is for work small
  enough that a subagent would only add cost.
- **`agent(prompt, { schema, model, label, effort })`**: spawn one subagent via the
  Agent tool using that exact prompt text (with template values filled in) and that
  model. If a `schema` is given, instruct the subagent to return structured data
  matching it and parse the result; otherwise treat its final report as plain text.
  `effort` caps how much reasoning that stage should spend: pass it as the Agent
  tool's `effort` parameter. An agent call with no `effort` inherits this
  session's effort — pass nothing for those.
- **`pipeline(items, mapFn, thenFn)`**: process `items` one at a time — run `mapFn`
  then `thenFn` for each before moving to the next.
- **`parallel(fns)`**: run those subagent calls concurrently (single message,
  multiple tool calls) and gather all results before continuing.
- **`phase(name)` / `log(msg)`**: emit a short status line to the user at that point
  — don't wait until the end to report progress.
- **`return`**: the value returned at the end of the file is the final result —
  summarize it for the user, including the path of any `docs/code-review-*.md`
  report written.

Follow the file's own early-exit conditions (e.g. no units discovered, no confirmed
findings and nothing carried forward) exactly as written — don't invent additional
stopping conditions or skip steps it doesn't skip.
