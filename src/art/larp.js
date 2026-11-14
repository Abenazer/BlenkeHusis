// The youngsters larping by the fields in Krigslida, drawn in code until
// the asset factory delivers them (ordered as batch 17 in TODO.md), in
// home-made costumes: a wizard in a dyed bedsheet with a broomstick staff,
// an elf with a bow, an orc in war paint, a thief in a hood and a warrior
// with a foam sword taller than he is, which takes a bigger frame than a
// citizen's. Once delivered, this file is deleted. Pure: no DOM.
import { citizenLooks } from './citizen.js';

// The wizard: a pointed hat with a star, a cotton-wool beard, a bedsheet
// robe with a potion at its belt and a broomstick with a tinfoil ball.
const WIZARD = {
  a: 'ink',
  f: 'grey_5',
  F: 'grey_4',
  b: 'brown_3',
  h: 'purple_3',
  H: 'purple_2',
  y: 'urine_4',
  g: 'grey_6',
  G: 'grey_5',
  s: 'skin_4',
  d: 'skin_3',
  r: 'blue_3',
  R: 'blue_2',
  t: 'red_3',
  k: 'brown_1',
};

const WIZARD_HAT = [
  '.ff......a',
  'fFFf....aha',
  '.ff....ahHa',
  '..b....ahyHa',
  '..b...ahhhHa',
  '..b...ahhhhHa',
  '..b.ahhhhhhhHa',
  '..b..aggssasa',
];

const WIZARD_BEARD = [
  '..b..agsssda',
  '..b..agggggga',
];

const WIZARD_ARMS_DOWN = [
  '..b.argggggrra',
  '..bararggGgrara',
  '..bararrgggrara',
  '..sasarRRtRrasa',
];

const WIZARD_ROBE = [
  '..b.arrRrrrrra',
  '..b.arrRrryrra',
  '..b.arrRrrrrra',
  '..barrrRrrrrrra',
  '..barrrRrrrrrra',
  '..b.akkaaakka',
  '..b.aaaa.aaaa',
];

const WIZARD_WAVE_HIGH = [
  '..b..agsssda..asa',
  '..b..agggggga.ara',
  '..b.argggggrraara',
  '..bararggGgrraa',
  '..bararrgggrra',
  '..sasarRRtRrra',
];

const WIZARD_WAVE_OUT = [
  '..b..agsssda...asa',
  '..b..agggggga..ara',
  '..b.argggggrrraara',
  '..bararggGgrraaaa',
  '..bararrgggrra',
  '..sasarRRtRrra',
];

// The elf: long fair hair with a pointed ear through it, a green tunic,
// a pouch of herbs at the belt and a bow in the hand behind.
const ELF = {
  a: 'ink',
  h: 'urine_4',
  H: 'urine_3',
  s: 'skin_4',
  d: 'skin_3',
  g: 'grass_3',
  G: 'grass_2',
  l: 'brown_3',
  w: 'grey_6',
  k: 'brown_2',
  p: 'brown_4',
  t: 'grass_4',
};

const ELF_HEAD = [
  '.....aaaa',
  '....ahhhha',
  '...ahhhhhha',
  '..asHhhsasa',
  '...aHhssssa',
  '...aHhasda',
];

const ELF_ARMS_DOWN = [
  '.l.aHggggga',
  '.lwagggggga',
  'l.wagagggaga',
  'l.waGakkkaga',
  'l.ssagtgggasa',
  'l.wagggggga',
  '.lw.agaaga',
];

const ELF_LEGS = [
  '.l..apaapa',
  '....apaapa',
  '....akaaka',
  '....akkakka',
  '....aaaaaaa',
];

const ELF_WAVE_HIGH = [
  '.l.aHggggga.asa',
  '.lwagggggga.aga',
  'l.wagaggggaaga',
  'l.waGakkkaga',
  'l.ssagtgggaa',
  'l.wagggggga',
  '.lw.agaaga',
];

const ELF_WAVE_OUT = [
  '.l.aHggggga..asa',
  '.lwaggggggaaaga',
  'l.wagaggggggga',
  'l.waGakkkaaaa',
  'l.ssagtgggaa',
  'l.wagggggga',
  '.lw.agaaga',
];

// The orc: green war paint on the face, a mop of black hair, a vest of
// cardboard armour and a foam club.
const ORC = {
  a: 'ink',
  h: 'grey_1',
  o: 'slime_3',
  O: 'slime_2',
  w: 'grey_6',
  v: 'brown_3',
  V: 'brown_2',
  n: 'grey_3',
  N: 'grey_2',
  k: 'brown_1',
  c: 'brown_4',
  C: 'orange_1',
  s: 'skin_4',
};

