// The levels in playing order, and the engine's test level, which can be
// played by its id (main.js takes ?bana=<id>) but is no part of the game.
import { forort1 } from './forort1.js';
import { testbana } from './testbana.js';

export const LEVELS = [forort1];
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
