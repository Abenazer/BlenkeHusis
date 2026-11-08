import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLAYER, STEP } from '../src/config.js';
import {
  applyImpacts,
  createImpact,
  hasImpact,
  holdStill,
  isStill,
  MAX_SHAKE,
  NO_IMPACT,
  settleShake,
  shakeOffset,
} from '../src/impact.js';
import { beginStep, createInput } from '../src/input.js';
import { createWorld, stepWorld } from '../src/world.js';
import { createDriver, sentEventTypes, WORLD_SOURCES } from './helpers.js';

function impactOf(event) {
  const state = createImpact();
  applyImpacts(state, [event]);
  return state;
}

// The shake's swing, sampled every step until it has settled.
function swings(state) {
  const offsets = [];
  for (let i = 0; i < 120; i++) {
    offsets.push(shakeOffset(state));
    settleShake(state, STEP);
  }
  return offsets;
}

test('every event the world sends has an impact or is listed without one', () => {
  const types = sentEventTypes(WORLD_SOURCES);
  assert.ok(types.length > 20, `found only ${types.length} event types`);
  for (const type of types) assert.ok(hasImpact(type) || type in NO_IMPACT, `the event '${type}' has no impact`);
  for (const type of Object.keys(NO_IMPACT)) assert.ok(!hasImpact(type), `'${type}' has an impact and is listed without one`);
});

test('a stomp stops the world for a few steps; the prosecutor beaten, for longer, with a shake', () => {
  const ordinary = impactOf({ type: 'stomp', enemy: 'bureaucrat' });
  const boss = impactOf({ type: 'stomp', enemy: 'prosecutor' });
  assert.ok(ordinary.stop >= 2 && ordinary.stop <= 4, `${ordinary.stop} steps`);
  assert.equal(shakeOffset(ordinary).x, 0);
  assert.ok(boss.stop > ordinary.stop * 2);
  assert.ok(swings(boss).some((offset) => Math.abs(offset.x) > 1));
});

test('a stop counts down a step at a time', () => {
  const state = impactOf({ type: 'hurt' });
  const steps = state.stop;
  let held = 0;
  while (holdStill(state)) held += 1;
  assert.equal(held, steps);
  assert.equal(isStill(state), false);
});

test('the shake stays within its limit, settles to nothing, and is the same every time', () => {
  const offsets = swings(impactOf({ type: 'stomp', enemy: 'prosecutor' }));
  for (const { x, y } of offsets) assert.ok(Math.abs(x) <= MAX_SHAKE && Math.abs(y) <= MAX_SHAKE);
  assert.deepEqual(offsets.at(-1), { x: 0, y: 0 });
  assert.deepEqual(swings(impactOf({ type: 'stomp', enemy: 'prosecutor' })), offsets);
  const early = Math.max(...offsets.slice(0, 5).map(({ x, y }) => Math.hypot(x, y)));
  const late = Math.max(...offsets.slice(20, 25).map(({ x, y }) => Math.hypot(x, y)));
  assert.ok(late < early, 'it dies down');
});

test('a harder shake takes over from a softer one, not the other way round', () => {
  const state = impactOf({ type: 'crateOpened', col: 0, row: 0 });
  applyImpacts(state, [{ type: 'gatesOpened' }]);
  assert.equal(state.shake.strength, impactOf({ type: 'gatesOpened' }).shake.strength);
  applyImpacts(state, [{ type: 'crateOpened', col: 0, row: 0 }]);
  assert.equal(state.shake.strength, impactOf({ type: 'gatesOpened' }).shake.strength);
});

// Blenke drops onto a bureaucrat.
function stompWorld() {
  return createWorld({ id: 'drop', name: 'Drop', rows: ['.@......', '........', '........', '.Y......', '########'] });
}

function stepUntilStomp(world, input) {
  for (let i = 0; i < 120; i++) {
    beginStep(input);
    if (stepWorld(world, input, STEP).some((event) => event.type === 'stomp')) return;
  }
  assert.fail('no stomp');
}

test('during a hit-stop nothing in the world moves, and then it goes on', () => {
  const world = stompWorld();
  const input = createInput();
  stepUntilStomp(world, input);
  const steps = world.impact.stop;
  assert.ok(steps > 0);
  const before = { x: world.player.x, y: world.player.y, time: world.time, timeLeft: world.timeLeft, particles: JSON.stringify(world.particles) };
  for (let i = 0; i < steps; i++) {
    beginStep(input);
    stepWorld(world, input, STEP);
    const now = { x: world.player.x, y: world.player.y, time: world.time, timeLeft: world.timeLeft, particles: JSON.stringify(world.particles) };
    assert.deepEqual(now, before, `step ${i + 1} of the stop`);
  }
  beginStep(input);
  stepWorld(world, input, STEP);
  assert.ok(world.player.y < before.y, 'he bounces on');
});

test('a jump pressed during a hit-stop is kept for when the world moves again', () => {
  const world = stompWorld();
  const driver = createDriver();
  stepUntilStomp(world, driver.input);
  driver.press('jump');
  beginStep(driver.input);
  stepWorld(world, driver.input, STEP);
  assert.equal(world.player.jumpBuffer, PLAYER.jumpBuffer);
  driver.release('jump');
  while (world.impact.stop > 0) {
    beginStep(driver.input);
    stepWorld(world, driver.input, STEP);
  }
  assert.ok(world.player.jumpBuffer > 0, 'still buffered as the world moves on');
});
