// The backdrops' layers, drawn in code: sky, clouds, Hanveden's forested
// ridge on the countryside's horizon, the blocks of flats and the water
// tower far off, fields before the forest's edge, row houses and trees
// nearer. Each layer
// repeats sideways and moves by a share of the camera's movement (factor),
// so nearer layers pass faster: parallax. Pure: no DOM.
import { TILE, VIEW_HEIGHT } from '../config.js';
import { colour } from '../palette.js';
import { createImage, fillRect, getPixel, noise, setPixel } from '../pixels.js';

function fillDisc(image, cx, cy, radius, value) {
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      if (x * x + y * y <= radius * radius + radius) setPixel(image, cx + x, cy + y, value);
    }
  }
}

// Bands of colour from top to bottom, the joins dithered in a checkerboard
// as 16-bit games did it.
function sky() {
  const image = createImage(TILE, VIEW_HEIGHT);
  const bands = [
    [0, 'sky_1'],
    [36, 'sky_2'],
    [96, 'sky_3'],
    [150, 'sky_4'],
  ];
  for (let y = 0; y < VIEW_HEIGHT; y++) {
    const band = bands.findLastIndex(([top]) => y >= top);
    const next = bands[band + 1];
    for (let x = 0; x < TILE; x++) {
      const dither = next && next[0] - y <= 4 && (x + y) % 2 === 0;
      setPixel(image, x, y, colour(dither ? next[1] : bands[band][1]));
    }
  }
  return image;
}

function clouds() {
  const image = createImage(24 * TILE, 72);
  const puffs = [
    { x: 40, y: 26, size: 1 },
    { x: 170, y: 46, size: 0.7 },
    { x: 285, y: 20, size: 1.2 },
  ];
  for (const { x, y, size } of puffs) {
    const parts = [[-14, 4, 7], [-5, 0, 9], [7, 2, 8], [16, 5, 6]].map(([dx, dy, r]) => [
      x + Math.round(dx * size),
      y + Math.round(dy * size),
      Math.max(3, Math.round(r * size)),
    ]);
    for (const [cx, cy, r] of parts) fillDisc(image, cx, cy, r, colour('white'));
    // A flat underside, shaded.
    const base = y + Math.round(5 * size);
    const left = x - Math.round(24 * size);
    const right = x + Math.round(26 * size);
    fillRect(image, left, base, right - left, image.height - base, null);
    for (let px = left; px < right; px++) {
      for (const py of [base - 1, base - 2]) {
        if (getPixel(image, px, py) !== null) setPixel(image, px, py, colour('sky_4'));
      }
    }
  }
  return image;
}

// Slab blocks of the million programme, a water tower and a mast, hazy
// with distance.
function blocksOfFlats() {
  const width = 20 * TILE;
  const height = 104;
  const image = createImage(width, height);
  const body = colour('grey_5');
  const shade = colour('grey_4');
  const light = colour('grey_6');
  const blocks = [
    { x: 0, w: 72, h: 64 },
    { x: 84, w: 40, h: 92 },
    { x: 196, w: 88, h: 56 },
    { x: 292, w: 28, h: 40 },
  ];
  for (const { x, w, h } of blocks) {
    const top = height - h;
    fillRect(image, x, top, w, h, body);
    fillRect(image, x, top, w, 1, light);
    fillRect(image, x + w - 2, top + 1, 2, h - 1, shade);
    // Windows in rows, the balconies' slabs between the floors.
    for (let y = top + 4; y < height - 6; y += 6) {
      fillRect(image, x + 1, y + 4, w - 3, 1, light);
      for (let wx = x + 3; wx < x + w - 4; wx += 5) {
        if (noise(wx, y, 3) < 0.85) fillRect(image, wx, y, 3, 2, shade);
      }
    }
  }
  // The water tower: a mushroom on a stem.
  const towerX = 156;
  fillRect(image, towerX - 3, height - 70, 7, 70, body);
  fillRect(image, towerX + 2, height - 70, 2, 70, shade);
  fillRect(image, towerX - 16, height - 86, 33, 12, body);
  fillRect(image, towerX - 12, height - 92, 25, 6, body);
  fillRect(image, towerX - 16, height - 86, 33, 1, light);
  fillRect(image, towerX - 12, height - 92, 25, 1, light);
  fillRect(image, towerX - 14, height - 74, 29, 2, shade);
  fillRect(image, towerX, height - 96, 1, 4, shade);
  return image;
}

