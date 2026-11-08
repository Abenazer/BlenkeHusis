// Prints a level's numbers, for balancing it: what there is to find and
// what it is worth, how far its points go up the ranks, the clock against
// the time a straight run takes, the time bonus, the boss, and where the
// checkpoints stand against the places a life can be lost.
//
//   node tools/balance.js            every level of the game
//   node tools/balance.js testbana   one level, by id
//
// Points are without the combo or the budget increase, which only add.
import { PLAYER, TILE } from '../src/config.js';
import { ENEMIES } from '../src/enemies.js';
import { ITEMS } from '../src/items.js';
import { findLevel, LEVELS } from '../src/levels/index.js';
import { isSolid, parseLevel, tileAt, tileName } from '../src/level.js';
import { levelTotals, REPORT_ROWS, timeBonus } from '../src/report.js';
import { HELP_POINTS, RANKS } from '../src/score.js';

function findsOf(level) {
  const finds = [];
  for (const marker of level.markers) {
    if (marker.type === 'item') finds.push({ type: marker.item, where: 'lying' });
    if (marker.type === 'enemy') {
      const enemy = ENEMIES[marker.enemy];
      for (let i = 0; i < (enemy.carries ? enemy.drops ?? 1 : 0); i++) finds.push({ type: enemy.carries, where: 'carried' });
    }
  }
  for (const crate of level.crates) finds.push({ type: crate.contents, where: 'crate' });
  return finds;
}

// Where a life can be lost: the hazards that drown or hurt, and columns
// with nothing to stand on all the way down (a canal is water, not a pit).
// Neighbouring columns of the same danger make one stretch.
function dangers(level) {
  const found = [];
  const open = new Map();
  for (let col = 0; col < level.width; col++) {
    const names = new Set();
    let floor = false;
    for (let row = 0; row < level.height; row++) {
      const char = tileAt(level, col, row);
      if (isSolid(char)) floor = true;
      const name = tileName(char);
      if (['water', 'slime', 'syringes', 'pipe'].includes(name)) names.add(name);
    }
    if (!floor && !names.has('water') && !names.has('slime')) names.add('pit');
    for (const name of names) {
      const stretch = open.get(name);
      if (stretch && stretch.to === col - 1) {
        stretch.to = col;
        continue;
      }
      const started = { name, from: col, to: col };
      open.set(name, started);
      found.push(started);
    }
  }
  return found;
}

function pad(text, width) {
  return String(text).padEnd(width);
}

function report(definition) {
  const level = parseLevel(definition);
  const lines = [`${definition.title ?? definition.name} (${definition.id}): ${level.width}×${level.height} tiles`];

  const finds = findsOf(level);
  const points = {};
  let samples = 0;
  for (const { type } of finds) {
    const { category, points: worth, samples: count = 0 } = ITEMS[type];
    points[category] = (points[category] ?? 0) + worth;
    samples += count;
  }
  const enemies = level.markers.filter((marker) => marker.type === 'enemy').map((marker) => ENEMIES[marker.enemy]);
  points.enemies = enemies.reduce((sum, enemy) => sum + enemy.points, 0);
  points.citizens = level.markers.filter((marker) => marker.type === 'citizen').length * HELP_POINTS;
  const totals = levelTotals(level);
  lines.push('', 'To find (count, points):');
  for (const { key, label } of REPORT_ROWS) lines.push(`  ${pad(label, 28)} ${pad(totals[key], 4)} ${points[key] ?? ''}`);
  for (const key of ['bonus', 'powerUp']) lines.push(`  ${pad(key, 28)} ${pad(totals[key], 4)} ${points[key] ?? 0}`);
  const sum = Object.values(points).reduce((total, value) => total + value, 0);
  lines.push(`  ${pad('All points', 28)}      ${sum}`);
  const where = (kind) => finds.filter((find) => find.where === kind).length;
  lines.push(`  Lying about ${where('lying')}, in crates ${where('crate')}, carried by enemies ${where('carried')}`);

  lines.push('', `Samples: ${samples} in all.`);
  lines.push('', `Ranks by the finds' points alone (${sum}, before any bonus):`);
  for (const rank of RANKS.slice(1)) lines.push(`  ${pad(rank.title, 20)} at ${pad(rank.points, 6)} ${sum >= rank.points ? 'reached' : `${rank.points - sum} short`}`);

  const runTime = (level.width * TILE) / PLAYER.runSpeed;
  const walkTime = (level.width * TILE) / PLAYER.walkSpeed;
  lines.push('', `Clock: ${definition.time} s. Straight across at a run ${runTime.toFixed(0)} s, at a walk ${walkTime.toFixed(0)} s.`);
  lines.push(`  Time bonus at the goal with ${[0.75, 0.5, 0.25].map((share) => `${Math.round(definition.time * share)} s left ${timeBonus(definition.time * share)}`).join(', ')}.`);

  for (const enemy of enemies.filter((candidate) => candidate.boss)) lines.push('', `Boss: ${enemy.health} hits, ${enemy.points} points.`);

  const start = level.start.col;
  const checkpoints = level.markers.filter((marker) => marker.type === 'checkpoint').map((marker) => marker.col).sort((a, b) => a - b);
  const goal = level.markers.find((marker) => marker.type === 'goal');
  const end = goal ? { name: 'goal', col: goal.col } : { name: 'the end (no goal)', col: level.width };
  const posts = [{ name: 'start', col: start }, ...checkpoints.map((col, i) => ({ name: `checkpoint ${i + 1}`, col })), end];
  lines.push('', 'From post to post (tiles), and the dangers between:');
  const found = dangers(level);
  for (let i = 0; i < posts.length - 1; i++) {
    const [from, to] = [posts[i], posts[i + 1]];
    const between = found.filter((danger) => danger.from >= from.col && danger.from < to.col);
    const list = between.map((danger) => `${danger.name} ${danger.from}${danger.to > danger.from ? `–${danger.to}` : ''}`).join(', ');
    lines.push(`  ${pad(`${from.name} → ${to.name}`, 30)} ${pad(to.col - from.col, 4)} ${list || 'none'}`);
  }
  return lines.join('\n');
}

const id = process.argv[2];
const levels = id ? [findLevel(id)] : LEVELS;
if (!levels[0]) {
  console.error(`No level with the id '${id}'`);
  process.exit(1);
}
console.log(levels.map(report).join('\n\n'));
