// The club king, Stureplan's boss, drawn in code until the asset factory
// delivers him (batch 28): slicked-back black hair, sunglasses at night, a
// tan, a white suit over a black shirt open on a gold chain; walking,
// popping champagne, and squashed. Facing right, in the bosses' 26×33
// frame on [12, 33]. Pure: no DOM.
import { BOSS_FRAME } from './commissioner.js';
import { framed } from './framed.js';

const LEGEND = {
  k: 'ink', H: 'grey_1', h: 'grey_3', f: 'skin_3', F: 'skin_2', W: 'grey_6', w: 'grey_5',
  b: 'purple_1', o: 'urine_3', g: 'slime_1', G: 'slime_2', c: 'brown_4', O: 'urine_4',
};

const HEAD = [
  '.....kkkkkk.....',
  '....kHHHHHHk....',
  '...kHhhHHHHHk...',
  '...kHHHHHHHHk...',
  '...kHHfffffFk...',
  '...kHkkkkkkkk...',
  '...kHffffffFk...',
  '....kfffkkkFk...',
  '....kkffffFk....',
  '....kWbbbbWk....',
];
const BODY = [
  '...kWWbobbWWk...',
  '..kWWWWbobWWWk..',
  '..kWwWWbbbWWWk..',
  '..kWwWWbbWWWWk..',
  '..kWwWWWbWWWWk..',
  '..kWwWWWWWWWWk..',
  '..kWwWWWWWWWWk..',
  '..kWwWWWWWWWWk..',
  '..kWwWWWWWWWWk..',
  '..kfkWWWWWWkfk..',
  '...kkWWWWWWkk...',
  '...kWWWWWWWWk...',
];
// The bottle held up, its cork popping in a spray of foam.
const BOTTLE = [
  '...kWWbobbWWk.kOk.',
  '..kWWWWbobWWWkkck.',
  '..kWwWWbbbWWkkGk..',
  '..kWwWWbbWWWkgGk..',
  '..kWwWWWbWWWkggk..',
  '..kWwWWWWWWWkfgk..',
  '..kWwWWWWWWWkkkk..',
  '..kWwWWWWWWWk.....',
  '..kWwWWWWWWWk.....',
  '..kfkWWWWWWWk.....',
  '...kkWWWWWWkk.....',
  '...kWWWWWWWWk.....',
];
const STRIDE = [
  '...kWWWWkWWWWk..',
  '...kWWWk.kWWWk..',
  '...kWWWk.kWWWk..',
  '...kWwWk.kWwWk..',
  '...kWwWk.kWwWk..',
  '...kWWWk.kWWWk..',
  '..kkkkkk.kkkkkk.',
  '..kkkkkk.kkkkkk.',
];
const PASSING = [
  '....kWWWWWWWk...',
  '....kWWWwWWWk...',
  '....kWWWwWWWk...',
  '....kWWWwWWWk...',
  '.....kWWwWWk....',
  '.....kWWWWWk....',
  '....kkkkkkkkk...',
  '....kkkkkkkkk...',
];
const SQUASHED = [
  '......kkkkkk.......',
  '....kkHHHHHHkk.....',
  '...kHHkkkkkkHHk....',
  '..kWWWWbobbWWWWk.kk',
  '..kWWWWWWWWWWWWkkgk',
  '.kkkkkkWWWWWWkkkkkk',
  '.kkkkkkkkkkkkkkkkk.',
];

// Shifted so the middle of his feet stands on the frame's origin.
const placed = (rows, name) => framed(rows.map((row) => `....${row}`), LEGEND, name, BOSS_FRAME);

export const CLUB_KING_ART = {
  move: [placed([...HEAD, ...BODY, ...STRIDE], 'club king move 1'), placed([...HEAD, ...BODY, ...PASSING], 'club king move 2')],
  act: placed([...HEAD, ...BOTTLE, ...STRIDE], 'club king act'),
  defeated: placed(SQUASHED, 'club king defeated'),
};
