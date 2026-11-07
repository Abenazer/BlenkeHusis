// What shows a power-up at work, drawn around Blenke: the helicopter's
// rotor over his cap, coffee steam, a form circling him as a shield, a
// banknote circling him on a budget, the swollen sample bag at his hip,
// and the sparkle over hidden things that mandatory testing shows. Pure:
// no DOM.
import { parsePixels } from '../pixels.js';

const LEGEND = {
  k: 'ink',
  W: 'white',
  w: 'grey_5',
  G: 'grey_3',
  R: 'red_3',
  e: 'grass_4',
  E: 'grass_3',
  U: 'urine_4',
  u: 'urine_3',
  o: 'urine_2',
  y: 'hivis_3',
};

const art = (name, rows) => parsePixels(rows, LEGEND, `effect ${name}`);

// Frames are played in turn; a still effect has one.
export const EFFECT_ART = {
  // Blades a-blur, on a mast that stands on his cap.
  rotor: {
    fps: 16,
    frames: [
      art('rotor', ['GGGGGGGGGkkGGGGGGGGG', '.........kk.........', '.........kk.........']),
      art('rotor turned', ['.....GGGGkkGGGG.....', '.........kk.........', '.........kk.........']),
    ],
  },
  steam: {
    fps: 4,
    frames: [
      art('steam', ['.w...', 'w.w..', '.w.w.', '..w..', '.w...', 'w....']),
      art('steam drifted', ['..w..', '.w.w.', 'w..w.', '.w...', '..w..', '.w...']),
    ],
  },
  shield: { fps: 1, frames: [art('shield', ['kkkkk.', 'kWWWkk', 'kWGGWk', 'kWWWWk', 'kWGRWk', 'kWWRWk', 'kkkkkk'])] },
  note: { fps: 1, frames: [art('note', ['kkkkkkkk', 'keeWWeek', 'keEWWEek', 'kkkkkkkk'])] },
  bag: { fps: 1, frames: [art('bag', ['.kkk...', 'kUUUk..', 'kUWUUk.', 'kUUUuuk', 'kUUuuuk', 'kUuuuok', 'kuuuook', '.kooook', '..kkkk.'])] },
  sparkle: {
    fps: 6,
    frames: [
      art('sparkle', ['..W..', '..y..', 'WyWyW', '..y..', '..W..']),
      art('sparkle small', ['.....', '..y..', '.yWy.', '..y..', '.....']),
    ],
  },
};
