// The animals Blenke tests, one in each level, drawn in code until the
// asset factory delivers them: each standing (or sitting), and, while
// Blenke comes near, wagging, flapping, sniffing or calling. Facing right,
// hung in the citizens' frame by the middle of their feet. Pure: no DOM.
import { CITIZEN_FRAME } from './chess.js';
import { framed } from './framed.js';

// The rows with some of them replaced: { row index: new row }.
const changed = (rows, changes) => rows.map((row, index) => changes[index] ?? row);

const look = (rows, legend, name) => framed(rows, legend, name, CITIZEN_FRAME);

// stand: rows; wave: two sets of rows, played in turn.
function animal(name, legend, stand, wave, fps = 4) {
  return {
    stand: { frames: [look(stand, legend, `${name} stand`)], fps: 2 },
    wave: { frames: wave.map((rows, index) => look(rows, legend, `${name} wave ${index + 1}`)), fps },
  };
}

// A mongrel by the slab block in Jordbro, brown with a lighter muzzle and
// a red collar; wagging its tail.
const DOG = [
  '...........kk.....',
  '..........kbBk....',
  '..........kBBBkkk.',
  '..........kBkBLLLk',
  '..........kBBBLLk.',
  '.k........kRRRkk..',
  'kBk.......kBBBk...',
  '.kBkkkkkkkBBBBk...',
  '..kBBBBBBBBBBBk...',
  '..kbBBBBBBBBBbk...',
  '..kbBBbkkkbBBbk...',
  '..kbkbk...kbkbk...',
  '..kkkkk...kkkkk...',
];
const DOG_TAIL_BACK = {
  5: '..........kRRRkk..',
  6: 'kk........kBBBk...',
  7: 'kBkkkkkkkkBBBBk...',
  8: '.kBBBBBBBBBBBBk...',
};

// A villa cat in Södertörns villastad, a ginger tabby with a white chest,
// sitting; flicking its tail.
const CAT = [
  '........k...k...',
  '.......kOk.kOk..',
  '.......kOOOOOk..',
  '.......kOYOYOk..',
  '.......kOOwOOk..',
  '........kOOOk...',
  '.......kOOwwOk..',
  '......kOOOwwOk..',
  '.....kOoOOwwOk..',
  '.....kOoOOwwOk..',
  'kkk..kOOOOwwOk..',
  'kOOkkkOOOkwkwk..',
  '.kkkkkkkkkkkkk..',
];
const CAT_TAIL_UP = {
  8: '.k...kOoOOwwOk..',
  9: 'kOk..kOoOOwwOk..',
  10: 'kOk..kOOOOwwOk..',
  11: '.kOkkkOOOkwkwk..',
  12: '..kkkkkkkkkkkk..',
};

// A hedgehog in a garden in Tungelsta, its spines tipped light; sniffing,
// the spines bristling.
const HEDGEHOG = [
  '....k.k.k.k.....',
  '...kbkbkbkbk....',
  '..kbBbBbBbBbk...',
  '.kbBbBbBbBbBbk..',
  'kBbBbBbBbBbBkkk.',
  'kbBbBbBbBbBkLLLk',
  'kBbBbBbBbBkLkLLk',
  '.kkLkkkkkLkLLLk.',
  '..kk....kk.kkk..',
];
const HEDGEHOG_BRISTLE = {
  0: '...k.k.k.k.k....',
  1: '...kbkbkbkbkk...',
  5: 'kbBbBbBbBbBkLLLLk',
  6: 'kBbBbBbBbBkLkLLk.',
};

// A hen on Krigslida farm, white with a red comb and wattle; flapping a
// wing.
const HEN = [
  '..........kkk...',
  '.........kRRRk..',
  '.........kWWWk..',
  '.........kWkWYk.',
  '.........kWWWYYk',
  '..........kRWkk.',
  'kk.......kWWWk..',
  'kWk.....kWWWWk..',
  'kWWkkkkkWWWWWk..',
  'kWWWWWWWWWWWWk..',
  '.kWWwwwwWWWWk...',
  '..kWWwwWWWWk....',
  '...kkkkkkkk.....',
  '.....kY.kY......',
  '....kYYkYYk.....',
];
const HEN_FLAP = {
  7: 'kWk..kkk.kWWWk..',
  8: 'kWWkkwwwkWWWWk..',
  9: 'kWWWWkwwwWWWWk..',
  10: '.kWWWWkkWWWWk...',
};

