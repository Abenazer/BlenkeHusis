import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_FRAME_TIME, STEP } from '../src/config.js';
import { advanceClock, createClock } from '../src/loop.js';

test('a frame is turned into whole steps, with the rest carried over', () => {
  const clock = createClock();
  const first = advanceClock(clock, STEP * 2.5);
  assert.equal(first.steps, 2);
  assert.ok(Math.abs(first.alpha - 0.5) < 1e-9);
  const second = advanceClock(clock, STEP * 0.5);
  assert.equal(second.steps, 1);
});

test('a long pause simulates at most the capped time', () => {
  const clock = createClock();
  const { steps } = advanceClock(clock, 30);
  assert.equal(steps, Math.floor(MAX_FRAME_TIME / STEP + 1e-9));
});

test('a negative frame time, e.g. from a clock change, adds nothing', () => {
  const clock = createClock();
  assert.equal(advanceClock(clock, -5).steps, 0);
  assert.equal(clock.accumulator, 0);
});
