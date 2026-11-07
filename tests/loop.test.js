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

// A display at exactly 60 Hz whose browser reports each frame up to 2 ms off.
function jitteryFrames(count) {
  const frames = [];
  let seed = 7;
  for (let i = 0; i < count; i++) {
    seed = (seed * 16807) % 2147483647;
    frames.push(1 / 60 + ((seed / 2147483647) - 0.5) * 0.004);
  }
  return frames;
}

test('jitter in the reported frame times is smoothed away', () => {
  const clock = createClock();
  const frames = jitteryFrames(200);
  const positions = frames.map((frameTime) => {
    const { steps, alpha } = advanceClock(clock, frameTime);
    return { steps, alpha };
  });
  // Once the interval is known, every frame advances exactly one step.
  const settled = positions.slice(60);
  assert.ok(settled.every((frame) => frame.steps === 1), 'uneven steps');
  const alphas = new Set(settled.map((frame) => frame.alpha.toFixed(6)));
  assert.equal(alphas.size, 1, 'the display moved by uneven amounts');
});

test('a dropped frame still counts as two', () => {
  const clock = createClock();
  for (let i = 0; i < 40; i++) advanceClock(clock, 1 / 60);
  assert.equal(advanceClock(clock, 2 / 60 + 0.001).steps, 2);
});

test('a frame time far from a whole number of frames is used as it is', () => {
  const clock = createClock();
  for (let i = 0; i < 40; i++) advanceClock(clock, 1 / 60);
  // 1.5 frames: no snapping either way.
  const before = clock.accumulator;
  advanceClock(clock, 1.5 / 60);
  assert.ok(Math.abs(clock.accumulator - (before + 0.5 / 60)) < 1e-9);
});

test('the clock learns a 144 Hz display too', () => {
  const clock = createClock();
  for (let i = 0; i < 40; i++) advanceClock(clock, 1 / 144 + (i % 2 ? 0.0008 : -0.0008));
  assert.equal(clock.interval, 1 / 144);
});

test('an unusual display rate is used as measured', () => {
  const clock = createClock();
  for (let i = 0; i < 40; i++) advanceClock(clock, 1 / 110);
  assert.ok(Math.abs(clock.interval - 1 / 110) < 1e-9);
});
