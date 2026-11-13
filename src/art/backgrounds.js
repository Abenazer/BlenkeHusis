// The backdrop layers the asset factory hasn't delivered yet, drawn in
// code: Hanveden's forested ridge on the countryside's horizon and the
// fields before the forest's edge (ordered as batch 12). Each layer
// repeats sideways and moves by a share of the camera's movement (factor),
// so nearer layers pass faster: parallax. The other layers are only the
// factory's sheets. Pure: no DOM.
import { TILE } from '../config.js';
import { colour } from '../palette.js';
import { createImage, fillRect, noise, setPixel } from '../pixels.js';

// A layer wraps sideways, so what is drawn near one edge comes round at
// the other.
function setWrapped(image, x, y, value) {
  setPixel(image, ((x % image.width) + image.width) % image.width, y, value);
}

// A spruce's silhouette, its tip at (x, top), widening by a pixel every
// other row down to the ground, the edge ragged with branches. A branch
// sticks out only on a row the next one widens past, so none overhangs a
// gap the sky would show through.
function spruce(image, x, top, ground, body, shade, seed) {
  for (let y = top; y < ground; y++) {
    const row = y - top;
    const half = Math.floor(row / 2) + (row % 2 === 1 && noise(x, y, seed) < 0.4 ? 1 : 0);
    for (let dx = -half; dx <= half; dx++) setWrapped(image, x + dx, y, dx > 0 ? shade : body);
  }
}

// Hanveden on the horizon: a long forested ridge, hazy blue with
// distance, its line rising and falling and ragged with spruce tops.
// Solid below its line, so it covers the sky down to the fields.
function hanveden() {
  const width = 28 * TILE;
  const height = 40;
  const image = createImage(width, height);
  const body = colour('water_3');
  const shade = colour('water_2');
  // Whole waves across the width, so the ridge meets itself as it repeats.
  const ridge = (x) => Math.round(14 - 5 * Math.sin((2 * Math.PI * x) / width) - 3 * Math.sin((6 * Math.PI * x) / width + 1));
  for (let x = 0; x < width; x++) fillRect(image, x, ridge(x), 1, height - ridge(x), body);
  for (let x = 0; x < width; x += 3) {
    const tall = 2 + Math.floor(noise(x, 0, 21) * 4);
    spruce(image, x, ridge(x) - tall, height, body, body, 21);
  }
  // A darker fold of the forest lower down, where the ridge turns away.
  for (let x = 0; x < width; x++) {
    const fold = ridge(x) + 10 + Math.round(2 * Math.sin((4 * Math.PI * x) / width));
    fillRect(image, x, fold, 1, height - fold, shade);
    if (noise(x, 1, 22) < 0.5) setPixel(image, x, fold - 1, shade);
  }
  return image;
}

// A field's patch: its crop's colour and the rows drawn across it.
const CROPS = [
  { ground: 'grass_3', marks: 'grass_4', every: 3 },  // pasture
  { ground: 'urine_3', marks: 'urine_2', every: 2 },  // ripe rye
  { ground: 'hivis_2', marks: 'grass_4', every: 2 },  // oats, still green
  { ground: 'brown_3', marks: 'brown_2', every: 2 },  // ploughed
  { ground: 'brown_4', marks: 'urine_3', every: 3 },  // stubble
];

// A red barn with white corners and a dark roof, its gable to the view.
function barn(image, x, ground) {
  fillRect(image, x, ground - 9, 20, 9, colour('red_3'));
  fillRect(image, x + 18, ground - 9, 2, 9, colour('red_2'));
  fillRect(image, x, ground - 9, 1, 9, colour('white'));
  fillRect(image, x + 19, ground - 9, 1, 9, colour('white'));
  fillRect(image, x + 8, ground - 5, 4, 5, colour('red_2'));
  for (let row = 0; row < 6; row++) fillRect(image, x - 1 + row, ground - 15 + row, 22 - 2 * row, 1, colour('grey_2'));
}

