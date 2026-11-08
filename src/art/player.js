// Blenke, drawn in code until the asset factory's sheet is approved: the
// same frame size (24×32), pivot (the middle of his feet) and animation
// names as the factory's player.json (games/blenkehusis/exports/sprites/
// characters/player/), so its sheet can take this one's place. He faces
// right; the page mirrors him to face left. Each frame is put together from
// parts (head, upper body, a pose of the legs) moved a pixel or two, as a
// walk cycle bobs and a run leans. Pure: no DOM.
import { createImage, parsePixels, stamp } from '../pixels.js';

export const PLAYER_SIZE = { width: 24, height: 32 };
export const PLAYER_PIVOT = { x: 12, y: 32 };

const LEGEND = {
  k: 'ink',
  n: 'blue_1',
  b: 'blue_2',
  B: 'blue_3',
  S: 'skin_4',
  s: 'skin_3',
  d: 'skin_2',
  h: 'brown_2',
  c: 'brown_3',
  y: 'hivis_3',
  v: 'hivis_2',
  w: 'grey_5',
  m: 'grey_1',
  u: 'urine_3',
  U: 'urine_4',
};

const part = (name, rows) => parsePixels(rows, LEGEND, `player ${name}`);

// The cap with its badge, a moustache and a look that takes the job
// seriously. It is the HUD's icon for lives too.
export const PLAYER_HEAD = part('head', [
  '.kkkkkk...',
  'kbBBBBbk..',
  'kBBBUBBk..',
  'knnnnnnnkk',
  'khssssssk.',
  'khSSSSkSSk',
  'kSSSSSSSk.',
  'kSSShhhk..',
  '.kdSSSk...',
]);

const HEAD_BLINK = part('head blink', [
  '.kkkkkk...',
  'kbBBBBbk..',
  'kBBBUBBk..',
  'knnnnnnnkk',
  'khssssssk.',
  'khSSSShSSk',
  'kSSSSSSSk.',
  'kSSShhhk..',
  '.kdSSSk...',
]);

// Hit: eyes wide, the moustache over an open mouth.
const HEAD_HURT = part('head hurt', [
  '.kkkkkk...',
  'kbBBBBbk..',
  'kBBBUBBk..',
  'knnnnnnnkk',
  'khssssssk.',
  'khSSSkkSk.',
  'kSSSSSSSk.',
  'kSSShhhk..',
  '.kdSSkk...',
]);

// Reflective vest over a belly, the clipboard held at his back, the belt
// with its buckle and the urine sample bag on his hip.
const UPPER = part('upper', [
  '.....knnnnk.....',
  '....kbbyyyyyk...',
  '.kkkbbyyyyyyyk..',
  '.kwcBbyyyyyyyk..',
  '.kwcBbyyyyyyyyk.',
  '.kwcBbwwwwwwwwk.',
  '.kwcbbyyyyyyyyk.',
  '.kwcSbvyyyyyyyk.',
  '.kkkkdvvyyyyyk..',
  '....kmmmmmmUmmk.',
  '....kbbbbbbbbkuk',
  '....kbbbbbbbbkUk',
]);

// Leg poses, 14 pixels wide. The near leg has a blue_3 front edge.
const LEGS = {
  stand: part('legs stand', [
    '..kbbbbbbbbk..',
    '..kbbbkbbbBk..',
    '..kbbbkbbbBk..',
    '..kbbbkbbbBk..',
    '..kmmmkmmmmmk.',
    '..kkkkkkkkkkk.',
  ]),
  strideNear: part('legs stride near', [
    '..kbbbbbbbbk..',
    '.kbbbbkkbbbBk.',
    '.kbbbk..kbbBk.',
    'kbbbk....kbBk.',
    'kmmmk....kmmmk',
    'kkkk.....kkkkk',
  ]),
  strideFar: part('legs stride far', [
    '..kbbbbbbbbk..',
    '.kBbbbkkbbbbk.',
    '.kBbbk..kbbbk.',
    'kBbbk....kbbk.',
    'kmmmk....kmmmk',
    'kkkk.....kkkkk',
  ]),
  passNear: part('legs pass near', [
    '..kbbbbbbbbk..',
    '..kbbbkbbbBk..',
    '..kbbbkbbbBk..',
    '..kbbbkkmmmmk.',
    '..kmmmkkkkkk..',
    '..kkkkk.......',
  ]),
  passFar: part('legs pass far', [
    '..kbbbbbbbbk..',
    '..kbbbkbbbBk..',
    '..kbbbkbbbBk..',
    '.kmmmkkbbbBk..',
    '.kkkk.kmmmmk..',
    '......kkkkkk..',
  ]),
  runNear: part('legs run near', [
    '..kbbbbbbbbk..',
    '.kbbbbbkbbbBk.',
    'kbbbk...kbbBk.',
    'kmmk.....kbBk.',
    'kkk......kmmmk',
    '.........kkkkk',
  ]),
  runFar: part('legs run far', [
    '..kbbbbbbbbk..',
    '.kBbbbbkbbbbk.',
    'kBbbk...kbbbk.',
    'kmmk.....kbbk.',
    'kkk......kmmmk',
    '.........kkkkk',
  ]),
  tuck: part('legs tuck', [
    '..kbbbbbbbbk..',
    '.kbbbbkbbbbBk.',
    'kbbbk.kbbbBBk.',
    'kbbk...kkmmmk.',
    'kmmk....kkkk..',
    'kkk...........',
  ]),
  dangle: part('legs dangle', [
    '..kbbbbbbbbk..',
    '.kbbbbkkbbbBk.',
    '.kbbbk..kbbBk.',
    '.kbbbk..kbbBk.',
    '.kmmmk..kmmmmk',
    '.kkkkk..kkkkkk',
  ]),
};

