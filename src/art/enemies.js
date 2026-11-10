// The enemies and what they throw, drawn in code. Each enemy is put
// together from parts like Blenke (a head, an upper body and a pose of the
// legs, the legs shared by all and coloured by each one's legend) in a
// 16×24 frame that hangs from the middle of its feet, facing right. Each
// has frames for moving, one for throwing or shouting where it does, and
// a defeated one: itself squashed flat. The prosecutor, a miniboss, is
// bigger and drawn in a frame of his own, with pips for the hits he has
// left. Pure: no DOM.
import { createImage, getPixel, mirrored, parsePixels, setPixel, stamp } from '../pixels.js';

export const ENEMY_SIZE = { width: 16, height: 24 };
export const ENEMY_PIVOT = { x: 8, y: 24 };
export const BOSS_SIZE = { width: 24, height: 32 };
// The raggare's car.
export const CAR_SIZE = { width: 48, height: 24 };
// The progg activist under her banner.
export const BANNER_SIZE = { width: 32, height: 36 };
const FRAME_SIZES = { prosecutor: BOSS_SIZE, raggare: CAR_SIZE, proggActivist: BANNER_SIZE };

// The size of an enemy type's frames; each hangs from the middle of its
// bottom edge.
export function enemyFrameSize(type) {
  return FRAME_SIZES[type] ?? ENEMY_SIZE;
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

// The punk: a tall green mohawk, eyeliner, a leather jacket full of
// safety pins, red tartan trousers and boots; her legs tuck as she pogos.
const PUNK = {
  k: 'ink',
  G: 'slime_4',
  g: 'slime_3',
  S: 'skin_4',
  J: 'grey_2',
  j: 'grey_1',
  W: 'grey_5',
  P: 'red_3',
  p: 'red_2',
  m: 'grey_1',
};
const PUNK_HEAD = [
  '...kGk...',
  '...kGk...',
  '..kkgkk..',
  '.kSSgSSk.',
  'kSkkSkkSk',
  'kSSSSSSSk',
  'kSSkkkSSk',
  '.kSSSSSk.',
  '..kkkkk..',
];
const PUNK_UPPER = [
  '...kJJJJk...',
  '..kJJWJJJk..',
  '.kJJjWjJJJk.',
  '.kJjJJJJWjk.',
  '.kJjWJJJJjk.',
  '.kJjJJJWJjk.',
  '.kSjJJJJJSk.',
  '..kkJJJJkk..',
  '...kkkkkk...',
];

// A note rising from the hippie's guitar while he plays.
export const MUSIC_NOTE = parsePixels(['..kkk..', '..kWWk.', '..kWkWk', '..kWk.k', 'kkkWk..', 'kWWWk..', 'kWWWk..', '.kkk...'], { k: 'ink', W: 'white' }, 'music note');

// The synth: a pale face, black eyeliner, a black fringe over one eye, a
// long grey coat and a white keytar, raised to play.
const SYNTH = {
  k: 'ink',
  H: 'grey_1',
  S: 'skin_5',
  d: 'skin_4',
  T: 'grey_3',
  t: 'grey_2',
  W: 'white',
  R: 'red_3',
  V: 'purple_4',
  P: 'grey_1',
  p: 'grey_2',
  m: 'ink',
};
const SYNTH_HEAD = [
  '..kkkkk..',
  '.kHHHHHk.',
  'kHHHHHHHk',
  'kHSSHHHHk',
  'kHkSkHHHk',
  'kHSSSSHHk',
  'kSSSSSSHk',
  '.kSdkdSk.',
  '..kSSSk..',
];
const SYNTH_UPPER = [
  '...kTTTTk...',
  '..kTTVVTTk..',
  '.kTTTVVTTTk.',
  '.kTtTVVTTtk.',
  '.kTtTTTTTtk.',
  '.kTtTTTTTtk.',
  '.kStTTTTTSk.',
  '..kTTTTTTk..',
  '..kTTTTTTk..',
];
const COAT_HEM = ['.kTtTTTtk.', '.kkkkkkkk.'];
const KEYTAR = ['.......kk', '......kWk', '.....kWk.', 'kkkkkWk..', 'kWkWkk...', 'kkkkk....'];
const KEYTAR_RAISED = ['......kRk', '......kWk', '.....kWk.', 'kkkkkWk..', 'kWkWkk...', 'kkkkk....'];

function synthFrame(legs, keytar, keytarY, headDrop = 0) {
  return frame(SYNTH, 'synth', {
    head: SYNTH_HEAD,
    upper: SYNTH_UPPER,
    legs,
    headDrop,
    extras: [{ rows: COAT_HEM, x: 3, y: 17 }, { rows: keytar, x: 6, y: keytarY }],
  });
}

// The breakdancer: a red cap, a blue tracksuit with white stripes, white
// trainers. He spins upside down on a piece of cardboard and freezes with
// his arms crossed.
const BREAKDANCER = {
  k: 'ink',
  R: 'red_3',
  r: 'red_2',
  S: 'skin_2',
  h: 'skin_1',
  T: 'blue_3',
  t: 'blue_2',
  W: 'white',
  P: 'blue_3',
  p: 'blue_2',
  m: 'white',
  C: 'brown_4',
  c: 'brown_3',
};
const BREAKDANCER_HEAD = [
  '..kkkkk..',
  '.kRRRRRk.',
  'kRRRRRRRk',
  'krrkSSSSk',
  'kkSkSSkSk',
  'kSSSSSSSk',
  'kSSSSSSSk',
  '.kSSkkSk.',
  '..kSSSk..',
];
const BREAKDANCER_UPPER = [
  '...kTTTTk...',
  '..kTTWWTTk..',
  '.kTTTWWTTTk.',
  '.kWtTWWTTWk.',
  '.kWtTWWTTWk.',
  '.kWtTTTTTWk.',
  '.kStTTTTTSk.',
  '..kkTTTTkk..',
  '...kkkkkk...',
];
const BREAKDANCER_ARMS_CROSSED = [
  '...kTTTTk...',
  '..kTTWWTTk..',
  '.kTTTWWTTTk.',
  '.kTkkkkkkTk.',
  '.kTSWWWWSTk.',
  '.kTkkkkkkTk.',
  '.kTtTTTTtTk.',
  '..kkTTTTkk..',
  '...kkkkkk...',
];
const CARDBOARD = ['kkkkkkkkkkkkkkkk', 'kCcCCcCCCcCCcCCk'];

// A picture turned upside down.
function upsideDown(image) {
  const result = createImage(image.width, image.height);
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) setPixel(result, x, image.height - 1 - y, getPixel(image, x, y));
  }
  return result;
}

