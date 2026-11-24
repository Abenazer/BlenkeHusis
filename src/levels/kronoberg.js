// Polishuset at Kronoberg at three in the morning, one night in 1997,
// world 2's seventh: the police house on Kungsholmen, where the rave
// commission brought the young for their blood and urine tests. Blenke
// comes down from Kronobergsparken, in at the front desk, along two floors
// of corridors (the evidence room hidden at the end of the upper one),
// through the waiting room and the sample room, up the lift to the remand
// prison's exercise yards on the roof and down to the courtyard, where
// the police doctor waits; then the finish every level ends with.
// Written in sections side by side (joinSections); the street's top is
// row 17, the park's row 13 and the roof's row 5.
import { joinSections } from '../level.js';
import { finish } from './finish.js';

// 1. Kronobergsparken on its hill above the police house at three in the
// morning, dark under its trees but for a lamp: a stoner, then down its
// steps to the street and a dealer.
const park = [
  '............................................',
  '............................................',
  '............................................',
  '............................................',
  '............................................',
  '............................................',
  '............................................',
  '............................................',
  '....&&&&&&&&&&&&&&&&&&......................',
  '....&&&&&&&&&uu&&&&&&&......................',
  '....&&&&&&&&&&&&&&&&&&......................',
  '....&&&&&&&&&&&&&&&&&&......................',
  '.@.i&&&uuu&&&&&&S&&&&&......................',
  '########################....................',
  '##########################..................',
  '############################................',
  '##############################.uuu....D.....',
  '##############################AAAAAAAAAAAAAA',
  '##############################AAAAAAAAAAAAAA',
  '##############################AAAAAAAAAAAAAA',
];

