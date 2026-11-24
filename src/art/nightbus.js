// A youngster waiting for the night bus on Medborgarplatsen, drawn in
// code until the asset factory delivers her (batch 29): an orange beanie,
// a discman's headphones, a big black puffer jacket, baggy jeans and
// white trainers; standing, and hugging herself against the cold, then
// looking at her watch. Facing right. Pure: no DOM.
import { CITIZEN_FRAME } from './chess.js';
import { framed } from './framed.js';

const LEGEND = {
  k: 'ink', O: 'orange_2', o: 'orange_1', f: 'skin_4', F: 'skin_3', g: 'grey_4',
  G: 'grey_1', P: 'grey_2', J: 'blue_3', j: 'blue_2', w: 'white',
};

const HEAD = [
  '.....kkkkk....',
  '....kOOOOOk...',
  '...kOoOoOoOk..',
  '...kgffkffgk..',
  '....kffffFk...',
  '.....kfFFk....',
];
const LEGS = [
  '....kJJJJJJk..',
  '....kJJjJJJk..',
  '....kJJkkJJk..',
  '...kJJJk.kJJk.',
  '...kJJJk.kJJJk',
  '...kwwwk.kwwwk',
  '...kkkkk.kkkkk',
];
// The puffer jacket, arms down.
const DOWN = [
  '..kGGGGGGGGk..',
  '.kGGPGGGGPGGk.',
  '.kGGkGGGGkGGk.',
  '.kGGkGGPGkGGk.',
  '.kffkGGGGkffk.',
  '..kkkGGGGGkk..',
];
// Hugging herself against the cold, then her arm up to read her watch.
const COLD = [
  '..kGGGGGGGGk..',
  '.kGGPGGGGPGGk.',
  '.kGkkkkkkkkGk.',
  '.kGGGGGPGGGGk.',
  '.kGkkkkkkkkGk.',
  '..kkkGGGGGkk..',
];
const WATCH = [
  '..kGGGGGGGkkk.',
  '.kGGPGGGGkGGk.',
  '.kGGkGGGGkfwk.',
  '.kGGkGGPGGkk..',
  '.kffkGGGGGk...',
  '..kkkGGGGGk...',
];

const figure = (arms, name) => framed([...HEAD, ...arms, ...LEGS], LEGEND, name, CITIZEN_FRAME);

export const NIGHT_BUS_RIDER_ART = {
  stand: { frames: [figure(DOWN, 'night bus rider stand')], fps: 2 },
  wave: { frames: [figure(COLD, 'night bus rider wave 1'), figure(WATCH, 'night bus rider wave 2')], fps: 2 },
};
