// The head of customs on Skeppsbron's quay, Gamla stan's boss, drawn in
// code until the asset factory delivers her (batch 28): a made-up woman,
// a navy peaked cap with a gold band over her dark hair in a bun, the
// navy uniform with gold buttons; walking, snapping on a white rubber
// glove for the search, and squashed. Facing right, in the bosses' 26×33 frame
// on [12, 33]. Pure: no DOM.
import { BOSS_FRAME } from './commissioner.js';
import { framed } from './framed.js';

const LEGEND = {
  k: 'ink', U: 'blue_2', u: 'blue_1', o: 'urine_3', f: 'skin_4', F: 'skin_3', h: 'brown_2',
  T: 'grey_2', r: 'red_3', w: 'white', W: 'grey_5',
};

const HEAD = [
  '.....kkkkkkk....',
  '....kUUUUUUUk...',
  '...kUooooooooUk.',
  '..kkkkkkkkkkkkk.',
  '.khkffffkffk....',
  'khhkffffffFk....',
  'khhkfffrrfFk....',
  '.kkkkffffffk....',
  '.....kffffk.....',
  '....kkUwwUkk....',
];
const BODY = [
  '...kUUUkwUUUUk..',
  '..kUUUUUoUUUUUk.',
  '..kUuUUUUUUUUUk.',
  '..kUuUUUoUUUUUk.',
  '..kUuUUUUUUUUUk.',
  '..kUuUUUoUUUUUk.',
  '..kUuUUUUUUUUUk.',
  '..kUuUUUUUUUUUk.',
  '..kfkUUUUUUUkfk.',
  '...kkUUUUUUUkk..',
  '...kUUUUUUUUk...',
  '...kUUUUUUUUk...',
];
// The rubber glove held up and snapped on, the fingers spread.
const GLOVE = [
  '...kUUUkwUUUUkkwkwk',
  '..kUUUUUoUUUUkwwwwk',
  '..kUuUUUUUUUUkwwWWk',
  '..kUuUUUoUUUkkWwwk.',
  '..kUuUUUUUUkfkkkk..',
  '..kUuUUUoUUUkk.....',
  '..kUuUUUUUUUUUk....',
  '..kUuUUUUUUUUUk....',
  '..kfkUUUUUUUUUk....',
  '...kkUUUUUUUkk.....',
  '...kUUUUUUUUk......',
  '...kUUUUUUUUk......',
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
  '.....kkkkkkkk......',
  '....kUoooooooUk....',
  '..khkffkffrrfffk...',
  '..kUUUUUoUUUUUUk.kk',
  '..kUUUUUUUUUUUUkkwk',
  '.kkkkkkUUUUUUkkkkkk',
  '.kkkkkkkkkkkkkkkkk.',
];

// Shifted so the middle of her feet stands on the frame's origin.
const placed = (rows, name) => framed(rows.map((row) => `....${row}`), LEGEND, name, BOSS_FRAME);

export const CUSTOMS_CHIEF_ART = {
  move: [placed([...HEAD, ...BODY, ...STRIDE], 'customs chief move 1'), placed([...HEAD, ...BODY, ...PASSING], 'customs chief move 2')],
  act: placed([...HEAD, ...GLOVE, ...STRIDE], 'customs chief act'),
  defeated: placed(SQUASHED, 'customs chief defeated'),
};
