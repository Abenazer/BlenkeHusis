import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { VIEW_WIDTH } from '../src/config.js';
import {
  COMBO_STEPS,
  createCues,
  cueEvents,
  HARD_LANDING,
  HEARING_MARGIN,
  isCued,
  LAST_TICKS,
  SILENT_EVENTS,
  SOFT_LANDING,
} from '../src/cues.js';
import { ITEMS } from '../src/items.js';
import { SOUNDS } from '../src/sounds.js';

function cue(event, { time = 0, cameraX = null, cues = createCues() } = {}) {
  return cueEvents(cues, [event], { time, cameraX });
}

function soundOf(event, options) {
  return cue(event, options).map((play) => play.sound);
}

const POWER_UPS = Object.keys(ITEMS).filter((type) => ITEMS[type].category === 'powerUp');

// Every event type the game's modules send: the literal types they push,
// and the ways an enemy can be hit (defeating it sends the way as the type).
function sentEventTypes() {
  const types = new Set();
  for (const file of readdirSync(new URL('../src/', import.meta.url))) {
    if (!file.endsWith('.js')) continue;
    const source = readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8');
    for (const [, type] of source.matchAll(/events\.push\(\{ type: '(\w+)'/g)) types.add(type);
    for (const [, how] of source.matchAll(/hitEnemy\(world, \w+, '(\w+)'/g)) types.add(how);
  }
  return [...types];
}

test('every event the game sends is either cued or listed as silent', () => {
  const types = sentEventTypes();
  assert.ok(types.length > 20, `found only ${types.length} event types`);
  for (const type of types) assert.ok(isCued(type) || type in SILENT_EVENTS, `the event '${type}' has no cue`);
  for (const type of Object.keys(SILENT_EVENTS)) assert.ok(!isCued(type), `'${type}' is both cued and silent`);
});

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

test('each kind of pickup has its own sound; a power-up sounds with its own event', () => {
  assert.deepEqual(soundOf({ type: 'collected', item: 'sampleCup', chain: 1 }), ['sample']);
  assert.deepEqual(soundOf({ type: 'collected', item: 'possession', chain: 1 }), ['possession']);
  assert.deepEqual(soundOf({ type: 'collected', item: 'bag', chain: 1 }), ['evidence']);
  assert.deepEqual(soundOf({ type: 'collected', item: 'coffee', chain: 1 }), ['bonus']);
  assert.deepEqual(soundOf({ type: 'collected', item: 'policeCoffee', chain: 1 }), []);
});

test('a combo plays each pickup a step higher, up to the top step', () => {
  const rates = [1, 2, 3, 20].map((chain) => cue({ type: 'collected', item: 'sampleCup', chain })[0].rate);
  assert.equal(rates[0], 1);
  assert.ok(rates[1] > rates[0] && rates[2] > rates[1]);
  assert.equal(rates[3], 2 ** (COMBO_STEPS.at(-1) / 12));
});

test('each power-up has a sound of its own', () => {
  const sounds = POWER_UPS.map((type) => soundOf({ type: 'powerUp', powerUp: type })[0]);
  assert.equal(new Set(sounds).size, POWER_UPS.length);
  for (const sound of sounds) assert.ok(SOUNDS[sound], sound);
});

test('a life lost sounds by what took it', () => {
  const sounds = ['hurt', 'pit', 'water', 'time'].map((cause) => soundOf({ type: 'lifeLost', cause, lives: 2 })[0]);
  assert.equal(new Set(sounds).size, 4);
  assert.throws(() => cue({ type: 'lifeLost', cause: 'boredom' }), /boredom/);
});

test('the clock ticks higher in its last seconds', () => {
  const rate = (left) => cue({ type: 'tick', left })[0].rate;
  assert.equal(rate(LAST_TICKS + 1), 1);
  assert.ok(rate(LAST_TICKS) > 1);
});

test('what enemies do off screen is not heard', () => {
  const cameraX = 1000;
  const shout = (x) => ({ type: 'shout', text: 'X', x });
  assert.deepEqual(soundOf(shout(cameraX + VIEW_WIDTH / 2), { cameraX }), ['shout']);
  assert.deepEqual(soundOf(shout(cameraX - HEARING_MARGIN - 1), { cameraX }), []);
  assert.deepEqual(soundOf(shout(cameraX + VIEW_WIDTH + HEARING_MARGIN + 1), { cameraX }), []);
  assert.deepEqual(soundOf({ type: 'drop', item: 'bag', x: 0 }, { cameraX }), []);
  const paper = { type: 'paper', x: cameraX + 20, w: 8 };
  assert.deepEqual(soundOf({ type: 'throw', projectile: paper }, { cameraX }), ['throw']);
  assert.deepEqual(soundOf({ type: 'throw', projectile: { ...paper, x: 0 } }, { cameraX }), []);
  assert.deepEqual(soundOf({ type: 'jump', x: 0 }, { cameraX }), ['jump'], 'Blenke is always heard');
});

test('a shouted slogan is heard as the shout, not as a throw', () => {
  assert.deepEqual(soundOf({ type: 'throw', projectile: { type: 'shout', x: 0, w: 8 } }), []);
});

test('a sound with a minimum gap does not play again until it has passed', () => {
  const cues = createCues();
  const land = { type: 'land', speed: HARD_LANDING };
  const gap = SOUNDS.land.minGap;
  assert.equal(cueEvents(cues, [land, land], { time: 1 }).length, 1, 'once in one step');
  assert.equal(cueEvents(cues, [land], { time: 1 + gap / 2 }).length, 0);
  assert.equal(cueEvents(cues, [land], { time: 1 + gap }).length, 1);
});

test('the silent events play nothing', () => {
  for (const type of Object.keys(SILENT_EVENTS)) assert.deepEqual(cue({ type }), [], type);
});
