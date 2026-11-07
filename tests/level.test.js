import test from 'node:test';
import assert from 'node:assert/strict';
import { EMPTY, joinSections, parseLevel, tileAt } from '../src/level.js';
import { LEVELS } from '../src/levels/index.js';

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
  assert.throws(() => parseLevel({ id: 'x', rows: ['.@?', '###'] }), /unknown tile '\?'/);
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
