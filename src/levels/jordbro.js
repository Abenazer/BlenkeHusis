// Jordbro, in the 1970s: a stop on Nynäsbanan since 1901, its
// commuter trains from 1973. The town was planned in 1961–62 for 12 000
// people, three-storey slab blocks with park strips between, and building
// began in 1963 on streets named after stone (Moränvägen,
// Blockstensvägen), its developers promising pure sanatorium air. The old
// Nynäsvägen ran through the middle of it until the motorway came in 1975;
// the centre at Hurtigs torg was six low buildings joined by walkways, a
// sculpture called Vågen (1966) on the square. Bröderna Hedlunds Rörverk
// (1961) was the first big employer, the industrial area was laid out in
// old sand and gravel pits, and in the 1950s Jordbro was proposed for
// Stockholm's new airport. The railway cuts through Mälardalen's largest
// grave field, some 660 graves from 500 BC to 500 AD. So from the station,
// over the grave field, through a slab block and past
// Lundaskolan, over the old road, through
// the centre and the pipe works to the gravel pits, then the finish every
// level ends with. Written in sections side by side (joinSections); the
// ground's top is row 17.
import { joinSections } from '../level.js';
import { finish } from './finish.js';

// The station of 1973: the platform and the walkway tunnel under it, a
// stoner sheltering in the tunnel, a party waiting for the train.
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
  '....................................K...........',
  '....................................?...........',
  '................................................',
  '................................uuu.............',
  '...........................5............P.......',
  '.....................u..ZZZZZZZZZZZZZZZZZZZZ....',
  '...................u....;;;;;;;;;;;;;;;;;;;;.uu.',
  '..@.9.........i.........;;;;uu;;;S;;;;uuu;;;....',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// The grave field the railway cuts through: mounds, a cairn with a crate
// over it, the cutting to jump, an ideologue on a mound and a stone circle.
const graves = [
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
  '.............{..................................',
  '.............?..................................',
  '................................................',
  '.............u............uuuu..................',
  '......uu.....n......uu..........................',
  '.............#....................I....b.u......',
  '.i....##....###.....##...........###..#.#.#..D..',
  '##########################....##################',
  '##########################....##################',
  '##########################....##################',
];

// A slab block of 1963 on Moränvägen, three storeys: up through the holes
// in its floors or the balconies at its end, a flat on the top floor
// hidden, a crate over the roof; the park strip, a citizen and the first
// checkpoint.
const block = [
  '................................................................',
  '................................................................',
  '.........................E......................................',
  '.........................?......................................',
  '................................................................',
  '................................................................',
  '..................uuuu............Y.............................',
  '......ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ......................',
  '......Z;;;;;;;;;;;;;;;;;;;;;;;;;:::::::::Z......................',
  '......Z;;;;;;uu;;;;;;;P;;;;;;;;;::p::h:U:Z.u....................',
  '......ZZZZZZZZZZZZZZZZZZZZZZ;;ZZZZZZZZZZZZ---...................',
  '......Z;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;Z......................',
  '......Z;;uu;;;;;;;;;Y;;;;;;;;;;;;;uuu;;;;Z.u....................',
  '......ZZZZZZ;;ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ---...................',
  '......Z;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;Z......................',
  '......;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;.............uu.......',
  '..i...;;;;S;;;;;uu;;;;;;P;;;;;c;;;;;u;;;;;....3.....m.....4...C.',
  '################################################################',
  '################################################################',
  '################################################################',
];

