// The velvet rope at a club's door on Stureplan, drawn in code until the
// asset factory delivers it (batch 26): two brass posts on round feet and
// the red rope sagging between them. Standing on its bottom row, placed by
// its bottom left corner as a delivered piece of scenery is. Pure: no DOM.
import { parsePixels } from '../pixels.js';

const LEGEND = { k: 'ink', O: 'urine_4', o: 'urine_3', R: 'red_3', r: 'red_2' };

const ROPE = [
  '...kk...............................kk..',
  '..kOok.............................kOok.',
  '..kook.............................kook.',
  '...kk...............................kk..',
  '..kokk............................kkok..',
  '..kokRkk........................kkRkok..',
  '..kOkrRRk......................kRRrkOk..',
  '..kokkrrRkk..................kkRrrkkok..',
  '..kok.kkrRRkk..............kkRRrkk.kok..',
  '..kOk...krrRRkkk........kkkRRrrk...kOk..',
  '..kok....kkrrRRRkkkkkkkkRRRrrkk....kok..',
  '..kok......kkrrrRRRRRRRRrrrkk......kok..',
  '..kOk........kkkrrrrrrrrkkk........kOk..',
  '.kkkkk..........kkkkkkkk..........kkkkk.',
  '.koook............................koook.',
  '.kkkkk............................kkkkk.',
];

export const VELVET_ROPE_ART = {
  fps: 1,
  frames: [{ image: parsePixels(ROPE, LEGEND, 'velvet rope'), originX: 0, originY: ROPE.length }],
};
