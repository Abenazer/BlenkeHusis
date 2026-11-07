// The citizens Blenke can help, drawn like the enemies (art/enemies.js),
// in the same 16×24 frame hanging from the middle of their feet: standing,
// and waving for attention while they plead. Pure: no DOM.
import { personFrame } from './enemies.js';

// The pensioner: white hair, glasses, a beige coat and a walking stick.
const PENSIONER = {
  k: 'ink',
  H: 'grey_5',
  h: 'grey_4',
  S: 'skin_4',
  d: 'skin_3',
  G: 'grey_3',
  W: 'white',
  T: 'brown_4',
  t: 'brown_3',
  c: 'brown_2',
  P: 'purple_2',
  p: 'purple_1',
  m: 'brown_1',
};
const PENSIONER_HEAD = [
  '..kkkkk..',
  '.kHHHHHk.',
  'kHHhHHHHk',
  'kHSSSSSHk',
  'kHGWGGWGk',
  'kHSSSSSSk',
  'kSSSdSSSk',
  '.kSSkkSk.',
  '..kSSSk..',
];
const PENSIONER_UPPER = [
  '...kTTTTk...',
  '..kTTTTTTk..',
  '.kTTTtTTTTk.',
  '.kTtTTTTTtk.',
  '.kTtTTtTTtk.',
  '.kTtTTTTTtSk',
  '.kSTTTTTTkck',
  '..kkTTTTkkck',
  '...kkkkkk.ck',
];
const PENSIONER_WAVING = [
  '.kkkTTTTk...',
  '.kTTTTTTTk..',
  '.kTTTtTTTTk.',
  '.kTtTTTTTtk.',
  '.kTtTTtTTtk.',
  '.kTtTTTTTtSk',
  '..kTTTTTTkck',
  '..kkTTTTkkck',
  '...kkkkkk.ck',
];
const STICK = { rows: ['c', 'c', 'c', 'c', 'c', 'c', 'c'], x: 13, y: 17 };
const RAISED_ARM = { rows: ['kSk', 'kSk', 'kTk', 'kTk', 'kTk'], x: 1, y: 3 };

// For each citizen type: `stand` and `wave`, facing right.
export const CITIZEN_ART = {
  pensioner: {
    stand: personFrame(PENSIONER, 'pensioner', { head: PENSIONER_HEAD, upper: PENSIONER_UPPER, legs: 'stand', extras: [STICK] }),
    wave: personFrame(PENSIONER, 'pensioner', {
      head: PENSIONER_HEAD,
      upper: PENSIONER_WAVING,
      legs: 'stand',
      extras: [STICK, RAISED_ARM],
    }),
  },
};
