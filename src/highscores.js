// The high scores: the ten best, highest first, each { name, points, rank },
// the name a three-letter tag signed arcade style. A new game's list is
// filled with made-up officers to beat. Pure: no DOM; the list and the tag
// being signed are plain values, replaced rather than changed.
import { currentRank } from './score.js';

export const MAX_ENTRIES = 10;
// A tag's length, and the letters each place turns through, in order.
export const TAG_LENGTH = 3;
export const TAG_LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ0123456789'];

export const SEED_SCORES = [
  { name: 'NOL', points: 50000, rank: 'Justitieminister' },
  { name: 'BUD', points: 40000, rank: 'Justitieminister' },
  { name: 'BRÅ', points: 30000, rank: 'Justitieminister' },
  { name: 'VOV', points: 20000, rank: 'Rikspolischef' },
  { name: 'RPS', points: 15000, rank: 'Polismästare' },
  { name: 'KIS', points: 10000, rank: 'Polisintendent' },
  { name: 'BLÅ', points: 7500, rank: 'Kriminalinspektör' },
  { name: 'LVM', points: 5000, rank: 'Kriminalinspektör' },
  { name: 'SOU', points: 2500, rank: 'Polisinspektör' },
  { name: 'ASP', points: 1000, rank: 'Polisassistent' },
];

export function createHighScores() {
  return SEED_SCORES.map((entry) => ({ ...entry }));
}

// Where these points would go in the list, or -1 if they don't make it.
// A tie goes below the entries already there.
export function placeFor(list, points) {
  if (points <= 0) return -1;
  const index = list.findIndex((entry) => points > entry.points);
  if (index !== -1) return index;
  return list.length < MAX_ENTRIES ? list.length : -1;
}

export function qualifies(list, points) {
  return placeFor(list, points) !== -1;
}

// The list with a game's score in its place, cut to the ten best:
// { list, index }, index where the new entry went.
export function addScore(list, name, score) {
  const index = placeFor(list, score.points);
  if (index === -1) throw new Error(`${score.points} points don't make the list`);
  if (!isTag(name)) throw new Error(`'${name}' is not a tag`);
  const entry = { name, points: score.points, rank: currentRank(score).title };
  const next = [...list.slice(0, index), entry, ...list.slice(index)].slice(0, MAX_ENTRIES);
  return { list: next, index };
}

// Whether a name is a tag: one to three of its letters (a tag signed here
// always has three; older saves' names were cut to at most three).
export function isTag(name) {
  const letters = [...name];
  return letters.length >= 1 && letters.length <= TAG_LENGTH && letters.every((letter) => TAG_LETTERS.includes(letter));
}

// A tag being signed: the letter in each slot (an index into
// TAG_LETTERS) and the slot being set. It starts at AAA.
export function createTag() {
  return { letters: new Array(TAG_LENGTH).fill(0), slot: 0 };
}

export function tagName(tag) {
  return tag.letters.map((index) => TAG_LETTERS[index]).join('');
}

// The letter in the slot turned by step (1 the next, -1 the one before),
// round from the last to the first.
export function turnLetter(tag, step) {
  const count = TAG_LETTERS.length;
  const letters = [...tag.letters];
  letters[tag.slot] = (letters[tag.slot] + step + count) % count;
  return { ...tag, letters };
}

// That slot set, kept within the tag.
export function chooseSlot(tag, slot) {
  return { ...tag, slot: Math.max(0, Math.min(TAG_LENGTH - 1, slot)) };
}

export function moveSlot(tag, step) {
  return chooseSlot(tag, tag.slot + step);
}

// Something typed (event.key): a letter of the tag's fills the slot and
// moves on, Backspace moves back. Returns the tag, the same one if the
// key means nothing to it.
export function typeLetter(tag, key) {
  if (key === 'Backspace') return moveSlot(tag, -1);
  const index = TAG_LETTERS.indexOf(key.toUpperCase());
  if (index === -1) return tag;
  const letters = [...tag.letters];
  letters[tag.slot] = index;
  return moveSlot({ ...tag, letters }, 1);
}

// An older save's name as a tag: its letters, spaces and anything else
// left out, cut to three. A name with none left is the hero's.
export function tagFrom(name) {
  const letters = [...name.toUpperCase()].filter((letter) => TAG_LETTERS.includes(letter));
  return letters.length === 0 ? 'BLE' : letters.slice(0, TAG_LENGTH).join('');
}
