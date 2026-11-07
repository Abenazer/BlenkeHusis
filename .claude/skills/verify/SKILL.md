---
name: verify
description: Serve/launch/drive recipe for verifying Blenke Husis & Urinjakten (HTML5 canvas / JavaScript) changes at runtime.
---

# Blenke Husis & Urinjakten verify

## Tests (preferred when behavior is covered by node:test)

```bash
node --test tests/
find src tests -name '*.js' -print0 | xargs -0 -rn1 node --check
```

The simulation (movement, jump physics, collision, level logic, saves) is pure
logic with no DOM dependency, stepped at a fixed rate. Verify it here — step
the state with scripted input and assert where the player ends up — rather
than through a browser.

## Serve the page

ES modules don't load from `file://`, so every browser run needs the dev server:

```bash
python3 -m http.server 8000 --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER_PID=$!
# ...browser steps below...
kill $SERVER_PID
```

## Headless checks (no display needed)

Chromium is the **snap** build, and snap confinement shapes where it can write:

- **`/tmp` is private to the snap.** A screenshot to `/tmp/...` (including the
  session scratchpad) prints "bytes written" and then isn't there.
- **Hidden folders under `$HOME` are denied** (`~/.cache/...` fails with
  "Permission denied").
- **`~/snap/chromium/common/` works** and is visible from the host. Use it for
  screenshots and the throwaway profile.

```bash
V=$HOME/snap/chromium/common/superlelle-verify
mkdir -p $V
# Screenshot (390x844 is a phone; use 1280x800 for desktop):
chromium --headless --disable-gpu --user-data-dir=$V/profile \
  --screenshot=$V/shot.png --window-size=1280,800 http://127.0.0.1:8000/
# The DOM after scripts ran — the quickest proof main.js loaded:
chromium --headless --disable-gpu --user-data-dir=$V/profile \
  --dump-dom http://127.0.0.1:8000/
```

- **Always pass `--user-data-dir`** pointing at that throwaway profile. Without it
  the run uses the user's real Chromium profile — and their real save in
  `localStorage`.
- `src/main.js` sets `data-ready="true"` on `#game` once it has run; a missing
  attribute in the dumped DOM means a module failed to load.
- A headless screenshot is taken soon after load, so it shows the first frames
  only. Anything that needs the game to run for a while needs a virtual display.

## Live/visual verification (driving input)

> **To drive input rather than just watch**, see the user-level `visual-verify`
> skill (`~/.claude/skills/visual-verify/`). It covers xdotool against a virtual
> display and the traps that waste a session — chiefly that `pgrep -f 'Xvfb :99'`
> matches its own command line, so a check-then-start one-liner never starts a
> server. This file keeps the launch commands; that one has the technique.

**Never run on the user's live display (`:0`)** — that's their real desktop
session, not a sandbox. The `no-live-display` hookify rule blocks it. Always use
a virtual display:

**`:99` is often already taken** by another session's Xvfb on this machine.
Check `pgrep -ax Xvfb` first and pick a free number (`:97` below). Stop only
your own server by its PID — `pkill -x Xvfb` would kill the other session's
display too.

```bash
Xvfb :97 -screen 0 1600x900x24 &
XVFB_PID=$!
DISPLAY=:97 xdotool getdisplaygeometry      # confirm it's up: "1600 900"
DISPLAY=:97 chromium --user-data-dir=$V/profile --no-first-run \
  --window-position=0,0 --window-size=1280,800 --app=http://127.0.0.1:8000/ &
WID=$(DISPLAY=:97 xdotool search --name "Blenke Husis" | head -1)
# Click the canvas once so it has keyboard focus, then hold right and jump:
DISPLAY=:97 xdotool mousemove --window $WID 640 400 click 1
DISPLAY=:97 xdotool keydown --window $WID Right
DISPLAY=:97 xdotool key --window $WID space
sleep 1
DISPLAY=:97 xdotool keyup --window $WID Right
DISPLAY=:97 import -window root -crop 1280x800+0+0 +repage $V/shot.png
# Close the browser gracefully (not kill -9), then the display:
DISPLAY=:97 xdotool key --window $WID ctrl+w
kill $XVFB_PID
```

- With `--app` and no window manager, window coordinates are page coordinates.
- **A held key needs `keydown` … `keyup`.** `xdotool key` is a tap of a few
  milliseconds, which may fall between two simulation steps. Always send the
  `keyup`: a key left down keeps the player running into the next run.
- **After changing code, hard-reload** (`xdotool key --window $WID ctrl+shift+r`).
  A plain F5 revalidates the page but can serve the ES modules it imports from
  cache, so the browser keeps running the old code with no error.
- Chromium shows its own "translate from Swedish" bar on a fresh profile. It's
  the browser, not the game.

## Gotchas

- The game reads the clock through `requestAnimationFrame`. When a check depends
  on how far the player moves or falls, test it in `node:test` by stepping the
  simulation, rather than timing it in a browser.
- Delete `$V/profile` to start from a fresh save.
