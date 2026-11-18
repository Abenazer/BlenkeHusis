// Three brothers singing outside the temple in Västerhaninge, the way
// Sweden won the Eurovision Song Contest in 1984: in short-sleeved shirts
// (navy, red, turquoise), white trousers to the ankles and golden high-top
// sneakers. Drawn in code until the asset factory delivers them; standing,
// and gesturing as they sing. Facing right. Pure: no DOM.
import { CITIZEN_FRAME } from './chess.js';
import { framed } from './framed.js';

const SHIRTS = {
  singerNavy: { hair: 'urine_2', streaks: 'urine_2', shirt: 'blue_2', shade: 'blue_1' },
  singerRed: { hair: 'brown_4', streaks: 'urine_3', shirt: 'red_3', shade: 'red_2' },
  singerTurquoise: { hair: 'brown_4', streaks: 'urine_3', shirt: 'water_4', shade: 'water_3' },
};

const HEAD = [
  '....kkkkkk....',
  '...kHHHHhHk...',
  '..khHHhHhhhk..',
  '..khhhffkfFk..',
  '...khfffffk...',
  '....kffFFk....',
  '.....kffk.....',
];
const LEGS = [
  '....kWWWWWWk..',
  '....kWWWwWWk..',
  '....kWWkwWWk..',
  '....kWWk.kWWk.',
  '....kWwk.kWwk.',
  '...kGGGGkkGGGGk',
  '...kGgGGkkGgGGk',
  '...kGgGGkkGgGGk',
  '...kGGGGGkGGGGGk',
  '...kWWWWWkWWWWWk',
  '...kkkkkkkkkkkkk',
];
const body = (arm) => [
  '...kSSSfSSSk..',
  '..kSSSSSSSSSk.',
  ...arm,
  '....kSSSSSSk..',
];
const DOWN = [
  '..kfkSSSSSkfk.',
  '..kfksSSSSkfk.',
  '..kkkSSSSSkkk.',
];
const UP = [
  '..kfkSSSSSkkfk',
  '..kfksSSSSSkfk',
  '..kkkSSSSSkkk.',
];
const OUT = [
  '..kfkSSSSSSkkkk',
  '..kfksSSSSSSffk',
  '..kkkSSSSSSkkkk',
];

const look = (type) => {
  const { hair, streaks, shirt, shade } = SHIRTS[type];
  const legend = {
    k: 'ink', h: hair, H: streaks, f: 'skin_4', F: 'skin_3', S: shirt, s: shade,
    W: 'white', w: 'grey_5', G: 'urine_3', g: 'urine_4',
  };
  const figure = (arm, name) => framed([...HEAD, ...body(arm), ...LEGS], legend, `${type} ${name}`, CITIZEN_FRAME);
  return {
    stand: { frames: [figure(DOWN, 'stand')], fps: 2 },
    wave: { frames: [figure(UP, 'sing 1'), figure(OUT, 'sing 2')], fps: 4 },
  };
};

export const SINGER_ART = Object.fromEntries(Object.keys(SHIRTS).map((type) => [type, look(type)]));
