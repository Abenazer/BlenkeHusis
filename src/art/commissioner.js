// The city's commissioner for social affairs, Sergels torg's boss, drawn in
// code until the asset factory delivers her (batch 28): grey hair in a
// bob, glasses, a grey trouser suit and a red scarf, walking, holding up
// the action plan for Plattan, and squashed. Facing right, in the bosses'
// 26×33 frame on [12, 33]. Pure: no DOM.
import { framed } from './framed.js';

export const BOSS_FRAME = { width: 26, height: 33, originX: 12, originY: 33 };

const LEGEND = {
  k: 'ink', G: 'grey_5', g: 'grey_4', f: 'skin_4', F: 'skin_3', w: 'white',
  S: 'grey_3', s: 'grey_2', R: 'red_3', r: 'red_2', p: 'white', l: 'grey_4',
};

const HEAD = [
  '.....kkkkkk.....',
  '....kGGGGGGk....',
  '...kGGGGGGGGk...',
  '...kGGfffffGk...',
  '...kGkkkfkkkk...',
  '...kGkwkkkwkk...',
  '...kGffffffFk...',
  '...kGfffkkFk....',
  '....kkffffk.....',
  '....kRRRRRRk....',
];
const BODY = [
  '...kSSRrRRSSk...',
  '..kSSSSRrSSSSk..',
  '..kSsSSSRSSSSk..',
  '..kSsSSSSSSSSk..',
  '..kSsSSSSSSSSk..',
  '..kSsSSSSSSSSk..',
  '..kSsSSSSSSSSk..',
  '..kSsSSSSSSSSk..',
  '..kSsSSSSSSSSk..',
  '..kfkSSSSSSkfk..',
  '...kkSSSSSSkk...',
  '...kSSSSSSSSk...',
];
// The action plan held up: a white folder with its lines.
const PLAN = [
  '...kSSRrRRSSk.kkkkk',
  '..kSSSSRrSSSSkppppk',
  '..kSsSSSRSSSSklllpk',
  '..kSsSSSSSSSkkppppk',
  '..kSsSSSSSSSkfklllk',
  '..kSsSSSSSSSk.kppk.',
  '..kSsSSSSSSSk..kk..',
  '..kSsSSSSSSSk......',
  '..kSsSSSSSSSk......',
  '..kfkSSSSSSSk......',
  '...kkSSSSSSkk......',
  '...kSSSSSSSSk......',
];
const STRIDE = [
  '...kSSSSkSSSSk..',
  '...kSSSk.kSSSk..',
  '...kSSSk.kSSSk..',
  '...kSSSk.kSSSk..',
  '...kSSSk.kSSSk..',
  '...kSSSk.kSSSk..',
  '...kSSSk.kSSSk..',
  '..kkkkkk.kkkkkk.',
];
const PASSING = [
  '....kSSSSSSSk...',
  '....kSSSsSSSk...',
  '....kSSSsSSSk...',
  '....kSSSsSSSk...',
  '.....kSSsSSk....',
  '.....kSSSSSk....',
  '.....kSSSSSk....',
  '....kkkkkkkkk...',
];
const SQUASHED = [
  '......kkkkkk.......',
  '....kkGGGGGGkk.....',
  '...kGGkkfkkfGGk....',
  '..kSSSSRRRRSSSSk.kk',
  '..kSSSSSSSSSSSSkkpk',
  '.kkkkkkSSSSSSkkkkkk',
  '.kkkkkkkkkkkkkkkkk.',
];

// Shifted so the middle of her feet stands on the frame's origin.
const placed = (rows, name) => framed(rows.map((row) => `....${row}`), LEGEND, name, BOSS_FRAME);

export const COMMISSIONER_ART = {
  move: [placed([...HEAD, ...BODY, ...STRIDE], 'commissioner move 1'), placed([...HEAD, ...BODY, ...PASSING], 'commissioner move 2')],
  act: placed([...HEAD, ...PLAN, ...STRIDE], 'commissioner act'),
  defeated: placed(SQUASHED, 'commissioner defeated'),
};
