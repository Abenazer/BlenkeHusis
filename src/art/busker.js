// A busker in the tunnelbana, drawn in code until the asset factory
// delivers him (batch 29): a black beret, a grey beard, a brown coat and
// a red accordion with white keys; standing, and playing it, the bellows
// pulled out and pushed in. Facing right. Pure: no DOM.
import { CITIZEN_FRAME } from './chess.js';
import { framed } from './framed.js';

const LEGEND = {
  k: 'ink', K: 'grey_1', f: 'skin_4', F: 'skin_3', b: 'grey_5', C: 'brown_3', c: 'brown_2',
  R: 'red_3', r: 'red_2', w: 'white', T: 'grey_2',
};

const HEAD = [
  '....kkkkkk....',
  '...kKKKKKKk...',
  '....kffkfFk...',
  '....kffffFk...',
  '....kbbbbbk...',
  '.....kbbbk....',
];
const LEGS = [
  '....kCCCCCCk..',
  '....kCCcCCCk..',
  '....kTTkkTTk..',
  '....kTTk.kTTk.',
  '....kTTk.kTTk.',
  '...kkkkk.kkkkk',
  '...kkkkk.kkkkk',
];
// The accordion held shut on his chest.
const SHUT = [
  '...kCCCCCCk...',
  '..kCkRRRRkCk..',
  '..kCkRwRwkCk..',
  '..kfkRwRwkfk..',
  '..kkkRRRRkkk..',
  '....kCCCCCk...',
];
// The bellows pulled out, then pushed in.
const OUT = [
  '..kCCCCCCCCk..',
  '.kfkRRrRrRRkfk',
  '.kkRwRrRrRwRkk',
  '..kRwRrRrRwRk.',
  '..kkRRrRrRRkk.',
  '....kCCCCCk...',
];
const IN = [
  '...kCCCCCCk...',
  '..kfkRrRRkfk..',
  '..kkRwrRwRkk..',
  '...kRwrRwRk...',
  '...kkRRRRkk...',
  '....kCCCCCk...',
];

const figure = (arms, name) => framed([...HEAD, ...arms, ...LEGS], LEGEND, name, CITIZEN_FRAME);

export const BUSKER_ART = {
  stand: { frames: [figure(SHUT, 'busker stand')], fps: 2 },
  wave: { frames: [figure(OUT, 'busker wave 1'), figure(IN, 'busker wave 2')], fps: 3 },
};
