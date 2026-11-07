import test from 'node:test';
import assert from 'node:assert/strict';
import { CITIZENS } from '../src/citizens.js';
import { ENEMIES } from '../src/enemies.js';
import { ITEMS } from '../src/items.js';
import {
  CRATE,
  CRATE_DEFAULT,
  DEFAULT_TIME,
  EMPTY,
  joinSections,
  MARKERS,
  OPEN_CRATE,
  openCrate,
  parseLevel,
  tileAt,
  TILE_TYPES,
} from '../src/level.js';
import { LEVELS } from '../src/levels/index.js';
import { PLATFORM_CHARS } from '../src/platforms.js';
import { PROPS } from '../src/props.js';

test('sections join side by side, row by row', () => {
  assert.deepEqual(joinSections(['ab', 'cd'], ['e', 'f']), ['abe', 'cdf']);
});

test('sections of different heights are refused', () => {
  assert.throws(() => joinSections(['a', 'b'], ['c']), /Section 1 has 1 rows/);
});

test('a level is parsed into tiles, and the start leaves an empty tile', () => {
  const level = parseLevel({ id: 'x', name: 'X', rows: ['.@.', '###'] });
  assert.equal(level.width, 3);
  assert.equal(level.height, 2);
  assert.deepEqual(level.start, { type: 'start', col: 1, row: 0 });
  assert.equal(tileAt(level, 1, 0), EMPTY);
  assert.equal(tileAt(level, 1, 1), '#');
});

test('uneven rows, unknown tiles and a missing start are refused', () => {
  assert.throws(() => parseLevel({ id: 'x', rows: ['.@.', '##'] }), /row 1 is 2 wide/);
  assert.throws(() => parseLevel({ id: 'x', rows: ['.@¤', '###'] }), /unknown tile '¤'/);
  assert.throws(() => parseLevel({ id: 'x', rows: ['...', '###'] }), /exactly one start/);
});

test('the sides of a level are walls, above and below are open', () => {
  const level = parseLevel({ id: 'x', rows: ['.@.', '###'] });
  assert.equal(tileAt(level, -1, 0), '#');
  assert.equal(tileAt(level, 3, 0), '#');
  assert.equal(tileAt(level, 1, -1), EMPTY);
  assert.equal(tileAt(level, 1, 2), EMPTY);
});

test('every level in the game parses', () => {
  for (const definition of LEVELS) {
    assert.doesNotThrow(() => parseLevel(definition), definition.id);
  }
});

test('item characters place items on empty tiles', () => {
  const level = parseLevel({ id: 'x', rows: ['.@uph', '#####'] });
  const items = level.markers.filter((marker) => marker.type === 'item');
  assert.deepEqual(items.map((marker) => [marker.item, marker.col]), [['sampleCup', 2], ['possession', 3], ['sampleCanister', 4]]);
  assert.equal(tileAt(level, 2, 0), EMPTY);
});

test('no item, enemy, platform, marker or tile shares a character', () => {
  const chars = [
    ...Object.keys(TILE_TYPES),
    ...Object.keys(MARKERS),
    ...Object.values(ITEMS).map((item) => item.char),
    ...Object.values(ENEMIES).map((enemy) => enemy.char),
    ...Object.keys(PLATFORM_CHARS),
    ...Object.values(CITIZENS).map((citizen) => citizen.char),
    ...Object.values(PROPS).map((prop) => prop.char),
    EMPTY,
  ];
  assert.equal(new Set(chars).size, chars.length);
});

test('a level has a clock: its own time, or the default', () => {
  assert.equal(parseLevel({ id: 'x', rows: ['@', '#'], time: 90 }).time, 90);
  assert.equal(parseLevel({ id: 'x', rows: ['@', '#'] }).time, DEFAULT_TIME);
  assert.throws(() => parseLevel({ id: 'x', rows: ['@', '#'], time: 0 }), /positive time/);
});

test('enemy and platform characters place them on empty tiles', () => {
  const level = parseLevel({ id: 'x', rows: ['.@DH', '####'] });
  const [, enemy, platform] = level.markers;
  assert.deepEqual(enemy, { type: 'enemy', enemy: 'dealer', col: 2, row: 0 });
  assert.deepEqual(platform, { type: 'platform', axis: 'horizontal', col: 3, row: 0 });
  assert.equal(tileAt(level, 2, 0), EMPTY);
});

test('an item written right above a crate is inside it; an empty crate holds a sample', () => {
  const level = parseLevel({ id: 'x', rows: ['.K....', '.?.?..', '......', '@.....', '######'] });
  assert.deepEqual(level.crates, [
    { col: 1, row: 1, contents: 'policeCoffee' },
    { col: 3, row: 1, contents: CRATE_DEFAULT },
  ]);
  assert.ok(!level.markers.some((marker) => marker.type === 'item'), 'the coffee is not lying on top');
  assert.equal(tileAt(level, 1, 1), CRATE);
});

test('a crate opens once, into an empty one, giving up what it held', () => {
  const level = parseLevel({ id: 'x', rows: ['.X', '.?', '@.', '##'] });
  assert.equal(openCrate(level, 1, 1), 'helicopter');
  assert.equal(tileAt(level, 1, 1), OPEN_CRATE);
  assert.equal(openCrate(level, 1, 1), null);
  assert.equal(openCrate(level, 0, 0), null);
});

test('signs take their texts in order from the left, and every sign needs one', () => {
  const level = parseLevel({ id: 'x', rows: ['..i.', '@i..', '####'], signs: ['A', 'B'] });
  const signs = level.markers.filter((marker) => marker.type === 'sign');
  assert.deepEqual(signs.map((sign) => [sign.col, sign.text]), [[2, 'B'], [1, 'A']]);
  assert.throws(() => parseLevel({ id: 'x', rows: ['@i', '##'] }), /1 signs but 0 sign texts/);
});

test('citizen and prop characters place them on empty tiles', () => {
  const level = parseLevel({ id: 'x', rows: ['@mv', '###'] });
  const [, citizen, prop] = level.markers;
  assert.deepEqual(citizen, { type: 'citizen', citizen: 'pensioner', col: 1, row: 0 });
  assert.deepEqual(prop, { type: 'prop', prop: 'cone', col: 2, row: 0 });
  assert.equal(tileAt(level, 1, 0), EMPTY);
});