function tree(image, x, ground, size, seed) {
  fillRect(image, x - 1, ground - 10, 3, 10, colour('brown_2'));
  setPixel(image, x - 1, ground - 10, colour('brown_1'));
  const cy = ground - 10 - size;
  const lobes = [[0, 0, size], [-size + 2, 3, size - 2], [size - 2, 3, size - 2], [0, -size + 3, size - 3]];
  for (const [dx, dy, r] of lobes) fillDisc(image, x + dx, cy + dy + 1, r, colour('grass_1'));
  for (const [dx, dy, r] of lobes) fillDisc(image, x + dx, cy + dy, r, colour('grass_2'));
  for (const [dx, dy, r] of lobes) fillDisc(image, x + dx - 1, cy + dy - 1, r - 2, colour('grass_3'));
  for (let i = 0; i < size * 2; i++) {
    const px = x - size + Math.floor(noise(i, 1, seed) * size * 1.5);
    const py = cy - size + Math.floor(noise(i, 2, seed) * size);
    setPixel(image, px, py, colour('grass_4'));
  }
}

// A row house in falu red with white trim and a dark roof.
function rowHouse(image, x, ground, w) {
  const wall = ground - 24;
  fillRect(image, x, wall, w, 24, colour('red_3'));
  fillRect(image, x + w - 2, wall, 2, 24, colour('red_2'));
  for (let y = wall; y < ground; y += 3) fillRect(image, x, y, w - 2, 1, colour('red_2'));
  for (let row = 0; row < 10; row++) {
    fillRect(image, x - 3 + row, wall - 10 + row, w + 6 - 2 * row, 1, colour(row === 9 ? 'grey_1' : 'grey_2'));
  }
  fillRect(image, x - 3, wall - 1, w + 6, 1, colour('grey_1'));
  for (let wx = x + 5; wx < x + w - 10; wx += 16) {
    fillRect(image, wx, wall + 5, 8, 8, colour('white'));
    fillRect(image, wx + 1, wall + 6, 6, 6, colour('sky_2'));
    fillRect(image, wx + 1, wall + 9, 6, 1, colour('white'));
    fillRect(image, wx + 4, wall + 6, 1, 6, colour('white'));
  }
  fillRect(image, x + w - 12, wall + 8, 7, 16, colour('white'));
  fillRect(image, x + w - 11, wall + 9, 5, 15, colour('blue_3'));
}

function gardens() {
  const width = 16 * TILE;
  const height = 72;
  const ground = height - 10;
  const image = createImage(width, height);
  rowHouse(image, 20, ground, 64);
  rowHouse(image, 150, ground, 48);
  tree(image, 106, ground, 13, 1);
  tree(image, 230, ground, 10, 2);
  tree(image, 6, ground, 8, 3);
  // A lamp post.
  fillRect(image, 128, ground - 34, 2, 34, colour('grey_2'));
  fillRect(image, 126, ground - 36, 7, 3, colour('grey_3'));
  fillRect(image, 127, ground - 33, 5, 1, colour('urine_4'));
  // The hedge along the bottom, and the lawn under it.
  for (let x = 0; x < width; x++) {
    const bump = Math.floor(noise(x >> 2, 0, 9) * 3);
    fillRect(image, x, ground - 4 - bump, 1, 4 + bump, colour('grass_2'));
    if (noise(x, 1, 9) < 0.3) setPixel(image, x, ground - 3 - bump, colour('grass_3'));
  }
  fillRect(image, 0, ground, width, height - ground, colour('grass_1'));
  return image;
}

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
// layer, for when the view reaches under it. Every width is a whole number
// of tiles, as the page draws layers in tile-wide columns.
export const BACKGROUND_LAYERS = [
  { name: 'sky', factor: 0, top: 0, image: sky(), fill: colour('sky_4') },
  { name: 'clouds', factor: 0.1, top: 6, image: clouds(), fill: null },
  { name: 'hanveden', factor: 0.15, top: 74, image: hanveden(), fill: colour('water_2') },
  { name: 'flats', factor: 0.25, top: 72, image: blocksOfFlats(), fill: colour('grey_5') },
  { name: 'fields', factor: 0.3, top: 100, image: fields(), fill: colour('grass_3') },
  { name: 'gardens', factor: 0.5, top: 120, image: gardens(), fill: colour('grass_1') },
];
