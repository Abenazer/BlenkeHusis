// The escalator, drawn in code until the asset factory delivers it (batch
// 25): a step seen from the side, drawn moving along the slope, and for
// each tile of the escalator its side panel under the steps and its
// handrail above, for an escalator rising to the right; mirrored for one
// rising to the left. Pure: no DOM.
import { colour } from '../palette.js';
import { createImage, fillRect, mirrored, setPixel } from '../pixels.js';
import { STEP_PITCH } from '../escalators.js';

// How far above the slope the handrail runs, and how far below it the
// side panel reaches; a tile's piece hangs this far above its tile.
export const RAIL_HEIGHT = 20;
const PANEL_DEPTH = 16;
const TILE_SIZE = 16;

// A step: its ribbed tread on top, its riser below, reaching down past
// the slope to the side panel, which is drawn over its foot; so the steps
// stacked along the slope make one band.
export const STEP_DEPTH = 2 * STEP_PITCH;
function step() {
  const image = createImage(STEP_PITCH, STEP_DEPTH);
  fillRect(image, 0, 0, STEP_PITCH, 1, colour('grey_6'));
  for (let x = 0; x < STEP_PITCH; x++) setPixel(image, x, 1, colour(x % 2 === 0 ? 'grey_4' : 'grey_3'));
  fillRect(image, 0, 2, STEP_PITCH, STEP_DEPTH - 2, colour('grey_2'));
  fillRect(image, 0, 2, 1, STEP_DEPTH - 2, colour('grey_3'));
  return image;
}

// One tile's side panel and handrail, the slope running from its bottom
// left to its top right; placed RAIL_HEIGHT above the tile's top.
function piece() {
  const image = createImage(TILE_SIZE, RAIL_HEIGHT + TILE_SIZE + PANEL_DEPTH);
  for (let x = 0; x < TILE_SIZE; x++) {
    // The row the slope leaves the column by: so the mirrored piece fits
    // a slope rising to the left as exactly.
    const slope = RAIL_HEIGHT + TILE_SIZE - 1 - x;
    fillRect(image, x, slope - RAIL_HEIGHT, 1, 2, colour('ink'));
    setPixel(image, x, slope - RAIL_HEIGHT + 2, colour('grey_1'));
    // A post every half tile holds the rail up.
    if (x % STEP_PITCH === 4) fillRect(image, x, slope - RAIL_HEIGHT + 3, 1, RAIL_HEIGHT - 3, colour('grey_3'));
    fillRect(image, x, slope + STEP_PITCH, 1, PANEL_DEPTH - STEP_PITCH - 1, colour('blue_2'));
    setPixel(image, x, slope + STEP_PITCH, colour('grey_4'));
    setPixel(image, x, slope + PANEL_DEPTH - 1, colour('ink'));
  }
  return image;
}

const STEP_RIGHT = step();
const PIECE_RIGHT = piece();

// By which way the escalator rises: right (slope -1) or left (slope 1).
export const ESCALATOR_ART = {
  step: { right: STEP_RIGHT, left: mirrored(STEP_RIGHT) },
  piece: { right: PIECE_RIGHT, left: mirrored(PIECE_RIGHT) },
};
