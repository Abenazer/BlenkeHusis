// Handen, in 1971: a crossroads where the roads to Dalarö and Nynäshamn
// split (a signpost shaped like a hand, the name most likely says), a
// station on Nynäsbanan since 1901 by the lake Övre Rudan (Österhaninge
// until 1913, its wooden house standing until 1979), a village on
// the esker Söderbymalm with its Konsum and Folkets hus. Some 1 400
// people lived here in 1950 and 30 000 in 1970; Handens centrum opened in
// the open air in 1964, the same year as the water tower, and in 1971
// Västerhaninge and Österhaninge became one kommun, Haninge, its offices
// in Nämndhuset, a brick tower in the centre. Rudans gård was farmed into
// the 1960s, its cows loose in the forest. The years aren't strict: the
// 1980s' Ultrakåken stands here too, the old villa on Källvägen 9 where
// the Ultra association let punks and anyone else play from 1980 until it
// burned in 1988, some 2 000 bands, buns baked for band and audience. So
// from the station, along the lake, through the centre and up
// Nämndhuset, over the esker, past Ultrakåken, through the farm and over
// the water tower, then the finish every level ends with. Written in sections side by side (joinSections); the ground's top
// is row 17.
import { joinSections } from '../level.js';
import { finish } from './finish.js';

