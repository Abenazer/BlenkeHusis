// The cover a screen fades in from: the palette's ink in an ordered dither,
// the way a 16-bit game fades without blending colours. Level 0 covers
// nothing, FADE_LEVELS covers the whole view, and each level covers every
// pixel the one below it does.
import { VIEW_HEIGHT, VIEW_WIDTH } from '../config.js';
import { colour } from '../palette.js';
import { createImage, setPixel } from '../pixels.js';

export const FADE_LEVELS = 16;

// A 4×4 Bayer matrix: the order the pixels of each 4×4 block are covered in.
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export function fadeImage(level) {
  return ditherImage(VIEW_WIDTH, VIEW_HEIGHT, level);
}

// The same ink at a level over any size: a dark passage's cover
// (darkness.js), whole tiles and their 4×4 blocks. Its size a whole number
// of 4×4 blocks, so pieces laid side by side keep the pattern.
export function ditherImage(width, height, level) {
  const image = createImage(width, height);
  const ink = colour('ink');
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (BAYER[y % 4][x % 4] < level) setPixel(image, x, y, ink);
    }
  }
  return image;
}
