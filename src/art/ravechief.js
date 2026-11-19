// The rave commission's chief, Finnboda varv's boss and Blenke's own
// chief, drawn in code until the asset factory delivers him (batch 28): a
// made-up man, thinning grey hair, a moustache, a beige trench coat over
// a grey suit; walking, holding up a binder of the year's reports, and
// squashed. Facing right, in the bosses' 26×33 frame on [12, 33]. Pure:
// no DOM.
import { BOSS_FRAME } from './commissioner.js';
import { framed } from './framed.js';

const LEGEND = {
  k: 'ink', G: 'grey_4', g: 'grey_3', f: 'skin_4', F: 'skin_3', m: 'grey_3', C: 'brown_4', c: 'brown_3',
  T: 'grey_2', R: 'red_3', B: 'blue_3', p: 'white',
};

const HEAD = [
  '......kkkk......',
  '.....kGGGGk.....',
  '....kGffffGk....',
  '...kGffffffGk...',
  '...kfffkffkfk...',
  '...kffffffffk...',
  '...kfmmmmmmFk...',
  '....kffffffk....',
  '.....kffffk.....',
  '....kCkRRkCk....',
];
const BODY = [
  '...kCCkRRkCCk...',
  '..kCCCCkRkCCCk..',
  '..kCcCCkkkCCCk..',
  '..kCcCCCCCCCCk..',
  '..kCcCCCcCCCCk..',
  '..kCcCCCCCCCCk..',
  '..kCcCCCcCCCCk..',
  '..kCcCCCCCCCCk..',
  '..kCcCCCCCCCCk..',
  '..kfkCCCCCCkfk..',
  '...kkCCCCCCkk...',
  '...kCCCCCCCCk...',
];
// The binder held up, blue with a white label.
const BINDER = [
  '...kCCkRRkCCkkkkk',
  '..kCCCCkRkCCkBBBk',
  '..kCcCCkkkCCkBppk',
  '..kCcCCCCCCCkBppk',
  '..kCcCCCcCCkkBBBk',
  '..kCcCCCCCCkfBBBk',
  '..kCcCCCcCCkkkkkk',
  '..kCcCCCCCCCk....',
  '..kCcCCCCCCCk....',
  '..kfkCCCCCCCk....',
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
  '....kkGffffGkk.....',
  '...kffkfmmmfffk....',
  '..kCCCCkRRkCCCCk.kk',
  '..kCCCCCCCCCCCCkkBk',
  '.kkkkkkCCCCCCkkkkkk',
  '.kkkkkkkkkkkkkkkkk.',
];

// Shifted so the middle of his feet stands on the frame's origin.
const placed = (rows, name) => framed(rows.map((row) => `....${row}`), LEGEND, name, BOSS_FRAME);

export const RAVE_CHIEF_ART = {
  move: [placed([...HEAD, ...BODY, ...STRIDE], 'rave chief move 1'), placed([...HEAD, ...BODY, ...PASSING], 'rave chief move 2')],
  act: placed([...HEAD, ...BINDER, ...STRIDE], 'rave chief act'),
  defeated: placed(SQUASHED, 'rave chief defeated'),
};
