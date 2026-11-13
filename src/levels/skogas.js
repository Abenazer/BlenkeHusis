// Skogås, in the early 1980s: a name made up by planners in the 1930s
// from the forest and the ridge, summer plots in Länna and Västra Skogås,
// and a station of its own only from 1932. The town plans of 1961 and
// 1964 gave it point blocks and slab blocks, schools, a fire station,
// a sports ground, Skogåshallen (Huddinge's first indoor pool) and
// Skogås centrum next to the station, under the open sky until 1985. On
// the ridges stand the forts of the southern front of 1914, Lännafortet
// among them, and in the early 1980s Beatebergsanstalten was built on
// Kassettvägen. So from the station, through the centre and the fire
// station, up a point block, across the pool, over the fort and through
// the prison, then the finish every level ends with. Written in
// sections side by side (joinSections); the ground's top is row 17.
import { joinSections } from '../level.js';
import { finish } from './finish.js';

// Skogås station, its own since 1932 (before that the trains stopped at
// Drevviken): the name board, a party waiting for the commuter train,
// a canopy with police coffee in a crate above it, a stoner and a bench.
const station = [
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '..........................K.....................',
  '..........................?.....................',
  '................................................',
  '........................uu..uu..................',
  '........................______..................',
  '................................................',
  '................uu..............................',
  '..@.9.........i.....P.........S...5.v.uu....P...',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// Skogås centrum, built in 1964 next to the station and still under the
// open sky: a long low row of shops with a dealer and his bag in it, a
// crate over its roof, a citizen; the fire station, its garage open and
// a bureaucrat in it, and its hose tower to climb by the balconies on
// its side; then the first checkpoint.
const centre = [
  '................................................................',
  '................................................................',
  '..............................................uuuu..............',
  '..............................................BBBB..............',
  '............................................u.BBBB..............',
  '...........................................---BBBB..............',
  '..............................................BBBB..............',
  '...........F................................u.BBBB..............',
  '...........?...............................---BBBB..............',
  '..............................................BBBB..............',
  '..............................................BBBB..............',
  '....uu....uu....uu................BBBBBBBBBBBBBBBB..............',
  '..BBBBBBBBBBBBBBBBBBBB............B;;;;;;;;;;;;;;B..............',
  '..B;;;;;;;;;;;;;;;;;;B............B;;;;;;;;;;;;;;B..............',
  '__;;;;;;;;;;;;;;;;;;;;.........___B;;;;;;;;;;;;;;B..............',
  '..;;;;;;;;;;;;;;;;;;;;............;;;;;;;;;;;;;;;;..............',
  '..;;;;;;D;;;;;b;;;uu;;.i.5..m...i.;;;;Y;;;k;;;uu;;...uu.........',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

// A point block of the 1960s plan, its stairwell open at the foot and a
// stoner in it: up the balconies on its side to the top floor, where a
// whole flat isn't on the plans, and over the roof; a crate before it,
// a party by the swings after.
const block = [
  '................................................',
  '................uuuu............................',
  '............ZZZZZZZZZZZZZZZZ....................',
  '............:::::::::::::::Z....................',
  '............:p::h::U::uu:::Z....................',
  '.........---ZZZZZZZZZZZZZZZZ....................',
  '............Z;;;;;;;;;;;;;;Z....................',
  '............Z;;;;;;;;;;;;;;Z....................',
  '..........u.Zp;;;;;;;;;;ttsZ.u..................',
  '.........---ZZZ;;ZZZZZZZZZZZ---.................',
  '............Z;;;;;;;;;;;;;;Z....................',
  '............Z;;;;;;;;;;;;;;Z....................',
  '.....Q....u.Z;;;;;;;;;;;;;;Z.u..............ü...',
  '.....?...---ZZZZZZZZZZ;;ZZZZ---.............?...',
  '............Z;;;;;;;;;;;;;;Z....................',
  '............;;;;;;;;;;;;;;;;....................',
  '.i..........;;;;S;;;N;uu;;;;......uu..P..3....C.',
  '################################################',
  '################################################',
  '################################################',
];

// Skogåshallen, Huddinge's first indoor pool: a technician testing the
// water, the budget in a crate, the lane ropes to hop along, up the
// diving tower and off its board, and bathers at the far end.
const hall = [
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '..BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB..',
  '..B;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;B..',
  '..B;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;B..',
  '..B;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;B..',
  '..B;;;;;;;;;;;;;;;;;;;;;;;;;;;uu;;;;;;;;;;;;;;;;;;;;;;;;;;;;;B..',
  '..B;;;;;;;;;;;;;;;;;;;;;;;;;;;ZZ____;;;;;;;;;;;;;;;;;;;;;;;;;B..',
  '..B;;;;;;;;;;;;;;;;;;;;;;;;uu;ZZ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;B..',
  '..B;;E;;;;;;;;;;;;;;;;;;;;;;;;ZZ;;;;uu;;;;;;;;;;;;;;;;;;;;;;;B..',
  '..B;;?;;;;;;;;;;;;;;;;;;;;____ZZ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;B..',
  '..B;;;;;;;;;;;;;;uu;;;uu;;;;;;ZZ;;;;;;;;;uu;;;uu;;;;;;;;;;;;;B..',
  '..;;;;;;;;;;;;;;;;;;;;;;;;;;;;ZZ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;..',
  'i.;;;;;L;;;;;;;__;;;__;;;__;;;ZZ;;;;;;__;;;__;;;__;;;;;P;;uu;;..',
  'ZZZZZZZZZZZZ~~~~~~~~~~~~~~~~~~ZZ~~~~~~~~~~~~~~~~~~~~ZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZ~~~~~~~~~~~~~~~~~~ZZ~~~~~~~~~~~~~~~~~~~~ZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZ~~~~~~~~~~~~~~~~~~ZZ~~~~~~~~~~~~~~~~~~~~ZZZZZZZZZZZZ',
];

// Lännafortet, built on the ridge in 1914 for the southern front that
// was never fought: the second checkpoint below it, a torch and a
// bureaucrat on the ridge, a plank up to the bunker's roof, inside it an
// ideologue and behind a wall its old magazine; a trench of syringes, a
// dealer, a crate; down the far slope to the third checkpoint.
const fort = [
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '....................uuuu................................',
  '..................ZZZZZZZZZZZZ...........T..............',
  '..................Z;;;;;;::::Z...........?..............',
  '...............___Z;;;;;;::::Z..........................',
  '..................;;;I;;;:p:hZ...uuu....................',
  '............].Y...;;;;;;;:U::Zuu.......D................',
  '............#####################...########............',
  '.........uu.#####################...########.uu.........',
  '........#########################^^^############........',
  '.i......########################################..uu.C..',
  '########################################################',
  '########################################################',
  '########################################################',
];

// Beatebergsanstalten, new in the early 1980s: over its wall by the
// planks outside, a guard in the yard, the cell block with a dealer at
// its foot and a spoon left in a cell upstairs, over the guard tower,
// the helicopter in a crate, and out over the far wall to a visitor.
const prison = [
  '.......................................................$',
  '.......................................................?',
  '........................................................',
  '........................................................',
  '......................................................__',
  '........................................................',
  '........................................................',
  '..............................uu........................',
  '......uu......................ZZ..........uu............',
  '......ZZ......................ZZ..........ZZ............',
  '......ZZ....BBBBBBBBBBBBBB.___ZZ..........ZZ............',
  '......ZZ....B;;s;;;;;;;U;B....ZZ..........ZZ............',
  '...uu.ZZ....B;;;;;;;;;;;;B....ZZ...X......ZZ............',
  '..___.ZZ....BBBBBB;;BBBBBB.___ZZ...?...___ZZ............',
  '......ZZ....B;;;;;;;;;;;;B....ZZ..........ZZ............',
  '......ZZ....;;;;;;;;;;;;;;....ZZ..........ZZ............',
  '.i....ZZ.Y..;;;;D;;;;uu;;;....ZZ.....S....ZZ..uu..m.....',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

// The arena at the end: two planks to come down from and
// Beatebergsanstalten's warden, his keys on a ring: five hits, and the
// gate stands until the boss is beaten.
const arena = [
  'vç..........................Z...',
  '??..........................Z...',
  '............................Z...',
  '............................Z...',
  '___.........................Z...',
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
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

export const skogas = {
  id: 'skogas',
  name: 'Skogås',
  stationName: 'SKOGÅS',
  time: 300,
  music: 'skogas',
  backdrop: 'seventies',
  rows: joinSections(station, centre, block, hall, fort, prison, arena, finish(20)),
  signs: [
    'SKOGÅS. ETT NAMN SOM PLANERARNA HITTADE PÅ. VI HITTAR PÅ RESTEN.',
    'SKOGÅS CENTRUM. UNDER BAR HIMMEL. SÅ SER VI ALLT SOM HÄNDER.',
    'BRANDSTATIONEN. VI SLÄCKER BRÄNDER. OCH JOINTAR.',
    'PUNKTHUSET. GRANNARNA SER ALLT. GRANNARNA RINGER OSS.',
    'SKOGÅSHALLEN. KISSA INTE I BASSÄNGEN. KISSA I KOPPEN.',
    'LÄNNAFORTET 1914. MOT EN FIENDE SOM ALDRIG KOM. VI VÄNTAR ÄNNU.',
    'BEATEBERGSANSTALTEN. NYBYGGD. FRAMGÅNGEN MÄTS I ANTAL PLATSER.',
  ],
};
