// A chess player by Kulturhuset, drawn in code until the asset factory
// delivers him (batch 29): an old man in a flat cap and a tweed jacket,
// grey trousers, a white king in his hand; standing, and waving the king.
// Facing right. Pure: no DOM.
import { framed } from './framed.js';

// The citizens' frame: 20×25, the middle of the feet at [8, 25].
export const CITIZEN_FRAME = { width: 20, height: 25, originX: 8, originY: 25 };

const LEGEND = {
  k: 'ink', C: 'brown_3', c: 'brown_2', g: 'grey_5', f: 'skin_4', F: 'skin_3',
  J: 'brown_2', j: 'brown_1', T: 'grey_3', t: 'grey_2', w: 'white',
};

const HEAD = [
  '.....kkkkk....',
  '....kCCCCCk...',
  '...kCCCCCCCkk.',
  '...kgkffkfFk..',
  '....kfffffk...',
  '....kgfFFgk...',
  '.....kgggk....',
];
const LEGS = [
  '....kTTTTTTk..',
  '....kTTTtTTk..',
  '....kTTktTTk..',
  '....kTTk.kTTk.',
  '....kTTk.kTTk.',
  '...kkkkk.kkkkk',
];
const body = (arm) => [
  '...kJJJJJJJk..',
  '..kJjJJJJJJk..',
  '..kJjJJJJJJk..',
  ...arm,
  '...kkJJJJJk...',
];
const DOWN = [
  '..kJjJJJJJJk..',
  '..kfkJJJJJkwk.',
  '..kkkJJJJJkwk.',
];
const UP = [
  '..kJjJJJJJJkwk',
  '..kfkJJJJJJkwk',
  '..kkkJJJJJJkfk',
];
const OUT = [
  '..kJjJJJJJJkkwk',
  '..kfkJJJJJJJfwk',
  '..kkkJJJJJJkkkk',
];

const figure = (arm, name) => framed([...HEAD, ...body(arm), ...LEGS], LEGEND, name, CITIZEN_FRAME);

export const CHESS_PLAYER_ART = {
  stand: { frames: [figure(DOWN, 'chess player stand')], fps: 2 },
  wave: { frames: [figure(UP, 'chess player wave 1'), figure(OUT, 'chess player wave 2')], fps: 4 },
};
