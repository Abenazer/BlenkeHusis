// The enemies and what they throw, drawn in code. Each enemy is put
// together from parts like Lelle (a head, an upper body and a pose of the
// legs, the legs shared by all and coloured by each one's legend) in a
// 16×24 frame that hangs from the middle of its feet, facing right. Each
// has frames for moving, one for throwing or shouting where it does, and
// a defeated one: itself squashed flat. Pure: no DOM.
import { createImage, getPixel, parsePixels, setPixel, stamp } from '../pixels.js';

export const ENEMY_SIZE = { width: 16, height: 24 };
export const ENEMY_PIVOT = { x: 8, y: 24 };

const HEAD_AT = { x: 4, y: 0 };
const UPPER_AT = { x: 2, y: 8 };
const LEGS_AT = { x: 3, y: 17 };

const LEGS = {
  stand: [
    '.kPPPPPPk.',
    '.kPpkkPpk.',
    '.kPpkkPpk.',
    '.kPpkkPpk.',
    '.kmmkkmmk.',
    '.kmmmkmmmk',
    '.kkkkkkkkk',
  ],
  step: [
    '.kPPPPPPk.',
    '.kPpkkPpk.',
    'kPpk..kPpk',
    'kPpk..kPpk',
    'kmmk..kmmk',
    'kmmmk.kmmk',
    'kkkkk.kkkk',
  ],
};

// Builds a frame from part maps, all read with one legend. extras are
// further parts placed where given.
function frame(legend, name, { head, upper, legs, headDrop = 0, extras = [] }) {
  const image = createImage(ENEMY_SIZE.width, ENEMY_SIZE.height);
  const part = (rows, label) => parsePixels(rows, legend, `${name} ${label}`);
  stamp(image, part(LEGS[legs], `legs ${legs}`), LEGS_AT.x, LEGS_AT.y);
  stamp(image, part(upper, 'upper'), UPPER_AT.x, UPPER_AT.y);
  stamp(image, part(head, 'head'), HEAD_AT.x, HEAD_AT.y + headDrop);
  extras.forEach(({ rows, x, y }, index) => stamp(image, part(rows, `extra ${index}`), x, y));
  return image;
}

// Defeated: flattened to half height, standing on the same ground.
export function squashed(image) {
  const result = createImage(image.width, image.height);
  const half = Math.ceil(image.height / 2);
  for (let y = 0; y < half; y++) {
    const source = y * 2;
    for (let x = 0; x < image.width; x++) setPixel(result, x, image.height - half + y, getPixel(image, x, source));
  }
  return result;
}

function enemy(move, act = null) {
  return { move, act, defeated: squashed(move[0]) };
}

// The stoner: a knitted hat, heavy eyelids, a hoodie and a smouldering
// cigarette of some kind, its smoke drifting.
const STONER = {
  k: 'ink',
  G: 'grass_3',
  g: 'grass_2',
  a: 'urine_3',
  h: 'brown_2',
  S: 'skin_4',
  d: 'skin_3',
  T: 'purple_3',
  t: 'purple_2',
  P: 'blue_4',
  p: 'blue_3',
  m: 'grey_2',
  W: 'white',
  w: 'grey_5',
};
const STONER_HEAD = [
  '..kkkkk..',
  '.kGGGGGk.',
  'kGgGgGgGk',
  'kaaaaaaak',
  'khSSSSSSk',
  'khSSdkdSk',
  'kSSSSSSSk',
  '.kSSSkkSk',
  '..kSSSSk.',
];
const STONER_UPPER = [
  '...kTTTTk...',
  '..kTTTTTTk..',
  '.kTTTTTTTTk.',
  '.kTtTTTTTtk.',
  '.kTtTttTTtk.',
  '.kTtTTTTTtSW',
  '.kSttttttk..',
  '..kkTTTTkk..',
  '...kkkkkk...',
];
const smoke = (points) => points.map(([x, y]) => ({ rows: ['w'], x, y }));

