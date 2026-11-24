# Code review 2026-11-24 — findings

Diff-scoped audit of what changed since commit ebd80e27e2b36952062c5c006009eb2536bdb50b (the commit of `docs/code-review-2026-11-08-findings.md`), across 6 units: simulation (35 files), save (1), page (3), helpers (39), tests (21) and tools (5). Markup was left out because `index.html` and `css/` did not change. Pipeline: discovery on the main thread, one Sonnet reviewer per unit, one Sonnet skeptical verifier per unit that had findings (tools raised none, so had no verifier), Sonnet synthesis. Reviewers raised 10 findings; 2 were confirmed real by adversarial verification, 0 are unresolved and 8 were rejected. Both confirmed findings are low severity (0 crash, 0 high, 0 medium, 2 low). There were no carry-forward findings from the prior review.

## Status summary

Legend: ✅ fixed · 🟡 partial · ⏸️ deferred-by-design · ❌ won't-fix · ⬜ open

- **BUG:** 2 total — 2 ⬜ open (0 crash, 0 high, 0 medium, 2 low)
- **QUAL:** 0 total

### Bugs

| ID | Sev | Status | Topic | Location |
|---|---|---|---|---|
| BUG-1 | low | ⬜ | Fine popup shows the nominal amount, not the clamped one: `touch()` deducts `fine = Math.min(data.fine, world.score.points)`, but the popup says `-${data.fine}` and the message says `data.fine * 10` KRONOR whatever was actually taken (at 30 points the player sees -120 and loses 30). The `fined` event carries the clamped value, so the popup should use `fine`. The chief's boss line "BOT: 1200 KRONOR!" (src/enemies.js:296) also disagrees with the 2500 the message shows for fine 250. Display mismatch only | src/world.js:322 |
| BUG-2 | low | ⬜ | Unknown worlds' scores are kept on save, but their `worldsOpen` entries are dropped: `validate` keeps their high-score lists (as its comment promises), but `src/game.js:141` filters `worldsOpen` to known worlds and `saveGame` writes that back, so an unknown world's opened state is lost on the next save while its scores survive. Minor and self-healing | src/save.js:89 |

### Code quality

| ID | Sev | Status | Topic | Location |
|---|---|---|---|---|
| — | — | — | No code-quality findings survived verification | — |
