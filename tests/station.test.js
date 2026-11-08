import test from 'node:test';
import assert from 'node:assert/strict';
import { STEP, TILE } from '../src/config.js';
import { parseLevel } from '../src/level.js';
import { forort1 } from '../src/levels/forort1.js';
import { createScore } from '../src/score.js';
import {
  arrive,
  createStation,
  FULL_FILL_TIME,
  fillTime,
  gaugeShare,
  HOLD_TIME,
  MIN_FILL_TIME,
  PLUG_TIME,
  samplesToFind,
  startWalking,
  stationLeft,
  stepStation,
} from '../src/station.js';

function plugged(carried, capacity = 100) {
  const station = createStation(4, 2, TILE, capacity);
  const score = createScore();
  score.carried = carried;
  startWalking(station);
  const events = [];
  arrive(station, events);
  return { station, score, events };
}

function stepFor(station, score, seconds, events = []) {
  for (let t = 0; t < seconds; t += STEP) stepStation(station, score, STEP, events);
  return events;
}

test('the gauge reads the share of all the level holds, and stops at MAX', () => {
  assert.equal(gaugeShare(50, 200), 0.25);
  assert.equal(gaugeShare(300, 200), 1);
  assert.equal(gaugeShare(5, 0), 0);
});

test('a fuller tank takes longer to fill, but none is over at once', () => {
  assert.equal(fillTime(1), FULL_FILL_TIME);
  assert.ok(fillTime(0.5) < FULL_FILL_TIME);
  assert.equal(fillTime(0), MIN_FILL_TIME);
});

test('world 1-1 holds all its samples for the gauge to count', () => {
  assert.equal(samplesToFind(parseLevel(forort1)), 148);
});

test('plugging in clicks, then the samples drain into the tank as the needle climbs', () => {
  const { station, score, events } = plugged(50);
  assert.deepEqual(events.map((event) => event.type), ['hoseIn']);
  stepFor(station, score, PLUG_TIME + STEP);
  assert.equal(station.phase, 'filling');
  assert.equal(station.poured, 50);
  const pours = stepFor(station, score, fillTime(0.5) / 2);
  assert.ok(score.carried > 0 && score.carried < 50, `${score.carried} still carried halfway`);
  assert.ok(station.needle > 0 && station.needle < 0.5, `the needle at ${station.needle}`);
  assert.ok(pours.filter((event) => event.type === 'pour').length > 2, 'the pour gurgles');
  const end = stepFor(station, score, fillTime(0.5));
  assert.equal(score.carried, 0);
  assert.equal(station.needle, 0.5);
  assert.deepEqual(end.filter((event) => event.type === 'gaugeStopped').map(({ share, full }) => ({ share, full })), [{ share: 0.5, full: false }]);
});

test('the needle climbs and never turns back on its way', () => {
  const { station, score } = plugged(80);
  stepFor(station, score, PLUG_TIME + STEP);
  let last = 0;
  while (station.phase === 'filling') {
    stepStation(station, score, STEP, []);
    assert.ok(station.needle >= last);
    last = station.needle;
  }
});

test('a full tank says so as the needle stops', () => {
  const { station, score } = plugged(120);
  const events = stepFor(station, score, PLUG_TIME + FULL_FILL_TIME + 0.1);
  assert.equal(station.needle, 1);
  assert.equal(events.find((event) => event.type === 'gaugeStopped').full, true);
});

test('with nothing to pour the needle stays at 0, silently, and the report still comes', () => {
  const { station, score } = plugged(0);
  const events = stepFor(station, score, PLUG_TIME + MIN_FILL_TIME + 0.1);
  assert.equal(station.needle, 0);
  assert.equal(events.filter((event) => event.type === 'pour').length, 0);
  assert.equal(station.phase, 'done');
});

test('the time left is only known once the needle has stopped', () => {
  const { station, score } = plugged(10);
  assert.equal(stationLeft(station), Infinity);
  stepFor(station, score, PLUG_TIME + fillTime(0.1) + 0.05);
  assert.ok(stationLeft(station) <= HOLD_TIME && stationLeft(station) > 0);
  stepFor(station, score, HOLD_TIME);
  assert.equal(stationLeft(station), 0);
});
