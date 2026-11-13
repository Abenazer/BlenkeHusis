---
name: release
description: Release a version of Blenke Husis & Urinjakten and bring its pages in ../narko-sites up to date (the game page and the updates page). Use when the owner says "släpp", "release", "gör en release", "x.y.z", or asks to tag or publish a version.
---

# Releasing a version

The owner decides when to release and as what version. Never pick the
version yourself, and never bump it or push a tag unless asked. A release
has two commits in two repos: `chore(release): x.y.z` here, then
`docs(blenkehusis): update the pages for x.y.z` in `../narko-sites`.

## 1. Check that it can go out

```bash
git status --short          # clean, or only what belongs in the release
git log --oneline $(git describe --tags --abbrev=0)..HEAD   # what the release holds
node --test tests/          # the whole suite at a release, not only the touched files
find src tests -name '*.js' -print0 | xargs -0 -rn1 node --check
```

Load the page headless once (the verify skill) and check that the console is
clean. Read `[Unreleased]` in `CHANGELOG.md` against the commits since the
last tag: every commit should have its entry. If one is missing, or a
player-facing entry is filed under `Development`, say so before you release.

## 2. The release commit

1. `VERSION` in `src/version.js` and `version` in `package.json`.
2. `CHANGELOG.md`: put `## [x.y.z] - YYYY-MM-DD` (`date +%F`) under
   `## [Unreleased]`, so `[Unreleased]` stays at the top and is empty.
3. `AGENTS.md`: the status paragraph says what the latest release holds
   ("Released in 0.5.0: …"). Bring it up to date if this release changes
   that summary. A release that only tunes or fixes things leaves it alone.
4. `node --test tests/version.test.js`. It fails if the version,
   `package.json` and the changelog section disagree. The release workflow
   would fail on the same thing after the push.
5. Commit `chore(release): x.y.z`, with no body, push `main`, then tag that
   commit and push the tag:

```bash
git tag vx.y.z && git push origin main && git push origin vx.y.z
gh run list --workflow release.yml --limit 1   # the image and the GitHub release
```

`release.yml` refuses a tag that doesn't match `VERSION`. When it is done,
`ghcr.io/abenazer/blenkehusis:x.y.z` and a GitHub release exist. If the run
fails, report the failing step's log. Don't move or delete the tag
without asking.

## 3. The site's pages (`../narko-sites`)

That repo has its own `AGENTS.md` and verify skill: read its rules on the
updates page and on numbers before editing. Change two files:

- **`sites/blenkehusis/index.html`** (the game page): the version in four
  places (the masthead's `build-tag`, the meta row's `Version`, the lede of
  "I spelet" and the footer). Also change any sentence the release makes
  untrue, or one it should now add (a new kind of thing to find, a new
  level). Check every claim against the game's code or `AGENTS.md`.
- **`sites/blenkehusis/uppdateringar.html`** (the updates page): a new
  `<section class="release" id="vX-Y-Z">` at the top, with a `<time>` of the
  release date. The "Senaste version" pill moves from the previous section
  to this one. In the meta row at the top, "Senaste version" changes and
  "Versioner" goes up by one. Copy the previous section's markup.

The updates section is the changelog's player-facing part written again in
Swedish for players: `Added` → **Nytt** (`g-added`), `Changed` → **Ändrat**
(`g-changed`), `Fixed` → **Rättat** (`g-fixed`), `Removed` → **Borttaget**.
Leave out `Development`. Keep it short and a little vague, so the page
doesn't spoil the game:

- no places of hidden things, no tricks, nothing an easter egg would give away
- no tuning figures ("every 3.6 seconds"); say "half as often"
- no small fixes to one spot in one level that only matter to someone
  stuck there

Check the site as its verify skill says (at least
`python3 scripts/check-links.py`, and screenshots at desktop and phone width).
If the release brought new art for Blenke, the font or the suburb, also run
`scripts/blenke-art.sh` there (see its `AGENTS.md`).

Commit `docs(blenkehusis): update the pages for x.y.z`. Its body says what
the pages now say, what was left vague on purpose, and how it was checked.
Push it to `main` (CI publishes the site image) when the owner asked for the
release to be pushed.

## 4. Report

Report the tag, the workflow's result, the site commit and anything left out
of the pages on purpose. Deploying the site's image to the server is the
owner's step (`../narko-sites/docs/deployment.md`). Don't run it unless asked.