// The dealer: hood up, dark glasses, hands in the pocket, white trainers.
const DEALER = {
  k: 'ink',
  H: 'grey_2',
  T: 'grey_3',
  t: 'grey_2',
  S: 'skin_3',
  d: 'skin_2',
  P: 'blue_2',
  p: 'blue_1',
  m: 'white',
};
const DEALER_HEAD = [
  '..kkkkk..',
  '.kHHHHHk.',
  'kHHHHHHHk',
  'kHHSSSSSk',
  'kHSkkkkSk',
  'kHSSSSSSk',
  'kHSSSSdSk',
  '.kHSSSdk.',
  '..kHHHk..',
];
const DEALER_UPPER = [
  '...kHHHHk...',
  '..kTTTTTTk..',
  '.kTTTTTTTTk.',
  '.kTtTTTTTtk.',
  '.kTtTTTTTtk.',
  '.kTtkkkkktk.',
  '.kttTTTTTtk.',
  '..kkTTTTkk..',
  '...kkkkkk...',
];

// The party people: wild hair, shades, a grin, a loud shirt, and arms in
// the air every other step. Their colours change from one to the next.
const PARTY_COLOURS = [
  { H: 'purple_4', T: 'sky_3', t: 'sky_2', a: 'white' },
  { H: 'hivis_3', T: 'purple_4', t: 'purple_3', a: 'white' },
  { H: 'slime_4', T: 'orange_3', t: 'orange_2', a: 'urine_4' },
];
const PARTY = { k: 'ink', g: 'grey_1', S: 'skin_4', W: 'white', P: 'blue_3', p: 'blue_2', m: 'red_3' };
const PARTY_HEAD = [
  '.kk.kk.k.',
  'kHHkHHkHk',
  'kHHHHHHHk',
  'kHHSSSSSk',
  'kHgggkggk',
  'kHSSSSSSk',
  'kSkWWWkSk',
  '.kSSSSSk.',
  '..kkkkk..',
];
const PARTY_UPPER = [
  '...kTTTTk...',
  '..kTTaTTTk..',
  '.kTTTTTaTTk.',
  '.kTtTaTTTtk.',
  '.kTtTTTaTtk.',
  '.kStTaTTTSk.',
  '..ktTTTTtk..',
  '..kkTTTTkk..',
  '...kkkkkk...',
];
const PARTY_UPPER_ARMS_UP = [
  '...kTTTTk...',
  '.kkTTaTTTkk.',
  '.kTTTTTaTTk.',
  '..kTaTTTTk..',
  '..kTTTaTTk..',
  '..kTaTTTTk..',
  '..ktTTTTtk..',
  '..kkTTTTkk..',
  '...kkkkkk...',
];
const PARTY_ARMS_UP = [
  'kSk.........kSk',
  'kSk.........kSk',
  'kTk.........kTk',
  '.kTk.......kTk.',
  '..kk.......kk..',
];

// The bureaucrat: bald on top, glasses, grey suit, red tie; he holds out
// a form to throw.
const BUREAUCRAT = {
  k: 'ink',
  S: 'skin_4',
  h: 'grey_4',
  W: 'white',
  T: 'grey_3',
  t: 'grey_2',
  R: 'red_3',
  P: 'grey_2',
  p: 'grey_1',
  m: 'ink',
};
const BUREAUCRAT_HEAD = [
  '..kkkkk..',
  '.kSSSSSk.',
  'kSSSSSSSk',
  'khSSSSSSk',
  'khSkkkkkk',
  'khSkWkkWk',
  'kSSSSSSSk',
  '.kSSSkkk.',
  '..kSSSk..',
];
const BUREAUCRAT_UPPER = [
  '...kWWWWk...',
  '..kTWRRWTk..',
  '.kTTTRRTTTk.',
  '.kTtTRRTTtk.',
  '.kTtTRRTTtk.',
  '.kTtTTRTTtk.',
  '.kStTTTTTSk.',
  '..kkTTTTkk..',
  '...kkkkkk...',
];
const BUREAUCRAT_THROW = [
  '...kWWWWk...',
  '..kTWRRWTkk.',
  '.kTTTRRTTTSW',
  '.kTtTRRTTkkW',
  '.kTtTRRTTtk.',
  '.kTtTTRTTtk.',
  '.ktTTTTTTtk.',
  '..kkTTTTkk..',
  '...kkkkkk...',
];

