// Entry point and the only module that touches the page: the canvas and its
// scaling, keyboard events and the frame loop. The game itself lives in
// DOM-free modules (see AGENTS.md).
import { BUILD_TIME } from './build.js';
import { createDiagnostics, drawDiagnostics, recordFrame } from './diagnostics.js';
import { STEP, VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { beginStep, createInput, queueKey, releaseAll } from './input.js';
import { LEVELS } from './levels/index.js';
import { advanceClock, createClock } from './loop.js';
import { createRenderer, renderWorld } from './render.js';
import { VERSION } from './version.js';
import { createWorld, stepWorld } from './world.js';

const root = document.getElementById('game');
const screen = document.getElementById('screen');
const screenContext = screen.getContext('2d', { alpha: false });

const renderer = createRenderer();

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

const diagnostics = createDiagnostics();
const input = createInput();
const clock = createClock();
const world = createWorld(LEVELS[0]);

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