// Spinning: himself upside down, his head on the cardboard, his legs
// apart and together, turned each way in turn.
function breakdancerSpinning() {
  const pose = (legs) => frame(BREAKDANCER, 'breakdancer', { head: BREAKDANCER_HEAD, upper: BREAKDANCER_UPPER, legs });
  const cardboard = parsePixels(CARDBOARD, BREAKDANCER, 'breakdancer cardboard');
  return [pose('step'), mirrored(pose('stand'))].map((image) => {
    const spinning = createImage(ENEMY_SIZE.width, ENEMY_SIZE.height);
    stamp(spinning, upsideDown(image), 0, -2);
    stamp(spinning, cardboard, 0, ENEMY_SIZE.height - cardboard.height);
    return spinning;
  });
}

// The raver: a yellow bucket hat, a whistle, a smiley T-shirt, wide
// purple trousers and a glow stick in each hand, one raised to throw.
const RAVER = {
  k: 'ink',
  Y: 'urine_3',
  y: 'urine_2',
  S: 'skin_4',
  W: 'white',
  T: 'urine_4',
  t: 'urine_3',
  G: 'slime_4',
  B: 'water_4',
  P: 'purple_3',
  p: 'purple_2',
  m: 'white',
};
const RAVER_HEAD = [
  '..kkkkk..',
  '.kYYYYYk.',
  'kyYYYYYyk',
  'kkkkkkkkk',
  '.kSkSSkSk',
  '.kSSSSSSk',
  '.kSSSkWWk',
  '..kSSSSk.',
  '...kkkk..',
];
const RAVER_UPPER = [
  '...kTTTTk...',
  '..kTTTTTTk..',
  '.kTTkTTkTTk.',
  '.kTtTTTTTtk.',
  '.kTtkTTkTtk.',
  '.kTtTkkTTtk.',
  'kGStTTTTTSBk',
  'kGktTTTTtkBk',
  '.k.kkkkkk.k.',
];
const RAVER_ARM_UP = [
  '...kTTTTk.k.',
  '..kTTTTTkGk.',
  '.kTTkTTkkGk.',
  '.kTtTTTTkSk.',
  '.kTtkTTkTk..',
  '.kTtTkkTTtk.',
  'kBStTTTTTtk.',
  'kBktTTTTtkk.',
  '.k.kkkkkk...',
];

