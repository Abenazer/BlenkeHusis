import test from 'node:test';
import assert from 'node:assert/strict';
import { STEP, TILE } from '../src/config.js';
import { createInput } from '../src/input.js';
import { createWorld, stepWorld } from '../src/world.js';

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
