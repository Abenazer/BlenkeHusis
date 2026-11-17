// World 2's night people: the ticket inspector, the Stureplan brat and the
// bouncer, how each behaves on its own (ai.js) and what touching one does
// in a level (world.js). The tagger is in tests/ai.test.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { updateEnemy } from '../src/ai.js';
import { PLAYER, STEP, TILE } from '../src/config.js';
import { createEnemy, ENEMIES } from '../src/enemies.js';
import { beginStep, createInput } from '../src/input.js';
import { parseLevel } from '../src/level.js';
import { createPlayer } from '../src/player.js';
import { levelTotals } from '../src/report.js';
import { createWorld, stepWorld } from '../src/world.js';
import { createDriver, makeLevel } from './helpers.js';

const floor = makeLevel([
  '..............................',
  '.@............................',
  '##############################',
]);

function run(enemy, seconds, at) {
  const player = createPlayer((at + 0.5) * TILE, 2 * TILE);
  const events = [];
  for (let i = 0; i < Math.round(seconds / STEP); i++) events.push(...updateEnemy(enemy, { level: floor, player }, STEP));
  return events;
}

// Blenke at column 1, the one cast at `col`.
function worldWith(type, col, rows = ['..............................', '.@............................', '##############################']) {
  return createWorld({ id: 'night', name: 'Night', rows, cast: [{ type, col }] });
}

function walkInto(world, seconds) {
  const driver = createDriver();
  driver.press('right');
  const events = [];
  for (let i = 0; i < Math.round(seconds / STEP); i++) {
    beginStep(driver.input);
    events.push(...stepWorld(world, driver.input, STEP));
    if (events.some((event) => event.type === 'fined' || event.type === 'shoved' || event.type === 'hurt')) break;
  }
  return events;
}

test('the ticket inspector walks, and with Blenke close stops and holds his card out', () => {
  const inspector = createEnemy('ticketInspector', 10, 1, TILE);
  run(inspector, 1, 25);
  assert.notEqual(inspector.x, 10 * TILE + (TILE - inspector.w) / 2, 'he walks');
  const checking = createEnemy('ticketInspector', 10, 1, TILE);
  run(checking, 0.5, 12);
  assert.equal(checking.vx, 0, 'he stops');
  assert.ok(checking.acting > 0, 'the card is out');
  assert.equal(checking.facing, 1, 'towards Blenke');
});

test('touching the ticket inspector costs a fine, not a heart, and holds Blenke a moment', () => {
  const world = worldWith('ticketInspector', 4);
  world.score.points = 1000;
  const events = walkInto(world, 3);
  const fined = events.find((event) => event.type === 'fined');
  assert.ok(fined, 'he was fined');
  assert.equal(world.score.points, 1000 - ENEMIES.ticketInspector.fine);
  assert.equal(world.player.health, 3);
  assert.ok(!events.some((event) => event.type === 'hurt'));
  assert.ok(world.player.hurt > 0, 'held');
  const said = [world.messages.current, ...world.messages.waiting].map((message) => message?.text);
  assert.ok(said.some((text) => /^BOT: 1200 KRONOR/.test(text)), said.join(' / '));
  // Not fined again while he still stands there.
  const again = walkInto(world, 0.5);
  assert.ok(!again.some((event) => event.type === 'fined'));
});

test('a fine never takes the score below nothing', () => {
  const world = worldWith('ticketInspector', 4);
  world.score.points = 30;
  walkInto(world, 3);
  assert.equal(world.score.points, 0);
});

test('the brat lobs his cork at Blenke, and stomped has nothing on him', () => {
  const brat = createEnemy('brat', 10, 1, TILE);
  const [thrown] = run(brat, ENEMIES.brat.throwEvery + 0.1, 4).filter((event) => event.type === 'throw');
  assert.equal(thrown.projectile.type, 'cork');
  assert.ok(thrown.projectile.vy < 0, 'it goes up first');
  assert.equal(ENEMIES.brat.carries, null);
});

test('the bouncer stands his ground, facing Blenke, an arm out when he comes close', () => {
  const bouncer = createEnemy('bouncer', 10, 1, TILE);
  const x = bouncer.x;
  run(bouncer, 1, 2);
  assert.equal(bouncer.x, x, 'he never moves');
  assert.equal(bouncer.facing, -1);
  assert.ok(!(bouncer.acting > 0), 'far off he only folds his arms');
  run(bouncer, 0.2, 8);
  assert.ok(bouncer.acting > 0, 'the arm goes out');
});

test('the bouncer shoves Blenke back unhurt, from the side and from above, and is never beaten', () => {
  const side = worldWith('bouncer', 4);
  const events = walkInto(side, 3);
  assert.ok(events.some((event) => event.type === 'shoved'));
  assert.equal(side.player.health, 3);
  assert.ok(side.player.vx < 0, 'thrown back');
  assert.equal(side.player.invulnerable, 0, 'no blinking: he was not hit');

  const above = createWorld({ id: 'drop', name: 'Drop', rows: ['.@......', '........', '........', '........', '########'], cast: [{ type: 'bouncer', col: 1 }] });
  const input = createInput();
  let shoved = false;
  for (let i = 0; i < 90 && !shoved; i++) shoved = stepWorld(above, input, STEP).some((event) => event.type === 'shoved');
  assert.ok(shoved, 'landing on him shoves too');
  assert.ok(!above.enemies[0].defeated);
  assert.equal(above.player.health, 3);
});

test('Blenke can jump the bouncer', () => {
  // The height of a full jump, less a margin, against his.
  const rise = (PLAYER.jumpSpeed ** 2) / (2 * PLAYER.gravity);
  assert.ok(rise - 16 > ENEMIES.bouncer.height, `${rise} px`);
});

test('the bouncer is no one to beat, so the report counts him out', () => {
  const definition = { id: 'night', name: 'Night', rows: ['.@...', '#####'], cast: [{ type: 'bouncer', col: 3 }, { type: 'brat', col: 4 }] };
  const totals = levelTotals(parseLevel(definition));
  assert.equal(totals.enemies, 1);
});
