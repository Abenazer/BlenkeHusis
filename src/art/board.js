// A railway station's name board with its station's name on it: the asset
// factory delivers the board blank, and each level's board carries its
// own station's name in white letters. Pure: no DOM.
import { SCENERY } from '../scenery.js';
import { createImage, opaqueBox, stamp } from '../pixels.js';
import { textImage } from './font.js';

// The widest name that fits the board.
export const BOARD_TEXT_WIDTH = SCENERY.stationSign.width - 8;

// A station's name on the blank board (the factory's leaves a pixel's
// margin round it): centred across the board, two rows below its top
// edge.
export function stationSign(name, blank) {
  const image = stamp(createImage(blank.width, blank.height), blank, 0, 0);
  if (!name) return image;
  const text = textImage(name, 'white');
  if (text.width > BOARD_TEXT_WIDTH) throw new Error(`The station name '${name}' doesn't fit its board`);
  const { left, top, right } = opaqueBox(blank);
  stamp(image, text, left + Math.floor((right - left - text.width) / 2), top + 2);
  return image;
}
