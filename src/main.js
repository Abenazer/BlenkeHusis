// Entry point and the only module that touches the page: the canvas and its
// scaling, keyboard events and the frame loop. The game itself lives in
// DOM-free modules (see AGENTS.md).
import { BUILD_TIME } from './build.js';
import { STEP, VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { beginStep, createInput, queueKey, releaseAll } from './input.js';
import { LEVELS } from './levels/index.js';
import { advanceClock, createClock } from './loop.js';
import { createRenderer, renderWorld } from './render.js';
import { VERSION } from './version.js';
import { createWorld, stepWorld } from './world.js';

const root = document.getElementById('game');
const screen = document.getElementById('screen');
const screenContext = screen.getContext('2d');

const renderer = createRenderer();

// A whole-number scale keeps every pixel the same size; it is used unless it
// would waste much more of the window than a fractional one.
const INTEGER_SCALE_MIN_SHARE = 0.85;
// Where the game sits on the screen canvas, in screen pixels.
let view = { x: 0, y: 0, width: VIEW_WIDTH, height: VIEW_HEIGHT, scale: 1 };

function resize() {
  const ratio = window.devicePixelRatio || 1;
  const box = screen.getBoundingClientRect();
  screen.width = Math.round(box.width * ratio);
  screen.height = Math.round(box.height * ratio);
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

  screenContext.fillStyle = '#000';
  screenContext.fillRect(0, 0, screen.width, screen.height);
  renderWorld(screenContext, renderer, world, alpha, view);
  requestAnimationFrame(frame);
}

const built = BUILD_TIME
  ? ` · byggd ${new Date(BUILD_TIME).toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' })}`
  : '';
document.getElementById('version').textContent = `v${VERSION}${built}`;

resize();
requestAnimationFrame(frame);
root.dataset.ready = 'true';
