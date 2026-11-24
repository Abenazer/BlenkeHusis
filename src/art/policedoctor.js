// The police doctor at Kronoberg, its boss, drawn in code until the
// asset factory delivers him (batch 28): a made-up man, bald with a grey
// fringe, glasses, a white coat with a stethoscope round his neck over
// grey trousers; walking, holding up a syringe for the blood test, and
// squashed. Facing right, in the bosses' 26×33 frame on [12, 33]. Pure:
// no DOM.
import { BOSS_FRAME } from './commissioner.js';
import { framed } from './framed.js';

const LEGEND = {
  k: 'ink', G: 'grey_5', f: 'skin_4', F: 'skin_3', w: 'white', W: 'grey_6', s: 'grey_2',
  T: 'grey_3', R: 'red_3', B: 'sky_3',
};

const HEAD = [
  '......kkkk......',
  '.....kffffk.....',
  '....kffffffk....',
  '...kGffffffGk...',
  '...kfkkkfkkkk...',
  '...kfkwkfkwkk...',
  '...kffffffffk...',
  '....kffFFffk....',
  '.....kffffk.....',
  '....kwkssskwk...',
];
const BODY = [
  '...kwwkBBkswwk..',
  '..kwwwwkBksWwwk.',
  '..kwWwwwkkswWwk.',
  '..kwWwwwwwsWwwk.',
  '..kwWwwwwwkkwwk.',
  '..kwWwwwwwwwwwk.',
  '..kwWwwwwwwWwwk.',
  '..kwWwwwwwwwwwk.',
  '..kwWwwwwwwwwwk.',
  '..kfkwwwwwwwkfk.',
  '...kkwwwwwwwkk..',
  '...kwwwwwwwwk...',
];
// The syringe held up, a drop at its needle.
const SYRINGE = [
  '...kwwkBBkswwk..R.',
  '..kwwwwkBksWwkkk..',
  '..kwWwwwkkswkwwwk.',
  '..kwWwwwwwsWkwBwk.',
  '..kwWwwwwwkkkwBwk.',
  '..kwWwwwwwwwkfwwk.',
  '..kwWwwwwwwkkkkk..',
  '..kwWwwwwwwwwwk...',
  '..kwWwwwwwwwwwk...',
  '..kfkwwwwwwwwwk...',
  '...kkwwwwwwwkk....',
  '...kwwwwwwwwk.....',
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
  '...kfkwkfkwkffk....',
  '..kwwwwkBBkwwwwk.kk',
  '..kwwwwwwwwwwwwkkBk',
  '.kkkkkkwwwwwwkkkkkk',
  '.kkkkkkkkkkkkkkkkk.',
];

// Shifted so the middle of his feet stands on the frame's origin.
const placed = (rows, name) => framed(rows.map((row) => `....${row}`), LEGEND, name, BOSS_FRAME);

export const POLICE_DOCTOR_ART = {
  move: [placed([...HEAD, ...BODY, ...STRIDE], 'police doctor move 1'), placed([...HEAD, ...BODY, ...PASSING], 'police doctor move 2')],
  act: placed([...HEAD, ...SYRINGE, ...STRIDE], 'police doctor act'),
  defeated: placed(SQUASHED, 'police doctor defeated'),
};
