import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addScore,
  chooseSlot,
  createHighScores,
  createTag,
  isTag,
  MAX_ENTRIES,
  moveSlot,
  placeFor,
  qualifies,
  SEED_SCORES,
  TAG_LENGTH,
  TAG_LETTERS,
  tagFrom,
  tagName,
  turnLetter,
  typeLetter,
} from '../src/highscores.js';
import { currentRank } from '../src/score.js';
import { textWidth } from '../src/art/font.js';

test('the list starts with ten made-up officers, highest first, with the ranks their points earn', () => {
  const list = createHighScores();
  assert.equal(list.length, MAX_ENTRIES);
  for (let i = 1; i < list.length; i++) assert.ok(list[i - 1].points > list[i].points);
  for (const entry of list) {
    assert.equal([...entry.name].length, TAG_LENGTH, entry.name);
    assert.ok(isTag(entry.name), entry.name);
    assert.equal(entry.rank, currentRank(entry).title, entry.name);
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

test('adding a score keeps the ten best and says where it went; only a tag signs', () => {
  const { list, index } = addScore(createHighScores(), 'BLE', { points: 45000 });
  assert.equal(index, 1);
  assert.deepEqual(list[1], { name: 'BLE', points: 45000, rank: 'Justitieminister' });
  assert.equal(list.length, MAX_ENTRIES);
  assert.equal(list[MAX_ENTRIES - 1].name, 'SOU');
  assert.throws(() => addScore(createHighScores(), 'X', { points: 10, samples: 0 }), /don't make the list/);
  assert.throws(() => addScore(createHighScores(), 'blenke', { points: 45000 }), /not a tag/);
});

test('a tag is one to three of its letters: A to Ö and the digits', () => {
  for (const name of ['BLE', 'Å9', 'Ö']) assert.equal(isTag(name), true, name);
  for (const name of ['', 'BLEN', 'bl', 'B E', '<b>']) assert.equal(isTag(name), false, name);
  assert.equal(new Set(TAG_LETTERS).size, TAG_LETTERS.length);
  for (const letter of TAG_LETTERS) assert.ok(textWidth(letter) > 0, `the font has ${letter}`);
});

test('a tag starts at AAA; its letters turn round both ways and its slot stays inside it', () => {
  let tag = createTag();
  assert.equal(tagName(tag), 'AAA');
  tag = turnLetter(tag, -1);
  assert.equal(tagName(tag), '9AA');
  tag = turnLetter(tag, 1);
  tag = turnLetter(tag, 1);
  assert.equal(tagName(tag), 'BAA');
  assert.equal(moveSlot(tag, -1).slot, 0);
  assert.equal(moveSlot(moveSlot(moveSlot(tag, 1), 1), 1).slot, TAG_LENGTH - 1);
  assert.equal(chooseSlot(tag, 2).slot, 2);
  assert.equal(chooseSlot(tag, 7).slot, TAG_LENGTH - 1);
});

test('typing a tag: a letter fills its slot and moves on, Backspace steps back, anything else is refused', () => {
  let tag = createTag();
  for (const key of 'ö1x') tag = typeLetter(tag, key);
  assert.equal(tagName(tag), 'Ö1X');
  assert.equal(tag.slot, 2);
  tag = typeLetter(tag, 'z');
  assert.equal(tagName(tag), 'Ö1Z', 'the last slot is typed over');
  tag = typeLetter(tag, 'Backspace');
  assert.equal(tag.slot, 1);
  assert.equal(typeLetter(tag, '-'), tag);
  assert.equal(typeLetter(tag, ' '), tag);
});

test('an older save\'s name becomes a tag: its first three letters, spaces and the rest left out', () => {
  assert.equal(tagFrom('BLENKE H'), 'BLE');
  assert.equal(tagFrom('A B'), 'AB');
  assert.equal(tagFrom('ÅSA'), 'ÅSA');
  assert.equal(tagFrom('  '), 'BLE');
});
