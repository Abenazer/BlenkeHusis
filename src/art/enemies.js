// The enemies and what they throw, drawn in code. Each enemy is put
// together from parts like Blenke (a head, an upper body and a pose of the
// legs, the legs shared by all and coloured by each one's legend) in a
// 16×24 frame that hangs from the middle of its feet, facing right. Each
// has frames for moving, one for throwing or shouting where it does, and
// a defeated one: itself squashed flat. The prosecutor, a miniboss, is
// bigger and drawn in a frame of his own, with pips for the hits he has
// left. Pure: no DOM.
import { createImage, getPixel, parsePixels, setPixel, stamp } from '../pixels.js';

export const ENEMY_SIZE = { width: 16, height: 24 };
export const ENEMY_PIVOT = { x: 8, y: 24 };
export const BOSS_SIZE = { width: 24, height: 32 };

// The size of an enemy type's frames; each hangs from the middle of its
// bottom edge.
export function enemyFrameSize(type) {
  return type === 'prosecutor' ? BOSS_SIZE : ENEMY_SIZE;
}

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

// The citizens (art/citizens.js) are put together the same way.
export { frame as personFrame };

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

// The prosecutor: grey hair combed back, heavy brows, a black suit and a
// purple tie, and a fat red binder of charges under his arm, which he
// raises over his head to throw.
const PROSECUTOR = {
  k: 'ink',
  H: 'grey_4',
  h: 'grey_3',
  S: 'skin_4',
  d: 'skin_3',
  W: 'white',
  T: 'grey_2',
  t: 'grey_1',
  V: 'purple_3',
  R: 'red_3',
  r: 'red_2',
  P: 'grey_1',
  m: 'ink',
};
const PROSECUTOR_HEAD = [
  '..kkkkkk..',
  '.kHHHHHHk.',
  'kHHHHHhhHk',
  'kHhSSSSSSk',
  'kHSkkSkkSk',
  'kHSSkSSkSk',
  'kSSSSSSSSk',
  '.kSSSSSdSk',
  '.kSSkkkkSk',
  '..kSSSSSk.',
  '...kkkkk..',
];
const PROSECUTOR_UPPER = [
  '....kWWWWk....',
  '..kkTWVVWTkk..',
  '.kTTTWVVWTTTk.',
  'kTTtTTVVTTtTTk',
  'kTtTTTVVTTTtTk',
  'kTtTTTVVTTTtTk',
  'kTtTTTTVTTTtTk',
  'kTtTTTTTTTTtTk',
  'kTtTTTkTTTTtTk',
  'kTtTTTTTTTTtTk',
  'kSkTTTTTTTTkSk',
  '.k.kTTTTTTk.k.',
  '...kkkkkkkk...',
];
const PROSECUTOR_UPPER_THROW = [
  '....kWWWWk....',
  '..kkTWVVWTkkk.',
  '.kTTTWVVWTTTTk',
  'kTTtTTVVTTTTk.',
  'kTtTTTVVTTTk..',
  'kTtTTTVVTTTk..',
  'kTtTTTTVTTTk..',
  'kTtTTTTTTTTk..',
  'kTtTTTkTTTTk..',
  'kTtTTTTTTTTk..',
  'kSkTTTTTTTTk..',
  '.k.kTTTTTTk...',
  '...kkkkkkkk...',
];
const PROSECUTOR_LEGS = {
  stand: [
    '.kPPPPPPk.',
    '.kPPkkPPk.',
    '.kPPkkPPk.',
    '.kPPkkPPk.',
    '.kPPkkPPk.',
    '.kmmkkmmk.',
    'kmmmkkmmmk',
    'kkkkkkkkkk',
  ],
  step: [
    '.kPPPPPPk.',
    '.kPPkkPPk.',
    'kPPk..kPPk',
    'kPPk..kPPk',
    'kPPk..kPPk',
    'kmmk..kmmk',
    'kmmmk.kmmk',
    'kkkkk.kkkk',
  ],
};
const BINDER_UNDER_ARM = ['kkkkk', 'kRRWk', 'kRRWk', 'kRrWk', 'kRrWk', 'kRrWk', 'kRRWk', 'kRRWk', 'kkkkk'];
const BINDER_RAISED = ['kkkkkkkk', 'kRRRRRRk', 'kWWWWWWk', 'kRRrrRRk', 'kkkkkkkk'];
const ARM_RAISED = ['kSSk', 'kTTk', 'kTTk', 'kTTk', 'kTTk', 'kTTk', 'kTTk'];

