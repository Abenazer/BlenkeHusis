// Sergels torg one night in the late 1990s, world 2's first level built:
// Blenke, posted to the rave commission, comes up from T-Centralen's
// platform through the unlit service passage, up the escalator to the
// square's upper level and its glass obelisk, past Kulturhuset's glass
// front and its chess players, and down the escalator to Plattan, the
// sunken square the city wants cleared, where its commissioner for social
// affairs waits; then the finish every level ends with. Written in
// sections side by side (joinSections); the ground's top is row 17.
import { joinSections } from '../level.js';
import { finish } from './finish.js';

// 1. T-Centralen's platform, deep under the city: the metro's tiled
// ceiling, the start and its sign, a tagger at work, a crate with police
// coffee, and the live track to jump.
const platform = [
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;uuu;;;;;;;;;;;;;;;;;;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;K;;;;;;;;;;;;;;;;;;;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;?;;;;;;;;;;;;;;;;;;;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;uuu;',
  ';;;;;;;;;;;;;;;;uuuu;;;;;;;;;;;;;;;;;uuu;;;;;;;;',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;',
  ';;@;;i;;;;uuu;;;;;;;;;m;;;;;;;u;u;u;;;;;;;;j;;;;',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ&&&ZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ&&&ZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ&&&ZZZZZZZZ',
];

// 2. The service passage under Sergels torg, unlit: a raver's glow sticks
// show the way, a stoner sits in the dark and a canister is hidden.
const passage = [
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ',
  ';;;;&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&',
  ';;;;&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&',
  ';;;;&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&',
  ';;;;&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&',
  ';;;;&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&',
  ';;;;&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&',
  ';;;;&&&&&&uuu&&&&&&&&&&&&&&uuu&&&&&&&&&&',
  ';;;;&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&',
  ';;;;&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&',
  ';;;;&&uuuu&&&&o&&&&&u&u&&S&&&&&h&&uuuu&&',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// 3. Up the escalator to the street, under the open sky: Sergels torg's
// upper level and the glass obelisk in its fountain, climbed by planks,
// samples on its top; a ticket inspector by the barriers.
const escalator = [
  'ZZZZZZ..................................',
  'ZZZZZZ..................................',
  'ZZZZZZ..................................',
  'ZZZZZZ..................uu..............',
  'ZZZZZZ..................gg..............',
  'ZZZZZZ..................gg..............',
  'JJJJJJ...............___gg..............',
  '&&&&&&..................gg..............',
  '&&&&&&..................gg..............',
  '&&&&&&.............___..gg........uuu...',
  '&&&&&&..................gg..............',
  '&&&&&&.........uuu....,,gg,,..C..j......',
  '&&&&&&....../AAAAAAAAAAAAAAAAAAAAAAAAAAA',
  '&&&&&&...../&ZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '&&&&&&..../&&ZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '&&&&&&.../&&&ZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  '&&&&&&../&&uuZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// 4. The street and Kulturhuset's glass front: in through the door, up
// its floors to a crate with an extra life on the top one, the chess
// players on the ground floor, a tagger upstairs; an extra life over
// the street before it; a stash in a cellar under the street, through
// secret asphalt; a brat by the door out.
const kulturhuset = [
  '................................................................',
  '................gggggggggggggggggggggggggggggggg................',
  '................g;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;g................',
  '................g;;;;;;;;;uuu;;;;;;;;;;;uuu;;;;g................',
  '................g;;;---------------------------g................',
  '................g;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;g................',
  '................g;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;g................',
  '....ü...........g;;;;;uuu;;;;;m;;;;;uu;;;;;;;;;g................',
  '....?...........g---------------------------;;;g................',
  '................;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;........uuu.....',
  '................;;uu;;;;;;;;;;;;;;;;;;;;;;;;;;;;................',
  '.......uu...i...;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;....l...........',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA[AAAAAAAA',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ[ZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ;;;;;;;;ZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ;;;p;u;;ZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// 5. Down the escalator to Plattan, the sunken square: a dark corner
// under it, then a club with its bouncer at the door (and samples and a
// party inside), or over its roof by the plank.
const down = [
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
  '.............................uuuu.......',
  '.uuu......................BBBBBBBBBBBB..',
  'AAAAAAAAAAz...............B;;;;;;;;;;B..',
  'ZZZZZZZZZZ&z..............B;;;;;;;;;;B..',
  'ZZZZZZZZZZ&&z........___..;;;;;uuu;;;;..',
  'ZZZZZZZZZZ&&&z............;;;;;;;;;;;;..',
  'ZZZZZZZZZZu&&&z...i......<;;;P;;;;p;;;..',
  'ZZZZZZZZZZ******************************',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// 6. Plattan: the black and white triangles, the scene the city wants
// gone: dealers who flee, a stoner, party people, an inspector, a crate
// with a heart, and the last phone booth before the arena.
const plattan = [
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
  '........................ç...............................',
  '........................?...............................',
  '..........................................uuuu..........',
  '....uuu.....uu.....................................uu...',
  '..................................uuu...................',
  '..C.....D.........S...i.....P.P.........D.....j.........',
  '********************************************************',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// 7. The arena on Plattan itself: two planks to come down from, the
// commissioner for social affairs, and the gate.
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
  '********************************',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

export const sergel = {
  id: 'sergel',
  name: 'Sergel',
  place: 'Sergels torg',
  time: 260,
  music: 'sergel',
  backdrop: 'city',
  night: true,
  rows: joinSections(platform, passage, escalator, kulturhuset, down, plattan, arena, finish(20)),
  signs: [
    'T-CENTRALEN. RAVEKOMMISSIONEN PATRULLERAR. PLANKA INTE.',
    'KULTURHUSET. SCHACK PÅ BOTTENVÅNINGEN. DAMEN ÄR MISSTÄNKT.',
    'KLUBB. ENDAST MEDLEMMAR. RAVEKOMMISSIONEN ÄR INTE MEDLEM.',
    'PLATTAN SKA SANERAS. PROBLEMET FLYTTAR TILL NÄSTA TORG.',
  ],
  cast: [
    { type: 'streetLamp', col: 124, row: 11 },
    { type: 'chessPlayer', col: 150, row: 11 },
    { type: 'chessPlayer', col: 156, row: 11 },
    { type: 'chessPlayer', col: 162, row: 11 },
    { type: 'streetLamp', col: 188, row: 11 },
    { type: 'pigeon', col: 246, row: 16 },
    { type: 'bench', col: 280, row: 16 },
    { type: 'socialCommissioner', col: 302, row: 16 },
    { type: 'streetLamp', col: 328, row: 16 },
    { type: 'policeVan', col: 340, row: 16 },
  ],
};
