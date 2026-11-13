// How the props look as Blenke's throws wear them, and the torch's light,
// drawn in code over the asset factory's pictures. Pure: no DOM.
import { colour } from '../palette.js';
import { createImage, fillRect, getPixel, noise, setPixel } from '../pixels.js';
import { BEAM_BASE, PROPS, THROWS } from '../props.js';

// How a prop looks as its throws wear it, one look for each throw it has
// left: whole, then chipped and cracked, worse each time: the factory's
// picture as it is, then cracks drawn in ink over it and chips knocked
// out of its outline.
export function wornLooks(image) {
  return Array.from({ length: THROWS }, (_, wear) => (wear === 0 ? image : worn(image, wear)));
}

// A crack running down from the top edge, a pixel at a time, wandering
// left and right; the same path every time, longer the more worn.
function crackPath(image) {
  const path = [];
  let x = Math.floor(image.width * 0.6);
  let y = 0;
  while (y < image.height && getPixel(image, x, y) === null) y += 1;
  for (; y < image.height; y++) {
    if (getPixel(image, x, y) === null) break;
    path.push({ x, y });
    const turn = noise(x, y, 7);
    const next = x + (turn < 0.3 ? -1 : turn > 0.7 ? 1 : 0);
    if (getPixel(image, next, y + 1) !== null) x = next;
  }
  return path;
}

// The first opaque pixels from a corner, scanning rows from the top
// (right to left) or from the bottom (left to right).
function corners(image) {
  const found = [];
  for (let y = 0; y < image.height && found.length === 0; y++) {
    for (let x = image.width - 1; x >= 0; x--) if (getPixel(image, x, y) !== null) { found.push({ x, y }); break; }
  }
  for (let y = image.height - 1; y >= 0 && found.length === 1; y--) {
    for (let x = 0; x < image.width; x++) if (getPixel(image, x, y) !== null) { found.push({ x, y }); break; }
  }
  return found;
}

function worn(image, wear) {
  const result = { width: image.width, height: image.height, pixels: [...image.pixels] };
  const ink = colour('ink');
  const path = crackPath(image);
  const length = Math.max(2, Math.ceil((path.length * wear) / (THROWS - 1)));
  for (const { x, y } of path.slice(0, length)) setPixel(result, x, y, ink);
  // The worst of it branches the other way halfway down.
  if (wear === THROWS - 1 && path.length > 2) {
    const fork = path[Math.floor(path.length / 2)];
    for (let k = 1; k <= Math.ceil(image.width / 5); k++) {
      if (getPixel(image, fork.x - k, fork.y + k) === null) break;
      setPixel(result, fork.x - k, fork.y + k, ink);
    }
  }
  for (const { x, y } of corners(image).slice(0, wear)) setPixel(result, x, y, null);
  return result;
}

// A shining torch's light, as a wedge widening to the right from its
// lens: drawn see-through over what it lights. The same wedge inBeam
// tests (props.js).
export function beamArt() {
  const { length, spread } = PROPS.torch.beam;
  const reach = Math.ceil(BEAM_BASE + length * spread);
  const image = createImage(length, 2 * reach + 1);
  const light = colour('hivis_4');
  for (let x = 0; x < length; x++) {
    const half = Math.floor(BEAM_BASE + x * spread);
    fillRect(image, x, reach - half, 1, 2 * half + 1, light);
  }
  return image;
}