// Lundaskolan, where Rainer Hartleb met class 1D in August 1972 and began
// the Jordbro films he made of them until 2014 (En pizza i Jordbro, 1994,
// won the Guldbagge): the low school with the class in its room, more of
// them on the asphalt yard, all of them there to be tested.
const school = [
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
  '...............uuu......................',
  '........................................',
  '..........BBBBBBBBBBBBBBBBB.............',
  '..........B;;;;;;;;;;;;;;;B.............',
  '..........;;;;;;;;;;;;;;;;;.....uu......',
  '..........;;;;;;;;;;;;;;;;;.............',
  '..i..ñ....;;;u;;;;ñ;;;;u;;;..ñ.5...ñ....',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

// The old Nynäsvägen through the middle of the town: cones, a police car,
// a cordon and an ideologue under the footbridge, a crate over it.
const road = [
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '......................F.........................',
  '......................?.........................',
  '................................................',
  '...............uuuu........uuu..................',
  '............______________________..............',
  '................................................',
  '................................................',
  '.........___........=..........u..___.........uu',
  '..i..v.v......2.....=.....I...,,,.....D..6..v...',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

// Jordbro centrum: six low shops joined by walkways at their roofs,
// Hurtigs torg between, and the second checkpoint.
const centre = [
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '............................uuu.................................',
  '................................................................',
  '................................................................',
  'ü....uu......uu......uu........Q.......uu......uu......uu.......',
  '?..BBBBBB__BBBBBB__BBBBBB......?.....BBBBBB__BBBBBB__BBBBBB.....',
  '...B;;;;B..B;;;;B..B;;;;B............B;;;;B..B;;;;B..B;;;;B.....',
  '...;;;;;;..;;;;;;..;;;;;;............;;;;;;..;;;;;;..;;;;;;.....',
  '...;;u;;;..;;D;;;..;;;b;;..i.5...k.m.;;P;;;..;;Y;;;..;;uu;;..C..',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

// Bröderna Hedlunds Rörverk: up the stacked pipes to the catwalk under
// the leaking ones, over the pickling bath, and at the catwalk's end an
// office that isn't on the plans; the third checkpoint outside.
const works = [
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '....BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB........',
  '....B.................O........O......BBBBBBBBBB........',
  '....B.................................:::::::::B........',
  '....B............Suu......uuu......uu.:::p:h:U:B........',
  '....B...........______________________BBBBBBBBBB........',
  '....B..........................................B........',
  '....B......................O...................B........',
  '....B.......uu.................................B........',
  '....B.......OO.................................B........',
  '...........OOO....................uuu.............uu....',
  '.i........OOOO....L.....uu.....t........Y........C...7..',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ%%%ZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ%%%ZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// The gravel pits where the airport would have been, and a helicopter in
// a crate.
const pits = [
  '...................................s}ç..',
  '...................................???..',
  '........................................',
  '........................................',
  '...................................___..',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '..................X.....................',
  '........uuuu......?.....uuuu............',
  '...............u........................',
  '...............#...................uu...',
  '..i...........###...S..........P........',
  '########....############....############',
  '########....############....############',
  '########....############....############',
];

// The arena at the end: two planks to come down from and the social
// secretary with the compulsory-care forms: five hits, and the gate stands
// until the boss is beaten.
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

export const jordbro = {
  id: 'jordbro',
  name: 'Jordbro',
  stationName: 'JORDBRO',
  time: 300,
  music: 'jordbro',
  backdrop: 'seventies',
  rows: joinSections(station, graves, block, school, road, centre, works, pits, arena, finish(20)),
  signs: [
    'JORDBRO 1973. PENDELTÅGET KOMMER. GÅNGTUNNELN ÖVERVAKAS.',
    'JORDBRO GRAVFÄLT. 660 GRAVAR. ETT NARKOTIKAFRITT SAMHÄLLE.',
    'JORDBRO 1963. REN SANATORIELUFT UTLOVAS. HUNDARNA NOSAR ÄNDÅ.',
    'LUNDASKOLAN 1972. KLASS 1D FILMAS TILL 2014. VI PROVTAR LIKA LÄNGE.',
    'GAMLA NYNÄSVÄGEN DELAR JORDBRO I TVÅ. VI KONTROLLERAR BÅDA.',
    'HURTIGS TORG. SKULPTUREN HETER VÅGEN. DEN ÄR BESLAGTAGEN.',
    'BRÖDERNA HEDLUNDS RÖRVERK 1961. RÖR INTE NÅGOT. ALLT ÄR BEVIS.',
    'HÄR SKULLE STOCKHOLMS NYA FLYGPLATS LIGGA. NU LANDAR BARA POLISEN.',
  ],
};
