// A dancer at the rave in the hall at Finnboda varv, drawn in code until
// the asset factory delivers him (batch 29): a bucket hat, a yellow
// smiley T-shirt, baggy jeans and white trainers; standing, and dancing
// with his hands in the air. Facing right. Pure: no DOM.
import { CITIZEN_FRAME } from './chess.js';
import { framed } from './framed.js';

const LEGEND = {
  k: 'ink', A: 'blue_4', a: 'blue_3', f: 'skin_4', F: 'skin_3', Y: 'urine_4', y: 'urine_3',
  J: 'blue_3', j: 'blue_2', w: 'white',
};

const HEAD = [
  '.....kkkkk....',
  '....kAAAAAk...',
  '...kaaaaaaak..',
  '....kffkfFk...',
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
const DOWN = [
  '...kYYYYYYk...',
  '..kYYkYkYYYk..',
  '..kfYYYYYYkfk.',
  '..kfkYkkYYkfk.',
  '..kkkYYYYYkkk.',
  '....kYYYYYk...',
];
// Both hands up, then one up and one out, in time with the beat.
const UP = [
  '..kfk....kfk..',
  '..kfkYYYYkfk..',
  '..kfYYkYkYfk..',
  '...kYYYYYYk...',
  '....kYkkYYk...',
  '....kYYYYYk...',
];
const SWAY = [
  '.........kfk..',
  '...kYYYYYkfk..',
  '.kkYYkYkYYfk..',
  'kffYYYYYYYk...',
  '.kkkYkkYYYk...',
  '....kYYYYYk...',
];

const figure = (arms, name) => framed([...HEAD, ...arms, ...LEGS], LEGEND, name, CITIZEN_FRAME);

export const DANCER_ART = {
  stand: { frames: [figure(DOWN, 'dancer stand')], fps: 2 },
  wave: { frames: [figure(UP, 'dancer wave 1'), figure(SWAY, 'dancer wave 2')], fps: 4 },
};
