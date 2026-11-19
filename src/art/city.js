// The city's backdrop at night, drawn in code until the asset factory
// delivers it (batch 23): the night sky with its stars (and the sky
// paling at dawn), the skyline across
// the water (Stadshuset's tower, Riddarholmskyrkan's iron spire,
// Katarinahissen and Söder's heights), the inner city's stone houses with
// lit and dark windows and a neon sign, and the street with its lamps and
// parked cars. Each repeats sideways in whole tiles; its bottom row is the
// colour the game fills under it. Pure: no DOM.
import { colour } from '../palette.js';
import { createImage, fillRect, getPixel, noise, setPixel } from '../pixels.js';

// A pixel on a checkerboard of two colours, for the dithered seams of
// the 16-bit look.
const checker = (x, y, a, b) => ((x + y) % 2 === 0 ? a : b);

// Deep at the top, paler towards the horizon, each colour dithered into
// the next over a few rows; stars in the upper half.
function nightSky() {
  const width = 192;
  const height = 216;
  const bands = [[0, 'ink'], [36, 'purple_1'], [84, 'blue_1'], [134, 'blue_2']];
  const seam = 6;
  const image = createImage(width, height);
  for (let y = 0; y < height; y++) {
    const index = bands.findLastIndex(([from]) => from <= y);
    const next = bands[index + 1];
    const dithered = next && y >= next[0] - seam;
    for (let x = 0; x < width; x++) {
      const name = dithered ? checker(x, y, bands[index][1], next[1]) : bands[index][1];
      setPixel(image, x, y, colour(name));
    }
    if (dithered || y >= 96) continue;
    for (let x = 0; x < width; x++) {
      if (noise(x, y, 11) < 0.003) setPixel(image, x, y, colour(noise(x, y, 12) < 0.3 ? 'white' : 'grey_4'));
    }
  }
  return image;
}

// The sky paling towards the morning, for Finnboda varv at half past
// four: still night blue at the top, through violet and a red glow to
// pale yellow at the horizon, each colour dithered into the next; the
// stars gone. As still as the night's sky, so a narrow strip.
function dawnSky() {
  const width = 16;
  const height = 216;
  const bands = [[0, 'blue_2'], [26, 'purple_2'], [52, 'purple_3'], [76, 'red_4'], [96, 'orange_3'], [114, 'urine_4']];
  const seam = 6;
  const image = createImage(width, height);
  for (let y = 0; y < height; y++) {
    const index = bands.findLastIndex(([from]) => from <= y);
    const next = bands[index + 1];
    const dithered = next && y >= next[0] - seam;
    for (let x = 0; x < width; x++) setPixel(image, x, y, colour(dithered ? checker(x, y, bands[index][1], next[1]) : bands[index][1]));
  }
  return image;
}

// Lit windows scattered over whatever is drawn in a box, on a grid.
function windows(image, x0, y0, width, height, chance, seed) {
  for (let y = y0; y < y0 + height; y++) {
    for (let x = x0; x < x0 + width; x++) {
      if (x % 3 !== 1 || y % 3 !== 1 || getPixel(image, x, y) === null) continue;
      if (noise(x, y, seed) < chance) setPixel(image, x, y, colour(noise(x, y, seed + 1) < 0.5 ? 'urine_3' : 'urine_2'));
    }
  }
}

// Fills a column from row top to the bottom.
const column = (image, x, top, name) => fillRect(image, x, top, 1, image.height - top, colour(name));

// The city across the water, dark against the sky, its towers above the
// houses in front.
function skyline() {
  const width = 448;
  const height = 56;
  const image = createImage(width, height);
  // Roofs of the old town and Söder, in blocks of uneven height; Söder's
  // heights rise towards Katarinahissen.
  for (let x = 0; x < width;) {
    const span = 8 + Math.floor(noise(x, 1, 21) * 20);
    const cliff = x >= 300 && x < 400 ? 10 : 0;
    const roof = height - 14 - cliff - Math.floor(noise(x, 2, 21) * 12);
    for (let i = x; i < Math.min(width, x + span); i++) column(image, i, roof, 'ink');
    x += span;
  }
  // Stadshuset: the floodlit brick tower, its lantern, its spire and the
  // three gilded crowns.
  for (let x = 40; x < 54; x++) column(image, x, 12, x < 43 ? 'red_2' : 'red_1');
  fillRect(image, 43, 7, 8, 5, colour('slime_1'));
  fillRect(image, 46, 3, 2, 4, colour('slime_1'));
  for (const x of [45, 46, 47]) setPixel(image, x, 2, colour('urine_4'));
  setPixel(image, 46, 1, colour('urine_3'));
  fillRect(image, 44, 14, 6, 1, colour('urine_3'));
  // Riddarholmskyrkan: the church, and its iron spire of open latticework.
  for (let x = 110; x < 140; x++) column(image, x, 38, 'ink');
  for (let y = 4; y < 38; y++) {
    const half = Math.floor((y - 4) / 10);
    for (let x = 124 - half; x <= 125 + half; x++) {
      if (half === 0 || x === 124 - half || x === 125 + half || y % 4 === 0) setPixel(image, x, y, colour('grey_1'));
    }
  }
  // Katarinahissen: the lift's lattice tower and its walkway across to the
  // heights, the restaurant's lit windows under it.
  for (let x = 290; x < 296; x++) column(image, x, 16, 'grey_1');
  for (let y = 18; y < height; y += 3) fillRect(image, 291, y, 4, 1, colour('ink'));
  fillRect(image, 290, 15, 46, 3, colour('grey_1'));
  for (let x = 292; x < 334; x += 2) setPixel(image, x, 18, colour('urine_3'));
  windows(image, 0, 0, width, height, 0.12, 31);
  return image;
}