// The goth: black hair, a white face with dark eyes and purple lips, black
// from head to toe, a silver crucifix and a book of poems.
const GOTH = {
  k: 'ink',
  H: 'grey_1',
  W: 'grey_6',
  V: 'purple_2',
  T: 'grey_2',
  t: 'grey_1',
  C: 'grey_5',
  B: 'purple_3',
  P: 'grey_1',
  p: 'ink',
  m: 'grey_2',
};
const GOTH_HEAD = [
  '..kkkkk..',
  '.kHHHHHk.',
  'kHHHHHHHk',
  'kHWWWWWHk',
  'kHkWWkWHk',
  'kHWWWWWHk',
  'kHWWVVWHk',
  'kHHWWWHHk',
  '.kHkkkHk.',
];
const GOTH_UPPER = [
  '...kTTTTk...',
  '..kTTTTTTk..',
  '.kTTTTCTTTk.',
  '.kTtTCCCTtk.',
  '.kTtTTCTTtk.',
  '.kTtTTCTTtk.',
  '.kWtTTTTTWk.',
  '..kTTTTTTk..',
  '...kkkkkk...',
];
const POEMS = ['kkkk', 'kBBk', 'kBCk', 'kBBk', 'kkkk'];

// The raggare's car: a long red 1950s American wagon with tail fins and
// chrome, its wheels turning, and him at the wheel, his quiff black and a
// can in his hand out of the window.
const CAR = {
  k: 'ink',
  R: 'red_3',
  r: 'red_2',
  O: 'orange_3',
  W: 'grey_6',
  B: 'sky_3',
  b: 'sky_4',
  S: 'skin_4',
  G: 'urine_3',
  m: 'grey_2',
  g: 'grey_4',
};
const CAR_ROWS = [
    '.......kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk.......',
    '......kRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRk......',
    '.....kRRbbbbbbbbbbbbRRbbbbbkkkkbbbbbRRRRRRk.....',
    '..kkkkRRBBBBBBBBBBBBRRBBBBBSSkSBBBBBRBBBBRk.....',
    '.kRRRRRRBBBBBBBBBBBBRRBBBBBSSSSBBGBBRBBBBRk.....',
    '.kRRRRRRBBBBBBBBBBBBRRBBBBBSSSSSSGBBRBBBBRk.....',
    '.kRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRkkkk..',
    '.kWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWk.',
    '.krORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRWk.',
    '.kORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRWk.',
    '.krrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrk.',
    '.krrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrk.',
    'kWWWWWWWkkkkkkkWWWWWWWWWWWWWWWWWWkkkkkkkWWWWWWWk',
    '.kkkkkkkkmmmmmkkkkkkkkkkkkkkkkkkkkmmmmmkkkkkkkk.',
    '........kmgggmk..................kmgggmk........',
    '........kmmmmmk..................kmmmmmk........',
    '........kkkkkkk..................kkkkkkk........',
    '.........kkkkk....................kkkkk.........',
];
const CAR_ROWS_TURNED = [
    '.......kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk.......',
    '......kRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRk......',
    '.....kRRbbbbbbbbbbbbRRbbbbbkkkkbbbbbRRRRRRk.....',
    '..kkkkRRBBBBBBBBBBBBRRBBBBBSSkSBBBBBRBBBBRk.....',
    '.kRRRRRRBBBBBBBBBBBBRRBBBBBSSSSBBGBBRBBBBRk.....',
    '.kRRRRRRBBBBBBBBBBBBRRBBBBBSSSSSSGBBRBBBBRk.....',
    '.kRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRkkkk..',
    '.kWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWk.',
    '.krORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRWk.',
    '.kORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRWk.',
    '.krrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrk.',
    '.krrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrk.',
    'kWWWWWWWkkkkkkkWWWWWWWWWWWWWWWWWWkkkkkkkWWWWWWWk',
    '.kkkkkkkkmmmmmkkkkkkkkkkkkkkkkkkkkmmmmmkkkkkkkk.',
    '........kgmgmgk..................kgmgmgk........',
    '........kmmmmmk..................kmmmmmk........',
    '........kkkkkkk..................kkkkkkk........',
    '.........kkkkk....................kkkkk.........',
];

