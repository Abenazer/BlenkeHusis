// The ticket inspector, drawn in code until the asset factory delivers
// him (batch 27): SL's man in a navy uniform and peaked cap with its
// badge, grey trousers and black shoes, walking, holding out his card and
// squashed. Facing right. Pure: no DOM.
import { framed } from './framed.js';

const LEGEND = {
  k: 'ink', U: 'blue_2', u: 'blue_1', y: 'urine_3', f: 'skin_4', F: 'skin_3',
  T: 'grey_3', t: 'grey_2', S: 'grey_1', c: 'white',
};

const HEAD = [
  '.....kkkkk.....',
  '....kUUUUUk....',
  '....kUyUUUkkk..',
  '....kkkkkkkk...',
  '.....kffkfk....',
  '.....kfffFk....',
  '.....kfFFk.....',
  '....kkUkkUkk...',
];
const BODY = [
  '...kUUUUUUUk...',
  '...kUuUUUyUk...',
  '...kUuUUUUUk...',
  '...kUuUUUUUk...',
  '...kfkUUUUkfk..',
  '....kkUUUUkk...',
];
const STRIDE = [
  '....kTTTTTTk...',
  '....kTTTtTTk...',
  '....kTTktTTk...',
  '....kTTkkTTk...',
  '....kTTk.kTTk..',
  '....kTTk.kTTk..',
  '...kSSSk.kSSSk.',
  '...kkkkk.kkkkk.',
];
const PASSING = [
  '....kTTTTTTk...',
  '....kTTTtTTk...',
  '....kTTTtTTk...',
  '.....kTTtTk....',
  '.....kTTTTk....',
  '.....kTTTTk....',
  '....kSSSSSSk...',
  '....kkkkkkkk...',
];
// His card held out at arm's length.
const CARD = [
  '...kUUUUUUUkkkk.kkkk',
  '...kUuUUUyUUUUfkcck.',
  '...kUuUUUUUkkkkkcck.',
  '...kUuUUUUUk...kkkk.',
  '...kfkUUUUUk........',
  '....kkUUUUkk........',
];
const SQUASHED = [
  '.....kkkkk.......',
  '...kkUyUUUkkk....',
  '..kUUkffkfUUk....',
  '..kUUUUUUUUUUk...',
  '..kTTTTTTTTTTk...',
  '.kSSSkTTTTkSSSk..',
  '.kkkkkkkkkkkkkk..',
];

export const INSPECTOR_ART = {
  move: [framed([...HEAD, ...BODY, ...STRIDE], LEGEND, 'ticket inspector move 1'), framed([...HEAD, ...BODY, ...PASSING], LEGEND, 'ticket inspector move 2')],
  act: framed([...HEAD, ...CARD, ...STRIDE], LEGEND, 'ticket inspector act'),
  defeated: framed(SQUASHED, LEGEND, 'ticket inspector defeated'),
};
