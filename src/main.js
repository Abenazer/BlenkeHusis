// Entry point and the only module that touches the page: the canvas and its
// scaling, keyboard events and the frame loop. The game itself lives in
// DOM-free modules (see AGENTS.md).
import { BUILD_TIME } from './build.js';
import { STEP, VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { beginStep, createInput, queueKey, releaseAll } from './input.js';
import { LEVELS } from './levels/index.js';
import { advanceClock, createClock } from './loop.js';
import { renderWorld } from './render.js';
import { VERSION } from './version.js';
import { createWorld, stepWorld } from './world.js';

const root = document.getElementById('game');
const screen = document.getElementById('screen');
const screenContext = screen.getContext('2d');

// Everything is drawn at the fixed internal resolution, then scaled up.
const view = document.createElement('canvas');
view.width = VIEW_WIDTH;
view.height = VIEW_HEIGHT;
const viewContext = view.getContext('2d');

// A whole-number scale keeps every pixel the same size; it is used unless it
// would waste much more of the window than a fractional one.
const INTEGER_SCALE_MIN_SHARE = 0.85;
let blit = { x: 0, y: 0, width: VIEW_WIDTH, height: VIEW_HEIGHT };

function resize() {
  const ratio = window.devicePixelRatio || 1;
  const { width, height } = screen.getBoundingClientRect();
  screen.width = Math.round(width * ratio);
  screen.height = Math.round(height * ratio);
  const fit = Math.min(screen.width / VIEW_WIDTH, screen.height / VIEW_HEIGHT);
  const whole = Math.floor(fit);
  const scale = whole >= 1 && whole / fit >= INTEGER_SCALE_MIN_SHARE ? whole : fit;
  const blitWidth = Math.round(VIEW_WIDTH * scale);
  const blitHeight = Math.round(VIEW_HEIGHT * scale);
  blit = {
    x: Math.floor((screen.width - blitWidth) / 2),
    y: Math.floor((screen.height - blitHeight) / 2),
    width: blitWidth,
    height: blitHeight,
  };
}

const input = createInput();
const clock = createClock();
const world = createWorld(LEVELS[0]);

window.addEventListener('keydown', (event) => {
  if (queueKey(input, event.code, true)) event.preventDefault();
});
window.addEventListener('keyup', (event) => {
  if (queueKey(input, event.code, false)) event.preventDefault();
});
window.addEventListener('blur', () => releaseAll(input));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) releaseAll(input);
});
window.addEventListener('resize', resize);

let lastTime = null;

function frame(now) {
  const frameTime = lastTime === null ? 0 : (now - lastTime) / 1000;
  lastTime = now;
  const { steps, alpha } = advanceClock(clock, frameTime);
  for (let i = 0; i < steps; i++) {
    beginStep(input);
    stepWorld(world, input, STEP);
  }

  renderWorld(viewContext, world, alpha);
  screenContext.imageSmoothingEnabled = false;
  screenContext.fillStyle = '#000';
  screenContext.fillRect(0, 0, screen.width, screen.height);
  screenContext.drawImage(view, blit.x, blit.y, blit.width, blit.height);
  requestAnimationFrame(frame);
}

const built = BUILD_TIME
  ? ` · byggd ${new Date(BUILD_TIME).toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' })}`
  : '';
document.getElementById('version').textContent = `v${VERSION}${built}`;

resize();
requestAnimationFrame(frame);
root.dataset.ready = 'true';
