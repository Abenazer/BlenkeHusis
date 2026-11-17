// A figure drawn in code, hung in a frame the way the asset factory's
// sheets hang theirs: its rows padded out to the frame's width and
// standing on its bottom, placed by the frame's origin. Pure: no DOM.
import { parsePixels } from '../pixels.js';

// The enemies' frame: 20×25, the middle of the feet at [8, 25].
export const ENEMY_FRAME = { width: 20, height: 25, originX: 8, originY: 25 };

// rows from the figure's top; legend from character to palette name.
export function framed(rows, legend, name, frame = ENEMY_FRAME) {
  const { width, height, originX, originY } = frame;
  if (rows.length > height) throw new Error(`${name} is ${rows.length} rows, taller than its frame`);
  const wide = rows.find((row) => row.length > width);
  if (wide) throw new Error(`${name} has a row ${wide.length} wide, wider than its frame`);
  const padded = [...Array(height - rows.length).fill(''), ...rows].map((row) => row.padEnd(width, '.'));
  return { image: parsePixels(padded, legend, name), originX, originY };
}
