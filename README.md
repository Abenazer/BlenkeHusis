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

Or in Docker (nginx serving the same files):

```bash
docker compose up --build -d
```

Then open http://localhost:8085/. Run the same command again after a change
to rebuild; `docker compose down` stops it.

Every push to `main` that changes the game
publishes the image to `ghcr.io/abenazer/superlelle:latest`, and every
release as `ghcr.io/abenazer/superlelle:<version>`. How it runs on the server
is in `docs/deployment.md`.

## Controls

| Key | Does |
| --- | --- |
| ← → (or A D) | Walk |
| Shift or X (held) | Run |
| ↑, W, Space or Z | Jump (hold for a higher jump) |
| ↓ (or S) | Crouch; with jump, drop through a thin platform |
| C or E | Pick up or throw a cone, help a citizen, read a sign |
| F2 | Measuring panel (frame times, refresh rate, canvas size) |

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
