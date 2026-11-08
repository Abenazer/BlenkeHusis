# Code review 2026-11-08 — findings

Full audit of 7 units (simulation, save, page, markup, helpers, tests, other = `tools/`). Pipeline: discovery on the main thread, one Sonnet reviewer per unit, one Sonnet skeptical verifier per unit that had findings (markup, tests and other raised none, so had no verifier), Sonnet synthesis. Reviewers raised 17 findings; 6 were confirmed real by adversarial verification, 0 are unresolved and 11 were rejected. All 6 confirmed findings are low severity (0 crash, 0 high, 0 medium, 6 low). There were no carry-forward findings from a prior review.

## Status summary

Legend: ✅ fixed · 🟡 partial · ⏸️ deferred-by-design · ❌ won't-fix · ⬜ open

- **BUG:** 3 total — 2 ✅ fixed, 1 ❌ won't-fix (0 crash, 0 high, 0 medium, 3 low)
- **QUAL:** 3 total — 1 ✅ fixed, 2 ⬜ open (0 high, 0 medium, 3 low)

### Bugs

| ID | Sev | Status | Topic | Location |
|---|---|---|---|---|
| BUG-1 | low | ✅ | Stomp not guarded after a life is lost this step: `hurtPlayer` can start the down state in the enemy loop, but the stomp branch has no `world.down`/`world.over` check, so a later enemy in the same step can still be stomped (bounce, defeat score, drop) | src/world.js:401 |
| BUG-2 | low | ✅ | `releaseAll` misses keydowns still waiting in the queue: it only walks `keysDown`, so a keydown queued but not yet applied by `beginStep` when the window blurs stays held with no keyup (impact negligible, under one frame) | src/input.js:128 |
| BUG-3 | low | ❌ | Every printable key is `preventDefault`'ed on every screen: `queueText` accepts any single character, so browser behaviour such as quick-find (`/`) is blocked during play and in menus, not just on name entry. Won't fix: letting letters through would let the browser act on game keys (Firefox's type-to-search opening its find bar mid-play); now in the playbook's "Do NOT flag" list | src/main.js:245 |

### Code quality

| ID | Sev | Status | Topic | Location |
|---|---|---|---|---|
| QUAL-1 | low | ✅ | Unused import `moveSlot` (name entry uses `chooseSlot`) | src/game.js:8 |
| QUAL-2 | low | ⬜ | Redundant time increment in `stepStation`: `station.time += dt` is done in the waiting/walking branch and again right after it | src/station.js:110 |
| QUAL-3 | low | ⬜ | Redundant ternary building band objects: both branches produce the same shape, `{from: row, to: row + 1, colour}` would do | src/backdrop.js:52 |
