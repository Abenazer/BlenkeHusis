import test from 'node:test';
import assert from 'node:assert/strict';
import { TILE } from '../src/config.js';
import { findLeaks, HAZARD_BOXES, hazardFor, isLeaking, isSlippery, LEAK_ON, LEAK_PERIOD, surfaceCrossed } from '../src/hazards.js';
import { makeLevel } from './helpers.js';

const level = makeLevel([
  '.....ZZZ..',
  '.@....O...',
  '..........',
  '.~%^,.....',
  '##########',
]);

// A body the size of Blenke with its feet at y, its middle at column col.
function body(col, feet, h = 22) {
  return { x: (col + 0.5) * TILE - 5, y: feet - h, w: 10, h };
}

const ground = 4 * TILE;

test('water drowns once the body is half under, not before', () => {
  assert.equal(hazardFor(level, body(1, ground - 14), [], 0), null);
  assert.equal(hazardFor(level, body(1, ground), [], 0), 'drown');
});

test('slime and syringes hurt where they are, not in the air above', () => {
  assert.equal(hazardFor(level, body(2, ground), [], 0), 'hurt');
  assert.equal(hazardFor(level, body(3, ground), [], 0), 'hurt');
  assert.equal(hazardFor(level, body(3, 3 * TILE + 2), [], 0), null);
});

test('falling through the surface of water or slime is found, once', () => {
  const water = 3 * TILE + HAZARD_BOXES.water.y;
  const slime = 3 * TILE + HAZARD_BOXES.slime.y;
  const x = (col) => (col + 0.5) * TILE;
  assert.deepEqual(surfaceCrossed(level, x(1), water - 3, water + 2), { liquid: 'water', y: water });
  assert.deepEqual(surfaceCrossed(level, x(2), slime - 1, slime), { liquid: 'slime', y: slime });
  assert.equal(surfaceCrossed(level, x(1), water + 2, water + 6), null, 'already under');
  assert.equal(surfaceCrossed(level, x(1), water + 2, water - 3), null, 'coming up');
  assert.equal(surfaceCrossed(level, x(4), 3 * TILE, 3 * TILE + 8), null, 'a puddle is no surface');
});

test('a puddle is slippery to stand in', () => {
  assert.equal(isSlippery(level, body(4, ground)), true);
  assert.equal(isSlippery(level, body(6, ground)), false);
});

test('a pipe with air below leaks down to the ground, on and off', () => {
  const leaks = findLeaks(level);
  assert.deepEqual(leaks.map(({ col, row, top, bottom }) => ({ col, row, top, bottom })), [{ col: 6, row: 1, top: 2 * TILE, bottom: ground }]);
  const [leak] = leaks;
  assert.equal(isLeaking(leak, 0), true);
  assert.equal(isLeaking(leak, LEAK_ON + 0.01), false);
  assert.equal(isLeaking(leak, LEAK_PERIOD), true);
  assert.equal(hazardFor(level, body(6, ground), leaks, 0), 'hurt');
  assert.equal(hazardFor(level, body(6, ground), leaks, LEAK_ON + 0.1), null);
});
