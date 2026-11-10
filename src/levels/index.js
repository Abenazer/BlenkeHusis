// The levels in playing order, and the try-out levels (the engine's test
// level and the characters'), which can be played by their id (main.js
// takes ?bana=<id>) but are no part of the game. Each level takes its cast,
// the characters placed in it by column, from cast.js.
//
// To change the order, change PLAYING_ORDER: nothing in a level's own file
// says where it is played. Each level names its world, and its number in
// that world ("VÄRLD 1-2") is counted here from its place in the order;
// every level ends with the same finish (finish.js), so any of them can
// come last.
import { CAST } from './cast.js';
import { figurer } from './figurer.js';
import { forort1 } from './forort1.js';
import { jordbro } from './jordbro.js';
import { krigslida } from './krigslida.js';
import { testbana } from './testbana.js';
import { tungelsta } from './tungelsta.js';
import { vasterhaninge } from './vasterhaninge.js';
import { villastad } from './villastad.js';

const PLAYING_ORDER = [forort1, villastad, jordbro, vasterhaninge, krigslida, tungelsta];

// A cast for a level that doesn't exist fails, rather than being lost.
const KNOWN_IDS = new Set([...PLAYING_ORDER, testbana, figurer].map((level) => level.id));
for (const id of Object.keys(CAST)) {
  if (!KNOWN_IDS.has(id)) throw new Error(`The cast names a level '${id}' that doesn't exist`);
}

function withCast(level) {
  return { ...level, cast: CAST[level.id] ?? [] };
}

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

export const LEVELS = numbered(PLAYING_ORDER.map(withCast));
export const TRY_LEVELS = [testbana, figurer].map(withCast);
export const TEST_LEVEL = TRY_LEVELS[0];

// The level with this id, the try-out levels included, or null.
export function findLevel(id) {
  return [...LEVELS, ...TRY_LEVELS].find((level) => level.id === id) ?? null;
}

// The level after this one, or null after the last (the game is then
// over) and after a try-out level.
export function nextLevel(definition) {
  const index = LEVELS.indexOf(definition);
  if (index === -1) return null;
  return LEVELS[index + 1] ?? null;
}