// The inner city's stone houses, five or six storeys, side by side.
const HOUSES = [
  { width: 40, roof: 26, facade: 'grey_2' },
  { width: 56, roof: 18, facade: 'brown_2', neon: true },
  { width: 32, roof: 30, facade: 'skin_1' },
  { width: 48, roof: 22, facade: 'blue_2' },
  { width: 64, roof: 16, facade: 'grey_2' },
  { width: 40, roof: 28, facade: 'brown_2' },
  { width: 40, roof: 24, facade: 'skin_1' },
];

function cityBlocks() {
  const width = HOUSES.reduce((sum, house) => sum + house.width, 0);
  const height = 104;
  const shop = height - 14;
  const image = createImage(width, height);
  let left = 0;
  HOUSES.forEach((house, index) => {
    const { width: span, roof, facade } = house;
    fillRect(image, left, roof, span, height - roof, colour(facade));
    // The cornice, and a chimney.
    fillRect(image, left, roof, span, 2, colour('ink'));
    fillRect(image, left + span - 9, roof - 5, 3, 5, colour('ink'));
    // A line of shadow where the house meets the next.
    fillRect(image, left + span - 1, roof, 1, height - roof, colour('ink'));
    // Windows: lit or dark, in rows to the shops.
    for (let y = roof + 6; y + 4 < shop; y += 10) {
      for (let x = left + 3; x + 3 < left + span - 1; x += 8) {
        const lit = noise(x, y, 41 + index) < 0.35;
        fillRect(image, x, y, 3, 4, colour(lit ? 'urine_3' : 'blue_1'));
        if (lit) setPixel(image, x, y, colour('urine_4'));
      }
    }
    // The shops on the ground floor, a few still lit.
    fillRect(image, left, shop, span - 1, height - shop, colour('ink'));
    for (let x = left + 3; x + 6 < left + span - 1; x += 12) {
      if (noise(x, shop, 51) < 0.4) fillRect(image, x, shop + 3, 6, 7, colour(noise(x, shop, 52) < 0.5 ? 'urine_2' : 'purple_2'));
    }
    // A neon sign on the roof, pink letters on their frame.
    if (house.neon) {
      const x = left + 12;
      const y = roof - 9;
      fillRect(image, x, y, 22, 7, colour('ink'));
      for (let i = 0; i < 18; i++) {
        if (i % 6 !== 5) setPixel(image, x + 2 + i, y + 2 + (i % 2), colour('purple_4'));
        if (i % 6 === 0) fillRect(image, x + 2 + i, y + 2, 1, 3, colour('purple_4'));
      }
      fillRect(image, x + 4, y + 7, 1, 2, colour('grey_1'));
      fillRect(image, x + 17, y + 7, 1, 2, colour('grey_1'));
    }
    left += span;
  });
  fillRect(image, 0, height - 2, width, 2, colour('ink'));
  return image;
}

// A lamp post: its pole, its arm and its lamp, the light pooled on the
// pavement under it.
function lampPost(image, x, pavement) {
  fillRect(image, x, 6, 2, pavement - 6, colour('grey_1'));
  fillRect(image, x, 6, 9, 1, colour('grey_1'));
  fillRect(image, x + 6, 7, 4, 2, colour('urine_4'));
  for (let i = -12; i <= 20; i++) {
    for (let row = 0; row < 3; row++) {
      if (Math.abs(i - 4) + row * 6 < 16 && (x + i + row) % 2 === 0) setPixel(image, x + i, pavement + row, colour('urine_2'));
    }
  }
}

// A parked car, its nose to the right.
function car(image, x, ground, body) {
  fillRect(image, x + 2, ground - 9, 36, 6, colour(body));
  fillRect(image, x + 10, ground - 14, 18, 5, colour(body));
  fillRect(image, x + 12, ground - 13, 6, 3, colour('blue_1'));
  fillRect(image, x + 20, ground - 13, 6, 3, colour('blue_1'));
  fillRect(image, x + 2, ground - 4, 36, 1, colour('ink'));
  for (const wheel of [x + 7, x + 29]) fillRect(image, wheel, ground - 4, 5, 4, colour('ink'));
  setPixel(image, x + 37, ground - 8, colour('urine_4'));
  setPixel(image, x + 2, ground - 8, colour('red_3'));
}

function street() {
  const width = 256;
  const height = 72;
  const pavement = 56;
  const image = createImage(width, height);
  for (let x = 0; x < width; x++) {
    column(image, x, pavement, 'grey_2');
    if (x % 16 === 0) fillRect(image, x, pavement, 1, 8, colour('grey_1'));
  }
  fillRect(image, 0, pavement + 8, width, 1, colour('grey_3'));
  fillRect(image, 0, pavement + 9, width, height - pavement - 9, colour('grey_1'));
  for (const x of [40, 168]) lampPost(image, x, pavement);
  car(image, 72, pavement + 2, 'red_1');
  car(image, 200, pavement + 2, 'blue_2');
  return image;
}

// By the layer's name in BACKGROUND_LAYERS.
export const CITY_ART = {
  night_sky: nightSky(),
  dawn_sky: dawnSky(),
  skyline: skyline(),
  city_blocks: cityBlocks(),
  street: street(),
};
