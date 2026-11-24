// The worlds and their levels in playing order, and the try-out levels
// (the engine's test level, the characters', and Förorten, the first level
// generated), which can be played by their id (main.js takes
// ?bana=<id>) but are no part of the game.
//
// To change the order, change WORLD_ORDER: nothing in a level's own file
// says where it is played. World 1 follows the commuter train in from the
// south, and each level's number ("BANA 2") is counted here from its place
// in its world; every level ends with the same finish (finish.js), so any
// of them can come last.
import { RELEASED } from '../build.js';
import { figurer } from './figurer.js';
import { finnboda } from './finnboda.js';
import { forort1 } from './forort1.js';
import { gamlastan } from './gamlastan.js';
import { handen } from './handen.js';
import { jordbro } from './jordbro.js';
import { krigslida } from './krigslida.js';
import { medborgarplatsen } from './medborgarplatsen.js';
import { sergel } from './sergel.js';
import { slussen } from './slussen.js';
import { stureplan } from './stureplan.js';
import { skogas } from './skogas.js';
import { testbana } from './testbana.js';
import { trangsund } from './trangsund.js';
import { tungelsta } from './tungelsta.js';
import { vasterhaninge } from './vasterhaninge.js';
import { villastad } from './villastad.js';

// The worlds in the order they are played, each its levels in playing
// order: Södertörn along the commuter line in from the south, and the
// city at night. A world still being built is a `preview`: played on
// localhost and in the image built from main, left out of a release
// (src/build.js).
const WORLD_ORDER = [
  {
    id: 'sodertorn',
    name: 'SÖDERTÖRN',
    tagline: 'PENDELTÅGET IN FRÅN SÖDER, 1969 TILL 1985.',
    report: { heading: 'POLISENS ÅRSRAPPORT', closing: 'ÅRETS POLIS: BLENKE HUSIS. ANSLAGEN FÖRDUBBLAS.' },
    vehicle: 'policeCar',
    levels: [tungelsta, krigslida, vasterhaninge, jordbro, handen, skogas, trangsund, villastad],
  },
  {
    id: 'nattstan',
    name: 'NATTSTAN',
    tagline: 'STOCKHOLM EFTER MÖRKRET. SENT 1990-TAL.',
    report: { heading: 'RAVEKOMMISSIONENS ÅRSRAPPORT 1997', closing: 'ENHETEN GÖRS PERMANENT.' },
    vehicle: 'policeVan',
    preview: true,
    levels: [gamlastan, slussen, medborgarplatsen, sergel, stureplan, finnboda],
  },
];
const TRY_ORDER = [testbana, figurer, forort1];

// A level with its title, shown as it starts and heading its report: its
// number in its world's playing order, then the place (its name unless it
// gives a longer one); and the world it is played in.
function numbered(levels, world) {
  return levels.map((level, index) => ({
    ...level,
    world,
    title: `BANA ${index + 1}: ${(level.place ?? level.name).toUpperCase()}`,
  }));
}

// The worlds a copy plays: all of them, or in a release those done. Each
// { id, number, name, tagline, report, vehicle, levels }, its levels
// numbered in it; its card shows the number, the name and the tagline,
// its year's report the report's heading and closing line, and the
// finish of each of its levels parks its police vehicle.
export function worldsFor(released) {
  return WORLD_ORDER
    .filter((world) => !(released && world.preview))
    .map((world, index) => ({ ...world, number: index + 1, levels: numbered(world.levels, world.id) }));
}
export const WORLDS = worldsFor(RELEASED);
// Every level of the game, world after world.
export const LEVELS = WORLDS.flatMap((world) => world.levels);
export const TRY_LEVELS = TRY_ORDER;
export const TEST_LEVEL = TRY_LEVELS[0];

// The level with this id, the try-out levels included, or null.
export function findLevel(id) {
  return [...LEVELS, ...TRY_LEVELS].find((level) => level.id === id) ?? null;
}

// The world with this id, or null.
export function findWorld(id) {
  return WORLDS.find((world) => world.id === id) ?? null;
}

// The level after this one in its world, or null after a world's last
// (the game is then over) and after a try-out level.
export function nextLevel(definition) {
  const world = findWorld(definition.world);
  if (!world) return null;
  const index = world.levels.indexOf(definition);
  if (index === -1) return null;
  return world.levels[index + 1] ?? null;
}
