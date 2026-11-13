---
name: level-import
description: Import the owner's level edits, exported from the level editor (tools/editor.html) into exports/, into src/levels/ in Blenke Husis & Urinjakten. Use when the owner says "importera banorna", "import my level edits", "jag har exporterat", or points at files in exports/.
---

# Importing levels from the editor's exports

The owner draws in the level editor and exports each level as a whole level
file into `exports/`, which git ignores. The browser names repeated
downloads `krigslida(1).js`, `krigslida(2).js`, and so on, and some numbers
may be missing. An export is the owner's work, so take their changes as they
are. Don't "improve" a level while importing it. If something in it looks
wrong, ask.

## 1. Which export is the one

Go by modification time, not by the number in brackets. For each level, the
newest file is the one:

```bash
ls -lt --time-style=+%F_%T exports/
for id in $(ls exports | sed -E 's/(\([0-9]+\))?\.js$//' | sort -u); do
  newest=$(ls -t exports/$id*.js | head -1)
  last=$(git log -1 --format=%cI -- src/levels/$id.js)
  echo "$id: $newest exported $(date -r "$newest" -Iseconds), level last committed $last"
done
```

An export older than the level's last commit has either been imported
already or was overtaken by later work, so leave it alone. If the owner
named levels, import only those. If not, take the levels whose newest export
is newer than their last commit, and say which ones you skipped.

## 2. Merge, don't copy

An export is the whole file as the editor had it: the rows, and also the
comments, `signs`, `time`, `music`, `backdrop` and `stationName`. Copying it
over `src/levels/<id>.js` undoes anything committed since the owner opened
the level. It happened once: the extra-life crates were added after an
export. Merge three ways instead. The base is the level as committed when
the export was made:

```bash
SP=<scratchpad>
id=krigslida; export="exports/krigslida(4).js"
base=$(git rev-list -1 --before="$(date -r "$export" -Iseconds)" HEAD -- src/levels/$id.js)
git show $base:src/levels/$id.js > $SP/$id.base.js
git merge-file -p src/levels/$id.js $SP/$id.base.js "$export" > $SP/$id.merged.js; echo "conflicts: $?"
diff src/levels/$id.js $SP/$id.merged.js    # the owner's changes, as they will land
```

- **No conflicts:** read the diff. It should show only what the owner drew.
  If it is far larger, the base is probably wrong (the owner may have edited
  a draft kept in the editor since an older version), so ask before going
  on.
- **Conflicts:** a row the owner changed was also changed in the repo after
  the export. A level row is a line, so look at it column by column. Changes
  in different columns can both be kept. Two changes to the same tile are
  the owner's to decide: ask, and show both versions.

Then copy the merged file into `src/levels/<id>.js`. A level file is
written in NFC and the editor writes it that way too. Never normalise or
transliterate å, ä and ö.

## 3. Check it as the game does

```bash
node --test tests/level.test.js tests/editor.test.js tests/world.test.js \
  tests/report.test.js tests/subcultures.test.js tests/props.test.js \
  tests/station.test.js tests/fringe.test.js tests/messages.test.js
node tools/balance.js <id>     # what the level holds and is worth, the clock, the checkpoints
```

`tests/level.test.js` holds every level of the game to its rules:

- the boss in its arena behind a gate
- the finish
- an extra life about the middle and a heart in the last third
- a goal, checkpoints and a filling station
- the characters

If a test fails because of the owner's drawing (the extra-life crate moved
out of the middle, say), don't move things to make it pass. Tell the owner
what the rule is and where the level breaks it.

Compare `balance.js` before and after (`git stash` or the base file). Large
changes to the samples, the clock's margin or the gaps between checkpoints
are worth mentioning, but they aren't for you to fix.

Then load each imported level headless, as the verify skill says, with
`?bana=<id>` and a fresh profile. The console should be clean and
`data-ready` set. If the owner asks, or a change is hard to judge from the
diff, open it in the level editor on a virtual display and take a
screenshot.

## 4. Docs and commit

- `CHANGELOG.md`, under `[Unreleased]`: what players will notice, per level,
  under `Changed` (or `Added` for a new place). Leave out where hidden
  things are.
- `AGENTS.md`: only if the import changes something it states (what a level
  holds, where the subcultures are).
- One commit per round of edits: `feat(levels): import the owner's …`, or
  `feat(<level>): …` for a single level. The body lists what changed and
  which tests ran.

Leave `exports/` as it is. It is the owner's folder, so don't delete or
rename anything there.
