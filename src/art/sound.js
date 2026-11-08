// The sound settings' pictures: a loudspeaker struck through, shown while
// all sound is off, and a volume's bar of steps, filled up to its level.
import { colour } from '../palette.js';
import { createImage, fillRect, parsePixels } from '../pixels.js';
import { VOLUME_STEPS } from '../settings.js';

export const SPEAKER_OFF = parsePixels([
  '...k.......',
  '..kWk.k...k',
  'kkWWk.kR.Rk',
  'kWWWk..kRk.',
  'kWWWk..kRk.',
  'kkWWk.kR.Rk',
  '..kWk.k...k',
  '...k.......',
], { k: 'ink', W: 'white', R: 'red_4' }, 'speaker off');

// Each step a block, a pixel apart, inked round: filled steps lit, the
// rest dark.
const STEP_WIDTH = 4;
const STEP_HEIGHT = 7;
const STEP_GAP = 1;

function volumeBar(level) {
  const image = createImage(VOLUME_STEPS * (STEP_WIDTH + STEP_GAP) + STEP_GAP, STEP_HEIGHT + 2);
  fillRect(image, 0, 0, image.width, image.height, colour('ink'));
  for (let step = 0; step < VOLUME_STEPS; step++) {
    const lit = step < level;
    fillRect(image, STEP_GAP + step * (STEP_WIDTH + STEP_GAP), 1, STEP_WIDTH, STEP_HEIGHT, colour(lit ? 'hivis_3' : 'grey_2'));
  }
  return image;
}

// VOLUME_BARS[level] for each level from 0 to VOLUME_STEPS.
export const VOLUME_BARS = Array.from({ length: VOLUME_STEPS + 1 }, (_, level) => volumeBar(level));