// Handen's station, called Österhaninge until 1913, and its wooden house
// of 1901, still standing in 1971 (it was pulled down in 1979): the name
// board, a bus stop, a stoner in the waiting room, a plank up to the
// roof and police coffee in a crate over it; a bench and a dealer.
const station = [
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '..............................K.................',
  '..............................?.................',
  '................................................',
  '................................................',
  '...........................uu..uu...............',
  '..........................WWWWWWWWWW............',
  '..........................W;;;;;;;;W............',
  '........................u.W;;;;;;;;W............',
  '.......................___W;;;;;;;;W............',
  '...............uu....u....;;;;;;;;;;............',
  '..@.9.........i...1.......;;;S;;uu;;..5.uu..D...',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// Övre Rudan, the lake by the station: bathers on the beach and the
// first checkpoint, a jetty where a technician tests the water, then a
// raft, the diving float and another raft to the far shore and a citizen.
const rudan = [
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................uu...$..........................',
  '......Q.................uuu................uu...................',
  '......?.........................ZZ..............................',
  '................................ZZ..............................',
  '..................L....HH.......ZZ........HH....................',
  '.i..P.......__________..........ZZ...VV...............m..uu.P...',
  '##############~~~~~~~~~~~~~~~~~~ZZ~~~~~~~~~~~~~~~~##############',
  '##############~~~~~~~~~~~~~~~~~~ZZ~~~~~~~~~~~~~~~~##############',
  '##############~~~~~~~~~~~~~~~~~~ZZ~~~~~~~~~~~~~~~~##############',
];

// Handens centrum of 1964, open to the sky: three low shops joined by
// walkways at their roofs, a dealer in one of them, and Nämndhuset, the
// brick tower the new Haninge kommun moved into in 1971. Up through the
// holes in its floors (or the balconies outside) past the bureaucrats to
// the top floor, where an office isn't on the plans; then a citizen and
// the second checkpoint.
const centre = [
  '........................................................................',
  '......................................BBBBBBBBBBBBBBBB..................',
  '......................................B;;;;;;;:::::::B..................',
  '......................................B;;;;;Y;:p::h:UB..................',
  '......................................BB;;BBBBBBBBBBBB..................',
  '......................................B;;;;;;;;;;;;;;B..................',
  '......................................B;;uu;;;Y;;;uu;B.u................',
  '......................................BBBBBBBBBBBB;;BB---...............',
  '.............F........................B;;;;;;;;;;;;;;B..................',
  '.............?........................B;;;;;;uuu;;;;;B.u................',
  '......................................BB;;BBBBBBBBBBBB---...............',
  '......................................B;;;;;;;;;;;;;;B..................',
  '...uu......uu......uu.................B;;uu;;;;P;;;;;B.u................',
  '..BBBBBB__BBBBBB__BBBBBB..............BBBBBBBBBBBB;;BB---...............',
  '..B;;;;B..B;;;;B..B;;;;B..............B;;;;;;;;;;;;;;B..................',
  '..;;;;;;..;;;;;;..;;;;;;..............;;;;;;;;;;;;;;;;..................',
  '..;;u;;;..;;D;;;..;;b;;;..i.5..k..Y...;;;;;I;;uu;;;c;;.....m..uu...C....',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

// Söderbymalm, the esker the station village grew on: up its slopes to
// Folkets hus on the ridge, where a party and an ideologue hold a
// meeting, a plank up to its roof; down the other side to a dealer.
const malm = [
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '.........................uuuu...........................',
  '.....................BBBBBBBBBBBBBB.....................',
  '.....................B;;;;;;;;;;;;B.....................',
  '...............T..___B;;;;;;;;;;;;B.....................',
  '...............?.....;;;;;;;;;;;;;;.....................',
  '...................u.;;;P;;uuu;;I;;.....................',
  '..................####################..................',
  '................u.####################.uu...............',
  '..............############################..............',
  '...........uu.############################.uu...........',
  '..........####################################..........',
  '..i.......####################################.5..D..6..',
  '########################################################',
  '########################################################',
  '########################################################',
];

// Ultrakåken, the Ultra association's villa on Källvägen 9: a bike rack
// and a moped outside, the stage on the ground floor where a punk pogos
// and a headbanger stage-dives, and up a plank, through the floor, the
// rehearsal room over it with samples and an empty can.
const ultra = [
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '..............WWWWWWWWWWWWWW............',
  '..............W;;;;;;;;;;;;W............',
  '..............W;;uu;;c;;uu;W............',
  '..............W____________W............',
  '..............W;;;;;;;;;;;;W............',
  '..............W;;;;;;;;;;;;W............',
  '..............W;;;;;;;;;;;;W............',
  '..............W;____;;;;;;;W............',
  '..............;;;;;;;;;;;;;;............',
  '.i..&....<....;;;;N;;;uu;x;;...uu.......',
  '########################################',
  '########################################',
  '########################################',
];

// Rudans gård, a working farm into the 1960s, its cows loose in the
// forest inside a fence of split rails: along the fence, a party in the
// meadow, the budget in a crate, and the barn, a stoner in its hay and a
// technician testing the milk; up in the hayloft, behind the bales, a
// stash. A dealer outside and the third checkpoint.
const farm = [
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '..........................WWWWWWWWWWWWWWWW..............',
  '..........................W;;;;;;;;::::::W..............',
  '..........................W;;uu;;;;:p:h:UW..............',
  '..........................W______________W..............',
  '..........................W;;;;;;;;;;;;;;W..............',
  '.....................E....W;;;;;;;;;;;;;;W..............',
  '.....................?....W;;;;;;;;;;;;;;W..............',
  '......uuu.................W;____;;;;;;;;;W..............',
  '...__________.............;;;;;;;;;;;;;;;;..............',
  '.i............m..P........;;;S;;;uu;;L;;;;..uu..D....C..',
  '########################################################',
  '########################################################',
  '########################################################',
];

// Handens vattentorn of 1964 in the industrial area, its stem in the
// way: up the planks and over the bowl, the whole kommun's water under
// Blenke's feet; puddles, a technician, a helicopter in a crate and a
// bureaucrat by the pit.
const waterTower = [
  '................................................',
  '................................................',
  '................uuuuuuuuuu......................',
  '...............ZZZZZZZZZZZZ.....................',
  '...............ZZZZZZZZZZZZ.....................',
  '...............ZZZZZZZZZZZZ.....................',
  '...............ZZZZZZZZZZZZ.....................',
  '............___....ZZZZ.........................',
  '...................ZZZZ.........................',
  '...........u.......ZZZZ.........................',
  '..........___......ZZZZ.........................',
  '...................ZZZZ.........................',
  '..............u....ZZZZ........X................',
  '.............___...ZZZZ........?................',
  '...................ZZZZ..............uuu........',
  '...................ZZZZ.........................',
  '.i...,,,...........ZZZZ....L......uu.......Y....',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ...ZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ...ZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ...ZZZZZZZZ',
];

// The arena at the end: two planks to come down from and the new kommun's
// councillor, scissors for the ribbon: five hits, and the gate stands
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
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

export const handen = {
  id: 'handen',
  name: 'Handen',
  stationName: 'HANDEN',
  time: 300,
  music: 'handen',
  backdrop: 'seventies',
  rows: joinSections(station, rudan, centre, malm, ultra, farm, waterTower, arena, finish(20)),
  signs: [
    'HANDEN. EFTER EN VÄGSKYLT FORMAD SOM EN HAND. NU PEKAR DEN PÅ DIG.',
    'ÖVRE RUDAN. BADA GÄRNA. VATTNET UNDERSÖKS. DU OCKSÅ.',
    'NÄMNDHUSET 1971. TVÅ KOMMUNER BLEV EN. BLANKETTERNA BLEV DUBBELT.',
    'SÖDERBYMALM. EN RULLSTENSÅS. HÄR RULLAR ÄVEN UTREDNINGARNA.',
    'ULTRAKÅKEN. 2000 BAND HAR SPELAT HÄR. BULLARNA ÄR PÅ ANALYS.',
    'RUDANS GÅRD. KORNA GÅR FRITT I SKOGEN. DE ÄR INTE MISSTÄNKTA. ÄN.',
    'HANDENS VATTENTORN 1964. HELA KOMMUNENS VATTEN. ETT ENDA URINPROV.',
  ],
};
