// Trångsund, on 1 May 1969: named after a narrow sound in Drevviken, a
// station on Nynäsbanan since 1901, villa plots in Stortorp and Sjöängen,
// and from a town plan of 1958 seven point blocks, slab blocks and a
// centre dominated by a tall block. Tacksägelsekyrkan was built in 1957
// by Sture Frölén, who also drew the buildings of Ågestaverket, Sweden's
// first commercial nuclear plant, blasted into the rock nearby and
// running from 1964 to 1974; on 1 May 1969 some 400 cubic metres of
// water poured from its cooling tower. In the late 1960s the whole
// country, Evert Taube among them, protested at Fållan against the
// motorway; Bellman spent the summer of 1773 by Magelungen. So from the
// station, over the sound, through the centre and the church, past
// Fållan and Bellmanslindarna to Ågestaverket, then the finish every
// level ends with. Written in sections side by side (joinSections); the
// ground's top is row 17.
import { joinSections } from '../level.js';
import { finish } from './finish.js';

// Trångsund's station of 1901: the name board, the wooden station house
// with a stoner in its waiting room, a plank up to its roof and police
// coffee in a crate over it; a bench, a party and a dealer.
const station = [
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '.....................K..........................',
  '.....................?..........................',
  '................................................',
  '................................................',
  '...................uuuu.........................',
  '..................WWWWWWWW......................',
  '..................W;;;;;;W......................',
  '................u.W;;;;;;W......................',
  '...............___W;;;;;;W......................',
  '..................;;;;;;;;......................',
  '..@.9.........i...;;;S;;;;....uu..5...P.....D...',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// The narrow sound in Drevviken the place is named after: a crate on the
// shore, the old footbridge with a technician testing the water, a gap,
// an islet, a lift and the rest of the bridge to the far shore, a
// citizen, a party and the first checkpoint.
const sound = [
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '................................$.......................',
  '.............................uuu........................',
  '.....Q.................uuu.........uu...................',
  '.....?.....................u............................',
  '..................L.....................................',
  '.........._____________...###........_________..........',
  '.i........................###...VV.............m..P.....',
  '############~~~~~~~~~~~~~~###~~~~~~~~~~~~~~~############',
  '############~~~~~~~~~~~~~~###~~~~~~~~~~~~~~~############',
  '############~~~~~~~~~~~~~~###~~~~~~~~~~~~~~~############',
];

// Trångsunds centrum of the 1960s and its tall block: a dealer in the
// shops, a crate on their roof; the block's stairwell, landing by
// landing, a party on the way, to the top, where a flat isn't on the
// plans and a window lets out. Tacksägelsekyrkan of 1957, a preacher
// inside, a plank to its roof and its tower, a crate above.
const centre = [
  '................................................................',
  '................................................................',
  '..................ZZZZZZZZZZZZZZZZ..............................',
  '..................Z:::::;;;;;;;;;;..............................',
  '..................Z:p:h:U;;;;uu;;;..............................',
  '..................Z______;;;_____Z..........F.....uuuu..........',
  '..................Z;;;;;;;;;;;;;;Z..........?.....BBBB..........',
  '.......d..........Z;;;;;;;;uu;;;;Z................BBBB..........',
  '.......?..........Z;;;;;;;____;;;Z................BBBB..........',
  '..................Z;;;;;;;;;;;;;;Z........uuuu....BBBB..........',
  '..................Z;;;P;;;;;;;;;;Z......BBBBBBBBBBBBBB..........',
  '....uu...uu.......Z;;____;;;;;;;;Z......B;;;;;;;;BBBBB..........',
  '..BBBBBBBBBBBB....Z;;;;;;;;;;;;;;Z......B;;;;;;;;BBBBB..........',
  '..B;;;;;;;;;;B....Z;;;;;;;;uu;;;;Z...___B;;;;;;;;BBBBB..........',
  '__B;;;;;;;;;;B....Z;;;;;;;____;;;Z......B;;;;;;;;BBBBB..........',
  '..;;;;;;;;;;;;....;;;;;;;;;;;;;;;;......;;;;;;;;;;BBBB..........',
  '..;;;;D;;;c;;;.i..;;;S;;;;;;;;Y;;;.Ci...;;;;;I;;u;BBBB...uu.Y...',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

// Fållan, where the motorway was to cut through the farm, and the whole
// country protested: cones, a trench, an ideologue at the barricades,
// the budget in a crate, a heap of earth, the police tape and the car,
// another ideologue, and the second checkpoint by the farm that stayed.
const fallan = [
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '.......................E................................',
  '.......................?............u...................',
  '..................uuu.....uuu...........................',
  '..........................###.......=...................',
  '.i......v...v.I...........###...v...=...2.....I...uu....',
  'AAAAAAAAAAAAAAAAAA...AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAA...AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAA...AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

// Bellmanslindarna by Magelungen, where Bellman spent the summer of
// 1773: a party in his honour, an empty can, a bench; across the bay,
// warm from Ågesta's cooling water, on two rafts; a citizen, mandatory
// testing in a crate, a dealer and the third checkpoint.
const lindens = [
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '..........................p.............................',
  '....................uuu......uuu...........T............',
  '...........................................?............',
  '........................................................',
  '...................HH.......HH..........................',
  '.i...P...P..c.5.........................m......D....C...',
  '##################~~~~~~~~~~~~~~~~~~####################',
  '##################~~~~~~~~~~~~~~~~~~####################',
  '##################~~~~~~~~~~~~~~~~~~####################',
];

// Ågestaverket, the nuclear plant in the rock: up the planks onto the
// rock, past the crate with the helicopter, to the cooling tower, which
// on 1 May 1969 let out 400 cubic metres of water; or into the tunnel,
// under the leaking pipes, over the pool, past the technician and the
// bureaucrat, up to the balcony, where the control room hides.
const agesta = [
  '................................................................',
  '........................X.......................................',
  '........................?.............uuuuuu....................',
  '......................................ZZZZZZ....................',
  '......................................ZZZZZZO...................',
  '........uuu.................uuuu..i...ZZZZZZ....uuu.............',
  '......####################################################......',
  '......####################################################......',
  '....u.####################################################......',
  '...___####################################################......',
  '......####################################################......',
  '......;;;;;;;;;;O;;;O;;;;;;;;;;;;;;;O;;;O;;;;;;;;;;;;;;;;;......',
  '...u..;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::::::;;;;;......',
  '..___.;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;P;:p:h:U:;;;;;......',
  '......;;;;;;;;;;;;;;;;;;;;;uuu;;;;;;;;;;;;;;__________;;;;......',
  '......;;;;;;;;;;;;uu;;;;;;;;;;;;;;;;;;uu;;;;;;;;;;;;;;;;;;......',
  '.i....;;;;;;L;;;;;;;;;;;;;;;;;;;;Y;;;;;;;;;;;;;;;;;;;;;S;;..uu..',
  '######ZZZZZZZZZZZZZZZZZZZZZ%%%ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ######',
  '######ZZZZZZZZZZZZZZZZZZZZZ%%%ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ######',
  '######ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ######',
];

// The arena at the end: two planks to come down from and the radiation
// inspector from Ågestaverket, testing everything: five hits, and the gate
// stands until the boss is beaten.
const arena = [
  '............................Z...',
  '............................Z...',
  '............................Z...',
  '............................Z...',
  '............................Z...',
  '............................Z...',
  '............................Z...',
  '............................Z...',
  '............................Z...',
  '............................Z...',
  '............................Z...',
  '............................|...',
  '.......u...........u........|...',
  '......___.........___.......|...',
  '............................|...',
  '............................|...',
  '............................|...',
  '################################',
  '################################',
  '################################',
];

export const trangsund = {
  id: 'trangsund',
  name: 'Trångsund',
  stationName: 'TRÅNGSUND',
  time: 300,
  music: 'trangsund',
  backdrop: 'seventies',
  rows: joinSections(station, sound, centre, fallan, lindens, agesta, arena, finish(20)),
  signs: [
    'TRÅNGSUND. ETT TRÅNGT SUND I DREVVIKEN. VÅR SYN ÄR ÄNNU TRÅNGRE.',
    'DREVVIKEN. SUNDET ÄR SMALT. VÄGEN TILL VÅRD ÄR SMALARE.',
    'TRÅNGSUNDS CENTRUM. HÖGHUSET. VARJE VÅNING SKA GENOMSÖKAS.',
    'TACKSÄGELSEKYRKAN 1957. SAMMA ARKITEKT SOM ÅGESTAVERKET.',
    'FÅLLAN. TAUBE PROTESTERAR MOT MOTORVÄGEN. VI ANTECKNAR HONOM.',
    'BELLMANSLINDARNA. 23 DIKTER 1773, MEST OM SPRIT. DEN ÄR LAGLIG.',
    'ÅGESTAVERKET. KÄRNKRAFT I BERGET. STRÅLNING GODKÄND. CANNABIS EJ.',
    'KYLTORNET 1 MAJ 1969. 400 KUBIKMETER RANN UT. INGEN TESTADES.',
  ],
};
