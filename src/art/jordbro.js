// Jordbro's children, class 1D at Lundaskolan in 1972, the year Rainer
// Hartleb started filming them for what became the Jordbro films, drawn in
// code until the asset factory delivers them (ordered as batch 14 in
// TODO.md): a seven-year-old with a bowl cut, a striped knitted jumper and
// flared jeans. Drawn as a citizen sheet is delivered (a 20×25 frame
// standing on [8, 25], standing and waving), like Tungelsta IF's junior.
// Once delivered, this file is deleted. Pure: no DOM.
import { parsePixels } from '../pixels.js';

const FRAME_WIDTH = 20;
const FRAME_HEIGHT = 25;

const CHILD = {
  a: 'ink',
  h: 'brown_2',
  s: 'skin_4',
  d: 'skin_3',
  r: 'red_3',
  w: 'urine_3',
  j: 'blue_3',
  J: 'blue_2',
  k: 'brown_1',
};

// Rows from the frame's top, left to right, padded out to the frame.
function frame(rows, name) {
  const padded = [...Array(FRAME_HEIGHT - rows.length).fill(''), ...rows].map((row) => row.padEnd(FRAME_WIDTH, '.'));
  return parsePixels(padded, CHILD, name);
}

// The fringe down to the eyes, the jumper's collar last.
const HEAD = [
  '...aaaa',
  '..ahhhha',
  '..ahhhhha',
  '..ahhsasa',
  '..ahsssda',
  '...asssa',
  '..awwwwwa',
];

// The jeans flare out over the shoes.
const LEGS = [
  '..ajjjjja',
  '..ajJajJa',
  '..ajJajJa',
  '.ajjjajjja',
  '.akkkakkka',
  '.aaaaaaaaa',
];

const ARMS_DOWN = [
  '.arrrrrrra',
  '.awawwwawa',
  '.asarrrasa',
];

// The near arm up, waving: raised high, then out to the side.
const WAVE_HIGH = [
  '.........asa',
  '.........ara',
  '..awwwwwara',
  '.arrrrrrra',
  '.awawwwaa',
  '.asarrra',
];

const WAVE_OUT = [
  '..........asa',
  '..awwwwwaara',
  '.arrrrrrrrra',
  '.awawwwaaaa',
  '.asarrra',
];

const CITIZEN_ORIGIN = { originX: 8, originY: FRAME_HEIGHT };

export const CITIZEN_ART = {
  jordbroChild: {
    stand: { frames: [{ image: frame([...HEAD, ...ARMS_DOWN, ...LEGS], 'jordbro child stand'), ...CITIZEN_ORIGIN }], fps: 2 },
    wave: {
      frames: [
        { image: frame([...HEAD.slice(0, -1), ...WAVE_HIGH, ...LEGS], 'jordbro child wave 1'), ...CITIZEN_ORIGIN },
        { image: frame([...HEAD.slice(0, -1), ...WAVE_OUT, ...LEGS], 'jordbro child wave 2'), ...CITIZEN_ORIGIN },
      ],
      fps: 4,
    },
  },
};