// 2. In at the door to the front desk: police coffee in a crate, the duty
// officer's counter to get over and the duty officer's paperwork behind
// it.
const front = [
  '......BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  '......BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  '......BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  '......BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  '......BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  '......BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  '......BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  '......BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  '......BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  '......BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  '......B;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  '......B;;;;;;;K;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  '......B;;;;;;;?;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  '......B;;;;;;;;;;;;;;;;;uuu;;;;;;;;;;;;;;;;;;;;;',
  '.......;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  '.......;;;;;;;;;;;;;;;WWWWWWWW;;;;;;;;;;;;;;;;;;',
  '...i...;;uuu;;;;;;;;;;WWWWWWWW;;;;Y;;;;;uu;;;;;;',
  'AAAAAAZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'AAAAAAZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'AAAAAAZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// 3. The corridors, two floors of them: the first phone booth, a
// bureaucrat and an ideologue below, a technician and the paperwork above,
// and behind the wall at the upper corridor's unlit end the evidence room,
// hidden, where what was seized is kept.
const corridors = [
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;&&&&&&&&BB;;;;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;&&&&&&&&BB;;;;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;&&&&&&&&BB;;;;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;&&&&&&&&::;uu;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;&&&&&&&&::;;;;;;',
  ';;;;;;;;;;;;uuu;;;;;;;;;L;;;;;r;;;uuu;;;&&uu&&&&::;p$bU;',
  '------------------------------------------------BBBBBBBB',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  ';;;;;;___;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  ';;C;;;;;;;uuu;;;;;;;Y;;;;;;;uuu;;;;;;;;;I;;;;;;;;;;;;;;;',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// 4. The waiting room, where the young brought in from the raves sit
// waiting for their tests on its benches, the police's sniffer dog, an
// extra life in a crate, and the sample room's shelves of jars.
const waiting = [
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  'BB;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  'BB;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  'BB;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  'BB;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;uuu;;U;;;',
  'BB;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;________;;',
  'BB;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;ü;;;;;;;;;;;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;?;;;;;Uuuu;;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;________;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  ';;;;;;;;;;;;;;;;;;;;;;uuu;;;;;;;;;;;;;;;;;;;L;;;',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// 5. The lift to the roof, ridden up its shaft from the second phone
// booth; past it a dead end with a canister left in it.
const lift = [
  'BBBBBBBBBBBBBBBBBBBB....................',
  'BBBBBBBBBBBBBBBBBBBB....................',
  'BBBBBBBBBBBBBBBBBBBB...........uuu......',
  'BBBBBBBBBBBBBBBBBBBB....................',
  'BBBBBBBBBBBBBBBBBBBB....................',
  'BBBBBBBBBBBBBBBBBBBBVVBBBBBBBBBBBBBBBBBB',
  'BBBBBBBBBBBBBBBBBBBBVVBBBBBBBBBBBBBBBBBB',
  'BBBBBBBBBBBBBBBBBBBBVVBBBBBBBBBBBBBBBBBB',
  'BBBBBBBBBBBBBBBBBBBBVVBBBBBBBBBBBBBBBBBB',
  'BBBBBBBBBBBBBBBBBBBBVVBBBBBBBBBBBBBBBBBB',
  'BBBBBBBBBBBBBBBBBBBBVVBBBBBBBBBBBBBBBBBB',
  'BBBBBBBBBBBBBBBBBBBBVVBBBBBBBBBBBBBBBBBB',
  ';;;;;;;;;;;;;;;;;;;BVVB;;;;;;;;;;;;;;;;B',
  ';;;;;;;;;;;;;;;;;;;BVVB;;;;;;;;;;;;;;;;B',
  ';;;;;;;;;;;;;;;;;;;;VV;;;;;;;;;;;;uu;;;B',
  ';;;;;;;;;;;;;;;;;;;;VV;;;;;;;;;;;;;;;;;B',
  ';;;;uuu;;;C;;;P;;;;;VV;;;uuu;;h;;;;;;;;B',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// 6. Kronobergshäktet's exercise yards on the roof, their bars to jump: a
// crate with a heart, a punk let out for his hour, then down the fire
// escape to the courtyard and the last phone booth.
const roof = [
  '..........................ç.........................',
  '..........................?.........................',
  '......O.......O.......O.......O.....................',
  '......O.......O.......O.......O.....................',
  '...i..O..uuu..O..uuu..O.uuu...O...N.................',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB............',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB............',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB.uu.........',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB.___........',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB............',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB.....u......',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB....___.....',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB............',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB........u...',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB.......___..',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB............',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB..........C.',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBAAAAAAAAAAAA',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBAAAAAAAAAAAA',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBAAAAAAAAAAAA',
];

// 7. The arena in the courtyard: two planks to come down from, the police
// doctor, and the gate.
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

export const kronoberg = {
  id: 'kronoberg',
  name: 'Kronoberg',
  place: 'Polishuset, Kronoberg',
  time: 260,
  music: 'kronoberg',
  backdrop: 'city',
  night: true,
  rows: joinSections(park, front, corridors, waiting, lift, roof, arena, finish(20)),
  signs: [
    'KRONOBERGSPARKEN. POLISHUSET NEDANFÖR. ALLA VÄGAR LEDER DIT.',
    'POLISHUSET. HIT FÖRS DE UNGA FRÅN REJVEN. FÖR PROV.',
    'KRONOBERGSHÄKTET. RASTGÅRDEN PÅ TAKET. EN TIMME OM DAGEN.',
  ],
  cast: [
    { type: 'streetLamp', col: 11, row: 12 },
    { type: 'streetLamp', col: 34, row: 16 },
    { type: 'detainee', col: 154, row: 16 },
    { type: 'detainee', col: 158, row: 16 },
    { type: 'bench', col: 160, row: 16 },
    { type: 'detainee', col: 162, row: 16 },
    { type: 'detainee', col: 166, row: 16 },
    { type: 'sniffer', col: 176, row: 16 },
    { type: 'policeDoctor', col: 302, row: 16 },
    { type: 'streetLamp', col: 328, row: 16 },
    { type: 'policeVan', col: 340, row: 16 },
  ],
};
