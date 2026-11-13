// The filling station's moving parts, drawn in code over the asset
// factory's station house and pump: the hose from Blenke's belt to the
// pump's nozzle, and the gauge's needle at each of its steps from 0 to
// MAX. Pure: no DOM.
import { colour } from '../palette.js';
import { createImage, fillRect, setPixel } from '../pixels.js';
import { HOSE_GAP, PUMP_SIZE } from '../station.js';

// The station house's picture is at most this big.
export const HOUSE_SIZE = { width: 128, height: 80 };
// The house stands this far left of the pump's left edge.
export const HOUSE_LEFT = 28;
// The dial's centre on the pump's picture, and its needle's length.
export const DIAL = { x: 12, y: 14, radius: 9 };
// The needle's steps, 0 to MAX.
export const NEEDLE_STEPS = 33;
// The nozzle on the pump's left, from its top; the hose reaches it from
// Blenke's belt, this far above his feet.
const NOZZLE_Y = 24;
const BELT_HEIGHT = 10;

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
  hose: hose(),
  needles: Array.from({ length: NEEDLE_STEPS }, (_, i) => needle(i / (NEEDLE_STEPS - 1))),
};
