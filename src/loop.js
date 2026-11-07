// The fixed-step clock: turns the time between two frames into a whole number
// of simulation steps, and how far the display is into the next one (for
// interpolating positions). Pure: the time is passed in.
import { MAX_FRAME_TIME, STEP } from './config.js';

// Frame times summed in floating point fall a hair short of a whole step; this
// much short still counts, or a 60 Hz display would now and then skip a step.
const EPSILON = 1e-9;
// How many recent frame times the display's frame interval is estimated from.
const HISTORY = 61;
// Frame times longer than this (a hidden tab, a hitch) say nothing about the
// display's rate and are left out of the estimate.
const LONGEST_SAMPLE = 0.1;
// How close, as a share of the interval, a frame time must be to a whole
// number of display frames to be taken as exactly that.
const SNAP_TOLERANCE = 0.2;
// Common display rates. An estimate this close to one (as a share) is taken
// as exactly that rate: the median of jittery samples wanders by a fraction
// of a millisecond, which would still show as unevenness.
const DISPLAY_RATES = [50, 60, 72, 75, 85, 90, 100, 120, 144, 165, 180, 200, 240, 360];
const RATE_TOLERANCE = 0.025;
// Once locked to a rate, the clock keeps it until the estimate is this far
// off, so a run of unlucky samples doesn't unlock it.
const RATE_HOLD = 0.05;

export function createClock() {
  return { accumulator: 0, history: [], interval: 0 };
}

// The mean of the middle half: dropped frames and hitches at the ends are
// left out, and jitter that alternates between two values averages out
// (a median would pick one of them).
function middleMean(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.slice(Math.floor(sorted.length / 4), Math.ceil(sorted.length * 3 / 4));
  return middle.reduce((sum, value) => sum + value, 0) / middle.length;
}

function displayInterval(samples, current) {
  const estimate = middleMean(samples);
  const rate = 1 / estimate;
  if (current > 0 && Math.abs(1 / current - rate) <= rate * RATE_HOLD && DISPLAY_RATES.includes(Math.round(1 / current))) {
    return current;
  }
  const nearest = DISPLAY_RATES.reduce((best, candidate) => (
    Math.abs(candidate - rate) < Math.abs(best - rate) ? candidate : best
  ));
  return Math.abs(nearest - rate) <= nearest * RATE_TOLERANCE ? 1 / nearest : estimate;
}

// Browsers can report frame times with a millisecond or two of jitter (Firefox
// and some Linux setups) while the screen shows frames at a steady rate.
// Simulating that jitter makes whatever moves on screen judder, so a frame
// time close to a whole number of display frames is taken as exactly that. A
// frame the browser really dropped still counts as two.
export function smoothFrameTime(clock, frameTime) {
  if (frameTime > 0 && frameTime < LONGEST_SAMPLE) {
    clock.history.push(frameTime);
    if (clock.history.length > HISTORY) clock.history.shift();
    clock.interval = displayInterval(clock.history, clock.interval);
  }
  if (clock.interval <= 0) return frameTime;
  const frames = Math.round(frameTime / clock.interval);
  const snapped = frames * clock.interval;
  return frames >= 1 && Math.abs(frameTime - snapped) <= clock.interval * SNAP_TOLERANCE
    ? snapped
    : frameTime;
}

export function advanceClock(clock, frameTime) {
  const capped = Math.min(Math.max(frameTime, 0), MAX_FRAME_TIME);
  clock.accumulator += smoothFrameTime(clock, capped);
  let steps = 0;
  while (clock.accumulator >= STEP - EPSILON) {
    clock.accumulator = Math.max(0, clock.accumulator - STEP);
    steps++;
  }
  return { steps, alpha: clock.accumulator / STEP };
}
