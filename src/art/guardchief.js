// The head of the metro's guards, Tunnelbanan's boss, drawn in code until
// the asset factory delivers him (batch 28): a made-up man, a black
// peaked cap, a crew cut and a square jaw, the guards' black uniform with
// a yellow badge on the chest; walking, holding up his hand to stop, and
// squashed. Facing right, in the bosses' 26×33 frame on [12, 33]. Pure:
// no DOM.
import { BOSS_FRAME } from './commissioner.js';
import { framed } from './framed.js';

const LEGEND = {
  k: 'ink', U: 'grey_1', u: 'grey_2', Y: 'hivis_3', f: 'skin_4', F: 'skin_3', h: 'brown_2',
  T: 'grey_2', w: 'white',
};

const HEAD = [
  '.....kkkkkkk....',
  '....kUUUUUUUk...',
  '...kUUUYYUUUUk..',
  '...kkkkkkkkkkkk.',
  '....kffffkffk...',
  '....kffffffFk...',
  '....kffffffFk...',
  '....kfkkkkfFk...',
  '....kfffffffk...',
  '....kkUUUUUkk...',
];
const BODY = [
  '...kUUUUUUUUUk..',
  '..kUUuUUUYYUUUk.',
  '..kUuUUUUYYUUUk.',
  '..kUuUUUUUUUUUk.',
  '..kUuUUUUUUUUUk.',
  '..kUuUUUUUUUUUk.',
  '..kUuUUUUUUUUUk.',
  '..kUuUUYYYYUUUk.',
  '..kUuUUUUUUUUUk.',
  '..kfkUUUUUUUkfk.',
  '...kkUUUUUUUkk..',
  '...kUUUUUUUUk...',
];
// A hand held up: stop.
const STOP = [
  '...kUUUUUUUUkkffk',
  '..kUUuUUUYYUkffffk',
  '..kUuUUUUYYUkffffk',
  '..kUuUUUUUUkkfffk.',
  '..kUuUUUUUUkUkfk..',
  '..kUuUUUUUUUUkk...',
  '..kUuUUUUUUUUUk...',
  '..kUuUUYYYYUUUk...',
  '..kUuUUUUUUUUUk...',
  '..kfkUUUUUUUUUk...',
  '...kkUUUUUUUkk....',
  '...kUUUUUUUUk.....',
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
  '....kUUUYYUUUk.....',
  '...kffkffffkfFk....',
  '..kUUUUUUYYUUUUk.kk',
  '..kUUUUUUUUUUUUkkfk',
  '.kkkkkkUUUUUUkkkkkk',
  '.kkkkkkkkkkkkkkkkk.',
];

// Shifted so the middle of his feet stands on the frame's origin.
const placed = (rows, name) => framed(rows.map((row) => `....${row}`), LEGEND, name, BOSS_FRAME);

export const GUARD_CHIEF_ART = {
  move: [placed([...HEAD, ...BODY, ...STRIDE], 'guard chief move 1'), placed([...HEAD, ...BODY, ...PASSING], 'guard chief move 2')],
  act: placed([...HEAD, ...STOP, ...STRIDE], 'guard chief act'),
  defeated: placed(SQUASHED, 'guard chief defeated'),
};
