// A small town's low houses, drawn in code until the asset factory
// delivers them: blocks of two to four floors, as Västerhaninge's centre
// of 1969 and the lamella houses round it were built, never higher. In
// the delivered flats' scale and manner (a floor six pixels, a row of
// windows and a pale line under it, the right side in shade), so they
// stand where the flats would, their roofs over the cottages in front,
// on a lawn with trees before them. Repeats sideways in whole tiles; its
// bottom row is the colour the game fills under it. Pure: no DOM.
import { colour } from '../palette.js';
import { createImage, fillRect, noise, setPixel } from '../pixels.js';

const WIDTH = 320;
const HEIGHT = 64;
// Where the houses stand, on the lawn.
const GROUND = 44;
const FLOOR = 6;

// A roof flat as the flats', or pitched (tiles seen from the long side,
// hipped at the ends), with a chimney.
function roof(image, x, top, width, { pitched, roofColour, eave }) {
  if (!pitched) {
    fillRect(image, x, top - 1, width, 1, colour('grey_6'));
    fillRect(image, x + width - 14, top - 3, 6, 2, colour('grey_4'));
    return;
  }
  const rows = 4;
  for (let row = 0; row < rows; row++) {
    fillRect(image, x - 1 + row * 2, top - 1 - row, width + 2 - row * 4, 1, colour(row === 0 ? eave : roofColour));
  }
  fillRect(image, x + Math.floor(width / 3), top - rows - 2, 2, 3, colour(eave));
}

// A house standing on the ground: its floors of windows, the right side
// in shade, its roof. Some windows catch the sky.
function house(image, { x, width, floors, wall, shade, line, ...roofLook }, seed) {
  const top = GROUND - floors * FLOOR;
  fillRect(image, x, top, width, GROUND - top, colour(wall));
  fillRect(image, x + width - 2, top, 2, GROUND - top, colour(shade));
  for (let floor = 0; floor < floors; floor++) {
    const y = top + floor * FLOOR;
    for (let wx = x + 3; wx + 2 <= x + width - 3; wx += 4) {
      const sky = noise(wx, y, seed) < 0.25;
      fillRect(image, wx, y + 2, 2, 2, colour(sky ? 'blue_5' : 'grey_3'));
    }
    fillRect(image, x, y + FLOOR - 1, width - 2, 1, colour(line));
  }
  roof(image, x, top, width, roofLook);
}

// The centre's low shops: a sign band over dark shop windows, offices over
// them.
function centre(image, x, width) {
  house(image, { x, width, floors: 2, wall: 'grey_6', shade: 'grey_4', line: 'white', pitched: false }, 5);
  const shopTop = GROUND - FLOOR;
  fillRect(image, x, shopTop, width - 2, 1, colour('red_3'));
  for (let wx = x + 2; wx + 6 <= x + width - 2; wx += 8) fillRect(image, wx, shopTop + 2, 6, 4, colour('blue_2'));
}

// A tree's round crown on the lawn, lit from the left, wrapping round the
// layer's edge so the layer repeats seamlessly.
function tree(image, cx, radius) {
  const cy = GROUND - radius + 3;
  for (let y = cy - radius; y <= GROUND; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy > radius * radius + radius && y < GROUND) continue;
      const lit = dx + dy < -radius / 2 && noise(x, y, 7) < 0.6;
      setPixel(image, (x + WIDTH) % WIDTH, y, colour(lit ? 'grass_4' : noise(x, y, 8) < 0.2 ? 'grass_2' : 'grass_3'));
    }
  }
}

function lowFlats() {
  const image = createImage(WIDTH, HEIGHT);
  // A lamella house in pale plaster under a tiled roof.
  house(image, { x: 6, width: 84, floors: 3, wall: 'skin_5', shade: 'skin_4', line: 'white', pitched: true, roofColour: 'red_2', eave: 'red_1' }, 1);
  // The tallest there is: four floors, flat-roofed, as the flats.
  house(image, { x: 104, width: 56, floors: 4, wall: 'grey_5', shade: 'grey_4', line: 'grey_6', pitched: false }, 2);
  // Yellow-brown brick, three floors, flat roof.
  house(image, { x: 178, width: 92, floors: 3, wall: 'brown_4', shade: 'brown_3', line: 'skin_5', pitched: false }, 3);
  centre(image, 282, 34);
  fillRect(image, 0, GROUND, WIDTH, HEIGHT - GROUND, colour('grass_3'));
  for (const [x, radius] of [[2, 6], [96, 7], [100, 5], [170, 6], [216, 5], [276, 7], [318, 5]]) tree(image, x, radius);
  return image;
}

// By the layer's name in BACKGROUND_LAYERS.
export const LOWRISE_ART = {
  low_flats: lowFlats(),
};
