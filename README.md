# Blenke Husis & Urinjakten

A satirical platformer: run, jump and collect urine samples through levels
full of absurd obstacles, satire and criticism of the system.

Plain HTML5 and JavaScript — no dependencies, no build step.

## Run

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open http://127.0.0.1:8000/. The page has to be served over HTTP;
opening `index.html` directly from disk won't load the ES modules.
Add `?bana=<id>` to start at a level: `tungelsta`, `krigslida`,
`vasterhaninge`, `jordbro` or `villastad` (BANA 1 to 5), `forort-1` for
Förorten (resting out of the game for now), or `testbana` for the
engine's test level, for instance http://127.0.0.1:8000/?bana=villastad.

The level editor runs off the same server, at
http://127.0.0.1:8000/tools/editor.html. Open one of the game's levels
or start a new one, paint it with the game's own art (or drag from the
palette), and it is checked as the game would check it, with the
level's numbers alongside. Exporting gives a level file to put in
`src/levels/` and list in `src/levels/index.js`, written in the sections
and with the comments the level was opened with. A draft is kept in the
browser between visits.

Or in Docker (nginx serving the same files):

```bash
docker compose up --build -d
```

Then open http://localhost:8085/. Run the same command again after a change
to rebuild; `docker compose down` stops it.

Every push to `main` that changes the game
publishes the image to `ghcr.io/abenazer/blenkehusis:latest`, and every
release as `ghcr.io/abenazer/blenkehusis:<version>`. How it runs on the server
is in `docs/deployment.md`.

## Controls

| Key | Does |
| --- | --- |
| ← → (or A D) | Walk |
| Shift or X (held) | Run |
| ↑, W, Space or Z | Jump (hold for a higher jump) |
| ↓ (or S) | Crouch; with jump, drop through a thin platform |
| C or E | Pick up or throw a cone, help a citizen, read a sign |
| Esc or P | Pause (the game also pauses, and goes quiet, when you leave the window) |
| M | Sound off and on |
| ↑ ↓, Enter or Space | Choose in the menus |
| ← → | Change a volume, on the sound screen (LJUD, on the title and pause menus) |
| Esc | Back, on the controls, sound and high score screens |
| F2 | Measuring panel (frame times, refresh rate, canvas size) |

On a phone or tablet the game is played by touch: a pad on the left
walks, crouches and, pushed out towards its rim, runs; the right side
jumps, the hand button acts and the corner button pauses. The menus and
screens are tapped (a mouse can click them too). The first touch makes
the game fullscreen and turns it sideways where the browser allows it;
where it doesn't (an iPhone), hold the phone sideways.

A score that makes the top ten is signed with a three-letter tag, arcade
style: ↑ ↓ turn the letter, ← → move between them, Enter moves on and
signs from the last, or type the letters; by touch, tap the arrows and
KLAR. The first time, the game asks whether the
high scores may be saved in the browser's `localStorage`; nothing is
stored before the answer, and a "no" stores only itself. A "yes" keeps
the sound settings too.

## Releases

The version is shown at the bottom of the page. A release happens only when
you push its tag (`git tag vx.y.z && git push origin vx.y.z`) after bumping
the version in `src/version.js`, `package.json` and `CHANGELOG.md`. That
creates a GitHub release with a zip of the game and publishes the versioned
image. See "Releases" in `AGENTS.md` for the steps.

## Test

```bash
node --test tests/
```

Requires Node.js 18 or newer. See `AGENTS.md` for the full set of conventions.
