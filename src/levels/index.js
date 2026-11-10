// The levels in playing order, and the engine's test level, which can be
// played by its id (main.js takes ?bana=<id>) but is no part of the game.
//
// To change the order, change PLAYING_ORDER: nothing in a level's own file
// says where it is played. Each level names its world, and its number in
// that world ("VÄRLD 1-2") is counted here from its place in the order;
// every level ends with the same finish (finish.js), so any of them can
// come last.
import { forort1 } from './forort1.js';
import { testbana } from './testbana.js';

const PLAYING_ORDER = [forort1];

// A level with its title, shown as it starts and heading its report: the
// world and its number there, then the place (its name unless it gives a
// longer one).
function numbered(levels) {
  const counts = new Map();
  return levels.map((level) => {
    if (!Number.isInteger(level.world) || level.world < 1) throw new Error(`Level ${level.id} has no world`);
    const number = (counts.get(level.world) ?? 0) + 1;
    counts.set(level.world, number);
    return { ...level, title: `VÄRLD ${level.world}-${number}: ${(level.place ?? level.name).toUpperCase()}` };
  });
}

export const LEVELS = numbered(PLAYING_ORDER);
export const TEST_LEVEL = testbana;

// The level with this id, the test level included, or null.
export function findLevel(id) {
  return [...LEVELS, TEST_LEVEL].find((level) => level.id === id) ?? null;
}

// The level after this one, or null after the last (the game is then
// over) and after the test level.
export function nextLevel(definition) {
  const index = LEVELS.indexOf(definition);
  if (index === -1) return null;
  return LEVELS[index + 1] ?? null;
}
