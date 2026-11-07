// The collectibles, drawn in code as pixel maps: each as small as it can be,
// trimmed to its outline, so the page can stand it on the bottom of its tile
// and the HUD can use the same pictures as icons. Pure: no DOM.
import { parsePixels } from '../pixels.js';
import { POWER_UPS } from '../powerups.js';
import { PLAYER_HEAD } from './player.js';

const LEGEND = {
  k: 'ink',
  W: 'white',
  w: 'grey_5',
  g: 'grey_4',
  G: 'grey_3',
  m: 'grey_2',
  U: 'urine_4',
  u: 'urine_3',
  o: 'urine_2',
  R: 'red_3',
  r: 'red_2',
  e: 'grass_4',
  E: 'grass_3',
  n: 'grass_2',
  b: 'blue_4',
  B: 'blue_3',
  y: 'hivis_3',
  c: 'brown_3',
  C: 'brown_2',
  s: 'slime_3',
  S: 'slime_4',
  l: 'sky_4',
};

const art = (name, rows) => parsePixels(rows, LEGEND, `item ${name}`);

export const ITEM_ART = {
  // A screw-top sample cup, warm and full.
  sampleCup: art('sampleCup', [
    '.kkkkk.',
    'kWWWWWk',
    'kgggggk',
    'kWUUUuk',
    'kWUUuuk',
    'kgwwwgk',
    'kWuuuok',
    'kguoook',
    '.kkkkk.',
  ]),
  // A big jar with a red lid and a label, for the statistics.
  sampleJar: art('sampleJar', [
    '..kkkkkk..',
    '.kRRRRRRk.',
    '.krrrrrrk.',
    'kkkkkkkkkk',
    'kWUUUUUUuk',
    'kWUUUUUuuk',
    'kWwwwwwwuk',
    'kWwkkwkwuk',
    'kWwwwwwwuk',
    'kWUUuuuuok',
    'kgUuuuuook',
    'kguuuooook',
    '.kkkkkkkk.',
  ]),
  // A whole canister, with a handle and a red cap.
  sampleCanister: art('sampleCanister', [
    '..kkkkk.....',
    '.kgwwwgk.kk.',
    '.kgkkkgk.kRk',
    'kkkkkkkkkkrk',
    'kWUUUUUUUUuk',
    'kWUUUUUUUuuk',
    'kWUUwwwwUuuk',
    'kWUUwkkwUuuk',
    'kWUUwwwwuuok',
    'kWUUUuuuuuok',
    'kWUuuuuuuook',
    'kguuuuuooook',
    'kgoooooooook',
    '.kkkkkkkkkk.',
  ]),
  // Minor possession: a zip bag the size of a fingernail, a green crumb in
  // it.
  possession: art('possession', [
    'kkkkkk',
    'kRrRrk',
    'kWWWwk',
    'kWEeWk',
    'kWnEwk',
    'kkkkkk',
  ]),
  // A plastic carrier bag, crumpled and empty.
  bag: art('bag', [
    '.kk....kk.',
    'k..k..k..k',
    'k..k..k..k',
    '.kkkkkkkk.',
    'kWWWWWWwwk',
    'kWWwWWWWgk',
    'kWWWWWwWgk',
    'kWwWWWWWgk',
    'kWWWWWWwgk',
    '.kgggggGk.',
    '..kkkkkk..',
  ]),
  // An empty tin, its label half gone.
  emptyCan: art('emptyCan', [
    'kkkkkkk',
    'kmmmmmk',
    'kWwwwgk',
    'kRRRRrk',
    'kRWWRrk',
    'kRRRRrk',
    'kWwwwgk',
    'kWwwggk',
    'kgggGGk',
    '.kkkkk.',
  ]),
  // A spoon, lying on the ground.
  spoon: art('spoon', [
    '.kkk.......',
    'kWWwk......',
    'kWwwgkkkkkk',
    'kwwggkwwWWk',
    '.kkk..kkkkk',
  ]),
  // A test tube with something green in it.
  testTube: art('testTube', [
    'kkkkk',
    'kWlgk',
    '.klk.',
    '.klk.',
    '.klk.',
    '.kSk.',
    '.kSk.',
    '.ksk.',
    '.ksk.',
    '..k..',
  ]),
  // Police coffee in a paper cup, steaming.
  coffee: art('coffee', [
    '..w..w..',
    '...w..w.',
    '..w..w..',
    'kkkkkkkk',
    'kWWWWWwk',
    '.kWWWwk.',
    '.kBBBBk.',
    '.kbbbBk.',
    '.kWWWwk.',
    '..kWwk..',
    '..kkkk..',
  ]),
  // A form, filled in, stamped.
  paperwork: art('paperwork', [
    'kkkkkkk..',
    'kWWWWWkk.',
    'kWGGGWWwk',
    'kWWWWWWwk',
    'kWGGGGWwk',
    'kWWWWWWwk',
    'kWGGWRRwk',
    'kWWWRWRwk',
    'kWWWWRRwk',
    'kkkkkkkkk',
  ]),
  // A government directive in a blue folder with a yellow band.
  directive: art('directive', [
    'kkkkkkkkkk',
    'kbbbbbbbBk',
    'kbbbbbbbBk',
    'kyyyyyyyyk',
    'kbbbbbbbBk',
    'kbbWWWWbBk',
    'kbbbbbbbBk',
    'kBBBBBBBBk',
    'kkkkkkkkkk',
  ]),
  // A bundle of taxpayers' money with its paper band.
  money: art('money', [
    'kkkkkkkkkkkk',
    'keeeeWWeeeek',
    'keEEEWWEEEek',
    'kkkkkkkkkkkk',
    'keeeeWWeeeek',
    'kEEEEWWEEEnk',
    'kkkkkkkkkkkk',
  ]),
};