function carFrame(rows, name) {
  const image = createImage(CAR_SIZE.width, CAR_SIZE.height);
  stamp(image, parsePixels(rows, CAR, name), 0, CAR_SIZE.height - rows.length);
  return image;
}

// The progg activist: long brown hair, a knitted sweater, a long red
// scarf, jeans and clogs, and a banner on a pole held high, its slogan in
// red on white.
const PROGG = {
  k: 'ink',
  H: 'brown_2',
  h: 'brown_1',
  S: 'skin_4',
  T: 'brown_4',
  t: 'brown_3',
  R: 'red_3',
  r: 'red_2',
  W: 'grey_6',
  w: 'grey_5',
  c: 'brown_3',
  P: 'blue_4',
  p: 'blue_3',
  m: 'brown_2',
};
const PROGG_HEAD = [
  '..kkkkk..',
  '.kHHHHHk.',
  'kHHHHHHHk',
  'kHSSSSSHk',
  'kHSkSSkHk',
  'kHSSSSSHk',
  'kHSSkkSHk',
  'kHHSSSHHk',
  'kHHkkkHHk',
];
const PROGG_UPPER = [
  '...kRRRRk...',
  '..kTRRRRTk..',
  '.kTtTRrTtTk.',
  '.kTTtRrtTTk.',
  '.kTtTRrTtTk.',
  '.kTTtRrtTTk.',
  '.kStTRrTtSk.',
  '..kkTRrTkk..',
  '...kkkkkk...',
];
const BANNER = [
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  'kWWWWWWWWWWWWWWWWWWWWWWWWWWWWk',
  'kWRRWRWRRWWRRWRRWWRWRRWRRWRRwk',
  'kWRWWRWRWRWRWWRWRWRWRWWRWRWWwk',
  'kWRRWRRRRWWRRWRRWWRRWRRRWRRWwk',
  'kWWWWWWWWWWWWWWWWWWWWWWWWWWWwk',
  'kwwwwwwwwwwwwwwwwwwwwwwwwwwwwk',
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
];
const POLE = ['kck', 'kck', 'kck', 'kck', 'kck', 'kck', 'kck', 'kck', 'kck', 'kck', 'kck', 'kck', 'kck', 'kck', 'kck', 'kck', 'kck'];

