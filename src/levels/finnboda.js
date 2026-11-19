// Finnboda varv at half past four in the morning, one night in 1997,
// world 2's last: the old shipyard in Nacka across the water from the
// city, where the rave goes on in a hall by the water and the rave
// commission raids it as the sky pales. Blenke crosses the quay and the
// dock basin on the cranes' hooks, goes down the slipway, through the
// dark hall and the raid outside, to the commission's own chief, his
// chief; then the finish every level ends with. Written in sections side
// by side (joinSections); the ground's top is row 17.
import { joinSections } from '../level.js';
import { finish } from './finish.js';

// 1. The shipyard's quay: containers to climb, a crate with police coffee
// on them, a stoner and a dealer, and a heron standing in the dawn.
const quay = [
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '..................K.............................',
  '..................?.............................',
  '................................................',
  '................u..u............................',
  '................åååå......uuu...................',
  '........uuu.uu..åååå....................uuu.....',
  '............åååååååå............................',
  '..@..i......åååååååå....S....uuu......D.........',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// 2. The dock basin: its deep water crossed on three loads hanging from
// the cranes' hooks, swinging to and fro; on the far quay a crane's tower,
// climbed by its ledges to the jib out over the water, a canister at its
// end; a tagger and the first phone booth past it.
const dock = [
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '...................h.u.u.u.u.u..........................',
  '..................----------------åå....................',
  '..................................åå....................',
  '...............................---åå....................',
  '..................................åå....................',
  '...............................---åå....................',
  '..................................åå....................',
  '..............uu...uu...uu.....---åå....................',
  '..................................åå....uuu.............',
  '...............................---åå....................',
  '...........HHH..HHH..HHH..........åå....................',
  '..................................åå..uu....m.....C.....',
  'ZZZZZZZZZZ~~~~~~~~~~~~~~~~~~~ZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZ~~~~~~~~~~~~~~~~~~~ZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZ~~~~~~~~~~~~~~~~~~~ZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// 3. The old slipway: down its steps towards the water, over a rusting
// hull moored at its foot, where a party person has strayed, and up onto
// the quay by the hall.
const slipway = [
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
  '.....uu............uuu..................',
  '...i.............................uuu....',
  '..ZZZZZZ.u.......P......................',
  '..ZZZZZZZZ.u....ååååååååå.....C....uuu..',
  'ZZZZZZZZZZZZ.u...ååååååå..ZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZ....ååååå...ZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZ~~~~~~~~~~~~ZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZ~~~~~~~~~~~~ZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZ~~~~~~~~~~~~ZZZZZZZZZZZZZZ',
];

// 4. The hall where the rave goes on: unlit but for the ravers' glow
// sticks, dancers on the floor to test, a breakdancer, a synth on the
// gallery; up the planks to a crate with an extra life; behind the far
// gallery the commission's own spotters' room, hidden, its paperwork and
// what it seized.
const hall = [
  '........................................................................',
  '........................................................................',
  '........................................................................',
  '........................................................................',
  '........................................................................',
  '....BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB....',
  '....B&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&B....',
  '....B&&&&&&&&&&&&&&&&&&&&&&&&&&&&&ü&&&&&&&&&&&&&&&&&&&&&&&:::::::::B....',
  '....B&&&&&&&&&&&&&&&&&&&&&&&&&&&&&?&&&&&&&&&&&&&&&&&&&&&&&:::::::::B....',
  '....B&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&:::::::::B....',
  '....B&&uuu&&&&y&&&uu&&&&&&&&&&&&u...u&&&&&&&&&&&&&uuu&&&&&:i:rUdpr:B....',
  '....B----------------&&&&&&&&&&&_____&&&&&&&&&---------------------B....',
  '....B&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&B....',
  '....&&&&&&&&&&&&&&&&&&uuu&&&uuu&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&....',
  '....&&&&&&&&&&&&&&&&&&___&&&___&&&&&&&&&&&&&&&___&&&&&&&&&&&&&&&&&&&....',
  '....&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&....',
  '....&&&&uu&&o&&&&&&&&&&&&&&&&&&&&&&&&&&&&&e&&&uuu&&&&&&&o&&&&&uu&&&&....',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// 5. The raid outside, the young taken in for their tests: dealers
// fleeing, party people, a police van, a crate with a heart, and the last
// phone booth.
const raid = [
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
  '....................ç...........................',
  '....................?.........uuu...............',
  '.......uuuu...................____..............',
  '.......____......uu...uu........................',
  '........................................uuu.....',
  '...i........D..uuu........P.........D.......C...',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// 6. The arena on the quay at dawn: two planks to come down from, the rave
// commission's chief, and the gate.
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
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

export const finnboda = {
  id: 'finnboda',
  name: 'Finnboda',
  place: 'Finnboda varv',
  time: 240,
  music: 'finnboda',
  backdrop: 'dawn',
  night: true,
  rows: joinSections(quay, dock, slipway, hall, raid, arena, finish(20)),
  signs: [
    'FINNBODA VARV. VARVET ÄR NEDLAGT. FESTEN ÄR DET INTE.',
    'SLIPEN. HÄR SJÖSATTES FARTYG. NU SJÖSÄTTS TILLSLAG.',
    'SPANARNAS RUM. HÄR RÄKNAS PROVEN, INTE SVAREN.',
    'TILLSLAG! ALLA UNGA TILL STATIONEN. FÖR PROV.',
  ],
  cast: [
    { type: 'streetLamp', col: 10, row: 16 },
    { type: 'heron', col: 32, row: 16 },
    { type: 'streetLamp', col: 92, row: 16 },
    { type: 'dancer', col: 170, row: 16 },
    { type: 'dancer', col: 174, row: 16 },
    { type: 'dancer', col: 178, row: 16 },
    { type: 'dancer', col: 182, row: 16 },
    { type: 'streetLamp', col: 222, row: 16 },
    { type: 'policeVan', col: 246, row: 16 },
    { type: 'raveChief', col: 278, row: 16 },
    { type: 'streetLamp', col: 304, row: 16 },
    { type: 'policeVan', col: 316, row: 16 },
  ],
};
