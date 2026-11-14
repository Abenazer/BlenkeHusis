// The Skogsmulle children in the woods by Trångsund, drawn in code until
// the asset factory delivers them (ordered as batch 20 in TODO.md): a
// child of five out with Friluftsfrämjandet in a red bobble hat, a yellow
// anorak, blue rain trousers and green rubber boots. Once delivered, this
// file is deleted. Pure: no DOM.
import { citizenLooks } from './citizen.js';

const CHILD = {
  a: 'ink',
  w: 'white',
  r: 'red_3',
  R: 'red_2',
  h: 'brown_3',
  s: 'skin_4',
  d: 'skin_3',
  y: 'urine_3',
  Y: 'urine_2',
  j: 'blue_3',
  J: 'blue_2',
  g: 'grass_3',
  G: 'grass_2',
};

// The bobble hat pulled down to the eyes.
const FACE = [
  '......aw',
  '.....arra',
  '....arrRra',
  '....aRRRRa',
  '....ahsasa',
  '....asssda',
];

const HEAD = [...FACE, '.....aaaa'];

// The anorak, the arms at its sides.
const ARMS_DOWN = [
  '....ayyyya',
  '...ayayyaya',
  '...ayaYyaya',
  '...asaYYasa',
];

// Rain trousers into rubber boots.
const LEGS = [
  '....ajaja',
  '....agaga',
  '....aaaaa',
];

// The near arm up, waving: raised high, then out to the side.
const WAVE_HIGH = [
  '.....aaaa.asa',
  '....ayyyyaaya',
  '...ayayyyyya',
  '...ayaYyaaa',
  '...asaYYa',
];

const WAVE_OUT = [
  '.....aaaa..asa',
  '....ayyyyaaaya',
  '...ayayyyyyyya',
  '...ayaYyaaaaa',
  '...asaYYa',
];

export const CITIZEN_ART = {
  mulleChild: citizenLooks('mulle child', CHILD, [...HEAD, ...ARMS_DOWN, ...LEGS], [
    [...FACE, ...WAVE_HIGH, ...LEGS],
    [...FACE, ...WAVE_OUT, ...LEGS],
  ]),
};
