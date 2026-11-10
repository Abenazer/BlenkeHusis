// A try-out level for characters (?bana=figurer): a long flat lawn with a
// stretch for each, who stands there by the cast (cast.js), not by these
// rows. One stretch has a hidden canister to find, one is a long road, and
// the last has a kerb and a gap to jump. It has no part in the game.
import { joinSections } from '../level.js';
import { finish } from './finish.js';

const HEIGHT = 14;
const SKY = HEIGHT - 4;

// A flat stretch of lawn `width` tiles long; `row` is what stands on it.
function stretch(width, row = '.'.repeat(width)) {
  if (row.length !== width) throw new Error(`A stretch ${width} wide got a row ${row.length} wide`);
  return [...Array(SKY).fill('.'.repeat(width)), row, ...Array(3).fill('#'.repeat(width))];
}

const kerbAndGap = [
  ...Array(SKY).fill('....................................'),
  '......................Z.............',
  '############################..######',
  '############################..######',
  '############################..######',
];

export const figurer = {
  id: 'figurer',
  name: 'Figurer',
  time: 300,
  music: 'suburbs',
  rows: joinSections(
    stretch(16, '.@..............'),
    stretch(28),
    stretch(28),
    stretch(28),
    stretch(28),
    stretch(28),
    stretch(28, '......................h.....'),
    stretch(28, '..C.........................'),
    stretch(44),
    stretch(28),
    kerbAndGap,
    finish(HEIGHT),
  ),
};
