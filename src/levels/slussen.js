// Slussen one night in 1997, world 2's first: Blenke, posted to the rave
// commission, starts by the lock between Mälaren and Saltsjön, crosses the
// cloverleaf of 1935 over or under its road deck, goes through the bus
// terminal in the rock and Saltsjöbanan's terminus, rides Katarinahissen
// up to its walkway (Gondolen hanging under it) and comes down from
// Mosebacke's heights to Södermalmstorg, where SL's chief inspector
// waits; then the finish every level ends with. Written in sections side
// by side (joinSections); the ground's top is row 17.
import { joinSections } from '../level.js';
import { finish } from './finish.js';

// The lock by Gamla stan, where the boats are lifted between Mälaren and
// Saltsjön: the cobbled quay, the lock's deep water crossed over its gates
// on the walkway, night walkers on the quay, a stoner and an inspector.
const lock = [
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
  '..................uuuuuu..............uuu.......',
  '................................................',
  '.........uuu....__________.uu.....uuu...........',
  '..................W....W........................',
  '..@..i............W....W......S...........j.....',
  '++++++++++++++++~~~~~~~~~~++++++++++++++++++++++',
  '++++++++++++++++~~~~~~~~~~++++++++++++++++++++++',
  '++++++++++++++++~~~~~~~~~~++++++++++++++++++++++',
];

// The cloverleaf of 1935: up the steps onto the road deck on its pillars,
// or under it in the dark, a tagger at work and a canister hidden; down
// again to the first phone booth and a dealer by the way on.
const cloverleaf = [
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
  '..............uuu.......uuuu............................',
  '..........uuu...........................................',
  '.................m......................................',
  '.......AAAAAAAAAAAAAAAAAAAAAAAAAA.......................',
  '......AA&&&&Z&&&&&&&&Z&&&&&&&&Z&AA......uuu.............',
  '.....AAA&&&&Z&&&&&&&&Z&&&&&&&&Z&AAA.....................',
  '..i.AAAA&&&&Z&&uu&m&&Z&&&h&&&&Z&AAAA..........C...P..D..',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
];

