// The tagger, drawn in code until the asset factory delivers him (batch
// 27): a graffiti painter in a grey hoodie with the hood up, baggy jeans
// and white trainers, walking, spraying (the can held out) and squashed;
// and his cloud of paint. Facing right. Pure: no DOM.
import { framed } from './framed.js';
import { parsePixels } from '../pixels.js';

const LEGEND = {
  k: 'ink', H: 'grey_2', h: 'grey_1', f: 'skin_3', F: 'skin_2',
  J: 'blue_3', j: 'blue_2', w: 'white', r: 'red_3', g: 'grey_5', p: 'purple_4',
};

const HEAD = [
  '.....kkkkk.....',
  '....kHHHHHk....',
  '...kHHHHHHHk...',
  '...kHHhkffFk...',
  '...kHhkfkffk...',
  '...kHhkffffk...',
  '...kHHhkFFk....',
  '...kkHHHHHkk...',
];
const BODY = [
  '..kHHHHHHHHHk..',
  '..kHHHHHHHHHk..',
  '..kHhHHHHHHHk..',
  '..kHhHHHHHHHk..',
  '..kfkHHHHHHfk..',
  '...kkHHHHHHk...',
];
const STRIDE = [
  '....kJJJJJJk...',
  '....kJJJjJJk...',
  '....kJJkjJJk...',
  '....kJJkkJJk...',
  '....kJJk.kJJk..',
  '....kJJk.kJJk..',
  '...kwwwk.kwwwk.',
  '...kkkkk.kkkkk.',
];
const PASSING = [
  '....kJJJJJJk...',
  '....kJJJjJJk...',
  '....kJJJjJJk...',
  '.....kJJjJk....',
  '.....kJJJJk....',
  '.....kJJJJk....',
  '....kwwwwwwk...',
  '....kkkkkkkk...',
];
// Spraying: the arm out level with the shoulder, the can in his fist.
const SPRAYING = [
  '..kHHHHHHHHHkkk....',
  '..kHHHHHHHHHHHHkrk.',
  '..kHhHHHHHHHkkfkrgk',
  '..kHhHHHHHHHk.kkrk.',
  '..kfkHHHHHHHk..kk..',
  '...kkHHHHHHk.......',
];
const SQUASHED = [
  '.....kkkkk.......',
  '...kkHHHHHkk.....',
  '..kHHHhkffkHk....',
  '..kHHHHHHHHHHk.kk',
  '..kJJJJJJJJJJkkrk',
  '.kwwwkJJJJkwwwkkk',
  '.kkkkkkkkkkkkkk..',
];

export const TAGGER_ART = {
  move: [framed([...HEAD, ...BODY, ...STRIDE], LEGEND, 'tagger move 1'), framed([...HEAD, ...BODY, ...PASSING], LEGEND, 'tagger move 2')],
  act: framed([...HEAD, ...SPRAYING, ...STRIDE], LEGEND, 'tagger act'),
  defeated: framed(SQUASHED, LEGEND, 'tagger defeated'),
};

// The paint: a cloud of pink droplets, two frames as it puffs, placed by
// its middle.
const CLOUDS = [
  ['..p.p...', '.p.ppp.p', 'pppp.pp.', '.pp.ppp.', 'p.ppp.p.', '...p..p.'],
  ['.p..p.p.', 'p.pp.pp.', '.ppppp.p', 'pp.pp.p.', '.p.p.pp.', 'p...p...'],
];
export const PAINT_ART = {
  fps: 10,
  frames: CLOUDS.map((rows, i) => ({ image: parsePixels(rows, LEGEND, `paint ${i + 1}`), originX: 4, originY: 3 })),
};
