// The Latter-day Saints at their temple in Västerhaninge, drawn in code
// until the asset factory delivers them (ordered as batch 22 in TODO.md):
// an elder on mission in a white short-sleeved shirt, a dark tie and dark
// trousers, his black name tag on his chest and the Book of Mormon in his
// hand; a sister on mission in a white blouse with her name tag and a long
// blue skirt, the book in her hand too. Waving, each holds the book up.
// Once delivered, this file is deleted. Pure: no DOM.
import { citizenLooks } from './citizen.js';

const ELDER = {
  a: 'ink',
  h: 'brown_4',
  s: 'skin_4',
  d: 'skin_3',
  w: 'white',
  t: 'blue_1',
  k: 'grey_1',
  c: 'grey_2',
  C: 'grey_1',
  m: 'grey_6',
  M: 'blue_2',
};

// Hair short and neatly parted, the collar and the tie's knot last.
const ELDER_FACE = [
  '.....aaaa',
  '....ahhhha',
  '....ahhhhha',
  '....ahssasa',
  '....ahsssda',
  '.....assda',
];

const ELDER_HEAD = [...ELDER_FACE, '....awwtwwa'];

// Short sleeves, the tie, the name tag; the book in the near hand.
const ELDER_ARMS_DOWN = [
  '...awwwtwwwa',
  '...awawtkawa',
  '...asawtwasa',
  '...asawwwasa.aaa',
  '...asacCcasaamMa',
];

const ELDER_LEGS = [
  '....acccCca.aaaa',
  '....acCacCa',
  '....acCacCa',
  '....acCacCa',
  '....aaaaaaa',
];

// The near arm up, the book held high; then held out.
const ELDER_WAVE_HIGH = [
  '....awwtwwa.aaaa',
  '...awwwtwwwaamMa',
  '...awawtkawasaa',
  '...asawtwawa',
  '...asawwwaa',
  '...asacCca',
];

const ELDER_WAVE_OUT = [
  '....awwtwwa',
  '...awwwtwwwa..aaaa',
  '...awawtkawwsssmMa',
  '...asawtwaaaaaaaaa',
  '...asawwwa',
  '...asacCca',
];

const SISTER = {
  a: 'ink',
  h: 'brown_2',
  s: 'skin_4',
  d: 'skin_3',
  w: 'white',
  k: 'grey_1',
  c: 'blue_3',
  l: 'skin_3',
  f: 'grey_1',
  m: 'grey_6',
  M: 'blue_2',
};

// Hair to the shoulders.
const SISTER_FACE = [
  '.....aaaa',
  '....ahhhha',
  '...ahhhhhha',
  '...ahhhsasa',
  '...ahhssssa',
  '...ahhassda',
];

const SISTER_HEAD = [...SISTER_FACE, '....awsswa'];

// The blouse with its name tag, the long skirt, the book in the near hand.
const SISTER_ARMS_DOWN = [
  '...awwwwwwwa',
  '...awawwkawa',
  '...awawwwawa',
  '...awacccawaaa',
  '...asacccasmMa',
  '....acccccamMa',
  '....acccccaaaa',
];

// Stockings and flat dark shoes.
const SISTER_LEGS = [
  '.....alaala',
  '.....alaala',
  '.....afaafa',
  '.....aaaaaa',
];

const SISTER_WAVE_HIGH = [
  '....awsswa..aaaa',
  '...awwwwwwaamMa',
  '...awawwkawamMa',
  '...awawwwawaaaa',
  '...awacccaa',
  '...asaccca',
  '....acccccca',
  '....acccccca',
];

const SISTER_WAVE_OUT = [
  '....awsswa',
  '...awwwwwwwa..aaaa',
  '...awawwkawwwasmMa',
  '...awawwwaaaaaamMa',
  '...awacccaa...aaaa',
  '...asaccca',
  '....acccccca',
  '....acccccca',
];

export const CITIZEN_ART = {
  mormonElder: citizenLooks('mormon elder', ELDER, [...ELDER_HEAD, ...ELDER_ARMS_DOWN, ...ELDER_LEGS], [
    [...ELDER_FACE, ...ELDER_WAVE_HIGH, ...ELDER_LEGS.map((row) => row.slice(0, 11))],
    [...ELDER_FACE, ...ELDER_WAVE_OUT, ...ELDER_LEGS.map((row) => row.slice(0, 11))],
  ]),
  mormonSister: citizenLooks('mormon sister', SISTER, [...SISTER_HEAD, ...SISTER_ARMS_DOWN, ...SISTER_LEGS], [
    [...SISTER_FACE, ...SISTER_WAVE_HIGH, ...SISTER_LEGS],
    [...SISTER_FACE, ...SISTER_WAVE_OUT, ...SISTER_LEGS],
  ]),
};