// A mallard drake at Övre Rudan, its head green and its collar white;
// quacking.
const DUCK = [
  '.........kkk...',
  '........kGGGk..',
  '........kGkGk..',
  '........kGGGYYk',
  '.........kGGkk.',
  '.........kwwk..',
  'k.......kCCCk..',
  'kk.....kCCCCk..',
  'kgkkkkkgCCCCk..',
  'kgggdddggggCk..',
  '.kgggddggggk...',
  '..kkkkkkkkk....',
  '.....kO.kO.....',
  '....kOOkOOk....',
];
const DUCK_QUACK = {
  3: '........kGGGYk.',
  4: '.........kGGkYk',
};

// A fox by Lännafortet in Skogås, red with a white chest and a white tip
// to its brush; swishing the brush.
const FOX = [
  '..........k.k.....',
  '..........kOkOk...',
  '..........kOOOkk..',
  '..........kOkOOOkk',
  '..........kOOwwwk.',
  '...........kwwkk..',
  '...........kOwwk..',
  'kk..kkkkkkkOOwwk..',
  'kwkkOOOOOOOOOOOk..',
  'kwwOOOOOOOOOOOOk..',
  '.kkkkOOOOOOOOOk...',
  '....kKkKkkkKkKk...',
  '....kkkkk.kkkkk...',
];
const FOX_SWISH = {
  6: 'kk.........kOwwk..',
  7: 'kwkkkkkkkkkOOwwk..',
  8: '.kwOOOOOOOOOOOOk..',
  9: '..kOOOOOOOOOOOOk..',
};

// A red squirrel in the woods by Trångsund, sitting up with a nut, its
// tail curled up behind it; twitching the tail.
const SQUIRREL = [
  '.kkk......k....',
  'kRRRk....kRk...',
  'kRrRRk..kRRRk..',
  'kRk.kRk.kRkRRk.',
  '.k..kRk.kRRRRRk',
  '....kRk..kRwk..',
  '...kRRk.kRwwNk.',
  '...kRk.kRRwNNk.',
  '..kRRk.kRRwwk..',
  '..kRRkkRRRwwk..',
  '...kRRRRRRRk...',
  '....kkRRkRRk...',
  '.....kkkkkkk...',
];
const SQUIRREL_TWITCH = {
  0: '..kkk.....k....',
  1: '.kRRRk...kRk...',
  2: '.kRrRk..kRRRk..',
  3: '.kRkRk..kRkRRk.',
  4: '..kRk...kRRRRRk',
};

// A brown hare in the fields by Håga in Västerhaninge, crouching, its long
// ears black-tipped; twitching them.
const HARE = [
  '.........k.k....',
  '........kKkKk...',
  '........kHkHk...',
  '........kHkHk...',
  '.........kHHk...',
  '........kHHHHk..',
  '........kHkHHHk.',
  '.kk....kHHHHHKk.',
  'kwwkkkkHHHHHkk..',
  'kwHHHHHHHHHHk...',
  '.kHHHHHHhHHHk...',
  '.khHHHHhHHkk....',
  '.kkkkkkkkhhk....',
];
const HARE_EARS = {
  0: '.......k.k......',
  1: '......kKkKk.....',
  2: '.......kHkHk....',
  3: '........kHkHk...',
};

// A herring gull on the quay at Slussen, white with grey wings, its yellow
// bill spotted red; calling.
const GULL = [
  '.........kkk...',
  '........kWWWk..',
  '........kWkWkk.',
  '........kWWWYYk',
  '.........kWWkRk',
  '.........kWWk..',
  '........kWWWk..',
  '.kk....kWWWWk..',
  '.kgkkkkgggWWk..',
  '..kKgggggWWWk..',
  '..kKggggWWWk...',
  '...kkkkkkkk....',
  '......kP.kP....',
  '......kP.kP....',
  '.....kPPkPPk...',
];
const GULL_CALL = {
  2: '........kWkWkkk',
  3: '........kWWWYk.',
  4: '.........kWWkYk',
};

// A feral pigeon on Plattan at Sergels torg, grey with a shimmering neck;
// bobbing its head.
const PIGEON = [
  '.......kkk..',
  '......kgggk.',
  '......kgkgYk',
  '.......kggk.',
  '.k....kSPk..',
  'kgkkkkgSPgk.',
  'kKgggggggk..',
  '.kKggdggggk.',
  '..kkgddgggk.',
  '...kkkkkkk..',
  '....kO.kO...',
];
const PIGEON_BOB = {
  0: '............',
  1: '.......kkk..',
  2: '......kgggk.',
  3: '......kgkgYk',
  4: '.k....kSPgk.',
};

