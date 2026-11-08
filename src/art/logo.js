// The title screen's logo, BLENKE HUSIS over & URINJAKTEN, made from the
// game's own font blown up, with bands of colour down each letter, a dark
// outline and a drop shadow, the way arcade titles were. Drawn in code until
// the asset factory delivers a logo. Pure: no DOM.
import { colour } from '../palette.js';
import { createImage, getPixel, setPixel, stamp } from '../pixels.js';
import { ABOVE, CAP_HEIGHT, textImage } from './font.js';

export const LOGO_SCALE = 4;
const LINES = [
  { text: 'BLENKE HUSIS', bands: ['hivis_4', 'hivis_4', 'hivis_3', 'hivis_3', 'hivis_3', 'hivis_2', 'hivis_2'] },
  { text: '& URINJAKTEN', bands: ['urine_4', 'urine_4', 'urine_3', 'urine_3', 'urine_3', 'urine_2', 'urine_2'] },
];
const OUTLINE = 'ink';
const SHADOW = 'blue_2';
const SHADOW_OFFSET = 2;
// Rows between the two lines' outlines.
const LINE_GAP = 3;
// Room around the letters for the outline, and below and right for the
// shadow.
const BORDER = 1;

// One line: each pixel of the capitals becomes a scale × scale block,
// coloured by the band of the font row it comes from.
function bigLine({ text, bands }) {
  const mask = textImage(text, 'white');
  const room = 2 * BORDER + SHADOW_OFFSET;
  const image = createImage(mask.width * LOGO_SCALE + room, CAP_HEIGHT * LOGO_SCALE + room);
  for (let row = 0; row < CAP_HEIGHT; row++) {
    for (let col = 0; col < mask.width; col++) {
      if (getPixel(mask, col, row + ABOVE) === null) continue;
      for (let dy = 0; dy < LOGO_SCALE; dy++) {
        for (let dx = 0; dx < LOGO_SCALE; dx++) {
          setPixel(image, BORDER + col * LOGO_SCALE + dx, BORDER + row * LOGO_SCALE + dy, colour(bands[row]));
        }
      }
    }
  }
  return outlined(image);
}

// Every empty pixel next to a letter becomes the outline; the outlined
// letters, moved down and right, become the shadow behind them.
function outlined(image) {
  const { width, height } = image;
  const shape = createImage(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let near = false;
      for (let dy = -BORDER; dy <= BORDER && !near; dy++) {
        for (let dx = -BORDER; dx <= BORDER && !near; dx++) near = getPixel(image, x + dx, y + dy) !== null;
      }
      if (near) setPixel(shape, x, y, getPixel(image, x, y) ?? colour(OUTLINE));
    }
  }
  const result = createImage(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (getPixel(shape, x, y) !== null) setPixel(result, x + SHADOW_OFFSET, y + SHADOW_OFFSET, colour(SHADOW));
    }
  }
  return stamp(result, shape, 0, 0);
}

function makeLogo() {
  const lines = LINES.map(bigLine);
  const width = Math.max(...lines.map((line) => line.width));
  const height = lines.reduce((sum, line) => sum + line.height, 0) + LINE_GAP * (lines.length - 1);
  const logo = createImage(width, height);
  let top = 0;
  for (const line of lines) {
    stamp(logo, line, Math.floor((width - line.width) / 2), top);
    top += line.height + LINE_GAP;
  }
  return logo;
}

export const LOGO = makeLogo();
