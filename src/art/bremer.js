// The pupils of Fredrika Bremergymnasiet in Handen, drawn in code until
// the asset factory delivers them (ordered as batch 15 in TODO.md): a
// gymnasium pupil of the early 1970s, long hair down past the shoulders,
// an army-green parka, bell-bottom jeans and clogs. Once delivered, this
// file is deleted. Pure: no DOM.
import { citizenLooks } from './citizen.js';

const PUPIL = {
  a: 'ink',
  h: 'urine_2',
  s: 'skin_4',
  d: 'skin_3',
  p: 'grass_2',
  P: 'grass_1',
  j: 'blue_3',
  J: 'blue_2',
  k: 'brown_2',
};

// Long hair falling behind the face and over the near shoulder.
const HEAD = [
  '...aaaa',
  '..ahhhha',
  '.ahhhhhha',
  '.ahhhsasa',
  '.ahhssssa',
  '.ahhsssda',
  '.ahhhaaa',
];

// The parka open over the jeans, the arms at its sides.
const ARMS_DOWN = [
  '.ahpppppa',
  '.apppppppa',
  '.apapppapa',
  '.apapPpapa',
  '.apapPpapa',
  '.asapppasa',
];

// Bell-bottoms flaring out over the clogs.
const LEGS = [
  '..ajjjjja',
  '..ajJajJa',
  '..ajJajJa',
  '..ajJajJa',
  '.ajjjajjja',
  '.akkkakkka',
  '.aaaaaaaaa',
];

// The near arm up, waving: raised high, then out to the side.
const WAVE_HIGH = [
  '.........asa',
  '.........apa',
  '.ahpppppapa',
  '.apppppppa',
  '.apapppaa',
  '.apapPpa',
  '.apapPpa',
  '.asapppa',
];

const WAVE_OUT = [
  '..........asa',
  '.ahpppppaapa',
  '.apppppppppa',
  '.apapppaaaa',
  '.apapPpa',
  '.apapPpa',
  '.asapppa',
];

export const CITIZEN_ART = {
  bremerPupil: citizenLooks('bremer pupil', PUPIL, [...HEAD, ...ARMS_DOWN, ...LEGS], [
    [...HEAD, ...WAVE_HIGH, ...LEGS],
    [...HEAD, ...WAVE_OUT, ...LEGS],
  ]),
};
