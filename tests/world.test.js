import test from 'node:test';
import assert from 'node:assert/strict';
import { STEP, TILE } from '../src/config.js';
import { beginStep, createInput } from '../src/input.js';
import { ITEMS } from '../src/items.js';
import { createWorld, POPUP_TIME, QUIET_LINE, QUIET_TIME, REVEAL_DISTANCE, stepWorld } from '../src/world.js';
import { createDriver } from './helpers.js';

const definition = {
  id: 'pit',
  name: 'Pit',
  rows: [
    '..........',
    '..........',
    '.@........',
    '###...####',
  ],
};

test('Lelle starts standing on the start tile', () => {
  const world = createWorld(definition);
  const input = createInput();
  stepWorld(world, input, STEP);
  assert.equal(world.player.onGround, true);
  assert.equal(world.player.y + world.player.h, 3 * TILE);
});

test('falling out of the level puts Lelle back at the start', () => {
  const world = createWorld(definition);
  const input = createInput();
  world.player.x = 4 * TILE;
  let fell = false;
  for (let i = 0; i < 120 && !fell; i++) {
    fell = stepWorld(world, input, STEP).some((event) => event.type === 'fell');
  }
  assert.equal(fell, true);
  assert.equal(world.player.x, 1.5 * TILE - world.player.w / 2);
});

// Lelle stands at column 1; whatever is at column 2 is in his way.
function worldWith(row, extra = {}) {
  return createWorld({ id: 'items', name: 'Items', rows: ['......', row, '######'], ...extra });
}

function walkRight(world, steps) {
  const driver = createDriver();
  driver.press('right');
  const events = [];
  for (let i = 0; i < steps; i++) {
    beginStep(driver.input);
    events.push(...stepWorld(world, driver.input, STEP));
  }
  return events;
}

test('walking into an item picks it up, scores it and floats its points', () => {
  const world = worldWith('.@u...');
  const events = walkRight(world, 30);
  const collected = events.filter((event) => event.type === 'collected');
  assert.deepEqual(collected, [{ type: 'collected', item: 'sampleCup', points: ITEMS.sampleCup.points }]);
  assert.equal(world.items[0].collected, true);
  assert.equal(world.score.samples, 1);
  assert.equal(world.popups[0].text, `+${ITEMS.sampleCup.points}`);
});

test('an item is only picked up once, and its points float away', () => {
  const world = worldWith('.@u...');
  walkRight(world, 30);
  const later = walkRight(world, Math.ceil(POPUP_TIME / STEP));
  assert.equal(later.filter((event) => event.type === 'collected').length, 0);
  assert.equal(world.popups.length, 0);
});

test('an item with a line says it after the level name', () => {
  const world = worldWith('.@b...');
  walkRight(world, 30);
  assert.deepEqual(world.messages.waiting.map((message) => message.text), [ITEMS.bag.messages[0]]);
  assert.equal(world.messages.current.text, 'Items');
});

test('a hidden item shows only once Lelle comes close, before he takes it', () => {
  const world = createWorld({ id: 'hidden', name: 'Hidden', rows: ['..........', '.@.......h', '##########'] });
  const [canister] = world.items;
  for (let i = 0; i < 120 && !canister.revealed; i++) walkRight(world, 1);
  assert.equal(canister.revealed, true);
  assert.equal(canister.collected, false);
  const gap = canister.x + canister.w / 2 - (world.player.x + world.player.w / 2);
  assert.ok(gap <= REVEAL_DISTANCE && gap > REVEAL_DISTANCE - 4, `revealed ${gap} away`);
  walkRight(world, 60);
  assert.equal(canister.collected, true);
});

test('the clock runs down to zero and stops there', () => {
  const world = worldWith('.@....', { time: 1 });
  const input = createInput();
  for (let i = 0; i < 90; i++) stepWorld(world, input, STEP);
  assert.equal(world.timeLeft, 0);
});

test('a long time without a pickup earns a nudge', () => {
  const world = worldWith('.@....');
  const input = createInput();
  for (let i = 0; i < Math.ceil(QUIET_TIME / STEP) + 1; i++) stepWorld(world, input, STEP);
  assert.equal(world.messages.current.text, QUIET_LINE);
});
