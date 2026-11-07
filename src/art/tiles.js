// The suburb's tiles, drawn in code: lawn over soil, red brick, concrete,
// asphalt with its kerb, concrete balconies and wooden planks. 16×16 and no
// outline, so they join without seams (as the asset factory's tiles do).
// Solid tiles have a look for their top surface and one for underneath, in
// a couple of variants so a long stretch doesn't repeat. Pure: no DOM.
import { TILE } from '../config.js';
import { colour } from '../palette.js';
import { createImage, fillRect, noise, setPixel } from '../pixels.js';

function tile(paint) {
  const image = createImage(TILE, TILE);
  paint(image);
  return image;
}

// Picks a colour per pixel from noise: each [threshold, name] wins where the
// noise is below its threshold, the base colour elsewhere.
function speckle(image, seed, base, specks, top = 0) {
  for (let y = top; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const n = noise(x, y, seed);
      const hit = specks.find(([threshold]) => n < threshold);
      setPixel(image, x, y, colour(hit ? hit[1] : base));
    }
  }
}

function soil(image, seed, top = 0) {
  speckle(image, seed, 'brown_2', [[0.1, 'brown_1'], [0.16, 'brown_3']], top);
  // A stone in some tiles.
  if (noise(seed, 3) < 0.5) return;
  const stoneX = 2 + Math.floor(noise(seed, 1) * 10);
  const stoneY = Math.max(top + 2, 4 + Math.floor(noise(seed, 2) * 9));
  fillRect(image, stoneX, stoneY, 3, 2, colour('grey_3'));
  fillRect(image, stoneX, stoneY, 2, 1, colour('grey_4'));
  setPixel(image, stoneX, stoneY, colour('grey_5'));
}

// Grass: a ragged lawn edge with tufts, over the soil.
function lawn(image, seed) {
  soil(image, seed, 0);
  for (let x = 0; x < TILE; x++) {
    const depth = 5 + Math.floor(noise(x, 0, seed + 7) * 3);
    const tuft = noise(x, 1, seed + 3) < 0.3;
    for (let y = tuft ? 0 : 1; y < depth; y++) {
      const shade = y === 0 || (y === 1 && !tuft) ? 'grass_4' : y >= depth - 1 ? 'grass_2' : 'grass_3';
      setPixel(image, x, y, colour(shade));
    }
    if (noise(x, 2, seed) < 0.25) setPixel(image, x, 2, colour('grass_4'));
    setPixel(image, x, depth, colour('grass_1'));
  }
}

// Red brick, 8×4 with mortar, every other course shifted half a brick.
function brick(image, seed, withCap) {
  fillRect(image, 0, 0, TILE, TILE, colour('grey_3'));
  for (let course = 0; course < 4; course++) {
    const shift = course % 2 === 0 ? 0 : 4;
    for (let b = -1; b < 2; b++) {
      const x0 = b * 8 + shift;
      const y0 = course * 4;
      const tone = noise(b + 2, course, seed) < 0.3 ? 'red_2' : 'red_3';
      fillRect(image, x0, y0, 7, 3, colour(tone));
      fillRect(image, x0, y0, 7, 1, colour(tone === 'red_3' ? 'red_4' : 'red_3'));
    }
  }
  if (withCap) {
    fillRect(image, 0, 0, TILE, 3, colour('grey_4'));
    fillRect(image, 0, 0, TILE, 1, colour('grey_5'));
    fillRect(image, 0, 3, TILE, 1, colour('grey_2'));
  }
}

// Concrete slab: flat grey with pores, lit from above.
function concrete(image, seed, withTop) {
  speckle(image, seed, 'grey_4', [[0.06, 'grey_3'], [0.09, 'grey_5']]);
  fillRect(image, 0, TILE - 1, TILE, 1, colour('grey_3'));
  fillRect(image, TILE - 1, 0, 1, TILE, colour('grey_3'));
  if (withTop) {
    fillRect(image, 0, 0, TILE, 1, colour('grey_6'));
    fillRect(image, 0, 1, TILE, 1, colour('grey_5'));
  }
}

// Asphalt; on top, a granite kerb.
function asphalt(image, seed, withKerb) {
  speckle(image, seed, 'grey_2', [[0.12, 'grey_1'], [0.18, 'grey_3']]);
  if (withKerb) {
    fillRect(image, 0, 0, TILE, 4, colour('grey_4'));
    fillRect(image, 0, 0, TILE, 1, colour('grey_5'));
    fillRect(image, 0, 4, TILE, 1, colour('grey_1'));
    setPixel(image, 7, 1, colour('grey_3'));
    setPixel(image, 7, 2, colour('grey_3'));
    setPixel(image, 7, 3, colour('grey_3'));
  }
}

// A balcony slab sticking out of a block of flats, on two brackets.
function balcony(image) {
  fillRect(image, 0, 0, TILE, 1, colour('grey_6'));
  fillRect(image, 0, 1, TILE, 2, colour('grey_5'));
  fillRect(image, 0, 3, TILE, 1, colour('grey_4'));
  fillRect(image, 0, 4, TILE, 1, colour('grey_2'));
  for (const x of [2, 12]) {
    fillRect(image, x, 5, 2, 1, colour('grey_3'));
    setPixel(image, x, 6, colour('grey_3'));
  }
}

// A plank with its nails.
function plank(image) {
  fillRect(image, 0, 0, TILE, 1, colour('brown_4'));
  fillRect(image, 0, 1, TILE, 3, colour('brown_3'));
  fillRect(image, 0, 4, TILE, 1, colour('brown_1'));
  fillRect(image, 3, 2, 5, 1, colour('brown_2'));
  fillRect(image, 10, 3, 4, 1, colour('brown_2'));
  setPixel(image, 1, 2, colour('grey_5'));
  setPixel(image, 14, 2, colour('grey_5'));
  fillRect(image, 0, 0, 1, 4, colour('brown_2'));
}

const VARIANTS = [11, 29, 47, 83];

// For each tile character: `top` where nothing solid lies above it, `fill`
// underneath; one-way platforms only have `top`.
export const TILE_ART = {
  '#': {
    top: VARIANTS.map((seed) => tile((image) => lawn(image, seed))),
    fill: VARIANTS.map((seed) => tile((image) => soil(image, seed))),
  },
  B: {
    top: VARIANTS.map((seed) => tile((image) => brick(image, seed, true))),
    fill: VARIANTS.map((seed) => tile((image) => brick(image, seed, false))),
  },
  Z: {
    top: VARIANTS.map((seed) => tile((image) => concrete(image, seed, true))),
    fill: VARIANTS.map((seed) => tile((image) => concrete(image, seed, false))),
  },
  A: {
    top: VARIANTS.map((seed) => tile((image) => asphalt(image, seed, true))),
    fill: VARIANTS.map((seed) => tile((image) => asphalt(image, seed, false))),
  },
  '-': { top: [tile(balcony)] },
  _: { top: [tile(plank)] },
};

// Which variant a tile at col, row uses: fixed per place, so the ground
// doesn't change as the view scrolls.
export function variantAt(variants, col, row) {
  return variants[Math.floor(noise(col, row, 5) * variants.length)];
}
