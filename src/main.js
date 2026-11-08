// Entry point and the only module that touches the page: the canvas and its
// scaling, keyboard and touch events, the frame loop and handing the cues
// to audio.js.
// The game itself lives in DOM-free modules (see AGENTS.md).
import { createAudio, playCues, prepareAudio, setAudioHidden, setLevels, setMusic, unlockAudio } from './audio.js';
import { BUILD_TIME } from './build.js';
import { createCues, cueEvents, musicFor } from './cues.js';
import { createDiagnostics, drawDiagnostics, recordFrame } from './diagnostics.js';
import { STEP, VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { beginStep, createInput, queueKey, queueTap, queueText, releaseAll } from './input.js';
import { createGame, pauseGame, stepGame } from './game.js';
import { findLevel, LEVELS } from './levels/index.js';
import { advanceClock, createClock } from './loop.js';
import { SONGS } from './music/index.js';
import { screenLayout, tapAt } from './screens.js';
import { createRenderer, drawTouch, renderGame } from './render.js';
import { SOUNDS } from './sounds.js';
import { createTouch, liftTouch, moveTouch, pressTouch, releaseTouches, touchLayout, touchState } from './touch.js';
import {
  BACKGROUND_SPRITES,
  CHECKPOINT_SPRITE,
  deliveredSheets,
  ENEMY_SPRITES,
  HORIZON_SPRITE,
  MANIFEST,
  PLAYER_SPRITE,
  PROJECTILE_SPRITES,
  SCENERY_SPRITES,
  SPRITES_PATH,
  TILE_SPRITES,
} from './sprites.js';
import { VERSION } from './version.js';

const root = document.getElementById('game');
const screen = document.getElementById('screen');
const screenContext = screen.getContext('2d', { alpha: false });

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status} ${response.statusText}`);
  return response.json();
}

async function loadImage(url) {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}

// The asset factory's sheets, by what they replace: { player, checkpoint,
// tiles: { char }, enemies: { type: [by variant] }, projectiles: { type },
// scenery: { type }, backgrounds: { layer }, horizon }, each
// { description, image }. A
// sheet that fails to load leaves the art drawn in code in its place, so
// the game always runs.
async function loadSprites() {
  const sprites = { player: null, checkpoint: null, tiles: {}, enemies: {}, projectiles: {}, scenery: {}, backgrounds: {}, horizon: null };
  let sheets;
  try {
    sheets = deliveredSheets(await fetchJson(`${SPRITES_PATH}/${MANIFEST}`));
  } catch (error) {
    console.warn('No usable sprite delivery; the art is drawn in code', { error });
    return sprites;
  }
  await Promise.all(sheets.map(async (sheet) => {
    try {
      const [description, image] = await Promise.all([
        fetchJson(`${SPRITES_PATH}/${sheet.description}`),
        loadImage(`${SPRITES_PATH}/${sheet.image}`),
      ]);
      if (sheet.sprite === PLAYER_SPRITE) sprites.player = { description, image };
      else if (sheet.sprite === CHECKPOINT_SPRITE) sprites.checkpoint = { description, image };
      else if (sheet.sprite === HORIZON_SPRITE) sprites.horizon = { description, image };
      else if (TILE_SPRITES[sheet.sprite]) sprites.tiles[TILE_SPRITES[sheet.sprite]] = { description, image };
      else if (ENEMY_SPRITES[sheet.sprite]) {
        const { type, variant } = ENEMY_SPRITES[sheet.sprite];
        (sprites.enemies[type] ??= [])[variant] = { description, image };
      } else if (PROJECTILE_SPRITES.includes(sheet.sprite)) sprites.projectiles[sheet.sprite] = { description, image };
      else if (SCENERY_SPRITES[sheet.sprite]) sprites.scenery[SCENERY_SPRITES[sheet.sprite]] = { description, image };
      else if (BACKGROUND_SPRITES.includes(sheet.sprite)) sprites.backgrounds[sheet.sprite] = { description, image };
      else console.info('A delivered sprite the game does not use yet', { sprite: sheet.sprite });
    } catch (error) {
      console.warn(`The sprite sheet '${sheet.sprite}' did not load; it is drawn in code`, { error });
    }
  }));
  return sprites;
}

const renderer = createRenderer(await loadSprites());
// A player who has asked their system for less motion gets no shaking view.
const lessMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
renderer.calm = lessMotion.matches;
lessMotion.addEventListener('change', () => {
  renderer.calm = lessMotion.matches;
});

// A whole-number scale keeps every pixel the same size; it is used unless it
// would waste much more of the window than a fractional one.
const INTEGER_SCALE_MIN_SHARE = 0.85;
// Where the game sits on the screen canvas, in screen pixels.
let view = { x: 0, y: 0, width: VIEW_WIDTH, height: VIEW_HEIGHT, scale: 1 };
// Where the touch controls sit, in screen pixels.
let touchPlaces = touchLayout(VIEW_WIDTH, VIEW_HEIGHT);

function layout() {
  const fit = Math.min(screen.width / VIEW_WIDTH, screen.height / VIEW_HEIGHT);
  const whole = Math.floor(fit);
  const scale = whole >= 1 && whole / fit >= INTEGER_SCALE_MIN_SHARE ? whole : fit;
  const width = Math.round(VIEW_WIDTH * scale);
  const height = Math.round(VIEW_HEIGHT * scale);
  view = {
    x: Math.floor((screen.width - width) / 2),
    y: Math.floor((screen.height - height) / 2),
    width,
    height,
    scale,
  };
  // The canvas's own pixels per CSS pixel, so the controls are a thumb's
  // size whatever the screen's density.
  const ratio = screen.width / Math.max(1, screen.clientWidth);
  touchPlaces = touchLayout(screen.width, screen.height, ratio);
}

function setScreenSize(width, height) {
  // Setting the size clears the canvas to black (it is opaque), which is the
  // letterbox; only the view is drawn each frame.
  screen.width = width;
  screen.height = height;
  layout();
}

// The canvas must have exactly as many pixels as it covers on the screen, or
// the browser scales the whole picture once more and everything that moves
// shimmers (with browser zoom or 125 % display scaling, for instance).
// device-pixel-content-box gives that size exactly; where it isn't supported
// the CSS size times devicePixelRatio, rounded, is the closest guess.
function observeScreenSize() {
  const fallback = (rect) => {
    const ratio = window.devicePixelRatio || 1;
    setScreenSize(Math.round(rect.width * ratio), Math.round(rect.height * ratio));
  };
  const observer = new ResizeObserver(([entry]) => {
    const box = entry.devicePixelContentBoxSize?.[0];
    if (box) setScreenSize(box.inlineSize, box.blockSize);
    else fallback(entry.contentRect);
  });
  try {
    observer.observe(screen, { box: 'device-pixel-content-box' });
  } catch (error) {
    console.info('device-pixel-content-box unsupported; sizing from devicePixelRatio', { error });
    observer.observe(screen);
  }
  fallback(screen.getBoundingClientRect());
}

// ?bana=<id> starts at that level instead of the first, the engine's test
// level included, for trying a level out.
function firstLevel() {
  const id = new URLSearchParams(window.location.search).get('bana');
  if (!id) return LEVELS[0];
  const level = findLevel(id);
  if (!level) console.warn('No level with that id; starting at the first', { id });
  return level ?? LEVELS[0];
}

// The browser's storage for the high scores, or null where it keeps
// nothing (some private windows, storage turned off): the game then keeps
// them only while the page is open. Nothing is read or written here; the
// game asks the player first (save.js).
function browserStorage() {
  try {
    return window.localStorage ?? null;
  } catch (error) {
    console.info('No storage in this browser; the high scores last while the page is open', { error });
    return null;
  }
}

const diagnostics = createDiagnostics();
const input = createInput();
const clock = createClock();
const game = createGame(firstLevel(), { storage: browserStorage() });
const audio = createAudio(SOUNDS, SONGS);
// Known before the first key makes the context, so a saved "sound off"
// holds from the start.
setLevels(audio, game.settings);
// Sounds and songs render a little each frame, in this many milliseconds,
// until all are ready: rendered at once they would stall the page.
const AUDIO_RENDER_BUDGET = 4;
let audioReady = false;
const cues = createCues();
const touch = createTouch();
// A phone or tablet shows its controls from the start; anything else once
// a finger touches the screen.
touch.visible = window.matchMedia('(pointer: coarse)').matches;

window.addEventListener('keydown', (event) => {
  unlockAudio(audio);
  touch.visible = false;
  if (event.code === 'F2' && !event.repeat) {
    diagnostics.visible = !diagnostics.visible;
    event.preventDefault();
    return;
  }
  // What a key types (a name, on the high scores) goes in as text too;
  // a shortcut with Ctrl, Alt or Meta stays the browser's.
  const shortcut = event.ctrlKey || event.altKey || event.metaKey;
  const typed = !shortcut && queueText(input, event.key);
  if (queueKey(input, event.code, true) || typed) event.preventDefault();
});
window.addEventListener('keyup', (event) => {
  if (queueKey(input, event.code, false)) event.preventDefault();
});
// Keys held when the window loses focus never send their keyup; and a game
// left behind in another window should wait, silent.
function leave() {
  releaseTouches(touch, input);
  releaseAll(input);
  pauseGame(game);
  setAudioHidden(audio, true);
}
window.addEventListener('blur', leave);
window.addEventListener('focus', () => setAudioHidden(audio, false));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) leave();
  else if (document.hasFocus()) setAudioHidden(audio, false);
});

// A pointer event's place on the canvas, in its own pixels.
function screenPoint(event) {
  const rect = screen.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) * screen.width) / Math.max(1, rect.width),
    y: ((event.clientY - rect.top) * screen.height) / Math.max(1, rect.height),
  };
}

// Fingers (and pens) work the touch controls while a level is played; on
// the screens around it a tap, or a click, takes what it lands on (a
// menu's row, a volume's step) or goes on where Enter would. Sound can
// only start from a touch, as from a key, and some browsers count only the
// lifting finger.
screen.addEventListener('pointerdown', (event) => {
  const finger = event.pointerType !== 'mouse';
  if (finger) {
    event.preventDefault();
    touch.visible = true;
  }
  unlockAudio(audio);
  const { x, y } = screenPoint(event);
  if (game.screen === 'playing') {
    if (finger) pressTouch(touch, input, touchPlaces, event.pointerId, x, y);
    return;
  }
  const target = tapAt(screenLayout(game, { touch: touch.visible }), (x - view.x) / view.scale, (y - view.y) / view.scale);
  if (target) queueTap(input, target);
});
screen.addEventListener('pointermove', (event) => {
  if (event.pointerType === 'mouse') return;
  const { x, y } = screenPoint(event);
  moveTouch(touch, input, touchPlaces, event.pointerId, x, y);
});
for (const type of ['pointerup', 'pointercancel']) {
  screen.addEventListener(type, (event) => {
    if (event.pointerType === 'mouse') return;
    if (type === 'pointerup') unlockAudio(audio);
    liftTouch(touch, input, event.pointerId);
  });
}
// A long press would otherwise bring up the browser's menu.
screen.addEventListener('contextmenu', (event) => event.preventDefault());

let lastTime = null;
let touchWasShown = false;

function frame(now) {
  const frameTime = lastTime === null ? 0 : (now - lastTime) / 1000;
  lastTime = now;
  const { steps, alpha } = advanceClock(clock, frameTime);
  const stepStart = performance.now();
  for (let i = 0; i < steps; i++) {
    beginStep(input);
    const events = stepGame(game, input, STEP);
    setLevels(audio, game.settings);
    playCues(audio, cueEvents(cues, events, { time: game.time, cameraX: game.world?.camera.x ?? null }));
    // Fingers held as the play stops (paused, the goal, the last life)
    // are let go; they work the next play only once lifted and put back.
    if (game.screen !== 'playing') releaseTouches(touch, input);
  }

  if (!audioReady) audioReady = prepareAudio(audio, AUDIO_RENDER_BUDGET);
  setMusic(audio, musicFor(game));

  const drawStart = performance.now();
  // The touch controls reach into the letterbox, which is otherwise never
  // drawn: it is cleared while they show (half seen through, they would
  // build up there) and once more as they go.
  const touchShown = touch.visible && game.screen === 'playing';
  if (touchShown || touchWasShown) {
    screenContext.fillStyle = '#000';
    screenContext.fillRect(0, 0, screen.width, screen.height);
  }
  touchWasShown = touchShown;
  renderGame(screenContext, renderer, game, alpha, view, { touch: touch.visible });
  if (touchShown) drawTouch(screenContext, renderer, touchPlaces, touchState(touch, touchPlaces));
  recordFrame(diagnostics, frameTime, steps, { step: drawStart - stepStart, draw: performance.now() - drawStart });
  drawDiagnostics(screenContext, diagnostics, clock, view, screen);
  requestAnimationFrame(frame);
}

const built = BUILD_TIME
  ? ` · byggd ${new Date(BUILD_TIME).toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' })}`
  : '';
document.getElementById('version').textContent = `v${VERSION}${built}`;

observeScreenSize();
requestAnimationFrame(frame);
root.dataset.ready = 'true';
