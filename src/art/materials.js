// World 2's own materials, drawn in code until the asset factory delivers
// them (batch 24), as tiles with a top (the face with something on it) and
// a fill (under more of itself): Plattan, Sergels torg's black and white
// triangles over concrete; cobbles, Gamla stan's and Slussen's; and the
// tunnelbana's wall tiles, pale with a blue band. By the tile's character
// in TILE_TYPES. Pure: no DOM.
import { colour } from '../palette.js';
import { createImage, fillRect, noise, setPixel } from '../pixels.js';

const SIZE = 16;

// Concrete with a few darker flecks, under Plattan's paving.
function concrete(image, from, seed) {
  for (let y = from; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      setPixel(image, x, y, colour(noise(x, y, seed) < 0.12 ? 'grey_3' : 'grey_4'));
    }
  }
  fillRect(image, 0, SIZE - 1, SIZE, 1, colour('grey_3'));
}

// Plattan: the paving seen low across, two rows of triangles turned
// against each other, black in white and white in black.
function plattan() {
  const image = createImage(SIZE, SIZE);
  const band = 4;
  for (let y = 0; y < 2 * band; y++) {
    const row = Math.floor(y / band);
    const depth = (y % band) + 1;
    for (let x = 0; x < SIZE; x++) {
      const across = Math.abs((x % 8) - 3.5);
      const inside = across < depth;
      const white = (row === 0) === inside;
      setPixel(image, x, y, colour(white ? 'grey_6' : 'grey_1'));
    }
  }
  fillRect(image, 0, 2 * band, SIZE, 1, colour('ink'));
  concrete(image, 2 * band + 1, 61);
  return image;
}

function plattanFill() {
  const image = createImage(SIZE, SIZE);
  concrete(image, 0, 62);
  return image;
}

// Cobbles: rounded stones, two to a tile's width, in staggered rows, the
// grout dark between them; the top row's caught by the light.
function cobbles(lit) {
  const image = createImage(SIZE, SIZE);
  fillRect(image, 0, 0, SIZE, SIZE, colour('grey_1'));
  for (let row = 0; row < 4; row++) {
    const shift = row % 2 === 0 ? 0 : 4;
    for (let stone = -1; stone < 2; stone++) {
      const left = stone * 8 + shift;
      const tone = noise(stone + 7, row, 71) < 0.5 ? 'grey_3' : 'grey_4';
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 7; x++) {
          // Rounded: the stone's corners left dark.
          if ((x === 0 || x === 6) && (y === 0 || y === 2)) continue;
          const px = left + x;
          if (px < 0 || px >= SIZE) continue;
          const shade = y === 0 ? (lit && row === 0 ? 'grey_5' : 'grey_4') : y === 2 ? 'grey_2' : tone;
          setPixel(image, px, row * 4 + y, colour(shade));
        }
      }
    }
  }
  return image;
}

// The tunnelbana's wall: small pale tiles in grey grout, the band of
// colour along its top.
function metroTiles(band) {
  const image = createImage(SIZE, SIZE);
  fillRect(image, 0, 0, SIZE, SIZE, colour('grey_4'));
  for (let y = 0; y < SIZE; y += 4) {
    for (let x = 0; x < SIZE; x += 4) {
      fillRect(image, x, y, 3, 3, colour(noise(x, y, 81) < 0.15 ? 'grey_5' : 'grey_6'));
    }
  }
  if (band) {
    fillRect(image, 0, 0, SIZE, 1, colour('grey_3'));
    fillRect(image, 0, 4, SIZE, 3, colour('blue_3'));
    fillRect(image, 0, 7, SIZE, 1, colour('blue_2'));
  }
  return image;
}

export const MATERIAL_ART = {
  '*': { top: [plattan()], fill: [plattanFill()] },
  '+': { top: [cobbles(true)], fill: [cobbles(false)] },
  J: { top: [metroTiles(true)], fill: [metroTiles(false)] },
};
