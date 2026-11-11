// Västerhaninge, in the 1970s and 1980s: a station town on
// Nynäsbanan since 1901 that became a suburb in the 1950s and 60s, its
// centre opened in 1969 and its commuter trains came in 1973, when the old
// station house was pulled down. Its laundries were many, its industrial
// estate at Håga came in 1959, and its courthouse of 1731–34 was moved
// fifteen metres in the late 1970s when Nynäsvägen was widened. So from
// the station, through the centre and the roadworks, a laundry and the
// school, to the prosecutor at the courthouse, then the finish every
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
  '..................BBBB..........................',
  '..................BBBBBBB.......................',
  '..................B;;;;;;;;;;...................',
  '..................B;uuu;;;;;r;;.................',
  '..................BBBBBBBB;;BBBB..........K.....',
  '..................B;;;;;;;;;;;;B.........???....',
  '..................B;;;;;;;;;;;;B.....uuu........',
  '..................;;;;;;;;;;;;;;................',
  '..@.9.........i...;;;;S;;uu;;;;;...6.........P..',
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
  '................................T...............................',
  '................................?...............................',
  '................................................................',
  '..............uuuu......2...............h.......................',
  '......ZZZ;;ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ..................',
  '......Z;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;Z..................',
  '......Z;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;Z..................',
  '......Z;;;;;;;uu;;;;P;;;;p;;;;P;;;;uu;;;;;;;;Z..................',
  '......ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ;;ZZZZZZ..................',
  '......Z;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;Z..................',
  '......Z;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;Z..................',
  '......Z;;;;;;;;;;;;;;;;;;;;;;;;;;;;;___;;;;;;Z..................',
  '......;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;..................',
  '..i...;;;;k;;;;D;;;;c;;;;uuu;;;b;;;;;;;;;;u;;;..8..uuu..7....Y..',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

// Nynäsvägen being widened: cones to throw, a cordon, puddles, an
// ideologue and two trenches, the first with a plank to stop on.
const road = [
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
  '.................uu.....................................',
  '...............u....u..........F........................',
  '...............................?...uuuu.................',
  '........................................................',
  '...........=.....__.....................................',
  '..i..v..v..=...........,,,.I...uu.........v..P...6..C...',
  'AAAAAAAAAAAAAAA......AAAAAAAAAAAAAA....AAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAA......AAAAAAAAAAAAAA....AAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAA......AAAAAAAAAAAAAA....AAAAAAAAAAAAAAAAA',
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
  '.i..;;;uu;;;;;;;;;;L;;;;t;;;;;uuu;;;...k...........Y...uu.......',
  'ZZZZZZZZZZZZ%%%%ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ%%%ZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZ%%%%ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ%%%ZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// Ribbyskolan: a drug education lesson downstairs, the headmaster
// upstairs, a plank to the skylight and over the roof; then the yard and
// the second checkpoint.
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
  '......B;;;uu;;;;;;Y;;;;;uuu;s;;;;;;;;B..................',
  '......BZZZZZZ;;ZZZZZZZZZZZZZZZZZZZZZZB..................',
  '......B;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;B..................',
  '......B;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;B..................',
  '......B;;;;___;;;;;;;;;;;;;;;;;;;;;;;B..................',
  '......;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;..................',
  '..i...;;;;;;;;;;I;;;;;d;;;uuu;;;;P;;;;..3...m.4.....C...',
  '########################################################',
  '########################################################',
  '########################################################',
];

// Tingshuset, the old courthouse moved for the road: through it to the
// prosecutor, whose barrier stands until he is beaten.
const courthouse = [
  '....................................Z...',
  '....................................Z...',
  '....................................Z...',
  '....................................Z...',
  '....................................Z...',
  '....................................Z...',
  '....................................Z...',
  '....................................Z...',
  '....................................Z...',
  '....................................Z...',
  '..WWWWWWWWWW........................Z...',
  '..W;;;;;;;;W........................|...',
  '..W;;;;;;;;W..F.....................|...',
  '..W;;;;;;;;W..?....___......___.....|...',
  '..W;;;;;;;;W........................|...',
  '..;;;;;;;;;;........................|...',
  'i.;;;r;;d;;;....v..............R....|...',
  '########################################',
  '########################################',
  '########################################',
];

// The arena at the end: a phone booth to start again from, two planks to
// come down from, and the judge, the court's last word after the
// prosecutor: five hits, and the gate stands until the boss is beaten.
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
  '.C..........................|...',
  '################################',
  '################################',
  '################################',
];

export const vasterhaninge = {
  id: 'vasterhaninge',
  name: 'V-haninge',
  place: 'Västerhaninge',
  stationName: 'VÄSTERHANINGE',
  time: 300,
  music: 'vasterhaninge',
  backdrop: 'seventies',
  rows: joinSections(station, centre, road, laundry, school, courthouse, arena, finish(20)),
  signs: [
    'STATIONSHUSET RIVS. PENDELTÅGET KOMMER 1973. PROVEN STANNAR.',
    'VÄSTERHANINGE CENTRUM 1969. UNGDOMEN SAMLAS. POLISEN OCKSÅ.',
    'NYNÄSVÄGEN BREDDAS. TINGSHUSET FÅR FLYTTA PÅ SIG.',
    'TVÄTTERIET I HÅGA. VI TVÄTTAR ALLT UTOM PENGAR.',
    'RIBBYSKOLAN. ANT-LEKTION: KNARK ÄR FARLIGT. MER VET VI INTE.',
    'TINGSHUSET 1734. FLYTTAT 15 METER. ÅKLAGAREN STOD KVAR.',
  ],
};
