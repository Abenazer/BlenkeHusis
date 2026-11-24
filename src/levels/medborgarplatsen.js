// Medborgarplatsen and Götgatan at half past twelve, one night in 1997,
// world 2's third: Blenke comes up Götgatsbacken from Slussen past the
// bars' queues, walks through a rock bar, crosses Medborgarplatsen and its
// night bus queue, goes through Söderhallarna's unlit hall or over its
// roof, through Björns trädgård in the dark and along Skånegatan to
// Medborgarhuset, where the city's licensing inspector waits; then the
// finish every level ends with. Written in sections side by side
// (joinSections); the hill's top and the bars' street are row 13, the
// square's row 17.
import { joinSections } from '../level.js';
import { finish } from './finish.js';

// 1. Götgatsbacken, up the hill from Slussen in steps: a shop's awning with
// police coffee in a crate over it, and the first bar's queue of party
// people at the top, beer spilt on the pavement.
const backen = [
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '........K.................uuu...................',
  '........?.......................................',
  '................................................',
  '......uu......................P..,,,..P...uu....',
  '......____...uuu........AAAAAAAAAAAAAAAAAAAAAAAA',
  '....................AAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  '................AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  '..@.i.......AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

// 2. Götgatan's rock bar, walked through: a headbanger and a punk inside,
// its roof climbed by the balconies, a crate of folköl left outside and a
// skater on the way down to the square.
const bars = [
  '................................................',
  '................................................',
  '................................................',
  '.........uuuuuu.................................',
  '......BBBBBBBBBBBBBBBBBBBB......................',
  '......BBBBBBBBBBBBBBBBBBBB......................',
  '..----BBBBBBBBBBBBBBBBBBBB......................',
  '......BBBBBBBBBBBBBBBBBBBB......................',
  '......BBBBBBBBBBBBBBBBBBBB......................',
  '..----;;;;;;;;;;;;;;;;;;;;......uuu.............',
  '......;;;;;;;;;;;;;;;;;;;;......................',
  '......;;;;;;;;;;;;;;;;;;;;......................',
  '......;;;;;;x;;uu;;;N;;;;;uuu.{.....w...u.u.....',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA........',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA......',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA....',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA..',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

// 3. Medborgarplatsen: the second phone booth, the night bus queue to be
// tested at its stop, an extra life in a crate over the square, a crow, a
// skater and a tagger, and a torch left by the market hall's door.
const square = [
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '...........................uuu..........................',
  '........................................................',
  '.............................ü..........................',
  '.............................?..........................',
  '..................uuu...............uuu.................',
  '........................................................',
  '........................................................',
  '....C...uuu.............................w...uu....m...].',
  '********************************************************',
  '********************************************************',
  '********************************************************',
];

// 4. Söderhallarna, the market hall of 1992, shut for the night: through
// its unlit hall past a stoner, a raver's glow sticks and a dealer, or over
// its roof and skylights; the cold room among the stalls hidden, what it
// keeps never counted.
const hall = [
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........uuuuuuuu......................uuuu..............',
  '....ööööööööööööööööggggggggöööööööööööööööööööööööö....',
  '....öööööööööööööööööööööööööööööööööööööööööööööööö....',
  '....öööööööööööööööööööööööööööööööööööööööööööööööö....',
  '....öööööööööööööööööööööööööööööööööööööööööööööööö....',
  '___.öööööööööööööööööööööööööööööööööööööööööööööööö....',
  '....&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&....',
  '....&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&....',
  '....&&&&&&&uu&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&....',
  '___.&&&&&&____&&&&&&&&&&&&öööööööööö&&&&&&&&&&&&&&&&....',
  '....&&&&&&&&&&&&&&&&&&&&&&::;;;;;;;ö&&&&&&&&&&&&&&&&....',
  '....&&&&&&&&&&&&&&&&&&&&&&::;;;;;;;ö&&&&&&&&&&&&&&&&....',
  '....&&&i&&&&&&&&&&S&&&&&&&::;p;$Uuuö&&&&o&&&uuu&D&&&....',
  '********************************************************',
  '********************************************************',
  '********************************************************',
];

// 5. Björns trädgård in the dark, lit by its lamps: the third phone booth,
// a hippie, a stoner, syringes in the grass, a dealer, and a canister
// hidden on the knoll.
const park = [
  '............................................',
  '............................................',
  '............................................',
  '............................................',
  '............................................',
  '............................................',
  '............................................',
  '............................................',
  '............................................',
  '............................................',
  '...............uuu..........................',
  '............................................',
  '....&&&&&&&&&&&&&&&&h&&&&&&&&&&&&&&&&&&&....',
  '....uuu&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&....',
  '....&&&&&&&&&&&&uuuu&&&&&&&&&&&&&&&&&&&&....',
  '....&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&....',
  '..C.&&&&uuuf&&&&&&&&&&&&&&&&S&&^^&&&D&&&....',
  '############################################',
  '############################################',
  '############################################',
];

// 6. Skånegatan towards Medborgarhuset: a crate with a heart, a party
// person, a punk, and the last phone booth.
const street = [
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '............ç...........................',
  '......uuu...?...........................',
  '............................uuu.........',
  '........................................',
  '........................................',
  '....uuu...........P.,,,...N.........C...',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

// 7. The arena before Medborgarhuset: two planks to come down from, the
// licensing inspector, and the gate.
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
  '********************************',
  '********************************',
  '********************************',
];

export const medborgarplatsen = {
  id: 'medborgarplatsen',
  name: 'Medis',
  place: 'Medborgarplatsen',
  time: 260,
  music: 'medborgarplatsen',
  backdrop: 'city',
  night: true,
  rows: joinSections(backen, bars, square, hall, park, street, arena, finish(20)),
  signs: [
    'GÖTGATSBACKEN. UPPFÖR. HÄR SPRINGER INGEN IFRÅN POLISEN.',
    'SÖDERHALLARNA. STÄNGT. KYLRUMMET RÄKNAS INTE.',
  ],
  cast: [
    { type: 'busStop', col: 110, row: 16 },
    { type: 'nightBusRider', col: 113, row: 16 },
    { type: 'nightBusRider', col: 116, row: 16 },
    { type: 'nightBusRider', col: 119, row: 16 },
    { type: 'nightBusRider', col: 122, row: 16 },
    { type: 'crow', col: 130, row: 16 },
    { type: 'streetLamp', col: 140, row: 16 },
    { type: 'streetLamp', col: 220, row: 16 },
    { type: 'bench', col: 226, row: 16 },
    { type: 'streetLamp', col: 238, row: 16 },
    { type: 'licensingInspector', col: 306, row: 16 },
    { type: 'streetLamp', col: 332, row: 16 },
    { type: 'policeVan', col: 344, row: 16 },
  ],
};
