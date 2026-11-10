// Södertörns villastad, in the 1970s and 1980s. The villa town
// was laid out in 1901 between the lakes Drevviken and Magelungen, along
// the new Nynäsbanan; few plots ever sold, the city bought it in 1912, and
// in the 1960s most villas were pulled down for the slab blocks of Farsta
// strand, the tunnelbana reaching its last stop there in 1971. The
// station kept the villa town's name until 1989. So from the station,
// under the tracks, past the slab block, through the villas left by the
// lake, across the bathing place and on to the tunnelbana's last stop,
// then the finish every level ends with. Written in sections side by
// side (joinSections); the ground's top is row 17.
import { joinSections } from '../level.js';
import { finish } from './finish.js';

// The station's platform on Nynäsbanan, which still bears the villa town's
// name: the name board, a stoner waiting for the commuter train, a bench
// and its spoon, and the first crates.
const platform = [
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
  '................................................',
  '..............................K.................',
  '.............................???................',
  '.................uu......................uu.....',
  '................u..u............................',
  '..@..i..9............5.s..S.......6..uuu.....6..',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// Down the stairs, past the puddles at their foot, through the underpass
// under the tracks, or over the embankment (keep off, it says); a dealer
// waits at the far side.
const underpass = [
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '.....................U..................',
  '.....................?..................',
  '........................................',
  '........................................',
  '........i...uuu...........u.u.u.........',
  '......ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ......',
  '......ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ......',
  '......ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ....D.',
  'ZZ....;;;;;;;;;;;;;;;;;;;;;;;;;;;;....ZZ',
  'ZZZZ,,;;;uu;;;u;u;;;;b;;;;;uuu;;;;..ZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// The 1960s slab block built where the villas stood: up the balconies to a
// roof with a hidden canister and a crate, or through the archway past
// the housing office's bureaucrat.
const block = [
  '..............................F.........................',
  '..............................?.........................',
  '........................................................',
  '........................................................',
  '..................h...uuuu..............................',
  '................ZZZZZZZZZZZZZZZZZZZZ....................',
  '................ZZZZZZZZZZZZZZZZZZZZ.u..................',
  '.............---ZZZZZZZZZZZZZZZZZZZZ---.................',
  '................ZZZZZZZZZZZZZZZZZZZZ....................',
  '..............u.ZZZZZZZZZZZZZZZZZZZZ.r..................',
  '.............---ZZZZZZZZZZZZZZZZZZZZ---.................',
  '................ZZZZZZZZZZZZZZZZZZZZ....................',
  '..............u.ZZZZZZZZZZZZZZZZZZZZ.u..................',
  '.............---ZZZZZZZZZZZZZZZZZZZZ---.................',
  '................ZZZZZZZZZZZZZZZZZZZZ....................',
  '................ZZZZZZ;;;;;;;;ZZZZZZ....................',
  '.7.....i..8.....ZZZZZZ;u;c;;u;ZZZZZZ.....Y....k...2.....',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

// The villas left by Magelungen. The first, on a brick plinth, holds a
// study circle on the drug-free society (an ideologue downstairs, a
// bureaucrat up through the hole in the floor, out over the veranda to
// the roof), and in its cellar, under a gap in the plinth, the secret
// room: a grow room. Then the garden, a pensioner, the first checkpoint,
// and the second villa, a collective's, with its tower and the
// helicopter on top.
const villas = [
  '........................................................................',
  '.....................................................X..................',
  '.....................................................?..................',
  '..............T.........................................................',
  '..............?.........................................................',
  '....................................................u..u................',
  '....................................................WWWW................',
  '.......uuuu.........................................WWWW................',
  '....WWWWWWWWWWWWWWWW..............................u.WWWW................',
  '....W;;;;;;;;;;;;;;W.............................___WWWW................',
  '....W;;;;;;;;;;;;;;;................................WWWW................',
  '....W;;Y;;;uuu;;;;;;........................uuu.....WWWW................',
  '....WWWWWWWWWWW;;WWW--....................WWWWWWWWWWWWWWWW..............',
  '....W;;;;;;;;;;;;;;W......................W;;;;;;;;;;;;;;W..............',
  '....;;;;;;;;;;;;;;;;.......uu.............;;;;;;;;;;;;;;;;..............',
  '....;;;;;;;I;;;;d;;;......u..u............;;;;P;;b;;P;;c;;..............',
  '.i..BBBB::BBBBBBBBBB...3.......m..S..C.i.BBBBBBBBBBBBBBBBB..6.uuu..D.5..',
  '####B::::::::::::::B####################################################',
  '####B:p:::U:::h:p::B####################################################',
  '####BBBBBBBBBBBBBBBB####################################################',
];

// Farsta strandbad on Magelungen: bathers, the jetty and a technician
// testing the water at its end, pedal boats, the diving tower and a raft
// to the far shore and the second checkpoint.
const beach = [
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '...............................U$...............................',
  '..............................____..............................',
  '................................................................',
  '................................................................',
  '......................................u..........U..............',
  '......Q..................uu....ZZ..........u....................',
  '......?........................ZZ.........___...................',
  '...............................ZZ...............................',
  '............uu...L.....HH......ZZ..............HH...............',
  '.i.5.P....__________...........ZZ....VV.................uu..C...',
  '##########~~~~~~~~~~~~~~~~~~~~~ZZ~~~~~~~~~~~~~~~~~~~~~##########',
  '##########~~~~~~~~~~~~~~~~~~~~~ZZ~~~~~~~~~~~~~~~~~~~~~##########',
  '##########~~~~~~~~~~~~~~~~~~~~~ZZ~~~~~~~~~~~~~~~~~~~~~##########',
];

// The tunnelbana's last stop: an ideologue, a cordon, the live track to
// jump (a pit), a plank over the syringes up to the canopy and its
// crate, a leaking pipe, a technician, a bureaucrat and a party.
const lastStop = [
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '........................................................',
  '.........................................t..............',
  '.........................................?..............',
  '........................................................',
  '........................................................',
  '.................................uuu....................',
  '................................ZZZZZZZZZZZZ............',
  '.........E...........................O..................',
  '.........?..........uuuu................................',
  '.............................__.........................',
  '.............=..........................................',
  '..i.....I....=..uu.......u...^^..........L..k..Y....P...',
  'ZZZZZZZZZZZZZZZZZZZZ....ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZ....ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZ....ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

export const villastad = {
  id: 'villastad',
  name: 'Villastad',
  place: 'Södertörns villastad',
  stationName: 'SÖDERTÖRNS VILLASTAD',
  time: 270,
  music: 'suburbs',
  rows: joinSections(platform, underpass, block, villas, beach, lastStop, finish(20)),
  signs: [
    'SÖDERTÖRNS VILLASTAD: SNART FARSTA STRAND. NAMNET UTREDS.',
    'OBEHÖRIGA ÄGA EJ TILLTRÄDE. POLISEN ÄR ALLTID BEHÖRIG.',
    'VILLORNA REVS PÅ 60-TALET. BETONGEN HAR LÄMNAT PROV.',
    'STUDIECIRKEL: ETT NARKOTIKAFRITT SAMHÄLLE. KÄLLAREN STÄNGD.',
    'KOLLEKTIVET ODLAR TOMATER. SÄGER DE.',
    'FARSTA STRANDBAD. BADVATTNET PROVTAS. BADARNA OCKSÅ.',
    'SLUTSTATION. 1 JULI 1988 BLIR EGET BRUK ETT BROTT.',
  ],
};
