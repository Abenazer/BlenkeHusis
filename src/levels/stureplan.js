// Stureplan at two in the morning, one night in 1997, world 2's third:
// Blenke, posted to the rave commission, comes down Kungsgatan to the
// square, over Svampen's concrete roof, past the queue to a club and over
// its bouncer, through the dark dance floor and the lounge above it (the
// VIP room behind it hidden, where nobody is tested), through the side
// streets' dark alley and up Birger Jarlsgatan to the club king's own
// door, where he waits behind his rope; then the finish every level ends
// with. The clubs stay unnamed. Written in sections side by side
// (joinSections); the ground's top is row 17.
import { joinSections } from '../level.js';
import { finish } from './finish.js';

// 1. Kungsgatan's end at Stureplan, the start: the stone houses' planks,
// a crate with police coffee, a brat on his way out and a dealer.
const kungsgatan = [
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '......................K.........................',
  '......................?.........................',
  '................................................',
  '.....................u..u.......................',
  '.....................____.......................',
  '................................................',
  '...............uuuu...........uuu...............',
  '.........uuu...____.......................uuu...',
  '................................................',
  '..@..i.....................l............D.......',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

// 2. Svampen, the concrete mushroom in the middle of the square, where
// everyone meets: its roof reached from a plank, a crate with a
// mandatory test on it, party people under it and a tagger past it.
const svampen = [
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '.....................T..........................',
  '.....................?..........................',
  '................................................',
  '................uuu........uuu..................',
  '...............ZZZZZZZZZZZZZZZZ.................',
  '...................ZZZZZZZZ.....................',
  '..........uu..........ZZ..........uuu...........',
  '..........____........ZZ........................',
  '...................u..ZZ..u.....................',
  '...i..............P...ZZ...P.........m......C...',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

// 3. The queue along the street and the club: clubbers waiting to be
// let in, the velvet rope and the bouncer at the door (jumped over);
// inside, the dark dance floor with a raver and party people, up through
// the floor to the lounge and its brat, and behind the lounge's far wall
// the VIP room, hidden: money and possession, and nobody tested. Up
// through the roof, an extra life.
const queue = [
  '........................................................................',
  '........................................................................',
  '..................................................ü.....................',
  '..................................................?.....................',
  '........................................................................',
  '..............................uuu.....uuu.................uuu...........',
  '..........................BBBBBBBBBBBBBBBBBB----BBBBBBBBBBBBBBBBBBBBBBBB',
  '..........................B;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;::::::::::::::B',
  '..........................B;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;::::::::::::::B',
  '..........................B;;;;;;;;;;;;;;;;;___;;;;;;;;;;::::::::::::::B',
  '..........................B;;i;;;;uuu;l;;;;;;;;;;uuu;;;;;::i:$:p:$:b:$:B',
  '..........................----------------------------------------------',
  '...........................&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&B',
  '...........................&&&&&&&&&&&&&&&&&uuu&&&&&&&&&&&&&&&&&&&&&&&&B',
  '.....uuuu...uuuu...........&&&&&&___&&&&&&&&&&&&&&&&&&&&&&&&&&&___&&&&&&',
  '...........................&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&',
  '........................<..&&&&uuu&&&&&&o&&&&&&P&&&&&uuu&&P&&&&&&&&&&&&&',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

// 4. The side streets: cobbles, a stone house climbed by its balconies,
// an unlit alley with a tagger at work and a goth unseen in it, a
// gateway through the next house in the dark, and a synth.
const sidestreets = [
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........uuuu............................................',
  '......öööööööööööö..................uuu..uuu............',
  '......öööööööööööö&&&&&&&&&&&&&&&&BBBBBBBBBBBB..........',
  '...---öööööööööööö&&&&&&&&&&&&&&&&BBBBBBBBBBBB..........',
  '......öööööööööööö&&&&&&&&h&&&&&&&BBBBBBBBBBBB.u........',
  '......öööööööööööö&&&&uuu&&&&&&&&&BBBBBBBBBBBB---.......',
  '...---öööööööööööö&&&&&&&&&&&&&&&&&&&&&&&&&&&&..........',
  '......öööööööööööö&&&&&&&&&&&&&&&&&&&&&&&&&&&&..........',
  '......öööööööööööö&&&m&&&&&&n&&u&&&&&&&&uu&&&&....y..C..',
  '++++++++++++++++++++++++++++++++++++++++++++++++++++++++',
  '++++++++++++++++++++++++++++++++++++++++++++++++++++++++',
  '++++++++++++++++++++++++++++++++++++++++++++++++++++++++',
];

// 5. Birger Jarlsgatan: the taxi queue at the night bus stop, brats, a
// dealer, a crate with a heart, and the last phone booth.
const birgerjarl = [
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '..................ç.............................',
  '..................?.........uuuu................',
  '.......uuuu.................____................',
  '.......____.....uu..uu..........................',
  '........................................uuu.....',
  '...i.........l...........P.......D....l.....C...',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

// 6. The arena outside the club king's own club: two planks to come down
// from, the king behind his rope, and the gate.
const arena = [
  '............................B...',
  '............................B...',
  '............................B...',
  '............................B...',
  '............................B...',
  '............................B...',
  '............................B...',
  '............................B...',
  '............................B...',
  '............................B...',
  '............................B...',
  '............................|...',
  '.......u...........u........|...',
  '......___.........___.......|...',
  '............................|...',
  '............................|...',
  '............................|...',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

export const stureplan = {
  id: 'stureplan',
  name: 'Stureplan',
  time: 250,
  music: 'stureplan',
  backdrop: 'city',
  night: true,
  rows: joinSections(kungsgatan, svampen, queue, sidestreets, birgerjarl, arena, finish(20)),
  signs: [
    'STUREPLAN, KLOCKAN TVÅ. RAVEKOMMISSIONEN PÅ PLATS.',
    'SVAMPEN. HÄR MÖTS MAN. HÄR MISSTÄNKS MAN.',
    'KLUBBEN. KÖN TESTAS. INNANFÖR REPET RÄKNAS INGET.',
    'VIP. HÄR TESTAS INGEN.',
    'BIRGER JARLSGATAN. TAXIKÖN ÄR LÄNGRE ÄN KLUBBKÖN.',
  ],
  cast: [
    { type: 'streetLamp', col: 12, row: 16 },
    { type: 'poodle', col: 24, row: 16 },
    { type: 'kiosk', col: 33, row: 16 },
    { type: 'bench', col: 60, row: 16 },
    { type: 'streetLamp', col: 88, row: 16 },
    { type: 'clubber', col: 99, row: 16 },
    { type: 'clubber', col: 102, row: 16 },
    { type: 'clubber', col: 105, row: 16 },
    { type: 'clubber', col: 108, row: 16 },
    { type: 'clubber', col: 111, row: 16 },
    { type: 'velvetRope', col: 116, row: 16 },
    { type: 'streetLamp', col: 198, row: 16 },
    { type: 'streetLamp', col: 223, row: 16 },
    { type: 'streetLamp', col: 234, row: 16 },
    { type: 'busStop', col: 252, row: 16 },
    { type: 'clubKing', col: 286, row: 16 },
    { type: 'velvetRope', col: 294, row: 16 },
    { type: 'streetLamp', col: 312, row: 16 },
    { type: 'policeVan', col: 324, row: 16 },
  ],
};
