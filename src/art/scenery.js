// The suburb's furniture, drawn in code: a bus shelter with its stop sign,
// a police car, swings, a slide, a bench, a street lamp, a bin shed and a
// parking sign; and the landmarks on Blenke's way, a checkpoint's post
// with its blue light and the goal's flagpole. Each picture is the size
// scenery.js and landmarks.js give it, standing on its bottom row. Pure:
// no DOM.
import { CHECKPOINT_SIZE, GOAL_SIZE } from '../landmarks.js';
import { colour } from '../palette.js';
import { SCENERY } from '../scenery.js';
import { createImage, fillRect, parsePixels, setPixel, stamp } from '../pixels.js';

function canvasFor(size) {
  return createImage(size.width, size.height);
}

// A straight line `thickness` pixels wide (downwards), end to end.
function line(image, x0, y0, x1, y1, name, thickness = 1) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / steps);
    const y = Math.round(y0 + ((y1 - y0) * i) / steps);
    fillRect(image, x, y, 1, thickness, colour(name));
  }
}

// An outlined box: ink round the edge, `fill` inside.
function box(image, x, y, w, h, fill) {
  fillRect(image, x, y, w, h, colour('ink'));
  fillRect(image, x + 1, y + 1, w - 2, h - 2, colour(fill));
}

const H_SIGN = parsePixels(
  [
    'kkkkkkkkkk',
    'kYYYYYYYYk',
    'kYkYYYYkYk',
    'kYkYYYYkYk',
    'kYkkkkkkYk',
    'kYkYYYYkYk',
    'kYkYYYYkYk',
    'kYYYYYYYYk',
    'kkkkkkkkkk',
  ],
  { k: 'ink', Y: 'hivis_3' },
  'bus stop sign',
);

// A glass bus shelter: a dark frame and roof, tinted panes with a glint,
// a poster at the end and a bench; the stop's sign on its own pole.
function busStop() {
  const image = canvasFor(SCENERY.busStop);
  const { height } = image;
  fillRect(image, 3, 4, 2, height - 4, colour('grey_3'));
  fillRect(image, 4, 4, 1, height - 4, colour('grey_2'));
  stamp(image, H_SIGN, 0, 0);
  fillRect(image, 12, 4, 36, 4, colour('ink'));
  fillRect(image, 12, 4, 36, 1, colour('grey_4'));
  fillRect(image, 13, 5, 34, 2, colour('grey_2'));
  fillRect(image, 14, 10, 32, 24, colour('water_4'));
  for (let i = 0; i < 6; i++) setPixel(image, 18 + i, 14 + i, colour('white'));
  for (let i = 0; i < 4; i++) setPixel(image, 26 + i, 12 + i, colour('white'));
  box(image, 36, 11, 10, 20, 'purple_3');
  fillRect(image, 38, 13, 6, 4, colour('orange_3'));
  fillRect(image, 38, 19, 6, 1, colour('white'));
  fillRect(image, 38, 21, 4, 1, colour('white'));
  fillRect(image, 38, 26, 6, 3, colour('urine_3'));
  for (const x of [12, 46]) fillRect(image, x, 8, 2, height - 8, colour('grey_2'));
  fillRect(image, 14, 9, 32, 1, colour('grey_2'));
  fillRect(image, 14, 34, 32, 1, colour('grey_2'));
  fillRect(image, 16, 29, 18, 2, colour('brown_3'));
  fillRect(image, 16, 31, 18, 1, colour('brown_1'));
  for (const x of [17, 32]) fillRect(image, x, 32, 1, height - 32, colour('grey_2'));
  return image;
}

// A Swedish police car: a white estate with blue and yellow checks along
// its side and a blue light bar on the roof.
function policeCar() {
  const image = canvasFor(SCENERY.policeCar);
  fillRect(image, 20, 0, 9, 1, colour('ink'));
  fillRect(image, 20, 1, 9, 2, colour('blue_4'));
  fillRect(image, 23, 1, 3, 1, colour('blue_5'));
  fillRect(image, 11, 3, 28, 1, colour('ink'));
  fillRect(image, 10, 4, 1, 6, colour('ink'));
  fillRect(image, 39, 4, 1, 6, colour('ink'));
  fillRect(image, 11, 4, 28, 6, colour('grey_6'));
  fillRect(image, 13, 5, 10, 4, colour('sky_3'));
  fillRect(image, 25, 5, 12, 4, colour('sky_3'));
  setPixel(image, 14, 5, colour('white'));
  setPixel(image, 26, 5, colour('white'));
  fillRect(image, 1, 9, 46, 1, colour('ink'));
  fillRect(image, 0, 10, 1, 8, colour('ink'));
  fillRect(image, 47, 10, 1, 8, colour('ink'));
  fillRect(image, 1, 10, 46, 8, colour('white'));
  for (let x = 1; x < 47; x += 4) {
    const top = (x - 1) % 8 === 0;
    fillRect(image, x, 12, 4, 2, colour(top ? 'blue_3' : 'hivis_3'));
    fillRect(image, x, 14, 4, 2, colour(top ? 'hivis_3' : 'blue_3'));
  }
  fillRect(image, 1, 16, 46, 2, colour('grey_5'));
  fillRect(image, 1, 10, 3, 2, colour('orange_3'));
  fillRect(image, 45, 10, 2, 2, colour('red_3'));
  fillRect(image, 1, 18, 46, 1, colour('ink'));
  for (const x of [7, 33]) {
    fillRect(image, x, 15, 8, 7, colour('ink'));
    fillRect(image, x + 2, 17, 4, 3, colour('grey_3'));
    setPixel(image, x + 3, 18, colour('grey_5'));
  }
  return image;
}

