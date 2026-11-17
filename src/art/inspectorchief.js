// SL's chief inspector, Slussen's boss, drawn in code until the asset
// factory delivers him (batch 28): a heavy man in the navy uniform with
// gold on his peaked cap and a grey moustache, walking, holding up his
// book of fines, and squashed. Facing right, in the bosses' 26×33 frame on
// [12, 33]. Pure: no DOM.
import { BOSS_FRAME } from './commissioner.js';
import { framed } from './framed.js';

const LEGEND = {
  k: 'ink', U: 'blue_2', u: 'blue_1', o: 'urine_3', f: 'skin_4', F: 'skin_3', m: 'grey_4',
  T: 'grey_2', S: 'grey_1', r: 'red_2', w: 'white',
};

const HEAD = [
  '.....kkkkkkk....',
  '....kUUUUUUUk...',
  '...kUoooooooUk..',
  '...kkkkkkkkkkkk.',
  '....kffffkffk...',
  '....kffffffFk...',
  '....kfmmmmmFk...',
  '....kffffffk....',
  '.....kffffk.....',
  '....kkUUUUkk....',
];
const BODY = [
  '...kUUUUUUUUUk..',
  '..kUUUUUoUUUUUk.',
  '..kUuUUUUUUUUUk.',
  '..kUuUUUoUUUUUk.',
  '..kUuUUUUUUUUUk.',
  '..kUuUUUoUUUUUk.',
  '..kUuUUUUUUUUUk.',
  '..kUuUUUUUUUUUk.',
  '..kUuUUUUUUUUUk.',
  '..kfkUUUUUUUkfk.',
  '...kkUUUUUUUkk..',
  '...kTTTTTTTTk...',
];
// The book of fines held up, its red cover open.
const BOOK = [
  '...kUUUUUUUUUkkkkk',
  '..kUUUUUoUUUUkrwwk',
  '..kUuUUUUUUUUkrwwk',
  '..kUuUUUoUUUkkrwwk',
  '..kUuUUUUUUUkfkkkk',
  '..kUuUUUoUUUk.....',
  '..kUuUUUUUUUk.....',
  '..kUuUUUUUUUk.....',
  '..kUuUUUUUUUk.....',
  '..kfkUUUUUUUk.....',
  '...kkUUUUUUkk.....',
  '...kTTTTTTTTk.....',
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
  '......kkkkkkk......',
  '....kkUoooooUkk....',
  '...kUUkfmmmfkUUk...',
  '..kUUUUUoUUUUUUUk.k',
  '..kTTTTTTTTTTTTTkrk',
  '.kkkkkkTTTTTTkkkkkk',
  '.kkkkkkkkkkkkkkkkk.',
];

// Shifted so the middle of his feet stands on the frame's origin.
const placed = (rows, name) => framed(rows.map((row) => `....${row}`), LEGEND, name, BOSS_FRAME);

export const INSPECTOR_CHIEF_ART = {
  move: [placed([...HEAD, ...BODY, ...STRIDE], 'inspector chief move 1'), placed([...HEAD, ...BODY, ...PASSING], 'inspector chief move 2')],
  act: placed([...HEAD, ...BOOK, ...STRIDE], 'inspector chief act'),
  defeated: placed(SQUASHED, 'inspector chief defeated'),
};
