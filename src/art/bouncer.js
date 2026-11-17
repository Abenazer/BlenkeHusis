// The bouncer, drawn in code until the asset factory delivers him (batch
// 27): broad and bald, sunglasses at night, a black bomber jacket with his
// arms folded, dark trousers and boots; standing, and with an arm out to
// stop the way. He is never beaten, so his squashed frame is his standing
// one. Facing right, in his own 24×30 frame on [11, 30]. Pure: no DOM.
import { framed } from './framed.js';

export const BOUNCER_FRAME = { width: 24, height: 30, originX: 11, originY: 30 };

const LEGEND = { k: 'ink', h: 'skin_3', H: 'skin_2', J: 'grey_1', j: 'grey_2', T: 'grey_2', G: 'grey_5' };

const head = (glint) => [
  '.....kkkkkk.....',
  '....khhhhhhk....',
  '....khhhhhhk....',
  `....khhk${glint}kkk....`,
  '....khhkkkhk....',
  '....khhhhhHk....',
  '.....khhhhk.....',
  '....kkkhhkkk....',
];
const FOLDED = [
  '..kkJJJJJJJJkk..',
  '.kJJJJJJJJJJJJk.',
  '.kJJJjJJJJjJJJk.',
  '.kJJJjJJJJjJJJk.',
  '.kJkkkkkkkkkkJk.',
  '.kJkhhJJJJJJkJk.',
  '.kJkkkkkkkkkkJk.',
  '.kJJJJJJJJJJJJk.',
  '.kJJJJJJJJJJJJk.',
  '..kJJJJJJJJJJk..',
  '..kkkkkkkkkkkk..',
  '..kTTTTTTTTTTk..',
];
// One arm out flat at the shoulder, the palm up: no further.
const STOPPING = [
  '..kkJJJJJJJJkkkkkk..',
  '.kJJJJJJJJJJJJJJJhhk',
  '.kJJJjJJJJjJJkkkkhhk',
  '.kJJJjJJJJjJJk...kk.',
  '.kJJJJJJJJJJJk......',
  '.kJJJJJJJJJJJk......',
  '.kJkkkkkkkJJJk......',
  '.kJJJJJJJJJJJk......',
  '.kJJJJJJJJJJJk......',
  '..kJJJJJJJJJJk......',
  '..kkkkkkkkkkkk......',
  '..kTTTTTTTTTTk......',
];
const LEGS = [
  '..kTTTTkkTTTTk..',
  '..kTTTTk.kTTTk..',
  '..kTTTTk.kTTTk..',
  '..kTTTTk.kTTTk..',
  '..kTTTk..kTTTk..',
  '.kkkkkk..kkkkkk.',
  '.kkkkkk..kkkkkk.',
];
// Shifted so the middle of his feet stands on the frame's origin.
const placed = (rows, name) => framed(rows.map((row) => `....${row}`), LEGEND, name, BOUNCER_FRAME);

const standing = placed([...head('k'), ...FOLDED, ...LEGS], 'bouncer move 1');
export const BOUNCER_ART = {
  move: [standing, placed([...head('G'), ...FOLDED, ...LEGS], 'bouncer move 2')],
  act: placed([...head('k'), ...STOPPING, ...LEGS], 'bouncer act'),
  defeated: standing,
};