function prosecutorFrame(legs, throwing, headDrop = 0) {
  const image = createImage(BOSS_SIZE.width, BOSS_SIZE.height);
  const part = (rows, label) => parsePixels(rows, PROSECUTOR, `prosecutor ${label}`);
  stamp(image, part(PROSECUTOR_LEGS[legs], `legs ${legs}`), 7, 24);
  stamp(image, part(throwing ? PROSECUTOR_UPPER_THROW : PROSECUTOR_UPPER, 'upper'), 5, 11);
  stamp(image, part(PROSECUTOR_HEAD, 'head'), 7, headDrop);
  if (throwing) {
    stamp(image, part(ARM_RAISED, 'arm'), 17, 5);
    stamp(image, part(BINDER_RAISED, 'binder'), 15, 0);
  } else {
    stamp(image, part(BINDER_UNDER_ARM, 'binder'), 1, 14 + headDrop);
  }
  return image;
}

// The hippie: long hair under a red headband, a flowery tunic, flared
// jeans, bare feet and a guitar; he sits down cross-legged to play it.
const HIPPIE = {
  k: 'ink',
  H: 'brown_3',
  h: 'brown_2',
  R: 'red_3',
  S: 'skin_4',
  d: 'skin_3',
  T: 'purple_4',
  t: 'purple_3',
  f: 'orange_3',
  P: 'blue_4',
  p: 'blue_3',
  m: 'skin_3',
  G: 'brown_4',
};
const HIPPIE_HEAD = [
  '..kkkkk..',
  '.kHHHHHk.',
  'kRRRRRRRk',
  'kHSSSSSHk',
  'kHSkSkSHk',
  'kHSSSSSHk',
  'kHSkkkSHk',
  'kHhSSShHk',
  '.khk.khk.',
];
const HIPPIE_UPPER = [
  '...kTTTTk...',
  '..kTTfTTTk..',
  '.kTfTTTTfTk.',
  '.kTtTTfTTtk.',
  '.kTtfTTTTtk.',
  '.kTtTTTfTtk.',
  '.kStTTTTTSk.',
  '..kTTfTTTk..',
  '...kkkkkk...',
];
// Held at his side as he walks, and across his lap as he plays.
const GUITAR_HELD = ['....kk', '...khk', '..khk.', 'kkkkk.', 'kGGhk.', 'kGhGk.', 'kGGGk.', '.kkk..'];
const GUITAR_LAP = ['kk.........', 'khk..kkkk..', '.khkkGGGGk.', '..kkGGhGGGk', '....kGGGGk.', '.....kkkk..'];
const CROSSED_LEGS = ['..kPPPPPPPPk..', '.kmPPpkkpPPmk.', '.kkkkkkkkkkkk.'];

// Sitting: everything lower, the legs crossed under him, the guitar on
// his knees.
function hippieSitting() {
  const image = createImage(ENEMY_SIZE.width, ENEMY_SIZE.height);
  const part = (rows, label) => parsePixels(rows, HIPPIE, `hippie sitting ${label}`);
  stamp(image, part(CROSSED_LEGS, 'legs'), 1, 21);
  stamp(image, part(HIPPIE_UPPER, 'upper'), 2, 12);
  stamp(image, part(HIPPIE_HEAD, 'head'), 4, 4);
  stamp(image, part(GUITAR_LAP, 'guitar'), 4, 16);
  return image;
}

// The headbanger: long hair, a denim vest over a black band T-shirt,
// jeans and white trainers. He bangs his head (the hair falls over his
// face) and dives flat through the air.
const HEADBANGER = {
  k: 'ink',
  H: 'urine_2',
  h: 'urine_1',
  S: 'skin_4',
  V: 'blue_3',
  v: 'blue_2',
  T: 'grey_1',
  W: 'white',
  P: 'blue_4',
  p: 'blue_3',
  m: 'white',
};
const HEADBANGER_HEAD = [
  '..kkkkk..',
  '.kHHHHHk.',
  'kHHHHHHHk',
  'kHSSSSSHk',
  'kHSkSkSHk',
  'kHSSSSSHk',
  'kHSSkSSHk',
  'kHHSSSHHk',
  'kHHkkkHHk',
];
const HEADBANGER_BANGING = [
  '..kkkkk..',
  '.kHHHHHk.',
  'kHHHHHHHk',
  'kHHHHHHHk',
  'kHhHHHhHk',
  'kHHHHHHHk',
  'kHhHHHhHk',
  'kHHhHhHHk',
  '.kHkHkHk.',
];
const HEADBANGER_UPPER = [
  '...kTTTTk...',
  '..kVTTTTVk..',
  '.kVVTWWTVVk.',
  '.kVvTTTTvVk.',
  '.kSvTWWTvSk.',
  '.kSvTTTTvSk.',
  '.kSvTTTTvSk.',
  '..kVTTTTVk..',
  '...kkkkkk...',
];
// Flat through the air, arms out ahead, facing right.
const HEADBANGER_DIVE = [
  '..........kkkk..',
  '.........kHHHHk.',
  'kk.kkkkkkHHSSSkk',
  'kWkPPPPPVTVHSkSk',
  'kWkPPpPPVTVHSSSk',
  'kk.kkkkkVVVkSSk.',
  '........kSSSSSSk',
  '........kkkkkkk.',
];

