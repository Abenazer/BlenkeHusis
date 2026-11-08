import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addScore,
  cleanName,
  createHighScores,
  DEFAULT_NAME,
  MAX_ENTRIES,
  NAME_LENGTH,
  placeFor,
  qualifies,
  SEED_SCORES,
  typeInto,
} from '../src/highscores.js';
import { RANKS } from '../src/score.js';
import { textWidth } from '../src/art/font.js';

test('the list starts with ten made-up officers, highest first, with real ranks', () => {
  const list = createHighScores();
  assert.equal(list.length, MAX_ENTRIES);
  for (let i = 1; i < list.length; i++) assert.ok(list[i - 1].points > list[i].points);
  for (const entry of list) {
    assert.ok([...entry.name].length <= NAME_LENGTH, entry.name);
    assert.ok(RANKS.some((rank) => rank.title === entry.rank), entry.rank);
    assert.ok(textWidth(entry.name) > 0);
  }
  list[0].points = 1;
  assert.equal(SEED_SCORES[0].points, 50000, 'a new list is a copy');
});

test('a score takes its place; a tie goes below; too little, or nothing, makes no list', () => {
  const list = createHighScores();
  assert.equal(placeFor(list, 60000), 0);
  assert.equal(placeFor(list, 40000), 2);
  assert.equal(placeFor(list, 1001), 9);
  assert.equal(placeFor(list, 1000), -1);
  assert.equal(qualifies(list, 999), false);
  assert.equal(placeFor([], 5), 0);
  assert.equal(placeFor([], 0), -1);
});

test('adding a score keeps the ten best and says where it went', () => {
  const { list, index } = addScore(createHighScores(), ' blenke ', { points: 45000, samples: 30 });
  assert.equal(index, 1);
  assert.deepEqual(list[1], { name: 'blenke', points: 45000, rank: 'Polisinspektör' });
  assert.equal(list.length, MAX_ENTRIES);
  assert.equal(list[MAX_ENTRIES - 1].name, 'REMISSEN');
  assert.throws(() => addScore(createHighScores(), 'X', { points: 10, samples: 0 }), /don't make the list/);
});

test('typing a name: capitals, Å, Ä, Ö and digits, one space between words, ten at most', () => {
  let name = '';
  for (const key of 'åsa-1 ') name = typeInto(name, key);
  assert.equal(name, 'ÅSA1 ');
  assert.equal(typeInto(name, ' '), 'ÅSA1 ', 'no double space');
  assert.equal(typeInto('', ' '), '', 'no leading space');
  assert.equal(typeInto('ÅSA', 'Backspace'), 'ÅS');
  assert.equal(typeInto('', 'Backspace'), '');
  assert.equal(typeInto('ABCDEFGHIJ', 'K'), 'ABCDEFGHIJ');
  assert.equal(cleanName('  '), DEFAULT_NAME);
});
