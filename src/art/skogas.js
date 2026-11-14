// Skogås centrum in the early 1980s, drawn in code until the asset factory
// delivers it (ordered as batch 16 in TODO.md): the youngsters hanging
// about the centre, in denim jackets over white T-shirts, jeans and
// white trainers, and the sign on the roof of Fornborgs Färg och Parfym,
// its orange castle tower by the name.
// The youngster is hung as a delivered citizen is (src/art/citizen.js);
// the sign stands on its bottom left corner, as scenery does. Once
// delivered, this file is deleted. Pure: no DOM.
import { colour } from '../palette.js';
import { createImage, fillRect, parsePixels, stamp } from '../pixels.js';
import { SCENERY } from '../scenery.js';
import { citizenLooks } from './citizen.js';
import { textImage } from './font.js';

const YOUTH = {
  a: 'ink',
  h: 'brown_3',
  s: 'skin_4',
  d: 'skin_3',
  j: 'blue_3',
  J: 'blue_2',
  n: 'blue_2',
  N: 'blue_1',
  w: 'white',
};

// Feathered hair parted at the side, the jacket's collar round the
// T-shirt last.
const HEAD = [
  '...aaaa',
  '..ahhhha',
  '..ahhhhha',
  '..ahhsasa',
  '..ahssssa',
  '...assda',
  '..ajwwja',
];

// The jacket open over the T-shirt, its waistband, the hands.
const ARMS_DOWN = [
  '.ajjwwwjja',
  '.ajajwjaja',
  '.ajajwjaja',
  '.ajaJJJaja',
  '.asannnasa',
];

// Straight jeans and white trainers.
const LEGS = [
  '..annnnna',
  '..anNanNa',
  '..anNanNa',
  '..anNanNa',
  '..awwawwa',
  '..aaaaaaa',
];

// The near arm up, waving: raised high, then out to the side.
const WAVE_HIGH = [
  '.........asa',
  '.........aja',
  '..ajwwjaaja',
  '.ajjwwwjja',
  '.ajajwjaa',
  '.ajaJJJa',
  '.asannna',
];

const WAVE_OUT = [
  '..........asa',
  '..ajwwjaaaja',
  '.ajjwwwjjjja',
  '.ajajwjaaaa',
  '.ajaJJJa',
  '.asannna',
];

const FACE = HEAD.slice(0, -1);

export const CITIZEN_ART = {
  skogasYouth: citizenLooks('skogas youth', YOUTH, [...HEAD, ...ARMS_DOWN, ...LEGS], [
    [...FACE, ...WAVE_HIGH, ...LEGS],
    [...FACE, ...WAVE_OUT, ...LEGS],
  ]),
};

// The shop's logo, an orange castle tower (the borg in Fornborg): its
// battlements, an arrow slit and the gate at its foot.
const TOWER = parsePixels([
  'oo.oo.oo.oo',
  'ooooooooooO',
  'ooooooooooO',
  '.ooooooooO.',
  '.oooaaoooO.',
  '.oooaaoooO.',
  '.oooaaoooO.',
  '.ooooooooO.',
  '.ooooooooO.',
  '.ooooooooO.',
  '.oooaaoooO.',
  '.ooaaaaooO.',
  '.ooaaaaooO.',
  '.ooaaaaooO.',
], { o: 'orange_2', O: 'orange_1', a: 'ink' }, 'fornborg tower');

// The shop's sign on two posts on its roof: white, a red border, the
// tower, and by it the name in red over what it sells in purple.
function fornborgSign() {
  const { width, height } = SCENERY.fornborgSign;
  const board = 24;
  const image = createImage(width, height);
  const post = colour('grey_2');
  fillRect(image, 8, 0, 2, height, post);
  fillRect(image, width - 10, 0, 2, height, post);
  fillRect(image, 0, 0, width, board, colour('red_2'));
  fillRect(image, 1, 1, width - 2, board - 2, colour('white'));
  stamp(image, TOWER, 4, Math.floor((board - TOWER.height) / 2));
  const textLeft = 4 + TOWER.width + 2;
  const textWidth = width - 1 - textLeft;
  const name = textImage('FORNBORGS', 'red_2');
  const wares = textImage('FÄRG & PARFYM', 'purple_2');
  stamp(image, name, textLeft + Math.floor((textWidth - name.width) / 2), 2);
  return stamp(image, wares, textLeft + Math.floor((textWidth - wares.width) / 2), 12);
}

export const SCENERY_ART = {
  fornborgSign: { frames: [{ image: fornborgSign(), originX: 0, originY: SCENERY.fornborgSign.height }], fps: 1 },
};