// A white poodle on Stureplan, clipped into pom-poms, a pink collar;
// wagging its pom-pom tail.
const POODLE = [
  '.........kkk...',
  '........kWWWk..',
  '........kWWWWk.',
  '.......kWWkWWk.',
  '.......kWWWWWkk',
  '...k...kPPPWWk.',
  '..kWk..kWWWkk..',
  '...kkkkkWWWWk..',
  '...kWWWWWWWWk..',
  '....kwWWWWWk...',
  '....kWk..kWk...',
  '...kWWk..kWWk..',
  '...kkkk..kkkk..',
];
const POODLE_WAG = {
  5: '.k.....kPPPWWk.',
  6: 'kWk....kWWWkk..',
  7: '.kkkkkkkWWWWk..',
};

// A grey heron on the quay at Finnboda varv at dawn, standing still on
// its long legs, its black crest back; calling with its beak open.
const HERON = [
  '.........kkk....',
  '........kWWWk...',
  '.......kKKWkYYk.',
  '........kWWkkkk.',
  '.........kWk....',
  '........kWk.....',
  '........kWk.....',
  '.........kWk....',
  '...kkkkkkgWk....',
  '..kggggggggWk...',
  '.kgGgGgggggWk...',
  'kgggggggggggk...',
  '.kkgggggggkk....',
  '...kkkkkkkk.....',
  '.......kYk......',
  '.......kYk......',
  '.......kYk......',
  '.......kYk......',
  '......kYYYk.....',
  '......kkkkk.....',
];
const HERON_CALL = {
  2: '.......kKKWkYYYk',
  3: '........kWWkk...',
  4: '.........kWkYYYk',
};

// A mute swan on Riddarholmen's quay in Gamla stan, white, its orange
// beak with the black knob; hissing, its wings half raised.
const SWAN = [
  '..........kk....',
  '.........kWWk...',
  '.........kWkWk..',
  '.........kWWOOk.',
  '..........kWkkk.',
  '..........kWk...',
  '.........kWk....',
  '.........kWk....',
  '..k.....kWWk....',
  '.kWkkkkkWWWk....',
  'kWWWWWWWWWWk....',
  'kWwWwWWWWWWk....',
  '.kWWWWWWWWk.....',
  '..kkkkkkkk......',
  '....kk.kk.......',
  '...kkk.kkk......',
];
const SWAN_HISS = {
  0: '................',
  1: '................',
  2: '................',
  3: '...........kk...',
  4: '..........kWWk..',
  5: '.........kWkWOOk',
  6: '.........kWkkkk.',
  8: 'kk......kWWk....',
  9: 'kWkkkkkkWWWk....',
};

// A hooded crow on Medborgarplatsen, grey with a black head, wings and
// tail; cawing, its beak open.
const CROW = [
  '.......kkk...',
  '......kKKKk..',
  '......kKkKKk.',
  '......kKKKKKk',
  '......kKKkkk.',
  '.....kgggk...',
  '..kkkgggggk..',
  '.kKKKggggggk.',
  'kKKKKKgggggk.',
  '.kkKKKKgggk..',
  '....kkkkkk...',
  '.....kk.kk...',
  '....kk..kk...',
];
const CROW_CAW = {
  1: '......kKKKkk.',
  2: '......kKkKKKk',
  3: '......kKKk...',
  4: '......kKKKKKk',
};

// A house mouse on the tunnelbana's platform edge, grey, its ears pink
// inside; sitting up and twitching its whiskers.
const MOUSE = [
  '.......kk...',
  '......kPgk..',
  '.....kgggkk.',
  '..kkkgggkgkk',
  '.kgggggggggk',
  'kgggggggggk.',
  'kkgggggggk..',
  '..kkkkkkk...',
];
const MOUSE_UP = {
  0: '.......kk.kk',
  1: '......kPgkPk',
  2: '.....kgggkk.',
  3: '..kkkgggkgkk',
};

// The police's sniffer dog at Kronoberg, an Alsatian, tan with a black
// saddle and a red harness; sniffing, its nose down.
const SNIFFER = [
  '...........kk...',
  '..........kKKk..',
  '.........kOKOkk.',
  '.........kOOOOOk',
  '.........kOOkkk.',
  '.k......kOOOk...',
  'kOk.kkkkKKKOk...',
  '.kOkKKKRRKKOOk..',
  '..kOKKKRRKKOOk..',
  '..kOOOOOOOOOk...',
  '..kOOkkkkkOOk...',
  '..kOk....kOk....',
  '..kOk....kOk....',
  '.kkk....kkk.....',
];
const SNIFFER_SNIFF = {
  0: '................',
  1: '................',
  2: '...........kk...',
  3: '..........kKKk..',
  4: '.........kOKOkk.',
  5: '.k......kOOOOOOk',
  6: 'kOk.kkkkKKKOkkk.',
};

