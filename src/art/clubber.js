// A clubber in the queue at Stureplan, drawn in code until the asset
// factory delivers her (batch 29): dressed up for the night, long dark
// hair, a silver top, black flared trousers and platform shoes; standing,
// and dancing where she waits. Facing right. Pure: no DOM.
import { CITIZEN_FRAME } from './chess.js';
import { framed } from './framed.js';

const LEGEND = {
  k: 'ink', H: 'brown_1', h: 'brown_2', f: 'skin_4', F: 'skin_3', r: 'red_3',
  S: 'grey_5', s: 'white', T: 'grey_1', P: 'purple_3',
};

const HEAD = [
  '.....kkkk.....',
  '....kHHHHk....',
  '...kHHhHHHk...',
  '...kHHfkffk...',
  '...kHffffFk...',
  '...kHHffrk....',
  '...kHHkffk....',
];
const LEGS = [
  '....kTTTTTk...',
  '....kTTkTTk...',
  '....kTTkkTTk..',
  '...kTTk..kTTk.',
  '...kPPk..kPPk.',
  '...kkkk..kkkk.',
];
const body = (arm) => [
  '...kHSSSSSk...',
  ...arm,
  '....kTTTTTk...',
];
const DOWN = [
  '..kSSsSSSSSk..',
  '..kfkSSSSSkfk.',
  '..kfkSSSSSkfk.',
  '..kkkSSSSSkkk.',
];
const UP = [
  '..kSSsSSSSSkfk',
  '..kfkSSSSSSkfk',
  '..kfkSSSSSSkk.',
  '..kkkSSSSSk...',
];
const OUT = [
  '..kSSsSSSSSkkkk',
  '..kfkSSSSSSSSfk',
  '..kfkSSSSSSkkkk',
  '..kkkSSSSSk....',
];

const figure = (arm, name) => framed([...HEAD, ...body(arm), ...LEGS], LEGEND, name, CITIZEN_FRAME);

export const CLUBBER_ART = {
  stand: { frames: [figure(DOWN, 'clubber stand')], fps: 2 },
  wave: { frames: [figure(UP, 'clubber wave 1'), figure(OUT, 'clubber wave 2')], fps: 4 },
};