// Fields in front of Hanveden: the forest's edge, spruce and leafy trees,
// then strips of fields towards the view, deeper as they come nearer,
// patched with crops and parted by hedgerows; a barn among them.
function fields() {
  const width = 20 * TILE;
  const height = 72;
  const image = createImage(width, height);
  const edge = 20;
  const strips = [edge, 24, 28, 33, 39, 46, 54, 63, height];
  // The fields, strip by strip, each cut into patches of one crop.
  strips.slice(0, -1).forEach((top, strip) => {
    const bottom = strips[strip + 1];
    const last = strip === strips.length - 2;
    let crop = Math.floor(noise(strip, 0, 31) * CROPS.length);
    for (let x = 0; x < width; x++) {
      // Patches change crop at a few places along the strip, never in the last.
      if (!last && x % 16 === 0 && noise(x, strip, 32) < 0.3) crop = (crop + 1 + Math.floor(noise(x, strip, 33) * 3)) % CROPS.length;
      const { ground, marks, every } = last ? CROPS[0] : CROPS[crop];
      fillRect(image, x, top, 1, bottom - top, colour(ground));
      for (let y = top + 1; y < bottom - (last ? 3 : 0); y += every) {
        if (noise(x, y, 34) < 0.6) setPixel(image, x, y, colour(marks));
      }
    }
    // The hedgerow along the strip's top, a bush here and there.
    for (let x = 0; x < width; x++) {
      setPixel(image, x, top, colour('grass_2'));
      if (noise(x >> 2, strip, 35) < 0.25) setPixel(image, x, top - 1, colour('grass_2'));
    }
  });
  barn(image, 212, 33);
  // The forest's edge along the back of the fields: spruce, and leafy
  // trees in rounded crowns between them.
  fillRect(image, 0, edge - 4, width, 4, colour('grass_2'));
  for (let x = 0; x < width; x += 4) {
    if (noise(x, 0, 36) < 0.35) {
      const r = 3 + Math.floor(noise(x, 1, 36) * 2);
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy <= r * r) setWrapped(image, x + dx, edge - 4 - r + dy + 2, colour(dx + dy < 0 ? 'grass_3' : 'grass_2'));
        }
      }
    } else {
      const top = 8 + Math.floor(noise(x, 2, 36) * 6);
      spruce(image, x, top, edge, colour('grass_2'), colour('grass_1'), 37);
    }
  }
  return image;
}

// Far off on the horizon, between the clouds and the flats: a landmark from
// the asset factory's sheet (HORIZON_SPRITE; nothing stands in for it in
// code). It stands by its origin on base, below the flats' bottom edge so
// its foot is always behind them, first at x and again every period
// pixels of the layer, far enough apart that it never shows twice at once,
// and moves by factor as a layer does.
export const HORIZON = { name: 'horizon', factor: 0.17, base: 188, x: 168, period: 512 };

// Back to front. top is where the layer's top edge sits on the view when the
// camera is as low as the level lets it go; fill is the colour below the
// layer, for when the view reaches under it (the bottom row of a delivered
// sheet). image is the picture drawn in code, for a layer not yet
// delivered; the rest are the factory's sheets (BACKGROUND_SPRITES in
// src/sprites.js). Every width is a whole number of tiles, as the page
// draws layers in tile-wide columns.
export const BACKGROUND_LAYERS = [
  { name: 'sky', factor: 0, top: 0, image: null, fill: colour('sky_4') },
  { name: 'clouds', factor: 0.1, top: 6, image: null, fill: null },
  { name: 'hanveden', factor: 0.15, top: 74, image: hanveden(), fill: colour('water_2') },
  { name: 'flats', factor: 0.25, top: 72, image: null, fill: colour('grey_5') },
  { name: 'fields', factor: 0.3, top: 100, image: fields(), fill: colour('grass_3') },
  { name: 'gardens', factor: 0.5, top: 120, image: null, fill: colour('grass_1') },
];