// Swings on an A-frame, two seats on their chains.
function swings() {
  const image = canvasFor(SCENERY.swings);
  const bottom = image.height - 1;
  for (const x of [4, 35]) {
    line(image, x, 1, x - 4, bottom, 'red_2', 1);
    line(image, x + 1, 1, x + 5, bottom, 'red_2', 1);
    line(image, x, 1, x - 3, bottom, 'red_3', 1);
  }
  fillRect(image, 2, 0, 36, 2, colour('red_3'));
  fillRect(image, 2, 0, 36, 1, colour('red_4'));
  for (const [x, seat] of [[12, 'blue_3'], [24, 'hivis_3']]) {
    fillRect(image, x, 2, 1, 22, colour('grey_4'));
    fillRect(image, x + 6, 2, 1, 22, colour('grey_4'));
    fillRect(image, x - 1, 24, 9, 2, colour('ink'));
    fillRect(image, x, 24, 7, 1, colour(seat));
  }
  return image;
}

// A slide: a ladder up to a little platform, and the chute down.
function slide() {
  const image = canvasFor(SCENERY.slide);
  const bottom = image.height - 1;
  fillRect(image, 3, 6, 1, bottom - 5, colour('grey_3'));
  fillRect(image, 9, 6, 1, bottom - 5, colour('grey_3'));
  for (let y = 9; y < bottom; y += 4) fillRect(image, 4, y, 5, 1, colour('grey_4'));
  fillRect(image, 2, 4, 12, 2, colour('blue_3'));
  fillRect(image, 2, 4, 12, 1, colour('blue_4'));
  fillRect(image, 2, 0, 1, 4, colour('grey_3'));
  fillRect(image, 13, 0, 1, 4, colour('grey_3'));
  fillRect(image, 2, 0, 12, 1, colour('grey_4'));
  line(image, 14, 5, 37, bottom - 3, 'orange_1', 4);
  line(image, 14, 4, 37, bottom - 4, 'orange_2', 3);
  line(image, 14, 4, 37, bottom - 4, 'orange_3', 1);
  fillRect(image, 36, bottom - 3, 4, 2, colour('orange_2'));
  fillRect(image, 37, bottom - 1, 1, 2, colour('grey_3'));
  return image;
}

// A park bench: two slats for the back, two for the seat, iron legs.
function bench() {
  const image = canvasFor(SCENERY.bench);
  for (const y of [0, 3, 6]) {
    fillRect(image, 0, y, 24, 2, colour('brown_3'));
    fillRect(image, 0, y, 24, 1, colour('brown_4'));
  }
  fillRect(image, 0, 8, 24, 1, colour('brown_1'));
  for (const x of [2, 20]) {
    fillRect(image, x, 0, 2, 11, colour('ink'));
    fillRect(image, x - 1, 10, 4, 1, colour('ink'));
  }
  return image;
}

// A street lamp: a tall grey pole, the lamp lit yellow underneath.
function streetLamp() {
  const image = canvasFor(SCENERY.streetLamp);
  const bottom = image.height;
  fillRect(image, 5, 4, 2, bottom - 4, colour('grey_3'));
  fillRect(image, 6, 4, 1, bottom - 4, colour('grey_2'));
  fillRect(image, 3, bottom - 4, 6, 4, colour('grey_2'));
  fillRect(image, 3, bottom - 4, 6, 1, colour('grey_4'));
  fillRect(image, 1, 0, 10, 3, colour('grey_2'));
  fillRect(image, 2, 0, 8, 1, colour('grey_4'));
  fillRect(image, 2, 3, 8, 1, colour('urine_4'));
  fillRect(image, 3, 4, 6, 1, colour('urine_3'));
  return image;
}

// A bin shed with three bins, sorted by kind; one of them yellow.
function binShed() {
  const image = canvasFor(SCENERY.binShed);
  const bottom = image.height;
  fillRect(image, 0, 0, 32, 3, colour('grey_4'));
  fillRect(image, 0, 0, 32, 1, colour('grey_5'));
  fillRect(image, 0, 3, 32, 1, colour('grey_2'));
  fillRect(image, 1, 4, 30, bottom - 4, colour('brown_2'));
  for (let x = 3; x < 31; x += 4) fillRect(image, x, 4, 1, bottom - 4, colour('brown_1'));
  fillRect(image, 0, 4, 1, bottom - 4, colour('brown_1'));
  fillRect(image, 31, 4, 1, bottom - 4, colour('brown_1'));
  [['grass_3', 'grass_2'], ['grey_3', 'grey_2'], ['urine_3', 'urine_2']].forEach(([light, dark], i) => {
    const x = 3 + i * 9;
    fillRect(image, x, 10, 8, bottom - 11, colour(light));
    fillRect(image, x - 1, 9, 10, 2, colour(dark));
    fillRect(image, x + 6, 11, 2, bottom - 12, colour(dark));
    fillRect(image, x + 1, bottom - 1, 2, 1, colour('ink'));
    fillRect(image, x + 5, bottom - 1, 2, 1, colour('ink'));
  });
  return image;
}

