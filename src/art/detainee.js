// A young raver brought in to Polishuset at Kronoberg for her tests,
// drawn in code until the asset factory delivers her (batch 29): purple
// pigtails, a grey police blanket over her shoulders, orange wide trousers
// and white platform trainers; standing, and shrugging, then hiding her
// face in the blanket. Facing right. Pure: no DOM.
import { CITIZEN_FRAME } from './chess.js';
import { framed } from './framed.js';

const LEGEND = {
  k: 'ink', P: 'purple_3', p: 'purple_2', f: 'skin_4', F: 'skin_3', G: 'grey_4', g: 'grey_3',
  O: 'orange_2', o: 'orange_1', w: 'white',
};

const HEAD = [
  '.....kkkkk....',
  '..kkkPPPPPkkk.',
  '.kPpkPPPPPkpPk',
  '..kkkffkfFkkk.',
  '....kffffFk...',
  '.....kfFFk....',
];
const LEGS = [
  '....kOOOOOOk..',
  '...kOOOoOOOOk.',
  '...kOOOkkOOOk.',
  '..kOOOOk.kOOOk',
  '..kOOOOk.kOOOk',
  '..kwwwwk.kwwwk',
  '..kkkkkk.kkkkk',
];
// The blanket over her shoulders, arms inside it.
const WRAPPED = [
  '...kGGGGGGk...',
  '..kGGgGGGGGk..',
  '..kGgGGGGgGk..',
  '..kGgGGGGgGk..',
  '..kGGGGGGGGk..',
  '...kkkkkkkk...',
];
// A shrug, the blanket slipping, then the blanket up to her face.
const SHRUG = [
  'kfk.kGGGGk.kfk',
  'kfkkGGgGGGkkfk',
  '.kGGgGGGGgGGk.',
  '..kGgGGGGgGk..',
  '..kGGGGGGGGk..',
  '...kkkkkkkk...',
];
const HIDE = [
  '...kGGGGGGk...',
  '..kGGgGGkfkk..',
  '..kGgGGkfffk..',
  '..kGgGGGkkGk..',
  '..kGGGGGGGGk..',
  '...kkkkkkkk...',
];

const figure = (arms, name) => framed([...HEAD, ...arms, ...LEGS], LEGEND, name, CITIZEN_FRAME);

export const DETAINEE_ART = {
  stand: { frames: [figure(WRAPPED, 'detainee stand')], fps: 2 },
  wave: { frames: [figure(SHRUG, 'detainee wave 1'), figure(HIDE, 'detainee wave 2')], fps: 2 },
};
