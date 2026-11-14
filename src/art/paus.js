// The customers of Paus bagarstuga in Västerhaninge centrum, drawn in code
// until the asset factory delivers them (ordered as batch 21 in TODO.md):
// a woman out for her fika in a permanent wave and a beige coat, a white
// paper bag of poppy-seed buns in her hand; waving, she holds it up. Once
// delivered, this file is deleted. Pure: no DOM.
import { citizenLooks } from './citizen.js';

const CUSTOMER = {
  a: 'ink',
  h: 'brown_3',
  H: 'brown_2',
  s: 'skin_4',
  d: 'skin_3',
  c: 'brown_4',
  C: 'brown_3',
  w: 'white',
  W: 'grey_5',
  l: 'skin_3',
  k: 'brown_1',
};

// A permanent wave round the face.
const FACE = [
  '.....aaaa',
  '....ahhhha',
  '...ahhhhhha',
  '...ahhhsasa',
  '...ahhssssa',
  '....ahassda',
];

const HEAD = [...FACE, '....acssca'];

// The coat, belted, the bag of buns hanging from the near hand.
const ARMS_DOWN = [
  '...accccccca',
  '...acacccaca',
  '...acaCCCaca',
  '...acacccacaaa',
  '...asacccasWwa',
  '....acccccaWwa',
  '....acccccaaaa',
];

// Stockings and brown shoes.
const LEGS = [
  '.....alaala',
  '.....alaala',
  '.....akaaka',
  '.....aaaaaa',
];

// The near arm up with the bag: held high, then out to the side.
const WAVE_HIGH = [
  '....acssca..aaaa',
  '...accccccaaWwa',
  '...acacccacaWwa',
  '...acaCCCacaaaa',
  '...acacccaa',
  '...asaccca',
  '....acccccca',
  '....acccccca',
];

const WAVE_OUT = [
  '....acssca',
  '...accccccca..aaaa',
  '...acacccacccasWwa',
  '...acaCCCaaaaaaWwa',
  '...acacccaa...aaaa',
  '...asaccca',
  '....acccccca',
  '....acccccca',
];

export const CITIZEN_ART = {
  pausCustomer: citizenLooks('paus customer', CUSTOMER, [...HEAD, ...ARMS_DOWN, ...LEGS], [
    [...FACE, ...WAVE_HIGH, ...LEGS],
    [...FACE, ...WAVE_OUT, ...LEGS],
  ]),
};
