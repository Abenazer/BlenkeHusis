// The subcultures, the enemies from the hippie on: how each behaves on its
// own (ai.js) and in a level (world.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import { SAY_TIME, updateEnemy } from '../src/ai.js';
import { STEP, TILE } from '../src/config.js';
import { createEnemy, ENEMIES } from '../src/enemies.js';
import { beginStep, createInput } from '../src/input.js';
import { ITEMS } from '../src/items.js';
import { createPlayer } from '../src/player.js';
import { createWorld, signLine, stepWorld } from '../src/world.js';
import { createDriver, makeLevel } from './helpers.js';

// A long floor, Blenke's column given by `at`.
const floor = makeLevel([
  '..............................',
  '.@............................',
  '##############################',
]);

// Steps an enemy standing on `level` at `col`, Blenke at column `at` on the
// same floor; returns its events.
function run(enemy, level, seconds, at) {
  const player = createPlayer((at + 0.5) * TILE, 2 * TILE);
  const events = [];
  for (let i = 0; i < Math.round(seconds / STEP); i++) events.push(...updateEnemy(enemy, { level, player }, STEP));
  return events;
}

function enemyOn(type, col, row = 1) {
  return createEnemy(type, col, row, TILE);
}

// A level with Blenke at column 1 and the cast given.
function worldWith(cast, rows = ['..............................', '.@............................', '##############################']) {
  return createWorld({ id: 'subcultures', name: 'Subcultures', rows, cast });
}

function walk(world, steps, action = 'right') {
  const driver = createDriver();
  driver.press(action);
  const events = [];
  for (let i = 0; i < steps; i++) {
    beginStep(driver.input);
    events.push(...stepWorld(world, driver.input, STEP));
  }
  return events;
}

function stepFor(world, seconds, input = createInput()) {
  const events = [];
  for (let i = 0; i < Math.round(seconds / STEP); i++) events.push(...stepWorld(world, input, STEP));
  return events;
}

function said(world) {
  return [world.messages.current, ...world.messages.waiting].map((message) => message?.text);
}

// Blenke drops from above onto whatever stands at column 1.
function dropOnto(type) {
  return createWorld({
    id: 'drop',
    name: 'Drop',
    rows: ['.@......', '........', '........', '........', '########'],
    cast: [{ type, col: 1 }],
  });
}

function stepUntil(world, type, seconds = 3) {
  const input = createInput();
  for (let i = 0; i < Math.round(seconds / STEP); i++) {
    const event = stepWorld(world, input, STEP).find((candidate) => candidate.type === type);
    if (event) return event;
  }
  return null;
}

test('the hippie wanders, then sits down to strum, holding still while he plays', () => {
  const data = ENEMIES.hippie;
  const hippie = enemyOn('hippie', 10);
  const quiet = run(hippie, floor, data.sitEvery - 0.1, 25);
  assert.ok(!quiet.some((event) => event.type === 'strum'), 'he strums before he sits');
  assert.notEqual(hippie.x, enemyOn('hippie', 10).x, 'he wanders');
  const playing = run(hippie, floor, data.sitTime - 0.2, 25);
  const strums = playing.filter((event) => event.type === 'strum');
  assert.ok(strums.length >= Math.floor((data.sitTime - 0.3) / data.strumEvery), `${strums.length} strums`);
  const sitting = hippie.x;
  run(hippie, floor, 0.1, 25);
  assert.equal(hippie.x, sitting, 'he moved while playing');
  run(hippie, floor, 1, 25);
  assert.notEqual(hippie.x, sitting, 'he never got up');
});

test('the headbanger bangs on the spot until Blenke comes near, then dives at him and rests before the next', () => {
  const data = ENEMIES.headbanger;
  const headbanger = enemyOn('headbanger', 10);
  const start = headbanger.x;
  assert.ok(!run(headbanger, floor, data.diveRest + 0.5, 25).some((event) => event.type === 'dive'), 'he dived at no one');
  assert.equal(headbanger.x, start, 'he walked');
  const dives = run(headbanger, floor, STEP, 6).filter((event) => event.type === 'dive');
  assert.equal(dives.length, 1);
  assert.ok(headbanger.vx < 0 && headbanger.vy < 0, 'he dives up and towards Blenke');
  assert.ok(headbanger.acting > 0, 'he shows no dive');
  run(headbanger, floor, 1, 6);
  assert.ok(headbanger.onGround && headbanger.acting === 0, 'he never lands');
  assert.ok(headbanger.x < start - TILE * 2, `he dived ${start - headbanger.x} px`);
  assert.ok(!run(headbanger, floor, data.diveRest - 1.2, 6).some((event) => event.type === 'dive'), 'he dived again at once');
  assert.ok(run(headbanger, floor, 1.5, 6).some((event) => event.type === 'dive'), 'he never dived again');
});

test('an enemy with lines says the next as Blenke comes near, then waits a while', () => {
  const hippie = enemyOn('hippie', 10);
  run(hippie, floor, 0.5, 25);
  assert.equal(hippie.saying, null, 'he talks to no one');
  run(hippie, floor, STEP, 12);
  assert.equal(hippie.saying, ENEMIES.hippie.lines[0]);
  run(hippie, floor, SAY_TIME + 0.5, 12);
  assert.equal(hippie.saying, null, 'he goes on at once');
  run(hippie, floor, 4, 12);
  assert.equal(hippie.saying, ENEMIES.hippie.lines[1]);
});

test('near the hippie Blenke walks slower, and the hippie harms no one', () => {
  const alone = worldWith([]);
  walk(alone, 40);
  const mellow = worldWith([{ type: 'hippie', col: 4 }]);
  const events = walk(mellow, 40);
  assert.ok(mellow.player.x < alone.player.x - 8, `${mellow.player.x} against ${alone.player.x}`);
  assert.ok(Math.abs(mellow.player.vx) <= Math.abs(alone.player.vx) * ENEMIES.hippie.mellow.speed + 1);
  assert.ok(!events.some((event) => event.type === 'hurt'), 'he hurt Blenke');
});

test('a subculture put out of action gives away its sign and drops what it carries', () => {
  const world = dropOnto('hippie');
  const stomp = stepUntil(world, 'stomp');
  assert.equal(stomp?.enemy, 'hippie');
  assert.ok(said(world).includes(signLine(ENEMIES.hippie.sign)));
  assert.ok(world.items.some((item) => item.type === 'herbalTea'), 'no herbal tea');
  assert.equal(ITEMS.herbalTea.category, 'evidence');
});

test('every subculture has a sign, lines to say and something to drop', () => {
  for (const type of ['hippie', 'headbanger']) {
    const enemy = ENEMIES[type];
    assert.ok(enemy.sign, `${type} has no sign`);
    assert.ok(enemy.lines?.length > 0 && enemy.talkRange > 0, `${type} has nothing to say`);
    assert.ok(ITEMS[enemy.carries], `${type} carries nothing`);
    assert.equal(ITEMS[enemy.carries].char, null, `${type}'s ${enemy.carries} can be found lying about`);
  }
});
