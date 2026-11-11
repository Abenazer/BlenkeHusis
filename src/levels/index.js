// The levels in playing order, and the try-out levels (the engine's test
// level, the characters', and Förorten, resting out of the game for now),
// which can be played by their id (main.js takes ?bana=<id>) but are no
// part of the game. Each level takes its cast, the characters placed in it
// by column, from cast.js.
//
// To change the order, change PLAYING_ORDER: nothing in a level's own file
// says where it is played. The game follows the commuter train in from
// the south, and each level's number ("BANA 2") is counted here from its
// place in the order; every level ends with the same finish (finish.js),
// so any of them can come last.
import { CAST } from './cast.js';
import { figurer } from './figurer.js';
import { forort1 } from './forort1.js';
import { handen } from './handen.js';
import { jordbro } from './jordbro.js';
import { krigslida } from './krigslida.js';
import { skogas } from './skogas.js';
import { testbana } from './testbana.js';
import { trangsund } from './trangsund.js';
import { tungelsta } from './tungelsta.js';
import { vasterhaninge } from './vasterhaninge.js';
import { villastad } from './villastad.js';

const PLAYING_ORDER = [tungelsta, krigslida, vasterhaninge, jordbro, handen, skogas, trangsund, villastad];
const TRY_ORDER = [testbana, figurer, forort1];

// A cast for a level that doesn't exist fails, rather than being lost.
const KNOWN_IDS = new Set([...PLAYING_ORDER, ...TRY_ORDER].map((level) => level.id));
for (const id of Object.keys(CAST)) {
  if (!KNOWN_IDS.has(id)) throw new Error(`The cast names a level '${id}' that doesn't exist`);
}

function withCast(level) {
  return { ...level, cast: CAST[level.id] ?? [] };
}

// A level with its title, shown as it starts and heading its report: its
// number in the playing order, then the place (its name unless it gives a
// longer one).
function numbered(levels) {
  return levels.map((level, index) => ({
    ...level,
    title: `BANA ${index + 1}: ${(level.place ?? level.name).toUpperCase()}`,
  }));
}

export const LEVELS = numbered(PLAYING_ORDER.map(withCast));
export const TRY_LEVELS = TRY_ORDER.map(withCast);
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