// The power-ups, as they lie or pop out of a crate; no taller than the
// HUD's line, where they show while at work.
Object.assign(ITEM_ART, {
  // A police thermos of coffee with the force's bands.
  policeCoffee: art('policeCoffee', [
    '.kkkkkk.',
    'kBBBBBBk',
    'kkkkkkkk',
    'kgWWWWgk',
    'kbbbbbbk',
    'kyyyyyyk',
    'kbbbbbbk',
    'kgWwwWgk',
    '.kkkkkk.',
  ]),
  // A shield folded out of a form, stamped.
  paperworkShield: art('paperworkShield', [
    'kkkkkkkkk',
    'kWWWWWWwk',
    'kWGGGGWwk',
    'kWWWWRRwk',
    'kWGGRWRwk',
    '.kWWWRRk.',
    '..kWGWk..',
    '...kwk...',
    '....k....',
  ]),
  // A magnifying glass: nothing stays hidden from mandatory testing.
  mandatoryTesting: art('mandatoryTesting', [
    '.kkkk....',
    'kgWllk...',
    'kWlllgk..',
    'kllllgk..',
    'kglllgk..',
    '.kgggkk..',
    '..kkkkCk.',
    '......kCk',
    '.......kk',
  ]),
  // A sack of money with a plus on it.
  budgetIncrease: art('budgetIncrease', [
    '..k...k..',
    '...kyk...',
    '..kkkkk..',
    '.kEEWEEk.',
    'kEEEWEEnk',
    'kEWWWWWnk',
    'kEEEWEEnk',
    '.kEEWEnk.',
    '..kkkkk..',
  ]),
  // A sample bag swollen to bursting.
  superBladder: art('superBladder', [
    '...kgk...',
    '..kkgkk..',
    '.kUUUUUk.',
    'kUWUUUuuk',
    'kUUUUUuuk',
    'kUUUUuuok',
    'kuUUuuook',
    '.kuuuook.',
    '..kkkkk..',
  ]),
  // The police helicopter, a toy-sized one.
  helicopter: art('helicopter', [
    'kkkkkkkkkkkkkk',
    '........k.....',
    '......kkkkk...',
    'kk...kBBBBllk.',
    'kbkkkBBBBBlllk',
    'kbbbbWWWWWWWWk',
    '.kk.kbbbbbbbk.',
    '.....k.k.k.k..',
    '....kkkkkkkk..',
  ]),
});

const heart = (name, light, dark) => parsePixels([
  '.kk.kk.',
  'kLLkLDk',
  'kLLLLDk',
  'kDLLDDk',
  '.kDDDk.',
  '..kDk..',
  '...k...',
], { k: 'ink', L: light, D: dark }, name);

// The HUD's icons: Blenke's head for lives, hearts for his health, the
// pictures of a sample and of minor possession for their counts, and each
// power-up's own for the one at work.
export const HUD_ICONS = {
  lives: PLAYER_HEAD,
  health: heart('health', 'red_4', 'red_3'),
  healthLost: heart('health lost', 'grey_3', 'grey_2'),
  samples: ITEM_ART.sampleCup,
  possession: ITEM_ART.possession,
  ...Object.fromEntries(Object.keys(POWER_UPS).map((type) => [type, ITEM_ART[type]])),
};
