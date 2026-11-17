// The Stureplan brat, drawn in code until the asset factory delivers him
// (batch 27): slicked blond hair, a navy blazer over a pink shirt with the
// collar up, beige chinos and loafers, strolling, popping champagne and
// squashed; and his cork. Facing right. Pure: no DOM.
import { framed } from './framed.js';
import { parsePixels } from '../pixels.js';

const LEGEND = {
  k: 'ink', Y: 'urine_3', y: 'urine_2', f: 'skin_4', F: 'skin_3', P: 'purple_4',
  B: 'blue_2', b: 'blue_1', C: 'brown_4', c: 'brown_3', L: 'brown_2', g: 'slime_1', o: 'urine_4',
};

const HEAD = [
  '.....kkkkk.....',
  '....kYYYYYk....',
  '...kYYYYYYYk...',
  '...kyYYkffFk...',
  '...kykfkffk....',
  '....kffffFk....',
  '....kfFFFk.....',
  '....kkPPkk.....',
];
const BODY = [
  '...kBBPPPBBk...',
  '...kBbPPPBBk...',
  '...kBbBPBBBk...',
  '...kBbBBBBBk...',
  '...kfkBBBBkfk..',
  '....kkBBBBkk...',
];
const STRIDE = [
  '....kCCCCCCk...',
  '....kCCCcCCk...',
  '....kCCkcCCk...',
  '....kCCkkCCk...',
  '....kCCk.kCCk..',
  '....kCCk.kCCk..',
  '...kLLLk.kLLLk.',
  '...kkkkk.kkkkk.',
];
const PASSING = [
  '....kCCCCCCk...',
  '....kCCCcCCk...',
  '....kCCCcCCk...',
  '.....kCCcCk....',
  '.....kCCCCk....',
  '.....kCCCCk....',
  '....kLLLLLLk...',
  '....kkkkkkkk...',
];
// The bottle held out, its cork popping.
const POPPING = [
  '...kBBPPPBBkk..kok.',
  '...kBbPPPBBBBkgok..',
  '...kBbBPBBBkkfgk...',
  '...kBbBBBBBk.kgk...',
  '...kfkBBBBBk..k....',
  '....kkBBBBkk.......',
];
const SQUASHED = [
  '.....kkkkk.......',
  '...kkYYYYYkk.....',
  '..kYYkffkfPPk....',
  '..kBBBBPBBBBBk...',
  '..kCCCCCCCCCCk...',
  '.kLLLkCCCCkLLLk..',
  '.kkkkkkkkkkkkkk..',
];

export const BRAT_ART = {
  move: [framed([...HEAD, ...BODY, ...STRIDE], LEGEND, 'brat move 1'), framed([...HEAD, ...BODY, ...PASSING], LEGEND, 'brat move 2')],
  act: framed([...HEAD, ...POPPING, ...STRIDE], LEGEND, 'brat act'),
  defeated: framed(SQUASHED, LEGEND, 'brat defeated'),
};

// The cork: turning as it flies, placed by its middle.
export const CORK_ART = {
  fps: 12,
  frames: [['.kk.', 'kCck', 'kCck', '.kk.'], ['....', 'kkkk', 'kCCk', 'kkkk']]
    .map((rows, i) => ({ image: parsePixels(rows, LEGEND, `cork ${i + 1}`), originX: 2, originY: 2 })),
};
