// The police station and its filling station, drawn in code: the station
// house behind, the yellow pump with its gauge in front, the hose from
// Blenke's belt to the pump's nozzle, and the gauge's needle at each of
// its steps from 0 to MAX. Pure: no DOM.
import { textImage } from './font.js';
import { colour } from '../palette.js';
import { createImage, fillRect, setPixel, stamp } from '../pixels.js';
import { HOSE_GAP, PUMP_SIZE } from '../station.js';

export const HOUSE_SIZE = { width: 128, height: 80 };
// The house stands this far left of the pump's left edge.
export const HOUSE_LEFT = 28;
// The dial's centre in the pump's picture, and its needle's length.
export const DIAL = { x: 12, y: 14, radius: 9 };
// The needle's steps, 0 to MAX.
export const NEEDLE_STEPS = 33;
// The nozzle on the pump's left, from its top; the hose reaches it from
// Blenke's belt, this far above his feet.
const NOZZLE_Y = 24;
const BELT_HEIGHT = 10;

function box(image, x, y, w, h, fill) {
  fillRect(image, x, y, w, h, colour('ink'));
  fillRect(image, x + 1, y + 1, w - 2, h - 2, colour(fill));
}

// A flat-roofed concrete station house: a blue band with POLIS in white,
// two rows of windows and glass doors.
function house() {
  const { width, height } = HOUSE_SIZE;
  const image = createImage(width, height);
  box(image, 0, 4, width, height - 4, 'grey_5');
  fillRect(image, 0, 0, width, 5, colour('ink'));
  fillRect(image, 1, 1, width - 2, 3, colour('grey_2'));
  fillRect(image, 1, 1, width - 2, 1, colour('grey_3'));
  for (let x = 16; x < width - 1; x += 16) fillRect(image, x, 5, 1, height - 6, colour('grey_4'));
  box(image, 34, 8, 60, 13, 'blue_3');
  fillRect(image, 35, 9, 58, 1, colour('blue_4'));
  const sign = textImage('POLIS', 'white');
  stamp(image, sign, 64 - Math.floor(sign.width / 2), 10);
  for (const row of [26, 46]) {
    for (let x = 6; x < width - 12; x += 22) {
      if (row === 46 && x >= 50 && x < 78) continue;
      box(image, x, row, 14, 12, 'sky_3');
      fillRect(image, x + 1, row + 1, 12, 3, colour('grey_4'));
      setPixel(image, x + 3, row + 6, colour('sky_4'));
      setPixel(image, x + 4, row + 5, colour('sky_4'));
    }
  }
  box(image, 52, 46, 24, height - 46, 'blue_2');
  fillRect(image, 63, 47, 2, height - 48, colour('ink'));
  fillRect(image, 54, 48, 2, 6, colour('sky_3'));
  fillRect(image, 66, 48, 2, 6, colour('sky_3'));
  fillRect(image, 48, 44, 32, 2, colour('grey_3'));
  fillRect(image, 1, height - 2, width - 2, 1, colour('grey_3'));
  return image;
}

// The pump: a half-circle gauge on top (its last stretch red), a yellow
// body with a drop on its panel, a nozzle on the left and a plinth.
function pump() {
  const { width, height } = PUMP_SIZE;
  const image = createImage(width, height);
  for (let y = 0; y <= DIAL.y + 1; y++) {
    for (let x = 0; x < width; x++) {
      const distance = Math.hypot(x - DIAL.x, Math.min(0, y - DIAL.y));
      if (distance <= DIAL.radius + 1.5) setPixel(image, x, y, colour(distance <= DIAL.radius + 0.5 && y <= DIAL.y ? 'grey_6' : 'ink'));
    }
  }
  for (let step = 0; step <= 64; step++) {
    const angle = Math.PI - (step / 64) * Math.PI;
    const x = Math.round(DIAL.x + Math.cos(angle) * (DIAL.radius + 1));
    const y = Math.round(DIAL.y - Math.sin(angle) * (DIAL.radius + 1));
    setPixel(image, x, y, colour(step > 52 ? 'red_3' : 'ink'));
  }
  for (const share of [0, 0.25, 0.5, 0.75, 1]) {
    const angle = Math.PI - share * Math.PI;
    const x = Math.round(DIAL.x + Math.cos(angle) * (DIAL.radius - 1));
    const y = Math.round(DIAL.y - Math.sin(angle) * (DIAL.radius - 1));
    setPixel(image, x, y, colour('grey_3'));
  }
  box(image, 2, 16, width - 4, height - 19, 'urine_3');
  fillRect(image, 3, 17, 2, height - 21, colour('urine_4'));
  fillRect(image, width - 5, 17, 2, height - 21, colour('urine_2'));
  box(image, 7, 21, 10, 12, 'grey_6');
  fillRect(image, 11, 23, 2, 2, colour('urine_3'));
  fillRect(image, 10, 25, 4, 4, colour('urine_3'));
  setPixel(image, 10, 25, colour('urine_4'));
  fillRect(image, 0, NOZZLE_Y, 3, 4, colour('ink'));
  fillRect(image, 0, NOZZLE_Y + 1, 2, 2, colour('grey_3'));
  fillRect(image, 1, height - 3, width - 2, 3, colour('ink'));
  fillRect(image, 2, height - 3, width - 4, 2, colour('grey_3'));
  return image;
}

// The hose, its left end at Blenke's belt and its right at the nozzle,
// sagging between. Placed by its top left at (pump's left - HOSE_GAP - 1,
// the pump's top + HOSE_TOP).
export const HOSE_TOP = NOZZLE_Y;
function hose() {
  const width = HOSE_GAP + 2;
  const beltY = PUMP_SIZE.height - BELT_HEIGHT - HOSE_TOP;
  const nozzleY = 1;
  const image = createImage(width, beltY + 6);
  for (let x = 0; x < width; x++) {
    const t = x / (width - 1);
    const y = Math.round(beltY + (nozzleY - beltY) * t + Math.sin(t * Math.PI) * 4);
    fillRect(image, x, y, 1, 3, colour('ink'));
    setPixel(image, x, y + 1, colour('grey_2'));
  }
  return image;
}

// The needle at share (0 to 1) of MAX: a red line from the dial's centre,
// with an ink hub, on a picture the pump's size placed over it.
function needle(share) {
  const image = createImage(PUMP_SIZE.width, 17);
  const angle = Math.PI - share * Math.PI;
  for (let i = 0; i <= DIAL.radius - 2; i++) {
    const x = Math.round(DIAL.x + Math.cos(angle) * i);
    const y = Math.round(DIAL.y - Math.sin(angle) * i);
    setPixel(image, x, y, colour('red_3'));
  }
  fillRect(image, DIAL.x - 1, DIAL.y - 1, 3, 2, colour('ink'));
  return image;
}

export function needleStep(share) {
  return Math.round(Math.min(1, Math.max(0, share)) * (NEEDLE_STEPS - 1));
}

export const STATION_ART = {
  house: house(),
  pump: pump(),
  hose: hose(),
  needles: Array.from({ length: NEEDLE_STEPS }, (_, i) => needle(i / (NEEDLE_STEPS - 1))),
};
