// Handen, in 1971: a crossroads where the roads to Dalarö and Nynäshamn
// split (a signpost shaped like a hand, the name most likely says), a
// station on Nynäsbanan since 1901 by the lake Övre Rudan, a village on
// the esker Söderbymalm with its Konsum and Folkets hus. Some 1 400
// people lived here in 1950 and 30 000 in 1970; Handens centrum opened in
// the open air in 1964, the same year as the water tower, and in 1971
// Västerhaninge and Österhaninge became one kommun, Haninge, its offices
// in Nämndhuset, a brick tower in the centre. Rudans gård was farmed into
// the 1960s, its cows loose in the forest. So from the station, along the
// lake, through the centre and up Nämndhuset, over the esker, through
// the farm and over the water tower, then the finish every level ends
// with. Written in sections side by side (joinSections); the ground's top
// is row 17.
import { joinSections } from '../level.js';
import { finish } from './finish.js';

// Handen's station by Övre Rudan, with the bus terminal beside it: the
// name board, a stoner waiting for a bus, a canopy over the platform with
// police coffee in a crate, and a dealer at the far end.
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
  '...............................K................',
  '...............................?................',
  '................................................',
  '.............................uu..uu.............',
  '............................_______.............',
  '................................................',
  '...............uu.....uu........................',
  '..@.9.........i...1.......S.........5...uu..D...',
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
  '.i..P....C..__________..........ZZ...VV...............m..uu.P...',
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

export const handen = {
  id: 'handen',
  name: 'Handen',
  stationName: 'HANDEN',
  time: 300,
  music: 'handen',
  backdrop: 'seventies',
  rows: joinSections(station, rudan, centre, malm, farm, waterTower, finish(20)),
  signs: [
    'HANDEN. EFTER EN VÄGSKYLT FORMAD SOM EN HAND. NU PEKAR DEN PÅ DIG.',
    'ÖVRE RUDAN. BADA GÄRNA. VATTNET UNDERSÖKS. DU OCKSÅ.',
    'NÄMNDHUSET 1971. TVÅ KOMMUNER BLEV EN. BLANKETTERNA BLEV DUBBELT.',
    'SÖDERBYMALM. EN RULLSTENSÅS. HÄR RULLAR ÄVEN UTREDNINGARNA.',
    'RUDANS GÅRD. KORNA GÅR FRITT I SKOGEN. DE ÄR INTE MISSTÄNKTA. ÄN.',
    'HANDENS VATTENTORN 1964. HELA KOMMUNENS VATTEN. ETT ENDA URINPROV.',
  ],
};
