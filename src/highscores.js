// The high scores: the ten best, highest first, each { name, points, rank }.
// A new game's list is filled with made-up officers to beat. Pure: no DOM;
// the list is a plain value, replaced rather than changed.
import { currentRank } from './score.js';

export const MAX_ENTRIES = 10;
export const NAME_LENGTH = 10;
// What a name may hold: capitals, Å, Ä, Ö, digits and spaces.
const NAME_CHAR = /^[A-ZÅÄÖ0-9 ]$/;
// A name left empty is signed with this.
export const DEFAULT_NAME = 'BLENKE';

export const SEED_SCORES = [
  { name: 'NOLLVISION', points: 50000, rank: 'Justitieminister' },
  { name: 'BUDGETEN', points: 40000, rank: 'Justitieminister' },
  { name: 'STATISTIK', points: 30000, rank: 'Justitieminister' },
  { name: 'NARKOHUND', points: 20000, rank: 'Rikspolischef' },
  { name: 'BYRÅKRAT', points: 15000, rank: 'Polismästare' },
  { name: 'PROVRÖRET', points: 10000, rank: 'Polisintendent' },
  { name: 'BLÅLJUS', points: 7500, rank: 'Kriminalinspektör' },
  { name: 'SVENSSON', points: 5000, rank: 'Kriminalinspektör' },
  { name: 'REMISSEN', points: 2500, rank: 'Polisinspektör' },
  { name: 'PRAKTIKANT', points: 1000, rank: 'Polisassistent' },
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
  const entry = { name: cleanName(name), points: score.points, rank: currentRank(score).title };
  const next = [...list.slice(0, index), entry, ...list.slice(index)].slice(0, MAX_ENTRIES);
  return { list: next, index };
}

// A name as typed: one more character, in capitals, if it may go in a name
// and there is room.
export function typeInto(name, key) {
  if (key === 'Backspace') return [...name].slice(0, -1).join('');
  const char = key.toUpperCase();
  if (!NAME_CHAR.test(char) || [...name].length >= NAME_LENGTH) return name;
  if (char === ' ' && (name === '' || name.endsWith(' '))) return name;
  return name + char;
}

export function cleanName(name) {
  const trimmed = name.trim();
  return trimmed === '' ? DEFAULT_NAME : trimmed;
}
