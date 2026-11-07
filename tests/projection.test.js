import test from 'node:test';
import assert from 'node:assert/strict';
import { STEP } from '../src/config.js';
import { toScreen } from '../src/projection.js';

test('something moving with the camera stays on the same screen pixel', () => {
  // Running speed, with the camera a fractional distance behind.
  const speed = 155;
  const lag = 17.37;
  const positions = new Set();
  for (let frame = 0; frame < 120; frame++) {
    const player = 40.3 + speed * STEP * frame;
    positions.add(toScreen(player, player - lag - 100, 3));
  }
  assert.equal(positions.size, 1);
});

test('the view scrolls in screen pixels, not in whole art pixels', () => {
  // At 3x, a third of an art pixel of camera movement moves a tile one pixel.
  assert.equal(toScreen(32, 0, 3) - toScreen(32, 1 / 3, 3), 1);
});

test('a whole scale keeps tiles on whole art pixels when the camera is', () => {
  assert.equal(toScreen(48, 16, 3), 96);
});
