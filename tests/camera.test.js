import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAYER, STEP, TILE, VIEW_HEIGHT, VIEW_WIDTH } from '../src/config.js';
import { createCamera, updateCamera } from '../src/camera.js';
import { beginStep, createInput, queueKey } from '../src/input.js';
import { pixelHeight, pixelWidth } from '../src/level.js';
import { createPlayer } from '../src/player.js';
import { createWorld, stepWorld } from '../src/world.js';
import { makeLevel } from './helpers.js';

const row = '.'.repeat(60);
const level = makeLevel([
  ...Array.from({ length: 16 }, (_, i) => (i === 14 ? `@${row.slice(1)}` : row)),
  '#'.repeat(60),
  '#'.repeat(60),
]);

test('the camera never shows anything left of or above the level', () => {
  const player = createPlayer(TILE / 2, 15 * TILE);
  const camera = createCamera(player, level);
  assert.equal(camera.x, 0);
  assert.ok(camera.y >= 0);
  assert.ok(camera.y <= pixelHeight(level) - VIEW_HEIGHT);
});

test('the camera never shows anything right of the level', () => {
  const player = createPlayer(59.5 * TILE, 15 * TILE);
  const camera = createCamera(player, level);
  assert.equal(camera.x, pixelWidth(level) - VIEW_WIDTH);
});

test('the camera catches up with Blenke smoothly, not at once', () => {
  const player = createPlayer(10 * TILE, 15 * TILE);
  const camera = createCamera(player, level);
  const before = camera.x;
  player.x += 3 * TILE;
  updateCamera(camera, player, level, STEP);
  assert.ok(camera.x > before);
  assert.ok(camera.x < before + 3 * TILE);
  for (let i = 0; i < 300; i++) updateCamera(camera, player, level, STEP);
  assert.ok(Math.abs(camera.x + VIEW_WIDTH / 2 - (player.x + player.w / 2)) < 1);
});

test('the camera looks ahead in the direction Blenke runs', () => {
  const player = createPlayer(25 * TILE, 15 * TILE);
  const camera = createCamera(player, level);
  player.vx = 150;
  player.facing = 1;
  for (let i = 0; i < 120; i++) updateCamera(camera, player, level, STEP);
  assert.ok(camera.x + VIEW_WIDTH / 2 > player.x + player.w / 2 + 20);
});

test('the camera changes speed gradually: never faster than Blenke accelerates', () => {
  const wide = '.'.repeat(200);
  const world = createWorld({
    id: 'wide',
    name: 'Wide',
    rows: [
      ...Array.from({ length: 16 }, (_, i) => (i === 14 ? `@${wide.slice(1)}` : wide)),
      '#'.repeat(200),
      '#'.repeat(200),
    ],
  });
  const input = createInput();
  const positions = [];
  for (let i = 0; i < 400; i++) {
    // Start running, stop, then turn and walk back.
    if (i === 30) {
      queueKey(input, 'ArrowRight', true);
      queueKey(input, 'ShiftLeft', true);
    }
    if (i === 200) {
      queueKey(input, 'ArrowRight', false);
      queueKey(input, 'ShiftLeft', false);
    }
    if (i === 260) queueKey(input, 'ArrowLeft', true);
    beginStep(input);
    stepWorld(world, input, STEP);
    positions.push(world.camera.x);
  }
  const speeds = positions.slice(1).map((x, i) => x - positions[i]);
  const largestChange = Math.max(...speeds.slice(1).map((v, i) => Math.abs(v - speeds[i])));
  assert.ok(largestChange < PLAYER.groundAccel * STEP * STEP, `changed by ${largestChange} px/step²`);
});