// The laboratory technician: goggles, a white coat with a pen in the
// pocket, blue gloves, and a test tube held up to throw.
const TECHNICIAN = {
  k: 'ink',
  h: 'brown_1',
  S: 'skin_4',
  d: 'skin_3',
  g: 'sky_4',
  W: 'white',
  w: 'grey_5',
  b: 'sky_3',
  R: 'red_3',
  G: 'blue_4',
  s: 'slime_3',
  P: 'grey_3',
  p: 'grey_2',
  m: 'grey_1',
};
const TECHNICIAN_HEAD = [
  '..kkkkk..',
  '.khhhhhk.',
  'khhhhhhhk',
  'khhSSSSSk',
  'khkggkggk',
  'khSSSSSSk',
  'kSSSSSSSk',
  '.kSSSSdk.',
  '..kSSSk..',
];
const TECHNICIAN_UPPER = [
  '...kWWWWk...',
  '..kWWbbWWk..',
  '.kWWWbbWWWk.',
  '.kWwWWWWWwk.',
  '.kWwWWWWWwk.',
  '.kWwWRkWWwk.',
  '.kGwWWWWWGk.',
  '..kkWWWWkk..',
  '...kkkkkk...',
];
const TECHNICIAN_THROW = [
  '...kWWWWk.s.',
  '..kWWbbWWkGk',
  '.kWWWbbWWkWk',
  '.kWwWWWWWwk.',
  '.kWwWWWWWwk.',
  '.kWwWRkWWwk.',
  '.kWwWWWWWwk.',
  '..kkWWWWkk..',
  '...kkkkkk...',
];

// The political ideologue: a neat parting, a blue suit and a yellow tie;
// he shouts through a megaphone.
const IDEOLOGUE = {
  k: 'ink',
  H: 'urine_3',
  h: 'urine_2',
  S: 'skin_4',
  R: 'red_3',
  W: 'white',
  T: 'blue_3',
  t: 'blue_2',
  Y: 'hivis_3',
  P: 'blue_2',
  p: 'blue_1',
  m: 'ink',
};
const IDEOLOGUE_HEAD = [
  '..kkkkk..',
  '.kHHHHHk.',
  'kHHHHHhhk',
  'kHHSSSSSk',
  'kHSSSSkSk',
  'kSSSSSSSk',
  '.kSSSSkkk',
  '..kSSSSk.',
  '...kkkk..',
];
const IDEOLOGUE_SHOUTING = [
  '..kkkkk..',
  '.kHHHHHk.',
  'kHHHHHhhk',
  'kHHSSSSSk',
  'kHSSSSkkk',
  'kSSSSSSSk',
  '.kSSSkRRk',
  '..kSSkRRk',
  '...kkkkk.',
];
const IDEOLOGUE_UPPER = [
  '...kWWWWk...',
  '..kTWYYWTk..',
  '.kTTTYYTTTk.',
  '.kTtTYYTTtk.',
  '.kTtTYYTTtk.',
  '.kTtTTYTTtk.',
  '.kStTTTTTSk.',
  '..kkTTTTkk..',
  '...kkkkkk...',
];
const IDEOLOGUE_ARM_UP = [
  '...kWWWWk...',
  '..kTWYYWTkk.',
  '.kTTTYYTTTSk',
  '.kTtTYYTTkk.',
  '.kTtTYYTTtk.',
  '.kTtTTYTTtk.',
  '.ktTTTTTTtk.',
  '..kkTTTTkk..',
  '...kkkkkk...',
];
const MEGAPHONE = ['..kk', 'kkRk', 'kWRk', 'kkRk', '..kk'];

