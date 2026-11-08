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
  GATE,
  isSolid,
  joinSections,
  MARKERS,
  OPEN_CRATE,
  openCrate,
  openGates,
  parseLevel,
  revealRoom,
  ROOM,
  SECRET_WALL,
  tileAt,
  TILE_TYPES,
} from '../src/level.js';
import { findLevel, LEVELS, nextLevel, TEST_LEVEL } from '../src/levels/index.js';
import { SCENERY } from '../src/scenery.js';
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

test('every level in the game parses, and the test level', () => {
  for (const definition of [...LEVELS, TEST_LEVEL]) {
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
    ...Object.values(SCENERY).map((piece) => piece.char),
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

test('checkpoints, the goal and scenery are markers on empty tiles; a level has one goal at most', () => {
  const level = parseLevel({ id: 'x', rows: ['@C1G', '####'] });
  assert.deepEqual(level.markers.slice(1), [
    { type: 'checkpoint', col: 1, row: 0 },
    { type: 'scenery', scenery: 'busStop', col: 2, row: 0 },
    { type: 'goal', col: 3, row: 0 },
  ]);
  assert.equal(tileAt(level, 2, 0), EMPTY);
  assert.throws(() => parseLevel({ id: 'x', rows: ['@GG', '###'] }), /more than one goal/);
});

test('a level shows its title as it starts, or else its name', () => {
  assert.equal(parseLevel({ id: 'x', name: 'Förorten', title: 'VÄRLD 1-1', rows: ['@', '#'] }).title, 'VÄRLD 1-1');
  assert.equal(parseLevel({ id: 'x', name: 'Förorten', rows: ['@', '#'] }).title, 'Förorten');
});

test('gates are solid until opened, all at once', () => {
  const level = parseLevel({ id: 'x', rows: ['..|', '@.|', '###'] });
  assert.ok(isSolid(GATE));
  assert.equal(openGates(level), 2);
  assert.equal(tileAt(level, 2, 0), EMPTY);
  assert.equal(tileAt(level, 2, 1), EMPTY);
});

test('a secret wall lets Blenke through, and revealing it shows the whole room joined to it', () => {
  const level = parseLevel({ id: 'x', rows: ['B::B:', 'B::BB', '@...#', '#####'] });
  assert.ok(!isSolid(SECRET_WALL));
  assert.equal(revealRoom(level, 1, 1), 4);
  for (const [col, row] of [[1, 0], [2, 0], [1, 1], [2, 1]]) assert.equal(tileAt(level, col, row), ROOM);
  assert.equal(tileAt(level, 4, 0), SECRET_WALL, 'a room not joined to it stays hidden');
  assert.equal(revealRoom(level, 0, 2), 0);
});

test('something placed in a room stands on the room, so the room has no hole', () => {
  const level = parseLevel({ id: 'x', rows: ['B:hu:B', 'B;Y;;B', 'Bp;;;B', '@.....', '######'] });
  assert.deepEqual([0, 1, 2].map((row) => [1, 2, 3, 4].map((col) => tileAt(level, col, row)).join('')), [
    '::::',
    ';;;;',
    ';;;;',
  ]);
  assert.equal(level.markers.filter((marker) => marker.type === 'item').length, 3);
});

test('levels follow each other in order and end with the last; the test level is found by its id', () => {
  LEVELS.slice(0, -1).forEach((level, i) => assert.equal(nextLevel(level), LEVELS[i + 1]));
  assert.equal(nextLevel(LEVELS[LEVELS.length - 1]), null);
  assert.equal(nextLevel(TEST_LEVEL), null);
  assert.equal(findLevel(TEST_LEVEL.id), TEST_LEVEL);
  assert.equal(findLevel('nowhere'), null);
});

test('a level has one filling station at most', () => {
  assert.equal(parseLevel({ id: 'x', rows: ['@G.M', '####'] }).markers.filter((marker) => marker.type === 'station').length, 1);
  assert.throws(() => parseLevel({ id: 'x', rows: ['@GMM', '####'] }), /more than one filling station/);
});

test('every level of the game can be finished: it has a goal, checkpoints, a filling station past the goal and a way to open its gates', () => {
  for (const definition of LEVELS) {
    const level = parseLevel(definition);
    const count = (type) => level.markers.filter((marker) => marker.type === type).length;
    assert.equal(count('goal'), 1, `${definition.id} has no goal`);
    assert.ok(count('checkpoint') > 0, `${definition.id} has no checkpoint`);
    assert.equal(count('station'), 1, `${definition.id} has no filling station`);
    const goal = level.markers.find((marker) => marker.type === 'goal');
    const station = level.markers.find((marker) => marker.type === 'station');
    assert.ok(station.col - goal.col >= 4 && station.row === goal.row, `${definition.id}'s filling station is not a walk on from the goal`);
    const bosses = level.markers.filter((marker) => marker.type === 'enemy' && ENEMIES[marker.enemy].boss);
    if (level.tiles.includes(GATE)) assert.ok(bosses.length > 0, `${definition.id} has gates but no boss to open them`);
  }
});
