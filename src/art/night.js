// Night: what each colour of the master palette becomes in the dark,
// another of its colours, darker and bluer. A night level's tiles are
// drawn in these colours until the asset factory delivers their night
// sheets (batch 24). Ink stays ink, so outlines keep their edge. Pure: no
// DOM.
import { PALETTE } from '../palette.js';

// What's left of a colour's light, and the night's blue added to it.
const LIGHT = 0.55;
const NIGHT_BLUE = [6, 10, 34];

const rgb = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));

const light = (hex) => rgb(hex).reduce((sum, value) => sum + value, 0);

// The palette colour nearest the target, of those no lighter than day's.
function nearest(target, day) {
  let best = null;
  let distance = Infinity;
  for (const hex of Object.values(PALETTE)) {
    if (light(hex) > light(day)) continue;
    const d = rgb(hex).reduce((sum, value, i) => sum + (value - target[i]) ** 2, 0);
    if (d < distance) {
      distance = d;
      best = hex;
    }
  }
  return best;
}

// '#rrggbb' to '#rrggbb', both palette colours.
export const NIGHT_COLOURS = Object.freeze(Object.fromEntries(Object.values(PALETTE).map((hex) => [
  hex,
  hex === PALETTE.ink ? hex : nearest(rgb(hex).map((value, i) => value * LIGHT + NIGHT_BLUE[i]), hex),
])));
