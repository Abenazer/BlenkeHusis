import test from 'node:test';
import assert from 'node:assert/strict';
import { STEP, TILE } from '../src/config.js';
import { beginStep, createInput } from '../src/input.js';
import { ESCALATOR_SPEED, escalatorSteps, STEP_PITCH, surfaceAt } from '../src/escalators.js';
import { parseLevel } from '../src/level.js';
import { moveBody, platformTop } from '../src/physics.js';
import { createWorld, stepWorld } from '../src/world.js';
import { createDriver } from './helpers.js';

// Up the escalator to the right: the lower floor on row 6, the upper on
// row 2, four tiles of escalator between.
const RISING_RIGHT = [
  '........................',
  '........................',
  '........../#############',
  '........./..............',
  '......../...............',
  '.....@./................',
  '########................',
];
// The same with Blenke on the floor above.
const ABOVE = RISING_RIGHT.map((row, i) => (i === 5 ? row.replace('@', '.') : i === 1 ? '..............@.........' : row));

const mirrorRows = (rows) => rows.map((row) => [...row].reverse().join(''));

function stepFor(world, input, seconds) {
  for (let i = 0; i < Math.round(seconds / STEP); i++) {
    beginStep(input);
    stepWorld(world, input, STEP);
  }
}

function holding(...actions) {
  const driver = createDriver();
  for (const action of actions) driver.press(action);
  beginStep(driver.input);
  return driver.input;
}

const feet = (body) => body.y + body.h;

test('a diagonal run of escalator characters is one escalator, rising as the run does', () => {
  const [right] = parseLevel({ id: 'x', rows: RISING_RIGHT }).escalators;
  assert.deepEqual({ ...right }, { direction: 'up', slope: -1, belt: 1, x: 7 * TILE, w: 4 * TILE, yLeft: 6 * TILE, dx: 0 });
  const [left] = parseLevel({ id: 'x', rows: mirrorRows(RISING_RIGHT).map((row) => row.replaceAll('/', 'z')) }).escalators;
  assert.deepEqual({ ...left }, { direction: 'down', slope: 1, belt: 1, x: 13 * TILE, w: 4 * TILE, yLeft: 2 * TILE, dx: 0 });
  assert.equal(surfaceAt(left, 13 * TILE), 2 * TILE);
  assert.equal(surfaceAt(left, 17 * TILE), 6 * TILE);
});

test('an up and a down escalator side by side stay two', () => {
  const level = parseLevel({ id: 'x', rows: ['@..z/', '..z/.', '#z/..'] });
  assert.deepEqual(level.escalators.map(({ direction, x, w }) => [direction, x / TILE, w / TILE]), [['down', 1, 3], ['up', 2, 3]]);
});

test('an escalator that bends or forks fails loudly', () => {
  assert.throws(() => parseLevel({ id: 'bent', rows: ['@/...', '../..', './...'] }), /bent.*escalator/);
  assert.throws(() => parseLevel({ id: 'fork', rows: ['@....', '././.', '../..'] }), /fork.*escalator/);
  assert.throws(() => parseLevel({ id: 'join', rows: ['@./..', '././.', '.....'] }), /join.*escalator/);
});

test('a body on a slope stands on it where its uphill edge is', () => {
  const [escalator] = parseLevel({ id: 'x', rows: RISING_RIGHT }).escalators;
  const body = { x: 8 * TILE, y: 0, w: 10, h: 22 };
  assert.equal(platformTop(escalator, body), surfaceAt(escalator, 8 * TILE + 10));
  body.x = 11 * TILE - 4;
  assert.equal(platformTop(escalator, body), 2 * TILE, 'past its top it is level with the floor');
});

test('a body falling onto an escalator lands on it, and one rising passes through', () => {
  const level = parseLevel({ id: 'x', rows: RISING_RIGHT });
  const [escalator] = level.escalators;
  const falling = { x: 8 * TILE, y: 0, w: 10, h: 22, vx: 0, vy: 400 };
  for (let i = 0; i < 30; i++) moveBody(falling, level, STEP, { platforms: [escalator] });
  assert.equal(feet(falling), platformTop(escalator, falling));
  const rising = { x: 8 * TILE, y: 5 * TILE, w: 10, h: 22, vx: 0, vy: -400 };
  assert.equal(moveBody(rising, level, STEP, { platforms: [escalator] }).onGround, false);
});

