import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COMBO_STEPS, createCues, cueEvents, HARD_LANDING, SOFT_LANDING } from '../src/cues.js';
import { SOUNDS } from '../src/sounds.js';

function cue(event, time = 0, cues = createCues()) {
  return cueEvents(cues, [event], time);
}

test('a jump plays the jump sound', () => {
  assert.deepEqual(cue({ type: 'jump' }), [{ sound: 'jump', rate: 1, volume: 1 }]);
});

test('a landing is silent from a small drop and louder the harder it is', () => {
  assert.deepEqual(cue({ type: 'land', speed: SOFT_LANDING - 1 }), []);
  const soft = cue({ type: 'land', speed: SOFT_LANDING })[0];
  const hard = cue({ type: 'land', speed: HARD_LANDING })[0];
  assert.equal(soft.sound, 'land');
  assert.ok(soft.volume < hard.volume);
  assert.equal(hard.volume, 1);
  assert.equal(cue({ type: 'land', speed: HARD_LANDING * 2 })[0].volume, 1);
});

test('each kind of pickup has its own sound, and a power-up is not one of them yet', () => {
  assert.equal(cue({ type: 'collected', item: 'sampleCup', chain: 1 })[0].sound, 'sample');
  assert.equal(cue({ type: 'collected', item: 'possession', chain: 1 })[0].sound, 'possession');
  assert.deepEqual(cue({ type: 'collected', item: 'policeCoffee', chain: 1 }), []);
});

test('a combo plays each pickup a step higher, up to the top step', () => {
  const rates = [1, 2, 3, 20].map((chain) => cue({ type: 'collected', item: 'sampleCup', chain })[0].rate);
  assert.equal(rates[0], 1);
  assert.ok(rates[1] > rates[0] && rates[2] > rates[1]);
  assert.equal(rates[3], 2 ** (COMBO_STEPS.at(-1) / 12));
});

test('a sound with a minimum gap does not play again until it has passed', () => {
  const cues = createCues();
  const land = { type: 'land', speed: HARD_LANDING };
  const gap = SOUNDS.land.minGap;
  assert.equal(cueEvents(cues, [land, land], 1).length, 1, 'once in one step');
  assert.equal(cueEvents(cues, [land], 1 + gap / 2).length, 0);
  assert.equal(cueEvents(cues, [land], 1 + gap).length, 1);
});

test('events without a sound play nothing', () => {
  assert.deepEqual(cue({ type: 'read' }), []);
});

test('every cue names a sound that exists', () => {
  const events = [
    { type: 'jump' }, { type: 'land', speed: HARD_LANDING }, { type: 'bump' },
    ...['sampleCup', 'possession', 'bag', 'coffee'].map((item) => ({ type: 'collected', item, chain: 1 })),
  ];
  for (const play of cueEvents(createCues(), events, 0)) assert.ok(SOUNDS[play.sound], play.sound);
});
