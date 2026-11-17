// A night walker, drawn in code until the asset factory delivers her
// (batch 29): a parent out walking the town at night in a yellow vest over
// a dark jacket, jeans and boots, a thermos of coffee in her hand;
// standing, and waving. Facing right. Pure: no DOM.
import { CITIZEN_FRAME } from './chess.js';
import { framed } from './framed.js';

const LEGEND = {
  k: 'ink', h: 'brown_3', H: 'brown_2', f: 'skin_4', F: 'skin_3', Y: 'hivis_3', y: 'hivis_2',
  J: 'grey_2', B: 'blue_3', b: 'blue_2', t: 'red_3', g: 'grey_5',
};

const HEAD = [
  '.....kkkk.....',
  '....khhhhk....',
  '...khhhhhhk...',
  '...khhffkfk...',
  '...khfffffk...',
  '....kffFFk....',
  '.....kffk.....',
];
const LEGS = [
  '....kBBBBBBk..',
  '....kBBBbBBk..',
  '....kBBkbBBk..',
  '....kBBk.kBBk.',
  '....kkkk.kkkk.',
];
const body = (arm) => [
  '...kYJJJJYYk..',
  '..kYYJJJJYYk..',
  '..kYyYYYYYYk..',
  ...arm,
  '...kkYYYYYk...',
];
const DOWN = [
  '..kYyYYYYYYk..',
  '..kfkYYYYYkkk.',
  '..kkkYYYYYktk.',
  '..kkkYYYYYkgk.',
];
const UP = [
  '..kYyYYYYYYkfk',
  '..kfkYYYYYYkfk',
  '..kkkYYYYYYkkk',
  '..kkkYYYYYk...',
];
const OUT = [
  '..kYyYYYYYYkkkk',
  '..kfkYYYYYYYYfk',
  '..kkkYYYYYYkkkk',
  '..kkkYYYYYk....',
];

const figure = (arm, name) => framed([...HEAD, ...body(arm), ...LEGS], LEGEND, name, CITIZEN_FRAME);

export const NIGHT_WALKER_ART = {
  stand: { frames: [figure(DOWN, 'night walker stand')], fps: 2 },
  wave: { frames: [figure(UP, 'night walker wave 1'), figure(OUT, 'night walker wave 2')], fps: 4 },
};