// For each enemy type, its looks (one per colour variant): `move` frames
// played as it moves, `act` while it throws or shouts, `defeated`.
export const ENEMY_ART = {
  stoner: [
    enemy([
      frame(STONER, 'stoner', { head: STONER_HEAD, upper: STONER_UPPER, legs: 'stand', extras: smoke([[13, 11], [14, 9], [13, 7]]) }),
      frame(STONER, 'stoner', { head: STONER_HEAD, upper: STONER_UPPER, legs: 'stand', headDrop: 1, extras: smoke([[14, 10], [13, 8], [14, 5]]) }),
    ]),
  ],
  dealer: [
    enemy([
      frame(DEALER, 'dealer', { head: DEALER_HEAD, upper: DEALER_UPPER, legs: 'stand' }),
      frame(DEALER, 'dealer', { head: DEALER_HEAD, upper: DEALER_UPPER, legs: 'step', headDrop: 1 }),
    ]),
  ],
  partyPerson: PARTY_COLOURS.map((colours) => {
    const legend = { ...PARTY, ...colours };
    return enemy([
      frame(legend, 'party', { head: PARTY_HEAD, upper: PARTY_UPPER, legs: 'stand' }),
      frame(legend, 'party', {
        head: PARTY_HEAD,
        upper: PARTY_UPPER_ARMS_UP,
        legs: 'step',
        extras: [{ rows: PARTY_ARMS_UP, x: 0, y: 4 }],
      }),
    ]);
  }),
  bureaucrat: [
    enemy(
      [frame(BUREAUCRAT, 'bureaucrat', { head: BUREAUCRAT_HEAD, upper: BUREAUCRAT_UPPER, legs: 'stand' })],
      frame(BUREAUCRAT, 'bureaucrat', { head: BUREAUCRAT_HEAD, upper: BUREAUCRAT_THROW, legs: 'stand' }),
    ),
  ],
  technician: [
    enemy(
      [
        frame(TECHNICIAN, 'technician', { head: TECHNICIAN_HEAD, upper: TECHNICIAN_UPPER, legs: 'stand' }),
        frame(TECHNICIAN, 'technician', { head: TECHNICIAN_HEAD, upper: TECHNICIAN_UPPER, legs: 'step', headDrop: 1 }),
      ],
      frame(TECHNICIAN, 'technician', { head: TECHNICIAN_HEAD, upper: TECHNICIAN_THROW, legs: 'stand' }),
    ),
  ],
  ideologue: [
    enemy(
      [
        frame(IDEOLOGUE, 'ideologue', { head: IDEOLOGUE_HEAD, upper: IDEOLOGUE_UPPER, legs: 'stand' }),
        frame(IDEOLOGUE, 'ideologue', { head: IDEOLOGUE_HEAD, upper: IDEOLOGUE_UPPER, legs: 'step', headDrop: 1 }),
      ],
      frame(IDEOLOGUE, 'ideologue', {
        head: IDEOLOGUE_SHOUTING,
        upper: IDEOLOGUE_ARM_UP,
        legs: 'stand',
        extras: [{ rows: MEGAPHONE, x: 12, y: 5 }],
      }),
    ),
  ],
};

// A picture turned a quarter clockwise.
function turned(image) {
  const result = createImage(image.height, image.width);
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) setPixel(result, image.height - 1 - y, x, getPixel(image, x, y));
  }
  return result;
}

const THROWN = {
  k: 'ink',
  W: 'white',
  g: 'grey_4',
  l: 'sky_4',
  s: 'slime_3',
  S: 'slime_4',
  R: 'red_3',
};
const thrown = (name, rows) => parsePixels(rows, THROWN, `projectile ${name}`);

const TUBE = thrown('tube', ['kkkk', 'kWlk', 'kllk', 'kllk', 'kssk', 'kssk', 'kSsk', '.kk.']);

// What enemies throw, as frames played in turn while it flies; each is
// drawn centred on where it is.
export const PROJECTILE_ART = {
  paper: {
    fps: 6,
    frames: [
      thrown('paper', ['kkkkkkk.', 'kWWWWWkk', 'kWggggWk', 'kWWWWWWk', 'kWggWWWk', 'kkkkkkkk']),
      thrown('paper turned', ['.kkkkkkk', 'kkWWWWWk', 'kWggggWk', 'kWWWWWWk', 'kWWWggWk', 'kkkkkkkk']),
    ],
  },
  tube: { fps: 10, frames: [TUBE, turned(TUBE)] },
  shout: {
    fps: 8,
    frames: [
      thrown('shout', ['.kkkkkk.', 'kWWkkWWk', 'kWWkRWWk', 'kWWkRWWk', 'kWWWWWWk', 'kWWkRWWk', '.kkkkkkk', '..kk....', '.k......']),
      thrown('shout loud', ['.kkkkkk.', 'kWWkkWWk', 'kWWkRWWk', 'kWWkRWWk', 'kWWWWWWk', 'kWWkRWWk', '.kkkkkkk', '...kk...', '....k...']),
    ],
  },
};
