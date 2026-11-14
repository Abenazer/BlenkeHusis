// Jordbro's children, class 1D at Lundaskolan in 1972, the year Rainer
// Hartleb started filming them for what became the Jordbro films, drawn in
// code until the asset factory delivers them (ordered as batch 14 in
// TODO.md): a seven-year-old with a bowl cut, a striped knitted jumper and
// flared jeans. Once delivered, this file is deleted. Pure: no DOM.
import { citizenLooks } from './citizen.js';

const CHILD = {
  a: 'ink',
  h: 'brown_2',
  s: 'skin_4',
  d: 'skin_3',
  r: 'red_3',
  w: 'urine_3',
  j: 'blue_3',
  J: 'blue_2',
  k: 'brown_1',
};

// The fringe down to the eyes, the jumper's collar last.
const HEAD = [
  '...aaaa',
  '..ahhhha',
  '..ahhhhha',
  '..ahhsasa',
  '..ahsssda',
  '...asssa',
  '..awwwwwa',
];

// The jeans flare out over the shoes.
const LEGS = [
  '..ajjjjja',
  '..ajJajJa',
  '..ajJajJa',
  '.ajjjajjja',
  '.akkkakkka',
  '.aaaaaaaaa',
];

const ARMS_DOWN = [
  '.arrrrrrra',
  '.awawwwawa',
  '.asarrrasa',
];

// The near arm up, waving: raised high, then out to the side.
const WAVE_HIGH = [
  '.........asa',
  '.........ara',
  '..awwwwwara',
  '.arrrrrrra',
  '.awawwwaa',
  '.asarrra',
];

const WAVE_OUT = [
  '..........asa',
  '..awwwwwaara',
  '.arrrrrrrrra',
  '.awawwwaaaa',
  '.asarrra',
];

const FACE = HEAD.slice(0, -1);

export const CITIZEN_ART = {
  jordbroChild: citizenLooks('jordbro child', CHILD, [...HEAD, ...ARMS_DOWN, ...LEGS], [
    [...FACE, ...WAVE_HIGH, ...LEGS],
    [...FACE, ...WAVE_OUT, ...LEGS],
  ]),
};
