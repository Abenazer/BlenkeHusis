// A citizen drawn in code until the asset factory delivers its sheet,
// hung as a delivered citizen is: 20×25 frames standing on [8, 25], his
// feet on the bottom row, standing (one frame, 2 fps) and waving (two
// frames, 4 fps). Pure: no DOM.
import { parsePixels } from '../pixels.js';

export const CITIZEN_FRAME = { width: 20, height: 25, originX: 8, originY: 25 };

// Rows from the figure's top, left to right, padded out to the frame and
// standing on its bottom.
function placed(rows, legend, name) {
  const { width, height, originX, originY } = CITIZEN_FRAME;
  if (rows.length > height) throw new Error(`${name} is ${rows.length} rows, taller than the frame`);
  const padded = [...Array(height - rows.length).fill(''), ...rows].map((row) => row.padEnd(width, '.'));
  return { image: parsePixels(padded, legend, name), originX, originY };
}

// A citizen's looks from its rows: standing, and the two frames of waving.
export function citizenLooks(name, legend, stand, [waveHigh, waveOut]) {
  return {
    stand: { frames: [placed(stand, legend, `${name} stand`)], fps: 2 },
    wave: { frames: [placed(waveHigh, legend, `${name} wave 1`), placed(waveOut, legend, `${name} wave 2`)], fps: 4 },
  };
}
