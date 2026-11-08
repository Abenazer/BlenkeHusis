// Entry point and the only module that touches the page: the canvas and its
// scaling, keyboard events and the frame loop. The game itself lives in
// DOM-free modules (see AGENTS.md).
import { BUILD_TIME } from './build.js';
import { createDiagnostics, drawDiagnostics, recordFrame } from './diagnostics.js';
import { STEP, VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { beginStep, createInput, queueKey, releaseAll } from './input.js';
import { findLevel, LEVELS, nextLevel } from './levels/index.js';
import { advanceClock, createClock } from './loop.js';
import { createRenderer, renderWorld } from './render.js';
import { BACKGROUND_SPRITES, deliveredSheets, MANIFEST, PLAYER_SPRITE, SPRITES_PATH, TILE_SPRITES } from './sprites.js';
import { VERSION } from './version.js';
import { createWorld, isGameOverDone, isLevelDone, stepWorld } from './world.js';

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

// The asset factory's sheets, by what they replace: { player, tiles:
// { char }, backgrounds: { layer } }, each { description, image }. A
// sheet that fails to load leaves the art drawn in code in its place, so
// the game always runs.
async function loadSprites() {
  const sprites = { player: null, tiles: {}, backgrounds: {} };
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
      else if (TILE_SPRITES[sheet.sprite]) sprites.tiles[TILE_SPRITES[sheet.sprite]] = { description, image };
      else if (BACKGROUND_SPRITES.includes(sheet.sprite)) sprites.backgrounds[sheet.sprite] = { description, image };
      else console.info('A delivered sprite the game does not use yet', { sprite: sheet.sprite });
    } catch (error) {
      console.warn(`The sprite sheet '${sheet.sprite}' did not load; it is drawn in code`, { error });
    }
  }));
  return sprites;
}

const renderer = createRenderer(await loadSprites());

// A whole-number scale keeps every pixel the same size; it is used unless it
// would waste much more of the window than a fractional one.
const INTEGER_SCALE_MIN_SHARE = 0.85;
// Where the game sits on the screen canvas, in screen pixels.
let view = { x: 0, y: 0, width: VIEW_WIDTH, height: VIEW_HEIGHT, scale: 1 };

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

const diagnostics = createDiagnostics();
const input = createInput();
const clock = createClock();
let level = firstLevel();
let world = createWorld(level);

window.addEventListener('keydown', (event) => {
  if (event.code === 'F2' && !event.repeat) {
    diagnostics.visible = !diagnostics.visible;
    event.preventDefault();
    return;
  }
  if (queueKey(input, event.code, true)) event.preventDefault();
});
window.addEventListener('keyup', (event) => {
  if (queueKey(input, event.code, false)) event.preventDefault();
});
window.addEventListener('blur', () => releaseAll(input));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) releaseAll(input);
});

let lastTime = null;

function frame(now) {
  const frameTime = lastTime === null ? 0 : (now - lastTime) / 1000;
  lastTime = now;
  const { steps, alpha } = advanceClock(clock, frameTime);
  for (let i = 0; i < steps; i++) {
    beginStep(input);
    stepWorld(world, input, STEP);
    // Until the game over and level complete screens (TODO.md), the game
    // simply starts the level over, or goes on to the next.
    if (isGameOverDone(world)) world = createWorld(level);
    if (isLevelDone(world)) {
      level = nextLevel(level);
      world = createWorld(level);
    }
  }

  recordFrame(diagnostics, frameTime, steps);
  renderWorld(screenContext, renderer, world, alpha, view);
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
