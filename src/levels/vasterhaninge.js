// Västerhaninge, in the 1970s and 1980s: a station town on
// Nynäsbanan since 1901 that became a suburb in the 1950s and 60s, its
// centre opened in 1969 and its commuter trains came in 1973, when the old
// station house was pulled down. Its laundries were many, its industrial
// estate at Håga came in 1959, and its courthouse of 1731–34 was moved
// fifteen metres in the late 1970s when Nynäsvägen was widened. The
// Mormons' temple for Scandinavia came in 1985. So from the station,
// through the centre and Paus bagarstuga, the temple, a laundry and the
// school, through the courthouse to the judge, then the finish every
// level ends with. Written in sections side by side (joinSections); the
// ground's top is row 17.
import { joinSections } from '../level.js';
import { finish } from './finish.js';

// The station: the commuter trains came in 1973, and the old station
// house is half pulled down. A stoner shelters in what is left of it;
// up through the hole in its floor and over its broken walls.
const station = [
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '...................uu...........................',
  '..................BBBB.......BBB................',
  '..................BBBBBBB..BBBBB................',
  '..................B;;;;;;;;;;;;B................',
  '..................B;uuu;;;;;r;;B................',
  '..................BBBBBBBB;;BBBB..........K.....',
  '..................B;;;;;;;;;;;;B.........???....',
  '..................B;;;;;;;;;;;;B.....uuu........',
  '..................;;;;;;;;;;;;;;................',
  '..@...........i...;;;;S;;uu;;;;;.............P..',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// The centre of 1969: shops on two floors, cut open, a dealer among them
// and a gang upstairs, a plank to the hole in the floor and a skylight to
// the roof, where the police park; a hidden canister and a crate up there.
const centre = [
  '................................................................',
  '................................................................',
  '................................................................',
  '................................]...............................',
  '................................?...............................',
  '................................................................',
  '..............uuuu......................h.......................',
  '......ZZZ;;ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ..................',
  '......Z;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;Z..................',
  '......Z;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;Z..................',
  '......Z};;;;;;uu;;;;P;;;;p;;;;P;;;;uu;;;;;;;oZ..................',
  '......ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ;;ZZZZZZ..................',
  '......Z;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;Z..................',
  '......Z;;;;;;;;;;;;;;;;;;;;;;;;;;;;;n;;;;;;;;Z..................',
  '......Z;;;;;;;;;;;;;;;;;;;;;;;;;;;;;___;;;;;;Z..................',
  '......;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;..................',
  '..i>..;;;;k;;;;D;;;;c;;;;uuuxf;b;y;y;;;;;;u;;;.....uuu.......Y..',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

// Paus bagarstuga in the centre, a bakery and café in old country style
// among the concrete: two customers at the counter and two outside by
// the bench, each with a bag of poppy-seed buns, which can make a urine
// test positive for opiates, so for once the tests are; a bun in a crate
// over the roof (minor possession, by the statistics), and a technician
// confirming it all.
const bakery = [
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '.................p......................',
  '.................?......................',
  '........................................',
  '..........uu..........uu................',
  '........ääääääääääääääääää..............',
  '........ä;;;;;;;;;;;;;;;;ä..............',
  '........ä;;;;;;;;;;;;;;;;ä..............',
  '...___..ä;;;;;;;;;;;;;;;;ä..............',
  '........;;;;;;;;;;;;;;;;;;..............',
  '..i.....;;;;;;;uuu;;;;;;;;............L.',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

// The Church of Jesus Christ of Latter-day Saints' temple, dedicated in
// 1985, the first in Scandinavia: white, with a spire, lawns and a
// reflecting pool, a plank over it. Two elders on mission by the gate,
// a bishop, a sister and the temple's president inside, a gallery over
// them, a second sister on the lawn and three brothers singing in
// golden sneakers between the pool and the door; all keep the Word of
// Wisdom, no coffee, no tea, so all are tested. A plank up to the roof and the
// spire, the paperwork shield in a crate over it. An ideologue and a
// party outside, and the first checkpoint.
const temple = [
  '........................................................',
  '...............................F........................',
  '...............................?........................',
  '........................................................',
  '........................................................',
  '...............................öö.......................',
  '...............................öö.......................',
  '...............................öö.......................',
  '..............................öööö......................',
  '........................u.....öööö.....u................',
  '......................öööööööööööööööööööö..............',
  '...............uu.....ö;;;;;;;;;;;;;;;;;;ö..............',
  '..............u..u....ö;;;;;uu;;;;uu;;;;;ö.............ü',
  '....................__ö;;;____________;;;ö.............?',
  '......................ö;;;;;;;;;;;;;;;;;;ö..............',
  '...............__.....;;;;;;;;;;;;;;;;;;;;..............',
  '..i...................;;;;;;;;;;;;;;;;;;;;.....I..P.C...',
  '#############~~~~~~#####################################',
  '#############~~~~~~#####################################',
  '#############~~~~~~#####################################',
];

// A laundry in Håga's industrial estate: a vat of lye, a conveyor up to
// the catwalk, a pipe leaking on it, a technician; at the catwalk's end
// the brick office the money is laundered in, a secret room.
const laundry = [
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '....BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB............................',
  '....B;;;;;;;;;;;;;;;;;;;;O;;BBBBBBBB............................',
  '....B;;;;;;;;;;;;;;;;;;;;;;;::::::BB............................',
  '....B;;;;;;;;;;;;;;;;;uu;;;;:$$$p:BB............................',
  '....B;;;;;;;;;;;;;;;;;______BBBBBBBB............................',
  '....B;;;;;;;;;u;;;;;;;;;;;;;;;;;;;;B......................Q.....',
  '....B;;;;;;;;u;u;;;;;;;;;;;;;;;;;;;B......................?.....',
  '....B;;;;;;;;;;;;HH;;;;;;;;;;;;;;;;B........uuu.................',
  '....;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;............................',
  '.i..;;;uu;;;;;;;;;;L;L;;t;;;;;uuu;;;...k...........Y...uu.......',
  'ZZZZZZZZZZZZ%%%%ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ%%%ZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZ%%%%ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ%%%ZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// Ribbyskolan: a drug education lesson downstairs, three pupils sitting
// it out, the headmaster upstairs, a plank to the skylight and over the
// roof; then the yard with a fourth pupil by the slide, and the second
// checkpoint. The pupils are there to be tested.
const school = [
  '........................................................',
  '........................................................',
  '..........................E.............................',
  '..........................?.............................',
  '........................................................',
  '..........uuuu......h...................................',
  '......BBBBBBBBBBBBBBBBBBBBBBBBBBB;;BBB..................',
  '......B;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;B..................',
  '......B;;;;;;;;;;;;;;;;;;;;;;;;__;;;;B..................',
  '......B;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;B..................',
  '......B;;;uu;;;;;;Y;;;;;uuu;sSD;;;;;;B..................',
  '......BZZZZZZ;;ZZZZZZZZZZZZZZZZZZZZZZB..................',
  '......B;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;B..................',
  '......B;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;B..................',
  '......B;;;;___;;;;;;;;;;;;;;;;;;;;;;;B..................',
  '......;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;..................',
  '.]i...;;;;;;;;;;I;;;;;d;;;uuu;;;;P;w;;..............C...',
  '########################################################',
  '########################################################',
  '########################################################',
];

// Tingshuset, the old courthouse moved for the road, and the way on
// past it to the judge.
const courthouse = [
  '........................................',
  '................................]ç......',
  '................................??......',
  '........................................',
  '........................................',
  '...............................____.....',
  '........................................',
  '............................HH..........',
  '........................................',
  '.........................HH.............',
  '..WWWWWWWWWW............................',
  '..W;;;;;;;;W..........HH................',
  '..W;;;;;;;;W..F.........................',
  '..W;;;;;;;;W..?....___......___.........',
  '..W;;;;;;;;W............................',
  '..;;;;;;;;;;............................',
  'i.;;;rY;d;;;....v.......................',
  '########################################',
  '########################################',
  '########################################',
];

// The arena at the end: two planks to come down from and the judge, the
// court's last word: five hits, and the gate stands until the boss is
// beaten.
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

export const vasterhaninge = {
  id: 'vasterhaninge',
  name: 'V-haninge',
  place: 'Västerhaninge',
  stationName: 'VÄSTERHANINGE',
  time: 320,
  music: 'vasterhaninge',
  backdrop: 'smalltown',
  rows: joinSections(station, centre, bakery, temple, laundry, school, courthouse, arena, finish(20)),
  signs: [
    'STATIONSHUSET RIVS. PENDELTÅGET KOMMER 1973. PROVEN STANNAR.',
    'VÄSTERHANINGE CENTRUM 1969. UNGDOMEN SAMLAS. POLISEN OCKSÅ.',
    'PAUS BAGARSTUGA. VALLMOFRALLOR. POSITIVT TILL 11.00.',
    'MORMONTEMPLET 1985. INGET KAFFE, INGET TE. MISSTÄNKT.',
    'TVÄTTERIET I HÅGA. VI TVÄTTAR ALLT UTOM PENGAR.',
    'RIBBYSKOLAN. ANT-LEKTION: KNARK ÄR FARLIGT. MER VET VI INTE.',
    'TINGSHUSET 1734. FLYTTAT 15 METER. DOMAREN STOD KVAR.',
  ],
  cast: [
    { type: 'policeCar', col: 72, row: 6 },
    { type: 'stationSign', col: 4, row: 16 },
    { type: 'streetLamp', col: 35, row: 16 },
    { type: 'parkingSign', col: 96, row: 16 },
    { type: 'binShed', col: 104, row: 16 },
    { type: 'pausCustomer', col: 123, row: 16 },
    { type: 'pausCustomer', col: 133, row: 16 },
    { type: 'pausCustomer', col: 140, row: 16 },
    { type: 'bench', col: 143, row: 16 },
    { type: 'pausCustomer', col: 146, row: 16 },
    { type: 'mormonElder', col: 158, row: 16 },
    { type: 'mormonElder', col: 160, row: 16 },
    { type: 'singerNavy', col: 171, row: 16 },
    { type: 'singerRed', col: 172, row: 16 },
    { type: 'singerTurquoise', col: 173, row: 16 },
    { type: 'mormonElder', col: 179, row: 16 },
    { type: 'mormonSister', col: 183, row: 16 },
    { type: 'mormonElder', col: 188, row: 16 },
    { type: 'mormonSister', col: 196, row: 16 },
    { type: 'streetLamp', col: 201, row: 16 },
    { type: 'moped', col: 275, row: 16 },
    { type: 'ribbyPupil', col: 281, row: 16 },
    { type: 'ribbyPupil', col: 284, row: 16 },
    { type: 'ribbyPupil', col: 291, row: 16 },
    { type: 'swings', col: 312, row: 16 },
    { type: 'pensioner', col: 316, row: 16 },
    { type: 'slide', col: 318, row: 16 },
    { type: 'ribbyPupil', col: 321, row: 16 },
    { type: 'judge', col: 382, row: 16 },
    { type: 'streetLamp', col: 408, row: 16 },
    { type: 'policeCar', col: 420, row: 16 },
  ],
};