// The bus terminal in the rock under Södermalm: a hall lit for the night
// buses, its far bays dark but for a raver's glow sticks; people waiting,
// an inspector and a tagger.
const terminal = [
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;&&&&&&&&&&&&&&&&&&',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;&&&&&&&&&&&&&&&&&&',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;K;;;&&&&&&&&&&&&&&&&&&',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;?;;;&&&&&&&&&&&&&&&&&&',
  ';;;;;;;;;;;;;;uuu;;;;;;;;;;;;;&&&&&&&&&&&&&&&&&&',
  ';;;;uuu;;;;;;;;;;;;;;;;;;;;;;;&&&&&&&&&&&&&&uu&&',
  ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;&&&&&&&&&&&&&&&&&&',
  ';;;i;;;;P;P;;;;;;;;;j;;;;;;;;;&&&o&&&&uuum&&&&&&',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// Saltsjöbanan's terminus: the platform under its canopy (up onto it by
// a plank), the track into the dark, a crate with an extra life over the
// canopy, a phone booth.
const saltsjobanan = [
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
  '............ü...........................',
  '............?...........................',
  '........uu....................uuu.......',
  '........................................',
  '......----------------....----------....',
  '........................................',
  '..................................uuu...',
  '...___...........uu...uuu___............',
  '........................................',
  '..C............S................m.......',
  'ZZZZZZZZZZZZZZZZZZZZZZ&&&ZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZ&&&ZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZ&&&ZZZZZZZZZZZZZZZ',
];

// Katarinahissen: the lift ridden up its tower to the walkway, Gondolen
// hanging under it (in through secret asphalt), the street below with a
// night walker, and the walkway on to the heights.
const katarinahissen = [
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................uuu.................uuu.........',
  '................................................',
  '...........VVAAAAAAAAAAAAA[AAAAAAAAAAAAAAAAAAAAA',
  '..........ZVVZ......g;;;;;;;;;;;;g......ZZZZZZZZ',
  '..........ZVVZ......g;;;;;;;;;;;;;......ZZZZZZZZ',
  '..........ZVVZ......g;;uuu;;p;u;;;......ZZZZZZZZ',
  '..........ZVVZ......BBBBBBBBBBBBBB......ZZZZZZZZ',
  '..........ZVVZ..........................ZZZZZZZZ',
  '..........ZVVZ..........................ZZZZZZZZ',
  '..........ZVVZ..........................ZZZZZZZZ',
  '....uu.....VV.................uuu.......ZZZZZZZZ',
  '...........VV...........................ZZZZZZZZ',
  '..i........VV...........S...............ZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
];

// Mosebacke's heights: a crate with a heart, then down the steps of
// Katarinavägen to Södermalmstorg and the last phone booth.
const heights = [
  '........................................',
  '......ç.................................',
  '......?.................................',
  '........................................',
  '...uuu..................................',
  '........................................',
  '++++++++++++.u..........................',
  'ZZZZZZZZZZZZ............................',
  'ZZZZZZZZZZZZ++.u........................',
  'ZZZZZZZZZZZZZZ..........................',
  'ZZZZZZZZZZZZZZ++.u......................',
  'ZZZZZZZZZZZZZZZZ........................',
  'ZZZZZZZZZZZZZZZZ++.u....................',
  'ZZZZZZZZZZZZZZZZZZ.......uu.............',
  'ZZZZZZZZZZZZZZZZZZ++..............uuu...',
  'ZZZZZZZZZZZZZZZZZZZZ....................',
  'ZZZZZZZZZZZZZZZZZZZZ....l.....C.........',
  'ZZZZZZZZZZZZZZZZZZZZ++++++++++++++++++++',
  'ZZZZZZZZZZZZZZZZZZZZ++++++++++++++++++++',
  'ZZZZZZZZZZZZZZZZZZZZ++++++++++++++++++++',
];

// The arena on Södermalmstorg: two planks to come down from, SL's chief
// inspector, and the gate.
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
  '++++++++++++++++++++++++++++++++',
  '++++++++++++++++++++++++++++++++',
  '++++++++++++++++++++++++++++++++',
];

export const slussen = {
  id: 'slussen',
  name: 'Slussen',
  stationName: 'SLUSSEN',
  time: 250,
  music: 'slussen',
  backdrop: 'city',
  night: true,
  rows: joinSections(lock, cloverleaf, terminal, saltsjobanan, katarinahissen, heights, arena, finish(20)),
  signs: [
    'SLUSSEN. BÅTARNA SLUSSAS. PROVEN OCKSÅ.',
    'KLÖVERBLADET, 1935. BILARNA SNURRAR. ÄRENDENA OCKSÅ.',
    'BUSSTERMINALEN. NATTBUSSEN GÅR. MISSTANKEN STANNAR.',
    'KATARINAHISSEN. EN TUR UPP KOSTAR. ÄVEN FÖR POLISEN.',
  ],
  cast: [
    { type: 'nightWalker', col: 8, row: 16 },
    { type: 'streetLamp', col: 12, row: 16 },
    { type: 'gull', col: 28, row: 16 },
    { type: 'nightWalker', col: 36, row: 16 },
    { type: 'streetLamp', col: 44, row: 16 },
    { type: 'nightWalker', col: 90, row: 16 },
    { type: 'bench', col: 160, row: 16 },
    { type: 'stationSign', col: 180, row: 16 },
    { type: 'nightWalker', col: 198, row: 16 },
    { type: 'streetLamp', col: 266, row: 16 },
    { type: 'nightWalker', col: 276, row: 16 },
    { type: 'inspectorChief', col: 294, row: 16 },
    { type: 'streetLamp', col: 320, row: 16 },
    { type: 'policeCar', col: 332, row: 16 },
  ],
};
