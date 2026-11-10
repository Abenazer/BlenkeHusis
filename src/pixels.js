// Pixel images as plain data: a width, a height and one colour (or null,
// transparent) per pixel, row by row. All the game's art is made as these,
// from text pixel maps or by small drawing functions, and the page layer
// turns each into a canvas once. Pure: no DOM, so the art can be tested.
import { colour } from './palette.js';

export const TRANSPARENT = '.';

export function createImage(width, height) {
  return { width, height, pixels: new Array(width * height).fill(null) };
}

// A text pixel map: one character per pixel, '.' transparent, every other
// character looked up in the legend (character to palette name).
export function parsePixels(rows, legend, name = 'image') {
  if (!rows || rows.length === 0) throw new Error(`Pixel map ${name} has no rows`);
  const width = rows[0].length;
  const image = createImage(width, rows.length);
  rows.forEach((line, y) => {
    if (line.length !== width) {
      throw new Error(`Pixel map ${name} row ${y} is ${line.length} wide, expected ${width}`);
    }
    for (let x = 0; x < width; x++) {
      const char = line[x];
      if (char === TRANSPARENT) continue;
      if (!(char in legend)) {
        throw new Error(`Pixel map ${name} has '${char}' at ${x},${y}, which its legend lacks`);
      }
      image.pixels[y * width + x] = colour(legend[char]);
    }
  });
  return image;
}

// A pixel image from RGBA bytes, as a canvas holds a delivered sheet's
// frame: each pixel with any opacity as its hex colour, the rest
// transparent.
export function fromRgba(data, width, height) {
  const image = createImage(width, height);
  for (let index = 0; index < width * height; index++) {
    if (data[index * 4 + 3] === 0) continue;
    image.pixels[index] = `#${[0, 1, 2].map((channel) => data[index * 4 + channel].toString(16).padStart(2, '0')).join('')}`;
  }
  return image;
}

export function getPixel(image, x, y) {
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) return null;
  return image.pixels[y * image.width + x];
}

// Outside the image does nothing, so drawing functions needn't clip.
export function setPixel(image, x, y, value) {
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) return;
  image.pixels[y * image.width + x] = value;
}

export function fillRect(image, x, y, width, height, value) {
  for (let row = y; row < y + height; row++) {
    for (let col = x; col < x + width; col++) setPixel(image, col, row, value);
  }
}

// A one-pixel ring of a palette colour round an image's outline,
// diagonals too, so the result is one pixel bigger on every side: drawn
// behind the image, one pixel up and to the left of it.
export function outline(image, colourName) {
  const value = colour(colourName);
  const ring = createImage(image.width + 2, image.height + 2);
  const solid = (x, y) => getPixel(image, x - 1, y - 1) !== null;
  for (let y = 0; y < ring.height; y++) {
    for (let x = 0; x < ring.width; x++) {
      if (solid(x, y)) continue;
      let beside = false;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) beside ||= solid(x + dx, y + dy);
      }
      if (beside) setPixel(ring, x, y, value);
    }
  }
  return ring;
}

// Draws one image onto another at x, y; transparent pixels leave what is
// underneath.
export function stamp(target, source, x, y) {
  for (let row = 0; row < source.height; row++) {
    for (let col = 0; col < source.width; col++) {
      const value = source.pixels[row * source.width + col];
      if (value !== null) setPixel(target, x + col, y + row, value);
    }
  }
  return target;
}

export function mirrored(image) {
  const result = createImage(image.width, image.height);
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      result.pixels[y * image.width + x] = image.pixels[y * image.width + (image.width - 1 - x)];
    }
  }
  return result;
}

export function coloursIn(image) {
  return new Set(image.pixels.filter((value) => value !== null));
}

// Deterministic noise in [0, 1) for a pixel position and a seed, so drawn
// textures look random but come out the same every time and in every test.
export function noise(x, y, seed = 0) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
