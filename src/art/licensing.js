// The city's licensing inspector, who shuts the bars round
// Medborgarplatsen, its boss, drawn in code until the asset factory
// delivers him (batch 28): a made-up man, brown hair combed flat,
// glasses, a brown corduroy jacket over a white shirt and a red tie;
// walking, holding up his clipboard of closures, and squashed. Facing
// right, in the bosses' 26×33 frame on [12, 33]. Pure: no DOM.
import { BOSS_FRAME } from './commissioner.js';
import { framed } from './framed.js';

const LEGEND = {
  k: 'ink', h: 'brown_2', f: 'skin_4', F: 'skin_3', w: 'white', C: 'brown_3', c: 'brown_2',
  R: 'red_3', T: 'grey_2', B: 'brown_4', p: 'grey_6',
};

const HEAD = [
  '......kkkk......',
  '.....khhhhk.....',
  '....khhhhhhk....',
  '...khhffffffk...',
  '...kfkkkfkkkk...',
  '...kfkwkfkwkk...',
  '...kffffffffk...',
  '....kffFFffk....',
  '.....kffffk.....',
  '....kCkwRkCk....',
];
const BODY = [
  '...kCCkwRkCCk...',
  '..kCCCCkRkCCCk..',
  '..kCcCCkRkCcCk..',
  '..kCcCCkwkCcCk..',
  '..kCcCCCCCCcCk..',
  '..kCcCCCCCCcCk..',
  '..kCcCCCCCCcCk..',
  '..kCcCCCCCCcCk..',
  '..kCcCCCCCCcCk..',
  '..kfkCCCCCCkfk..',
  '...kkCCCCCCkk...',
  '...kCCCCCCCCk...',
];
// The clipboard held up, its closure notice on it.
const CLIPBOARD = [
  '...kCCkwRkCkkkkk.',
  '..kCCCCkRkCkBBBBk',
  '..kCcCCkRkCkBppBk',
  '..kCcCCkwkCkBkpBk',
  '..kCcCCCCCkkBppBk',
  '..kCcCCCCCkfBBBBk',
  '..kCcCCCCCCkkkkkk',
  '..kCcCCCCCCcCk...',
  '..kCcCCCCCCcCk...',
  '..kfkCCCCCCkk....',
  '...kkCCCCCCkk....',
  '...kCCCCCCCCk....',
];
const STRIDE = [
  '...kTTTTkTTTTk..',
  '...kTTTk.kTTTk..',
  '...kTTTk.kTTTk..',
  '...kTTTk.kTTTk..',
  '...kTTTk.kTTTk..',
  '...kTTTk.kTTTk..',
  '..kkkkkk.kkkkkk.',
  '..kkkkkk.kkkkkk.',
];
const PASSING = [
  '....kTTTTTTTk...',
  '....kTTTTTTTk...',
  '....kTTTTTTTk...',
  '.....kTTTTTk....',
  '.....kTTTTTk....',
  '.....kTTTTTk....',
  '....kkkkkkkkk...',
  '....kkkkkkkkk...',
];
const SQUASHED = [
  '......kkkkkk.......',
  '....kkhhhhhhkk.....',
  '...kfkwkfkwkffk....',
  '..kCCCCkwRkCCCCk.kk',
  '..kCCCCCCCCCCCCkkpk',
  '.kkkkkkCCCCCCkkkkkk',
  '.kkkkkkkkkkkkkkkkk.',
];

// Shifted so the middle of his feet stands on the frame's origin.
const placed = (rows, name) => framed(rows.map((row) => `....${row}`), LEGEND, name, BOSS_FRAME);

export const LICENSING_INSPECTOR_ART = {
  move: [placed([...HEAD, ...BODY, ...STRIDE], 'licensing inspector move 1'), placed([...HEAD, ...BODY, ...PASSING], 'licensing inspector move 2')],
  act: placed([...HEAD, ...CLIPBOARD, ...STRIDE], 'licensing inspector act'),
  defeated: placed(SQUASHED, 'licensing inspector defeated'),
};