function headbangerDiving() {
  const image = createImage(ENEMY_SIZE.width, ENEMY_SIZE.height);
  stamp(image, parsePixels(HEADBANGER_DIVE, HEADBANGER, 'headbanger diving'), 0, 10);
  return image;
}

// A note rising from the hippie's guitar while he plays.
export const MUSIC_NOTE = parsePixels(['..kkk..', '..kWWk.', '..kWkWk', '..kWk.k', 'kkkWk..', 'kWWWk..', 'kWWWk..', '.kkk...'], { k: 'ink', W: 'white' }, 'music note');

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
  prosecutor: [enemy([prosecutorFrame('stand', false), prosecutorFrame('step', false, 1)], prosecutorFrame('stand', true))],
  hippie: [
    enemy(
      [
        frame(HIPPIE, 'hippie', { head: HIPPIE_HEAD, upper: HIPPIE_UPPER, legs: 'stand', extras: [{ rows: GUITAR_HELD, x: 10, y: 11 }] }),
        frame(HIPPIE, 'hippie', { head: HIPPIE_HEAD, upper: HIPPIE_UPPER, legs: 'step', headDrop: 1, extras: [{ rows: GUITAR_HELD, x: 10, y: 12 }] }),
      ],
      hippieSitting(),
    ),
  ],
  headbanger: [
    enemy(
      [
        frame(HEADBANGER, 'headbanger', { head: HEADBANGER_HEAD, upper: HEADBANGER_UPPER, legs: 'stand' }),
        frame(HEADBANGER, 'headbanger', { head: HEADBANGER_BANGING, upper: HEADBANGER_UPPER, legs: 'stand', headDrop: 2 }),
      ],
      headbangerDiving(),
    ),
  ],
};

const PIP = { k: 'ink', R: 'red_3', r: 'red_4', G: 'grey_3' };

// The hits a boss has left, shown as pips over his head: full or spent.
export const BOSS_PIPS = {
  full: parsePixels(['.kkk.', 'kRrRk', 'kRRRk', '.kkk.'], PIP, 'pip'),
  spent: parsePixels(['.kkk.', 'kGGGk', 'kGGGk', '.kkk.'], PIP, 'pip spent'),
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

// A binder of charges: a red cover with a label and a ring, its pages
// showing along the side.
const BINDER = thrown('binder', [
  'kkkkkkkkk.',
  'kRRRRRRRkk',
  'kRWWWWWRkW',
  'kRWkkkWRkW',
  'kRWWWWWRkW',
  'kRRRRRRRkW',
  'kRRRRRRRkW',
  'kRRRkRRRkW',
  'kRRkWkRRkW',
  'kRRRkRRRkW',
  'kRRRRRRRkk',
  'kkkkkkkkk.',
]);

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
  binder: { fps: 8, frames: [BINDER, turned(BINDER)] },
  brief: {
    fps: 8,
    frames: [
      thrown('brief', ['kkkkkkkkkkkkk.', 'kWWWWWWWWWWWkk', 'kWggggggWggWWk', 'kWWWWWWWWWWWWk', 'kWgggWWRRWWWWk', 'kkkkkkkkkkkkkk']),
      thrown('brief flapping', ['.kkkkkkkkkkkk.', 'kkWWWWWWWWWWWk', 'kWggggggWggWWk', 'kWWWWWWWWWWWWk', 'kWgggWWRRWWWkk', 'kkkkkkkkkkkkk.']),
    ],
  },
  shout: {
    fps: 8,
    frames: [
      thrown('shout', ['.kkkkkk.', 'kWWkkWWk', 'kWWkRWWk', 'kWWkRWWk', 'kWWWWWWk', 'kWWkRWWk', '.kkkkkkk', '..kk....', '.k......']),
      thrown('shout loud', ['.kkkkkk.', 'kWWkkWWk', 'kWWkRWWk', 'kWWkRWWk', 'kWWWWWWk', 'kWWkRWWk', '.kkkkkkk', '...kk...', '....k...']),
    ],
  },
};