// Crouched, the upper body folds onto the thighs; the two boot rows make
// the crawl.
const CROUCH_BODY = [
  '..kkkkbbyyyyyk..',
  '..kcwcbyyyyyyyk.',
  '..kcwcBwwwwwwwwk',
  '..kcwcSvyyyyyyyk',
  '..kkkkmmmmmUmmkk',
  '.kbbbbbbbbbbbbbk',
];
const CROUCH_BOOTS = {
  apart: 'kmmmmkkkkkkkmmmk',
  together: '.kkmmmmkkkmmmmk.',
};

// Where the parts sit in an upright frame.
const HEAD_AT = { x: 8, y: 5 };
const UPPER_AT = { x: 4, y: 14 };
const LEGS_AT = { x: 6, y: 26 };

// lift raises the whole of him (off the ground mid-stride); bob lowers the
// upper body onto the legs; lean moves it forward.
function upright({ legs, head = PLAYER_HEAD, bob = 0, lean = 0, lift = 0 }) {
  const frame = createImage(PLAYER_SIZE.width, PLAYER_SIZE.height);
  stamp(frame, LEGS[legs], LEGS_AT.x, LEGS_AT.y - lift);
  stamp(frame, UPPER, UPPER_AT.x + lean, UPPER_AT.y + bob - lift);
  stamp(frame, head, HEAD_AT.x + lean, HEAD_AT.y + bob - lift);
  return frame;
}

function crouched(boots) {
  const frame = createImage(PLAYER_SIZE.width, PLAYER_SIZE.height);
  stamp(frame, part('crouch body', [...CROUCH_BODY, CROUCH_BOOTS[boots]]), 4, 25);
  stamp(frame, PLAYER_HEAD, 9, 16);
  return frame;
}

export const PLAYER_FRAMES = {
  idle_1: upright({ legs: 'stand' }),
  idle_2: upright({ legs: 'stand', bob: 1 }),
  idle_3: upright({ legs: 'stand', head: HEAD_BLINK }),
  walk_1: upright({ legs: 'strideNear', bob: 1 }),
  walk_2: upright({ legs: 'passNear' }),
  walk_3: upright({ legs: 'strideFar', bob: 1 }),
  walk_4: upright({ legs: 'passFar' }),
  run_1: upright({ legs: 'runNear', lean: 1, bob: 1 }),
  run_2: upright({ legs: 'passNear', lean: 1, lift: 1 }),
  run_3: upright({ legs: 'runFar', lean: 1, bob: 1 }),
  run_4: upright({ legs: 'passFar', lean: 1, lift: 1 }),
  jump_1: upright({ legs: 'tuck' }),
  fall_1: upright({ legs: 'dangle' }),
  hurt_1: upright({ legs: 'tuck', head: HEAD_HURT, lean: -1, lift: 1 }),
  crouch_1: crouched('apart'),
  crouch_2: crouched('together'),
};

// The same shape as the factory's sheet: frames in playing order (a frame
// may come back), and how fast and whether each plays on.
export const PLAYER_ANIMATIONS = {
  idle: ['idle_1', 'idle_1', 'idle_2', 'idle_2', 'idle_1', 'idle_1', 'idle_2', 'idle_2', 'idle_3', 'idle_1', 'idle_2', 'idle_2'],
  walk: ['walk_1', 'walk_2', 'walk_3', 'walk_4'],
  run: ['run_1', 'run_2', 'run_3', 'run_4'],
  jump: ['jump_1'],
  fall: ['fall_1'],
  crouch: ['crouch_1', 'crouch_2'],
  hurt: ['hurt_1'],
};

export const PLAYER_PLAYBACK = {
  idle: { fps: 4, loop: true },
  walk: { fps: 8, loop: true },
  run: { fps: 12, loop: true },
  jump: { fps: 1, loop: false },
  fall: { fps: 1, loop: false },
  crouch: { fps: 6, loop: true },
  hurt: { fps: 1, loop: false },
};