const P_SIGN = parsePixels(
  [
    'wwwwwwwwwwww',
    'wBBBBBBBBBBw',
    'wBBWWWWWBBBw',
    'wBBWWBBWWBBw',
    'wBBWWBBWWBBw',
    'wBBWWWWWBBBw',
    'wBBWWBBBBBBw',
    'wBBWWBBBBBBw',
    'wBBWWBBBBBBw',
    'wBBBBBBBBBBw',
    'wwwwwwwwwwww',
  ],
  { w: 'grey_5', B: 'blue_3', W: 'white' },
  'parking sign',
);

// A parking sign: a white P on blue, on a pole.
function parkingSign() {
  const image = canvasFor(SCENERY.parkingSign);
  fillRect(image, 5, 11, 2, image.height - 11, colour('grey_4'));
  fillRect(image, 6, 11, 1, image.height - 11, colour('grey_3'));
  stamp(image, P_SIGN, 0, 0);
  return image;
}

// Each scenery type's picture.
export const SCENERY_ART = {
  busStop: busStop(),
  policeCar: policeCar(),
  swings: swings(),
  slide: slide(),
  bench: bench(),
  streetLamp: streetLamp(),
  binShed: binShed(),
  parkingSign: parkingSign(),
};

// A checkpoint's post: grey with a striped foot, and a dome on top that is
// dark until Blenke has passed and then flashes blue (`lit` are the
// frames, played in turn).
function checkpoint(dome, glint) {
  const image = canvasFor(CHECKPOINT_SIZE);
  const { width, height } = image;
  const middle = width / 2;
  fillRect(image, middle - 4, 0, 8, 1, colour('ink'));
  fillRect(image, middle - 5, 1, 10, 5, colour('ink'));
  fillRect(image, middle - 4, 1, 8, 4, colour(dome));
  if (glint) {
    fillRect(image, middle - 3, 1, 2, 2, colour(glint));
    fillRect(image, 0, 2, 1, 2, colour(dome));
    fillRect(image, width - 1, 2, 1, 2, colour(dome));
  }
  fillRect(image, middle - 4, 5, 8, 2, colour('grey_2'));
  fillRect(image, middle - 1, 7, 2, height - 11, colour('grey_4'));
  fillRect(image, middle, 7, 1, height - 11, colour('grey_3'));
  for (let y = height - 4; y < height; y++) {
    fillRect(image, middle - 3, y, 6, 1, colour(y % 2 === 0 ? 'blue_3' : 'white'));
  }
  return image;
}

export const CHECKPOINT_ART = {
  unlit: checkpoint('grey_3', null),
  lit: [checkpoint('blue_4', 'white'), checkpoint('blue_5', 'sky_4')],
  fps: 4,
};

// The goal: a flagpole with a gold knob and the police's flag, blue with
// a yellow star, waving in `frame`.
function goal(frame) {
  const image = canvasFor(GOAL_SIZE);
  const { height } = image;
  fillRect(image, 0, 0, 4, 4, colour('ink'));
  fillRect(image, 1, 0, 2, 3, colour('urine_3'));
  setPixel(image, 1, 0, colour('urine_4'));
  fillRect(image, 0, 4, 4, height - 4, colour('ink'));
  fillRect(image, 1, 4, 2, height - 4, colour('grey_5'));
  fillRect(image, 2, 4, 1, height - 4, colour('grey_4'));
  fillRect(image, 0, height - 3, 6, 3, colour('grey_3'));
  fillRect(image, 0, height - 3, 6, 1, colour('grey_4'));
  const flagW = 12;
  for (let x = 0; x < flagW; x++) {
    const wave = Math.round(Math.sin((x / flagW) * Math.PI * 1.5 - frame * 2) * (x / flagW) * 1.5);
    const top = 6 + wave;
    fillRect(image, 4 + x, top, 1, 10, colour('ink'));
    fillRect(image, 4 + x, top + 1, 1, 8, colour(x % 4 === 3 ? 'blue_2' : 'blue_3'));
    if (x >= 4 && x <= 7) fillRect(image, 4 + x, top + 3, 1, 4, colour('hivis_3'));
    if (x === 5 || x === 6) {
      fillRect(image, 4 + x, top + 2, 1, 6, colour('hivis_3'));
      setPixel(image, 4 + x, top + 4, colour('urine_4'));
    }
  }
  return image;
}

export const GOAL_ART = { frames: [0, 1, 2].map(goal), fps: 5 };
