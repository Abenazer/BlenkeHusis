// A tourist in Gamla stan late in the evening, drawn in code until the
// asset factory delivers him (batch 29): a red cap, a light blue
// windbreaker with a camera on his chest, khaki shorts, white socks in
// sandals; standing, and turning his map this way and that, lost. Facing right. Pure: no
// DOM.
import { CITIZEN_FRAME } from './chess.js';
import { framed } from './framed.js';

const LEGEND = {
  k: 'ink', R: 'red_3', r: 'red_2', f: 'skin_4', F: 'skin_3', B: 'sky_3', b: 'sky_2',
  K: 'grey_2', g: 'grey_4', w: 'white', H: 'brown_4', h: 'brown_3', S: 'brown_2', m: 'water_3',
};

const HEAD = [
  '.....kkkkk....',
  '....kRRRRRk...',
  '....krRRRRRRk.',
  '....kffkfFkk..',
  '....kffffFk...',
  '.....kfFFk....',
];
const LEGS = [
  '....kHHHHHHk..',
  '....kHHhHHHk..',
  '....kHHkkHHk..',
  '....kffk.kffk.',
  '....kwwk.kwwk.',
  '...kSSSk.kSSSk',
  '...kkkkk.kkkkk',
];
// Arms down, the camera on its strap.
const DOWN = [
  '...kBBBBBBk...',
  '..kBBBkkBBBk..',
  '..kfBkKKKkBfk.',
  '..kfBkKgKkBfk.',
  '..kkkBkkkBBkk.',
  '....kBBBBBk...',
];
// The map held out and read, then turned the other way up.
const MAP = [
  '...kBBBBBBk.....',
  '..kBBBkkBBBkkkkk',
  '..kfBkKKKkfwmwwk',
  '..kfBkKgKkkwwmwk',
  '..kkkBkkkBkwmwwk',
  '....kBBBBBkkkkk.',
];
const TURNED = [
  '...kBBBBBBkkkkk.',
  '..kBBBkkBBkwwmwk',
  '..kfBkKKKkfwmwwk',
  '..kfBkKgKkkwwwmk',
  '..kkkBkkkBBkkkk.',
  '....kBBBBBk.....',
];

const figure = (arms, name) => framed([...HEAD, ...arms, ...LEGS], LEGEND, name, CITIZEN_FRAME);

export const TOURIST_ART = {
  stand: { frames: [figure(DOWN, 'tourist stand')], fps: 2 },
  wave: { frames: [figure(MAP, 'tourist wave 1'), figure(TURNED, 'tourist wave 2')], fps: 3 },
};
