// Tungelsta IF on its pitch, drawn in code until the asset factory
// delivers it (ordered as batch 13 in TODO.md): a junior in the club's
// orange shirt and black shorts, a football goal and the club's banner.
// The junior is drawn as a citizen sheet is delivered (a 20×25 frame
// standing on [8, 25], standing and waving); the goal and the banner stand
// on their bottom left corner, as scenery does. Once delivered, this file
// is deleted. Pure: no DOM.
import { colour } from '../palette.js';
import { createImage, fillRect, parsePixels, stamp } from '../pixels.js';
import { SCENERY } from '../scenery.js';
import { textImage } from './font.js';

const FRAME_WIDTH = 20;
const FRAME_HEIGHT = 25;

const JUNIOR = {
  a: 'ink',
  h: 'urine_2',
  s: 'skin_4',
  d: 'skin_3',
  o: 'orange_2',
  O: 'orange_1',
  k: 'grey_1',
};

// Rows from the frame's top, left to right, padded out to the frame.
function frame(rows, name) {
  const padded = [...Array(FRAME_HEIGHT - rows.length).fill(''), ...rows].map((row) => row.padEnd(FRAME_WIDTH, '.'));
  return parsePixels(padded, JUNIOR, name);
}

const HEAD = [
  '...aaaa',
  '..ahhhha',
  '..ahhsssa',
  '..ahssasa',
  '..assssda',
  '...asssa',
  '..aookooa',
];

const LEGS = [
  '..akkkkka',
  '..akkakka',
  '..assassa',
  '..aooaooa',
  '..aooaooa',
  '..akkakkka',
  '..aaaaaaaa',
];

const ARMS_DOWN = [
  '.aoooooooa',
  '.aoaoooaoa',
  '.aoaoOoaoa',
  '.asaoOoasa',
];

// The near arm up, waving: raised high, then out to the side.
const WAVE_HIGH = [
  '.........asa',
  '.........aoa',
  '..aookooaoa',
  '.aoooooooa',
  '.aoaoooaa',
  '.aoaoOoa',
  '.asaoOoa',
];

const WAVE_OUT = [
  '..........asa',
  '..aookooaaoa',
  '.aoooooooooa',
  '.aoaoooaaaa',
  '.aoaoOoa',
  '.asaoOoa',
];

const CITIZEN_ORIGIN = { originX: 8, originY: FRAME_HEIGHT };

export const CITIZEN_ART = {
  junior: {
    stand: { frames: [{ image: frame([...HEAD, ...ARMS_DOWN, ...LEGS], 'junior stand'), ...CITIZEN_ORIGIN }], fps: 2 },
    wave: {
      frames: [
        { image: frame([...HEAD.slice(0, -1), ...WAVE_HIGH, ...LEGS], 'junior wave 1'), ...CITIZEN_ORIGIN },
        { image: frame([...HEAD.slice(0, -1), ...WAVE_OUT, ...LEGS], 'junior wave 2'), ...CITIZEN_ORIGIN },
      ],
      fps: 4,
    },
  },
};

// A seven-a-side goal: white posts and crossbar, the net behind them a
// grid of grey cords.
function footballGoal() {
  const { width, height } = SCENERY.footballGoal;
  const image = createImage(width, height);
  const cord = colour('grey_5');
  for (let x = 3; x < width - 3; x += 4) fillRect(image, x, 3, 1, height - 3, cord);
  for (let y = 5; y < height; y += 4) fillRect(image, 3, y, width - 6, 1, cord);
  const post = colour('white');
  const shade = colour('grey_4');
  fillRect(image, 0, 0, width, 3, post);
  fillRect(image, 0, 2, width, 1, shade);
  for (const x of [0, width - 3]) {
    fillRect(image, x, 0, 3, height, post);
    fillRect(image, x + 2, 3, 1, height - 3, shade);
  }
  return image;
}

// The club's banner on two poles at the pitch's side: black, an orange
// border, the club's name in orange.
function clubBanner() {
  const { width, height } = SCENERY.clubBanner;
  const image = createImage(width, height);
  const pole = colour('brown_2');
  fillRect(image, 1, 0, 2, height, pole);
  fillRect(image, width - 3, 0, 2, height, pole);
  fillRect(image, 3, 2, width - 6, 15, colour('orange_2'));
  fillRect(image, 4, 3, width - 8, 13, colour('ink'));
  const text = textImage('TUNGELSTA IF', 'orange_3');
  return stamp(image, text, Math.floor((width - text.width) / 2), 3);
}

export const SCENERY_ART = {
  footballGoal: { frames: [{ image: footballGoal(), originX: 0, originY: SCENERY.footballGoal.height }], fps: 1 },
  clubBanner: { frames: [{ image: clubBanner(), originX: 0, originY: SCENERY.clubBanner.height }], fps: 1 },
};
