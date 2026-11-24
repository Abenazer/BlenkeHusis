// Tunnelbanan at one in the morning, one night in 1997, world 2's fourth:
// Blenke takes the last train north. Down Medborgarplatsen's escalator,
// along the platform and into the unlit tunnel, where the train carries
// him over the live track, out of the rock at Slussen and over the bridge
// to Gamla stan's station, over the next bridge and down into
// T-Centralen's lower hall, where the head of the metro's guards waits;
// then the finish every level ends with. Written in sections side by
// side (joinSections); the platforms' floor is row 17, the bridges' and
// Gamla stan's row 13.
import { joinSections } from '../level.js';
import { finish } from './finish.js';

// 1. Medborgarplatsen's entrance on the square, the last train north: down
// the escalator into the ticket hall, a ticket inspector at the barriers
// and police coffee in a crate.
const entrance = [
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '............ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '............ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '............ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '............ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '............ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '..@.i....uu.JJJJJJJJJJJJJJJJJJJJJJJJJJJJ',
  '********z......;;;;;;;;;;;;;;;;;;;;;;;;;',
  '********;z.u...;;;;;;;;;;;;;K;;;;;;;;;;;',
  '********;;z....;;;;;;;;;uuu;?;;;;;;;;;;;',
  '********;;;z.u.;;;;;;;;;;;;;;;;;;;;uuu;;',
  '********;;;;z..;;;;;;;;;;;;;;;;;;;;;;;;;',
  '********;;;;;z.;;;;;;;;;;;;;;;;;;;;;;;;;',
  '********;;;;;;z;;uuu;;j;;;;;;;;uuu;;;;;;',
  '********ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '********ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '********ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// 2. The platform: buskers playing to the last travellers, a party person,
// a mouse at the edge, the live track to jump, the first phone booth and a
// torch left by the tunnel's mouth.
const platform = [
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  ';;;;;;;;;;uuu;;;;;;;uuu;;;;;;;;;;;;;;;;;;;;;;;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;uuu;;;;;;;;;uuu;;;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  ';;;;;;;;;;;;;;;;;;uuu;;;P;;;;;;;;;uu;;;;;;;;;C;]',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ....ZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ....ZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ....ZZZZ',
];

// 3. The tunnel, unlit: a canister hidden in the dark, the last train
// rolling slowly over the long stretch of live track (ridden across), a
// raver's glow sticks, the track again, and a stoner.
const tunnel = [
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&',
  '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&',
  '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&',
  '&&uuu&&&&&&&h&&&&&&&&&&&&&&&&&&&&&&&&&&&uuu&&&&&&&&&&&&&',
  '&&&&&&&&&&&&&&&&&&&&&&&&&uu&&&&&&&&&&&&&&&&&&uu&&&&&&&&&',
  '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&',
  '&&&&&&uuu&&&&&&&&&&&&&&&&&&&&&&&&uuu&&o&&&&&&&&&&&&S&&&&',
  'ZZZZZZZZZZZZZZZZZZZZHHHH.......ZZZZZZZZZZZZZ...ZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZ...........ZZZZZZZZZZZZZ...ZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZ...........ZZZZZZZZZZZZZ...ZZZZZZZZZ',
];

// 4. Out of the rock at Slussen: up to its station and the second phone
// booth, then the bridge over Söderström, a tagger at the last train
// parked on it, its roof climbed (an extra life in a crate over it), and a
// dealer.
const slussen = [
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '....................................ü...................',
  '....................................?...................',
  '........................................................',
  '..............uuu....uuu........uuuuu...................',
  '..............................ÅÅÅÅÅÅÅÅÅÅÅÅÅÅ............',
  '..............................ÅÅÅÅÅÅÅÅÅÅÅÅÅÅ............',
  '............C...........m.....ÅÅÅÅÅÅÅÅÅÅÅÅÅÅ..uuu...D...',
  '..........ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '........ZZZZZZZZZZZZ....................................',
  '......ZZZZZZZZZZZZZZ....................................',
  '....ZZZZZZZZZZZZZZZZ....................................',
  'ZZZZZZZZZZZZZZZZZZZZ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  'ZZZZZZZZZZZZZZZZZZZZ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  'ZZZZZZZZZZZZZZZZZZZZ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
];

// 5. Gamla stan's station on the island, under the open sky: buskers on
// the platform, its canopy to climb, the third phone booth and a party
// person.
const gamlastan = [
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '............uuuuuu............uuu.......',
  '......-------------------------.........',
  '........................................',
  '........................................',
  '..uiu.................uu..C.......P.....',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// 6. The bridge on towards the city, then down the escalator into
// T-Centralen's lower hall: a crate with a heart, a ticket inspector, and
// the last phone booth.
const central = [
  '................ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '................ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '................ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '................ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '................ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '................ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '................ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '................ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '................ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '.......uuu......JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ',
  '....................;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  '....................;;;;;;;;;;ç;;;;;;;;;;;;;;;;;',
  '....uuu.............;;;;;;;;;;?;;;;;;;;;;;;;;;;;',
  'ZZZZZZZZZZZZZZZZzu..;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  '................;zu.;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  '................;;z.;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  '................;;;z;;;;uuu;;;;;;;;;;;j;;uu;C;;;',
  '~~~~~~~~~~~~~~~~ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '~~~~~~~~~~~~~~~~ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '~~~~~~~~~~~~~~~~ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// 7. The arena on T-Centralen's lower platform: two planks to come down
// from, the head of the metro's guards, and the gate.
const arena = [
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;B;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;|;;;',
  ';;;;;;;u;;;;;;;;;;;u;;;;;;;;|;;;',
  ';;;;;;___;;;;;;;;;___;;;;;;;|;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;|;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;|;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;|;;;',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

export const tunnelbanan = {
  id: 'tunnelbanan',
  name: 'T-banan',
  place: 'Tunnelbanan',
  time: 260,
  music: 'tunnelbanan',
  backdrop: 'city',
  night: true,
  rows: joinSections(entrance, platform, tunnel, slussen, gamlastan, central, arena, finish(20)),
  signs: [
    'MEDBORGARPLATSEN. SISTA TÅGET NORRUT. RAVEKOMMISSIONEN ÅKER MED.',
    'GAMLA STAN. GATUMUSIK KRÄVER TILLSTÅND. URINPROV OCKSÅ.',
  ],
  cast: [
    { type: 'streetLamp', col: 154, row: 12 },
    { type: 'busker', col: 210, row: 12 },
    { type: 'busker', col: 216, row: 12 },
    { type: 'streetLamp', col: 230, row: 12 },
    { type: 'busker', col: 48, row: 16 },
    { type: 'busker', col: 54, row: 16 },
    { type: 'mouse', col: 78, row: 16 },
    { type: 'guardChief', col: 302, row: 16 },
    { type: 'streetLamp', col: 328, row: 16 },
    { type: 'policeVan', col: 340, row: 16 },
  ],
};