// She marches under her banner: herself at the bottom of the frame, the
// pole up from her hand, the banner on top.
function proggFrame(legs, headDrop) {
  const image = createImage(BANNER_SIZE.width, BANNER_SIZE.height);
  const part = (rows, label) => parsePixels(rows, PROGG, `progg activist ${label}`);
  const marcher = frame(PROGG, 'progg activist', { head: PROGG_HEAD, upper: PROGG_UPPER, legs, headDrop });
  stamp(image, part(POLE, 'pole'), 19, 7);
  stamp(image, marcher, (BANNER_SIZE.width - ENEMY_SIZE.width) / 2, BANNER_SIZE.height - ENEMY_SIZE.height);
  stamp(image, part(['kSSk', 'kSSk', '.kk.'], 'hand'), 18, 23 + headDrop);
  stamp(image, part(BANNER, 'banner'), 1, headDrop);
  return image;
}

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
  punk: [
    enemy([
      frame(PUNK, 'punk', { head: PUNK_HEAD, upper: PUNK_UPPER, legs: 'stand' }),
      frame(PUNK, 'punk', { head: PUNK_HEAD, upper: PUNK_UPPER, legs: 'step', headDrop: 1 }),
    ]),
  ],
  synth: [enemy([synthFrame('stand', KEYTAR, 12), synthFrame('step', KEYTAR, 12)], synthFrame('stand', KEYTAR_RAISED, 9))],
  raver: [
    enemy(
      [
        frame(RAVER, 'raver', { head: RAVER_HEAD, upper: RAVER_UPPER, legs: 'stand' }),
        frame(RAVER, 'raver', { head: RAVER_HEAD, upper: RAVER_UPPER, legs: 'step', headDrop: 1 }),
      ],
      frame(RAVER, 'raver', { head: RAVER_HEAD, upper: RAVER_ARM_UP, legs: 'stand' }),
    ),
  ],
  goth: [
    enemy([
      frame(GOTH, 'goth', { head: GOTH_HEAD, upper: GOTH_UPPER, legs: 'stand', extras: [{ rows: POEMS, x: 11, y: 13 }] }),
      frame(GOTH, 'goth', { head: GOTH_HEAD, upper: GOTH_UPPER, legs: 'step', headDrop: 1, extras: [{ rows: POEMS, x: 11, y: 14 }] }),
    ]),
  ],
  raggare: [enemy([carFrame(CAR_ROWS, 'car'), carFrame(CAR_ROWS_TURNED, 'car wheels turned')])],
  proggActivist: [enemy([proggFrame('stand', 0), proggFrame('step', 1)])],
  // Lying flat, he is drawn standing; spinning he would squash to a smear.
  breakdancer: [
    {
      move: breakdancerSpinning(),
      act: frame(BREAKDANCER, 'breakdancer', { head: BREAKDANCER_HEAD, upper: BREAKDANCER_ARMS_CROSSED, legs: 'stand' }),
      defeated: squashed(frame(BREAKDANCER, 'breakdancer', { head: BREAKDANCER_HEAD, upper: BREAKDANCER_UPPER, legs: 'stand' })),
    },
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
  V: 'purple_4',
  v: 'purple_3',
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
  // The raver's glow stick, flying or lying, its light pulsing.
  glowStick: {
    fps: 4,
    frames: [
      thrown('glow stick', ['.kkkkkk.', 'kSSSSSSk', 'kSsSSSSk', '.kkkkkk.']),
      thrown('glow stick bright', ['.kkkkkk.', 'kWSSSSWk', 'kSSWWSSk', '.kkkkkk.']),
    ],
  },
  // The synth's square wave, its corners glowing.
  wave: {
    fps: 8,
    frames: [
      thrown('wave', ['.kkkkk..', '.kVVVk..', 'kkVkVkkk', 'kVvkVVVk', 'kkkkkkkk']),
      thrown('wave bright', ['.kkkkk..', '.kWWWk..', 'kkWkWkkk', 'kWVkWWWk', 'kkkkkkkk']),
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
