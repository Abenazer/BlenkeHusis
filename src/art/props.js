// What Blenke can pick up and throw, and the signs he can read, drawn in
// code. Pure: no DOM.
import { parsePixels } from '../pixels.js';

const LEGEND = {
  k: 'ink',
  W: 'white',
  w: 'grey_5',
  G: 'grey_3',
  m: 'grey_2',
  O: 'orange_2',
  o: 'orange_1',
  B: 'blue_3',
  C: 'brown_3',
  c: 'brown_2',
};

const art = (name, rows) => parsePixels(rows, LEGEND, name);

// Each prop's picture, the size of its body, standing on its bottom row.
export const PROP_ART = {
  // A traffic cone with its reflective bands.
  cone: art('cone', [
    '....kk....',
    '...kOok...',
    '...kOok...',
    '..kWWwwk..',
    '..kOOOok..',
    '..kOOOok..',
    '.kWWWWwwk.',
    '.kOOOOOok.',
    '.kOOOOOok.',
    'kkkkkkkkkk',
    'kmmmmmmmGk',
    'kkkkkkkkkk',
  ]),
};

// A signpost: a blue information board on a wooden post, filling its tile.
export const SIGN_ART = art('sign', [
  'kkkkkkkkkkkkkkkk',
  'kWWWWWWWWWWWWWWk',
  'kWBBBBBWWBBBBBWk',
  'kWBBBBBBBBBBBBWk',
  'kWBBBBBWWBBBBBWk',
  'kWBBBBBWWBBBBBWk',
  'kWBBBBBWWBBBBBWk',
  'kWBBBBWWWWBBBBWk',
  'kWWWWWWWWWWWWWWk',
  'kkkkkkkkkkkkkkkk',
  '......kCck......',
  '......kCck......',
  '......kCck......',
  '......kCck......',
  '.....kkCckk.....',
  '....kmmmmmmk....',
]);
