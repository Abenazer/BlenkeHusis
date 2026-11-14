// The pupils of Ribbyskolan in Västerhaninge, drawn in code until the
// asset factory delivers them (ordered as batch 18 in TODO.md): a
// högstadium pupil of the late 1970s, about thirteen, hair to the collar,
// a light blue college sweater, brown corduroy trousers, white trainers
// and a square red school backpack, the kind that came in 1978 to save
// pupils' backs. Once delivered, this file is deleted. Pure: no DOM.
import { citizenLooks } from './citizen.js';

const PUPIL = {
  a: 'ink',
  h: 'urine_2',
  H: 'urine_1',
  s: 'skin_4',
  d: 'skin_3',
  c: 'sky_3',
  C: 'sky_2',
  n: 'brown_3',
  N: 'brown_2',
  w: 'white',
  r: 'red_3',
  R: 'red_2',
};

// Hair to the collar; the backpack's top shows behind his neck.
const FACE = [
  '.....aaaa',
  '....ahhhha',
  '....ahhhhha',
  '....ahhsasa',
];

const HEAD = [
  ...FACE,
  '....aHssssa',
  '....aHassda',
  '.aaa.aacccca',
];

// The backpack on his back, behind the far arm; the sweater, the arms at
// its sides.
const ARMS_DOWN = [
  'arrraccccccca',
  'arrRacacccCaca',
  'arrRacacccCaca',
  'aRRRacannnnaca',
  '.aaa.asannnasa',
];

// Corduroy trousers and white trainers.
const LEGS = [
  '.....anNanNa',
  '.....anNanNa',
  '.....anNanNa',
  '.....awwawwa',
  '.....aaaaaaa',
];

// The near arm up, waving: raised high, then out to the side.
const WAVE_HIGH = [
  '....aHssssa..asa',
  '....aHassda..aca',
  '.aaa.aacccca.aca',
  'arrracccccccaaca',
  'arrRacacccCccca',
  'arrRacacccCaaa',
  'aRRRacannnna',
  '.aaa.asannna',
];

const WAVE_OUT = [
  '....aHssssa',
  '....aHassda....asa',
  '.aaa.aacccca...aca',
  'arrracccccccaaaaca',
  'arrRacacccCcccccca',
  'arrRacacccCaaaaaa',
  'aRRRacannnna',
  '.aaa.asannna',
];

export const CITIZEN_ART = {
  ribbyPupil: citizenLooks('ribby pupil', PUPIL, [...HEAD, ...ARMS_DOWN, ...LEGS], [
    [...FACE, ...WAVE_HIGH, ...LEGS],
    [...FACE, ...WAVE_OUT, ...LEGS],
  ]),
};
