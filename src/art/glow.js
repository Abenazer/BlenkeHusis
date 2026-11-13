// A power-up lying about glows round its outline, the colour shifting
// from hi-vis yellow to blue light and back, so it stands apart from the
// plain finds (the police coffee from a mere cup of coffee). Drawn in code
// round the asset factory's picture of it; frames are played in turn, the
// same for every power-up. Pure: no DOM.
import { outline } from '../pixels.js';

const GLOW_COLOURS = ['hivis_3', 'hivis_4', 'white', 'sky_4', 'sky_3', 'sky_4', 'white', 'hivis_4'];
export const GLOW_FPS = 10;

export function glowFrames(image) {
  return GLOW_COLOURS.map((name) => outline(image, name));
}
