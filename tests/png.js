// Reads the PNG sheets the asset factory delivers, for the tests (not a
// test file itself: node --test only runs *.test.js). Only what the factory
// writes: 8-bit RGBA, not interlaced. Each pixel becomes a palette-style
// hex colour, or null where it is transparent, as src/pixels.js images are.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { inflateSync } from 'node:zlib';
import { deliveredSheets, MANIFEST, sheetFrames, SPRITES_PATH } from '../src/sprites.js';

const SIGNATURE = '89504e470d0a1a0a';
const RGBA = 6;
const CHANNELS = 4;

function paeth(left, up, upLeft) {
  const estimate = left + up - upLeft;
  const toLeft = Math.abs(estimate - left);
  const toUp = Math.abs(estimate - up);
  const toUpLeft = Math.abs(estimate - upLeft);
  if (toLeft <= toUp && toLeft <= toUpLeft) return left;
  return toUp <= toUpLeft ? up : upLeft;
}

// Undoes each row's filter, in place, row by row.
function unfilter(data, width, height) {
  const stride = width * CHANNELS;
  const out = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = data[y * (stride + 1)];
    const row = data.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const left = x >= CHANNELS ? out[y * stride + x - CHANNELS] : 0;
      const up = y > 0 ? out[(y - 1) * stride + x] : 0;
      const upLeft = x >= CHANNELS && y > 0 ? out[(y - 1) * stride + x - CHANNELS] : 0;
      const predictors = [0, left, up, (left + up) >> 1, paeth(left, up, upLeft)];
      if (predictors[filter] === undefined) throw new Error(`Unknown PNG filter ${filter} on row ${y}`);
      out[y * stride + x] = (row[x] + predictors[filter]) & 0xff;
    }
  }
  return out;
}

// { width, height, pixels }; a pixel that is neither opaque nor fully
// transparent is refused, since the game's art has no such pixels.
export function readPng(buffer, name = 'png') {
  if (buffer.subarray(0, 8).toString('hex') !== SIGNATURE) throw new Error(`${name} is not a PNG`);
  let offset = 8;
  let header = null;
  const compressed = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      header = { width: data.readUInt32BE(0), height: data.readUInt32BE(4), depth: data[8], colourType: data[9], interlace: data[12] };
    } else if (type === 'IDAT') {
      compressed.push(data);
    }
    offset += 12 + length;
  }
  if (!header || header.depth !== 8 || header.colourType !== RGBA || header.interlace !== 0) {
    throw new Error(`${name} is not 8-bit RGBA without interlacing`);
  }
  const { width, height } = header;
  const raw = unfilter(inflateSync(Buffer.concat(compressed)), width, height);
  const pixels = [];
  for (let i = 0; i < width * height; i++) {
    const [r, g, b, a] = raw.subarray(i * CHANNELS, (i + 1) * CHANNELS);
    if (a !== 0 && a !== 255) throw new Error(`${name} has a half-transparent pixel at ${i % width}, ${Math.floor(i / width)}`);
    pixels.push(a === 0 ? null : `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`);
  }
  return { width, height, pixels };
}

// The part of an image inside a rectangle { x, y, w, h }.
export function crop(image, { x, y, w, h }) {
  const pixels = [];
  for (let row = y; row < y + h; row++) pixels.push(...image.pixels.slice(row * image.width + x, row * image.width + x + w));
  return { width: w, height: h, pixels };
}

// The delivered sheets, each read: { sprite: { description, picture,
// frames, images } }, its frames' rectangles and each frame as an image.
export function loadDelivered() {
  const manifest = JSON.parse(readFileSync(join(SPRITES_PATH, MANIFEST), 'utf8'));
  return Object.fromEntries(deliveredSheets(manifest).map((sheet) => {
    const description = JSON.parse(readFileSync(join(SPRITES_PATH, sheet.description), 'utf8'));
    const picture = readPng(readFileSync(join(SPRITES_PATH, sheet.image)), sheet.image);
    const frames = sheetFrames(description);
    const images = Object.fromEntries(Object.entries(frames).map(([name, frame]) => [name, crop(picture, frame)]));
    return [sheet.sprite, { description, picture, frames, images }];
  }));
}