test('Blenke walks up a still slope and onto the floor above without stopping', () => {
  const world = createWorld({ id: 'x', name: 'X', rows: RISING_RIGHT });
  world.escalators[0].belt = 0;
  const input = holding('right');
  let lastFeet = Infinity;
  for (let i = 0; i < 140; i++) {
    beginStep(input);
    stepWorld(world, input, STEP);
    assert.equal(world.player.onGround, true, `on the ground at step ${i}`);
    assert.ok(feet(world.player) <= lastFeet + 1e-9, 'never sinking on the way up');
    lastFeet = feet(world.player);
  }
  assert.ok(world.player.x > 11 * TILE, 'he reached the floor above');
  assert.equal(feet(world.player), 2 * TILE);
});

test('Blenke walks down a slope keeping his feet on it', () => {
  const world = createWorld({ id: 'x', name: 'X', rows: ABOVE });
  world.escalators[0].belt = 0;
  stepFor(world, createInput(), 0.2);
  const input = holding('left');
  for (let i = 0; i < 120; i++) {
    beginStep(input);
    stepWorld(world, input, STEP);
    assert.equal(world.player.onGround, true, `on the ground at step ${i}`);
  }
  assert.equal(feet(world.player), 6 * TILE, 'down on the lower floor');
});

test('standing on an up escalator carries Blenke to the floor above and leaves him there', () => {
  const world = createWorld({ id: 'x', name: 'X', rows: RISING_RIGHT });
  const input = holding('right');
  stepFor(world, input, 0.3);
  assert.equal(world.player.platform, world.escalators[0], 'he stepped on');
  const still = createInput();
  stepFor(world, still, 0.5);
  const before = feet(world.player);
  stepFor(world, still, 1);
  assert.ok(Math.abs(before - feet(world.player) - ESCALATOR_SPEED) < 1, 'he rose at the belt\'s speed');
  stepFor(world, still, 3);
  assert.equal(world.player.platform, null);
  assert.equal(world.player.onGround, true);
  assert.equal(feet(world.player), 2 * TILE, 'on the floor above');
  const x = world.player.x;
  stepFor(world, still, 0.5);
  assert.equal(world.player.x, x, 'and the floor doesn\'t carry him');
});

test('running up a down escalator gets Blenke up, more slowly than up a still one', () => {
  const time = (belt) => {
    const world = createWorld({ id: 'x', name: 'X', rows: RISING_RIGHT.map((row) => row.replaceAll('/', 'z')) });
    world.escalators[0].belt = belt;
    const input = holding('right', 'run');
    for (let i = 1; i < 600; i++) {
      beginStep(input);
      stepWorld(world, input, STEP);
      if (world.player.x > 11 * TILE && feet(world.player) === 2 * TILE) return i;
    }
    return Infinity;
  };
  const still = time(0);
  const against = time(-1);
  assert.ok(Number.isFinite(against), 'he got up');
  assert.ok(against > still, 'the belt held him back');
});

test('jumping leaves the escalator', () => {
  const world = createWorld({ id: 'x', name: 'X', rows: RISING_RIGHT });
  stepFor(world, holding('right'), 0.3);
  assert.ok(world.player.platform);
  const jump = createDriver();
  jump.press('jump');
  stepFor(world, jump.input, 0.05);
  assert.equal(world.player.platform, null);
  assert.ok(world.player.vy < 0);
});

test('the drawn steps run along the slope, two to a tile, and move with the belt', () => {
  const [escalator] = parseLevel({ id: 'x', rows: RISING_RIGHT }).escalators;
  const steps = escalatorSteps(escalator, 0);
  assert.ok(steps.length >= 2 * 4);
  for (const step of steps) {
    assert.equal(step.y, Math.min(surfaceAt(escalator, step.x), surfaceAt(escalator, step.x + STEP_PITCH)));
  }
  const later = escalatorSteps(escalator, 0.1);
  assert.ok(Math.abs((later[0].x - steps[0].x) - ESCALATOR_SPEED * 0.1) < 1e-9, 'they move with the belt');
  assert.deepEqual(escalatorSteps(escalator, 4).map((step) => step.x), steps.map((step) => step.x), 'and repeat a whole number of steps on');
});