// A brown rat by the canal in Förorten, its tail long and pink; sniffing.
const RAT = [
  '...........kk...',
  '..........kgGk..',
  '........kkGGkGk.',
  '.......kGGGGGGPk',
  'kk....kGGGGGGkk.',
  'kPk..kGGGGGGGk..',
  '.kPkkGGGGGGGGk..',
  '..kPPPkkPkkkPk..',
  '...kkkk.kk..kk..',
];
const RAT_SNIFF = {
  2: '........kkGGkGkk',
  3: '.......kGGGGGGPP',
};

const INK = { k: 'ink' };

export const ANIMAL_ART = {
  dog: animal('dog', { ...INK, B: 'brown_3', b: 'brown_2', L: 'brown_4', R: 'red_3' }, DOG, [DOG, changed(DOG, DOG_TAIL_BACK)]),
  cat: animal('cat', { ...INK, O: 'orange_2', o: 'orange_1', w: 'white', Y: 'hivis_3' }, CAT, [CAT, changed(CAT, CAT_TAIL_UP)], 3),
  hedgehog: animal('hedgehog', { ...INK, B: 'brown_2', b: 'brown_4', L: 'skin_3' }, HEDGEHOG, [HEDGEHOG, changed(HEDGEHOG, HEDGEHOG_BRISTLE)]),
  hen: animal('hen', { ...INK, W: 'white', w: 'grey_5', R: 'red_3', Y: 'orange_2' }, HEN, [HEN, changed(HEN, HEN_FLAP)], 6),
  duck: animal('duck', { ...INK, G: 'slime_2', Y: 'urine_3', w: 'white', C: 'brown_3', g: 'grey_5', d: 'grey_4', O: 'orange_2' }, DUCK, [DUCK, changed(DUCK, DUCK_QUACK)]),
  fox: animal('fox', { ...INK, O: 'orange_2', w: 'white', K: 'grey_1' }, FOX, [FOX, changed(FOX, FOX_SWISH)]),
  squirrel: animal('squirrel', { ...INK, R: 'orange_1', r: 'orange_2', w: 'skin_4', N: 'brown_3' }, SQUIRREL, [SQUIRREL, changed(SQUIRREL, SQUIRREL_TWITCH)], 6),
  hare: animal('hare', { ...INK, H: 'brown_4', h: 'brown_3', K: 'ink', w: 'white' }, HARE, [HARE, changed(HARE, HARE_EARS)]),
  gull: animal('gull', { ...INK, W: 'white', g: 'grey_4', K: 'grey_2', Y: 'urine_3', R: 'red_3', P: 'skin_4' }, GULL, [GULL, changed(GULL, GULL_CALL)]),
  pigeon: animal('pigeon', { ...INK, g: 'grey_4', K: 'grey_3', d: 'grey_3', S: 'slime_3', P: 'purple_3', Y: 'grey_6', O: 'red_4' }, PIGEON, [PIGEON, changed(PIGEON, PIGEON_BOB)]),
  poodle: animal('poodle', { ...INK, W: 'white', w: 'grey_5', P: 'purple_4' }, POODLE, [POODLE, changed(POODLE, POODLE_WAG)], 6),
  heron: animal('heron', { ...INK, W: 'grey_5', g: 'grey_4', G: 'grey_3', K: 'ink', Y: 'urine_3' }, HERON, [HERON, changed(HERON, HERON_CALL)], 3),
  swan: animal('swan', { ...INK, W: 'white', w: 'grey_5', O: 'orange_2' }, SWAN, [SWAN, changed(SWAN, SWAN_HISS)], 3),
  crow: animal('crow', { ...INK, K: 'grey_1', g: 'grey_4' }, CROW, [CROW, changed(CROW, CROW_CAW)], 3),
  mouse: animal('mouse', { ...INK, g: 'grey_4', P: 'purple_4' }, MOUSE, [MOUSE, changed(MOUSE, MOUSE_UP)], 6),
  sniffer: animal('sniffer', { ...INK, O: 'orange_1', K: 'grey_1', R: 'red_3' }, SNIFFER, [SNIFFER, changed(SNIFFER, SNIFFER_SNIFF)], 4),
  rat: animal('rat', { ...INK, G: 'brown_3', g: 'brown_2', P: 'purple_4' }, RAT, [RAT, changed(RAT, RAT_SNIFF)], 6),
};
