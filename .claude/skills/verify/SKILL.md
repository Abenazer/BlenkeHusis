---
name: verify
description: Serve/launch/drive recipe for verifying Blenke Husis & Urinjakten (HTML5 canvas / JavaScript) changes at runtime.
---

# Blenke Husis & Urinjakten verify

## Tests (preferred when behavior is covered by node:test)

```bash
node --test tests/sprites.test.js tests/art.test.js   # the touched modules' test files
find src tests -name '*.js' -print0 | xargs -0 -rn1 node --check
```

Run the test files of the modules you touched (and of what imports them),
also before a commit, and name them in your report. The whole suite,
`node --test tests/`, is for a release or when asked.

The simulation (movement, jump physics, collision, level logic, saves) is pure
logic with no DOM dependency, stepped at a fixed rate. Verify it here — step
the state with scripted input and assert where the player ends up — rather
than through a browser.

## Serve the page

ES modules don't load from `file://`, so every browser run needs a server.
**Port 8000 is usually the owner's own server** (on `0.0.0.0`, left running):
a second one there fails without a word, and the run tests against theirs.
Use a port of your own and check it is free first:

```bash
P=8765
ss -ltn | grep -q ":$P " && echo "port $P is taken"   # pick another if so
python3 -m http.server $P --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER_PID=$!
# ...browser steps below, on http://127.0.0.1:$P/...
kill $SERVER_PID
```

Stop it by its PID. `pkill -f "http.server …"` matches the shell running
the pkill too, kills it (exit 144) and may hit the owner's server.

## Headless checks (no display needed)

Chromium is the **snap** build, and snap confinement shapes where it can write:

- **`/tmp` is private to the snap.** A screenshot to `/tmp/...` (including the
  session scratchpad) prints "bytes written" and then isn't there.
- **Hidden folders under `$HOME` are denied** (`~/.cache/...` fails with
  "Permission denied").
- **`~/snap/chromium/common/` works** and is visible from the host. Use it for
  screenshots and the throwaway profile.

```bash
V=$HOME/snap/chromium/common/blenkehusis-verify
mkdir -p $V
# Screenshot (390x844 is a phone; use 1280x800 for desktop):
chromium --headless --disable-gpu --user-data-dir=$V/profile \
  --screenshot=$V/shot.png --window-size=1280,800 http://127.0.0.1:$P/
# The DOM after scripts ran, and the page's console (warnings, errors,
# uncaught exceptions; objects print as [object Object]):
chromium --headless --disable-gpu --user-data-dir=$V/profile \
  --virtual-time-budget=3000 --enable-logging=stderr --v=0 \
  --dump-dom http://127.0.0.1:$P/ 2>$V/log.txt | grep -o 'data-ready="[a-z]*"'
grep ':CONSOLE' $V/log.txt     # nothing printed means a clean console
```

The rest of Chromium's stderr is its own noise (dbus, GPU, sign-in); only the
`:CONSOLE` lines are the page. A sheet that fails to load says so there
(`The sprite sheet '…' did not load`), and so does one the game doesn't map
(`A delivered sprite the game does not use yet`).

- **Always pass `--user-data-dir`** pointing at that throwaway profile. Without it
  the run uses the user's real Chromium profile — and their real save in
  `localStorage`.
- `src/main.js` sets `data-ready="true"` on `#game` once it has run; a missing
  attribute in the dumped DOM means a module failed to load.
- A headless screenshot is taken soon after load, so it shows the first frames
  only. Anything that needs the game to run for a while needs a virtual display.
- **`?bana=<id>` still opens on the title screen**: it chooses which level
  Starta plays. A headless screenshot never gets into a level; on a virtual
  display, click the canvas and press Return (below).

## The level editor: every piece of art at once

`tools/editor.html` draws levels with the game's own renderer, so it is the
quickest look at art (a factory delivery, a new tile or character) without
playing to it. Its palette, on the left, shows every tile, item, enemy,
subculture, prop and piece of scenery; scroll it with the mouse wheel over it.

```bash
DISPLAY=:97 chromium --user-data-dir=$V/profile --no-first-run \
  --window-position=0,0 --window-size=1600,900 --app=http://127.0.0.1:$P/tools/editor.html &
# Open a level: click "Öppna en bana…" (top left, about 225,20), then the
# level in the list that drops down (Figurer, the try-out level, has every
# subculture; BANA 1–8 the levels of the game).
DISPLAY=:97 xdotool mousemove 225 20 click 1
DISPLAY=:97 import -window root $V/editor.png
# Enlarge a part to judge pixels, e.g. the palette:
DISPLAY=:97 import -window root -crop 210x760+0+75 +repage -filter point -resize 200% $V/palette.png
```

Opening a level replaces the editor's draft, which is kept in the profile's
storage: harmless in the throwaway profile, never in the owner's.

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
  --window-position=0,0 --window-size=1280,800 --app="http://127.0.0.1:$P/?bana=figurer" &
sleep 6   # the page and its sheets load
WID=$(DISPLAY=:97 xdotool search --name "^Blenke Husis" | head -1)
# Click the canvas once so it has keyboard focus, start the level from the
# title (Starta is marked), then hold right and jump:
DISPLAY=:97 xdotool mousemove --window $WID 640 400 click 1
DISPLAY=:97 xdotool key --window $WID Return
sleep 2   # the iris opens on Blenke
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
- **The game pauses when its window loses focus**, as when a second window
  (the editor) opens on the same display. Click it and press Return
  (Fortsätt) before driving it again.
- Walking is slow for reaching a spot: hold `shift` with the arrow to run, or
  open the level in the editor to see what stands where.

## Gotchas

- The game reads the clock through `requestAnimationFrame`. When a check depends
  on how far the player moves or falls, test it in `node:test` by stepping the
  simulation, rather than timing it in a browser.
- Delete `$V/profile` to start from a fresh save.
