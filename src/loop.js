// The fixed-step clock: turns the time between two frames into a whole number
// of simulation steps, and how far the display is into the next one (for
// interpolating positions). Pure: the time is passed in.
import { MAX_FRAME_TIME, STEP } from './config.js';

// Frame times summed in floating point fall a hair short of a whole step; this
// much short still counts, or a 60 Hz display would now and then skip a step.
const EPSILON = 1e-9;

export function createClock() {
  return { accumulator: 0 };
}

export function advanceClock(clock, frameTime) {
  clock.accumulator += Math.min(Math.max(frameTime, 0), MAX_FRAME_TIME);
  let steps = 0;
  while (clock.accumulator >= STEP - EPSILON) {
    clock.accumulator = Math.max(0, clock.accumulator - STEP);
    steps++;
  }
  return { steps, alpha: clock.accumulator / STEP };
}