const ORC_HEAD = [
  '....a.a.a',
  '...ahahaha',
  '...ahhhhhha',
  '...ahhoOaoa',
  '...ahooooOa',
  '....aowowa',
  '.....aooa',
];

const ORC_ARMS_DOWN = [
  '...aovvVvvoa',
  '...aoaVvVaoa',
  '...aoavVvaoa.ac',
  '...aoaVVVaoaacC',
  '...asannnasaca',
];

const ORC_LEGS = [
  '....annnnna',
  '....anNanNa',
  '....anNanNa',
  '....akkakka',
  '....akkakka',
  '....aaaaaaa',
];

const ORC_WAVE_HIGH = [
  '....aowowa.aoa',
  '.....aooa..aoa',
  '...aovvVvvaaoa',
  '...aoaVvVvvoa',
  '...aoavVvaaa',
  '...aoaVVVa',
  '...asannna',
];

const ORC_WAVE_OUT = [
  '.....aooa...aoa',
  '...aovvVvvaaaoa',
  '...aoaVvVvvvvoa',
  '...aoavVvaaaaa',
  '...aoaVVVa',
  '...asannna',
];

// The thief: a dark hood over a mask, a cloak, a coin purse at the belt
// and soft boots.
const THIEF = {
  a: 'ink',
  c: 'grey_2',
  C: 'grey_1',
  m: 'red_2',
  s: 'skin_4',
  d: 'skin_3',
  e: 'grey_6',
  u: 'urine_3',
  n: 'brown_2',
  N: 'brown_1',
  k: 'grey_1',
};

const THIEF_HEAD = [
  '.....aaaa',
  '....acccca',
  '...acccccca',
  '...accmmema',
  '...accsssda',
  '...aCcassa',
];

const THIEF_ARMS_DOWN = [
  '..acCccccca',
  '..aCcccccccca',
  '..aCacccccaca',
  '..aCacnnnacaa',
  '..aCasuuasa',
  '..aCCcccca',
];

const THIEF_LEGS = [
  '...aCanNana',
  '....anNanNa',
  '....akkakka',
  '....akkakka',
  '....aaaaaaa',
];

const THIEF_WAVE_HIGH = [
  '...aCcassa.asa',
  '..acCcccccaaca',
  '..aCccccccccca',
  '..aCacccccaaa',
  '..aCacnnna',
  '..aCasuua',
  '..aCCcccca',
];

const THIEF_WAVE_OUT = [
  '...aCcassa..asa',
  '..acCcccccaaaca',
  '..aCcccccccccca',
  '..aCacccccaaaa',
  '..aCacnnna',
  '..aCasuua',
  '..aCCcccca',
];

// The warrior: a helmet of painted cardboard, a red tabard over a knitted
// "chain mail" jumper, and his foam sword, taller than he is, carried over
// his shoulder; waving, he holds it up. Its own frame, bigger than a
// citizen's, the origin under the middle of his feet as in one.
export const WARRIOR_FRAME = { width: 32, height: 32, originX: 19, originY: 32 };

const WARRIOR = {
  a: 'ink',
  f: 'grey_6',
  F: 'grey_4',
  g: 'urine_3',
  G: 'urine_2',
  b: 'brown_2',
  h: 'grey_5',
  H: 'grey_3',
  s: 'skin_4',
  d: 'skin_3',
  r: 'red_3',
  R: 'red_2',
  m: 'grey_4',
  n: 'brown_3',
  N: 'brown_2',
  k: 'brown_1',
};

// The warrior's figure, 18 rows standing on the frame's bottom, its
// columns where they stand in the frame (his feet's middle at 19).
const WARRIOR_HEAD = [
  '................aaaaa',
  '...............ahhhhha',
  '..............ahhhhhhHa',
  '..............aHhhhhhHa',
  '..............aHaHsasHa',
  '..............aHasssdHa',
  '...............aassssa',
];

// His sword hand at his shoulder, the other arm down.
const WARRIOR_ARMS = [
  '..............amrrrrrrma',
  '.............amarrgrssa',
  '.............amarggGraa',
  '.............amarrgrra',
  '.............asaRRRRRa',
];

const WARRIOR_WAVE = [
  '..............amrrrrrrmma',
  '.............amarrgrrraa',
  '.............amarggGraa',
  '.............amarrgrra',
  '.............asaRRRRRa',
];

const WARRIOR_LEGS = [
  '...............annnnna',
  '...............anNanNa',
  '...............anNanNa',
  '...............akkakka',
  '...............akkakka',
  '...............aaaaaaa',
];

