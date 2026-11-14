// Jehovah's Witnesses at their Kingdom Hall, Rikets sal, in Farsta strand,
// drawn in code until the asset factory delivers them (ordered as batch 19
// in TODO.md): a witness in a neat dark suit, a white shirt and a tie,
// a briefcase in one hand and the Watchtower held out in the other; waving,
// he holds it up. Once delivered, this file is deleted. Pure: no DOM.
import { citizenLooks } from './citizen.js';

const WITNESS = {
  a: 'ink',
  h: 'brown_2',
  s: 'skin_4',
  d: 'skin_3',
  c: 'grey_2',
  C: 'grey_1',
  w: 'white',
  t: 'red_2',
  b: 'brown_3',
  B: 'brown_2',
  m: 'grey_6',
  M: 'sky_2',
  k: 'ink',
};

// Hair short and parted, the shirt's collar and the tie's knot last.
const FACE = [
  '.....aaaa',
  '....ahhhha',
  '....ahhhhha',
  '....ahssasa',
  '....ahsssda',
  '.....assda',
];

const HEAD = [...FACE, '....acwtwca'];

// The suit, the tie down the shirt, the Watchtower in the near hand.
const ARMS_DOWN = [
  '...accwtwcca',
  '...acactcaca',
  '...acactcaca',
  '...acacCcaca.aaa',
  '...asacCcasaamMa',
];

// The briefcase hanging from the far hand by the trousers; black shoes.
const LEGS = [
  '.aaaacccCca.aaaa',
  'abbbacCacCa',
  'aBBBacCacCa',
  '.aaaacCacCa',
  '....akkakka',
  '....aaaaaaa',
];

// The near arm up, the Watchtower held high; then held out.
const WAVE_HIGH = [
  '....acwtwca.aaaa',
  '...accwtwccaamMa',
  '...acactcacasaa',
  '...acactcaca',
  '...acacCcaa',
  '...asacCca',
];

const WAVE_OUT = [
  '....acwtwca',
  '...accwtwcca..aaaa',
  '...acactcaccccsmMa',
  '...acactcaaaaaaaaa',
  '...acacCca',
  '...asacCca',
];

export const CITIZEN_ART = {
  witness: citizenLooks('witness', WITNESS, [...HEAD, ...ARMS_DOWN, ...LEGS], [
    [...FACE, ...WAVE_HIGH, ...LEGS.map((row) => row.slice(0, 11))],
    [...FACE, ...WAVE_OUT, ...LEGS.map((row) => row.slice(0, 11))],
  ]),
};
