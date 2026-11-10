// Prints a level's numbers (tools/levelstats.js), for balancing it.
//
//   node tools/balance.js            every level of the game
//   node tools/balance.js testbana   one level, by id
import { findLevel, LEVELS } from '../src/levels/index.js';
import { levelReport } from './levelstats.js';

const id = process.argv[2];
const levels = id ? [findLevel(id)] : LEVELS;
if (!levels[0]) {
  console.error(`No level with the id '${id}'`);
  process.exit(1);
}
console.log(levels.map(levelReport).join('\n\n'));
