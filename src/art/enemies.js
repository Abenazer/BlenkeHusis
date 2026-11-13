// The hits a boss has left, drawn in code as pips over his head, full or
// spent; the enemies themselves are the asset factory's sheets. Pure: no
// DOM.
import { parsePixels } from '../pixels.js';

const PIP = { k: 'ink', R: 'red_3', r: 'red_4', G: 'grey_3' };

export const BOSS_PIPS = {
  full: parsePixels(['.kkk.', 'kRrRk', 'kRRRk', '.kkk.'], PIP, 'pip'),
  spent: parsePixels(['.kkk.', 'kGGGk', 'kGGGk', '.kkk.'], PIP, 'pip spent'),
};
