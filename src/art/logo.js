// Big arcade lettering: the title screen's logo, BLENKE HUSIS over &
// URINJAKTEN, and the game over's heading, made from the game's own font
// blown up, with bands of colour down each letter, a dark outline and a
// drop shadow, the way arcade titles were. Drawn in code until the asset
// factory delivers a logo. Pure: no DOM.
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

function rowsWithPixels(image) {
  const rows = [];
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if (getPixel(image, x, y) !== null) {
        rows.push(y);
        break;
      }
    }
  }
  return rows;
}

// One line of text: each pixel of it becomes a scale × scale block,
// coloured by the band of the capitals' row it comes from (dots above
// Å, Ä and Ö take the top band, descenders the bottom one). The picture
// is as high as the text reaches, plus the outline and shadow.
export function bigText(text, scale, bands) {
  if (bands.length !== CAP_HEIGHT) throw new Error(`Big text needs a band for each of the ${CAP_HEIGHT} rows of the capitals`);
  const mask = textImage(text, 'white');
  const rows = rowsWithPixels(mask);
  const first = rows[0];
  const last = rows[rows.length - 1];
  const room = 2 * BORDER + SHADOW_OFFSET;
  const image = createImage(mask.width * scale + room, (last - first + 1) * scale + room);
  for (let row = first; row <= last; row++) {
    const band = colour(bands[Math.min(Math.max(row - ABOVE, 0), CAP_HEIGHT - 1)]);
    for (let col = 0; col < mask.width; col++) {
      if (getPixel(mask, col, row) === null) continue;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          setPixel(image, BORDER + col * scale + dx, BORDER + (row - first) * scale + dy, band);
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
  const lines = LINES.map(({ text, bands }) => bigText(text, LOGO_SCALE, bands));
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

export const GAME_OVER_SCALE = 3;
export const GAME_OVER_HEADING = bigText('SPELET ÄR SLUT', GAME_OVER_SCALE, ['red_4', 'red_4', 'red_3', 'red_3', 'red_3', 'red_2', 'red_2']);