// A blade from the hilt (the grip's top, in his hand) in a direction,
// drawn into a grid: two pixels wide (light and shade), a crossguard
// across it, a pommel below the grip, then everything outlined in ink.
function sword(grid, hiltX, hiltY, stepX, stepY, length) {
  const set = (x, y, char) => {
    if (y >= 0 && y < grid.length && x >= 0 && x < grid[y].length) grid[y][x] = char;
  };
  for (let step = 1; step <= length; step++) {
    const x = Math.round(hiltX + stepX * step);
    const y = Math.round(hiltY + stepY * step);
    set(x, y, 'f');
    set(x + (Math.abs(stepY) > Math.abs(stepX) ? 1 : 0), y + (Math.abs(stepY) > Math.abs(stepX) ? 0 : 1), 'F');
  }
  // The crossguard, across the blade; then the grip and pommel back from
  // the hilt.
  const acrossX = Math.round(-stepY);
  const acrossY = Math.round(stepX);
  for (let side = -2; side <= 2; side++) set(hiltX + acrossX * side, hiltY + acrossY * side, side === 0 ? 'G' : 'g');
  set(Math.round(hiltX - stepX), Math.round(hiltY - stepY), 'b');
  set(Math.round(hiltX - stepX * 2), Math.round(hiltY - stepY * 2), 'b');
  set(Math.round(hiltX - stepX * 3), Math.round(hiltY - stepY * 3), 'g');
  const filled = grid.map((row) => [...row]);
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (filled[y][x] !== '.') continue;
      const touches = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => (filled[y + dy]?.[x + dx] ?? '.') !== '.');
      if (touches) grid[y][x] = 'a';
    }
  }
}

// The figure's rows over the sword, standing on the frame's bottom.
function warriorRows(figure, hilt, direction, length) {
  const { width, height } = WARRIOR_FRAME;
  const grid = Array.from({ length: height }, () => Array(width).fill('.'));
  sword(grid, hilt.x, hilt.y, direction.x, direction.y, length);
  const top = height - figure.length;
  figure.forEach((row, y) => {
    [...row].forEach((char, x) => {
      if (char !== '.') grid[top + y][x] = char;
    });
  });
  return grid.map((row) => row.join(''));
}

// Over his shoulder, the blade sloping up behind him from his hand; held
// up, straight above his head; then swung forward.
const WARRIOR_STAND = warriorRows([...WARRIOR_HEAD, ...WARRIOR_ARMS, ...WARRIOR_LEGS], { x: 22, y: 22 }, { x: -0.55, y: -1 }, 22);
const WARRIOR_WAVE_HIGH = warriorRows([...WARRIOR_HEAD, ...WARRIOR_WAVE, ...WARRIOR_LEGS], { x: 23, y: 18 }, { x: 0, y: -1 }, 18);
const WARRIOR_WAVE_OUT = warriorRows([...WARRIOR_HEAD, ...WARRIOR_WAVE, ...WARRIOR_LEGS], { x: 23, y: 18 }, { x: 0.5, y: -1 }, 17);

export const CITIZEN_ART = {
  larpWizard: citizenLooks('larp wizard', WIZARD, [...WIZARD_HAT, ...WIZARD_BEARD, ...WIZARD_ARMS_DOWN, ...WIZARD_ROBE], [
    [...WIZARD_HAT, ...WIZARD_WAVE_HIGH, ...WIZARD_ROBE],
    [...WIZARD_HAT, ...WIZARD_WAVE_OUT, ...WIZARD_ROBE],
  ]),
  larpElf: citizenLooks('larp elf', ELF, [...ELF_HEAD, ...ELF_ARMS_DOWN, ...ELF_LEGS], [
    [...ELF_HEAD, ...ELF_WAVE_HIGH, ...ELF_LEGS],
    [...ELF_HEAD, ...ELF_WAVE_OUT, ...ELF_LEGS],
  ]),
  larpOrc: citizenLooks('larp orc', ORC, [...ORC_HEAD, ...ORC_ARMS_DOWN, ...ORC_LEGS], [
    [...ORC_HEAD.slice(0, -2), ...ORC_WAVE_HIGH, ...ORC_LEGS],
    [...ORC_HEAD.slice(0, -1), ...ORC_WAVE_OUT, ...ORC_LEGS],
  ]),
  larpThief: citizenLooks('larp thief', THIEF, [...THIEF_HEAD, ...THIEF_ARMS_DOWN, ...THIEF_LEGS], [
    [...THIEF_HEAD.slice(0, -1), ...THIEF_WAVE_HIGH, ...THIEF_LEGS],
    [...THIEF_HEAD.slice(0, -1), ...THIEF_WAVE_OUT, ...THIEF_LEGS],
  ]),
  larpWarrior: citizenLooks('larp warrior', WARRIOR, WARRIOR_STAND, [WARRIOR_WAVE_HIGH, WARRIOR_WAVE_OUT], WARRIOR_FRAME),
};
