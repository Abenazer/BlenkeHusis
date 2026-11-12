// What Blenke can pick up and throw (props.js): three throws each, and what
// each does of its own, on its own and in a level (world.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import { STEP, TILE } from '../src/config.js';
import { createEnemy } from '../src/enemies.js';
import { beginStep } from '../src/input.js';
import { updateEnemy } from '../src/ai.js';
import {
  createProp, inBeam, isBlaring, isShining, isStandable, MEGAPHONE_SLOGANS, PROPS, releaseProp, stepEffect, THROW_SPEED, THROWS, wearProp,
} from '../src/props.js';
import { actionTarget, createWorld, stepWorld } from '../src/world.js';
import { createDriver, makeLevel } from './helpers.js';

const ROWS = ['..............................', '.@............................', '##############################'];

function worldWith(rows = ROWS, cast = []) {
  return createWorld({ id: 'props', name: 'Props', rows, cast });
}

function stepFor(world, seconds, driver = createDriver()) {
  const events = [];
  for (let i = 0; i < Math.round(seconds / STEP); i++) {
    beginStep(driver.input);
    events.push(...stepWorld(world, driver.input, STEP));
  }
  return events;
}

// Throws a prop lying in the world as Blenke would, from where it is.
function fling(prop, facing = 1) {
  releaseProp(prop, { thrown: true, facing });
}

// A prop of the type placed in the world at a column of the floor.
function place(world, type, col) {
  const prop = createProp(type, col, 1, TILE);
  world.props.push(prop);
  return prop;
}

test('every prop has a level character, a size, shards to break into and a line when it breaks', () => {
  for (const [type, prop] of Object.entries(PROPS)) {
    assert.equal(typeof prop.char, 'string', type);
    assert.ok(prop.width > 0 && prop.height > 0, type);
    assert.ok(prop.shards.length > 0, type);
    assert.match(prop.breaks, /^[A-ZÅÄÖ .,!]+$/, type);
  }
});

test('a heavy crate of folköl is thrown shorter and lower than a cone', () => {
  const cone = createProp('cone', 0, 0, TILE);
  const crate = createProp('beerCrate', 0, 0, TILE);
  releaseProp(cone, { thrown: true, facing: -1 });
  releaseProp(crate, { thrown: true, facing: -1 });
  assert.equal(cone.vx, -THROW_SPEED);
  assert.ok(Math.abs(crate.vx) < Math.abs(cone.vx));
  assert.equal(crate.facing, -1);
});

test('each throw that ends wears a prop, and the last breaks it at once unless it has something to do lying', () => {
  const cone = createProp('cone', 0, 0, TILE);
  for (let i = 1; i < THROWS; i++) {
    assert.equal(wearProp(cone), false);
    assert.equal(cone.wear, i);
  }
  assert.equal(wearProp(cone), true);
  assert.equal(cone.spent, true);
  const torch = createProp('torch', 0, 0, TILE);
  torch.wear = THROWS - 1;
  assert.equal(wearProp(torch), false, 'the torch shines out its last light first');
  assert.ok(torch.spent && torch.effectTime > 0);
});

test('a megaphone blares its slogans in turn while it lies, then falls silent, and breaks if spent', () => {
  const megaphone = createProp('megaphone', 0, 0, TILE);
  megaphone.wear = THROWS - 1;
  wearProp(megaphone);
  const { time, every } = PROPS.megaphone.lure;
  const blared = [];
  let breaks = false;
  for (let i = 0; i < Math.round(time / STEP) + 2; i++) {
    const result = stepEffect(megaphone, STEP);
    if (result.blared) blared.push(result.blared);
    breaks ||= result.breaks;
  }
  assert.deepEqual(blared, MEGAPHONE_SLOGANS.slice(0, Math.ceil(time / every)));
  assert.equal(isBlaring(megaphone), false);
  assert.equal(megaphone.saying, null);
  assert.equal(breaks, true);
});

test("a torch lying lit shines ahead the way it was thrown, widening, and not behind it", () => {
  const torch = createProp('torch', 2, 1, TILE);
  torch.facing = -1;
  wearProp(torch);
  assert.ok(isShining(torch));
  const y = torch.y + torch.h / 2;
  const x = torch.x + torch.w / 2;
  assert.ok(inBeam(torch, x - 40, y));
  assert.ok(inBeam(torch, x - 80, y - 30), 'it widens');
  assert.ok(!inBeam(torch, x - 10, y - 30), 'not so wide by the lens');
  assert.ok(!inBeam(torch, x + 20, y), 'behind it');
  assert.ok(!inBeam(torch, x - PROPS.torch.beam.length - 1, y), 'past its reach');
  torch.carried = true;
  assert.ok(!inBeam(torch, x - 40, y), 'carried, it is off');
});

test('a cone takes three throws, and the third breaks it, saying so', () => {
  const world = worldWith();
  const cone = place(world, 'cone', 3);
  for (let throws = 1; throws <= THROWS; throws++) {
    fling(cone);
    const events = stepFor(world, 1);
    if (throws < THROWS) {
      assert.equal(cone.wear, throws);
      assert.ok(!events.some((event) => event.type === 'broken'), `broke at throw ${throws}`);
      continue;
    }
    assert.deepEqual(events.filter((event) => event.type === 'broken').map((event) => event.prop), ['cone']);
    assert.ok(!world.props.includes(cone), 'the broken cone still lies there');
    assert.ok([world.messages.current, ...world.messages.waiting].some((message) => message?.text === PROPS.cone.breaks));
  }
});

test('a cone dropped (a hit makes him) does not wear', () => {
  const world = worldWith();
  const cone = place(world, 'cone', 3);
  releaseProp(cone, { thrown: false });
  stepFor(world, 0.5);
  assert.equal(cone.wear, 0);
});

test('Blenke stands on a crate of folköl lying still, and lifts one lying beside him', () => {
  const world = worldWith();
  const crate = place(world, 'beerCrate', 4);
  stepFor(world, 0.2);
  assert.ok(isStandable(crate));
  const { player } = world;
  player.x = crate.x + crate.w / 2 - player.w / 2;
  player.y = crate.y - player.h - 6;
  stepFor(world, 0.3);
  assert.equal(player.platform, crate, 'he fell through it');
  assert.equal(player.y + player.h, crate.y);
  player.x = crate.x - player.w;
  player.y = 2 * TILE - player.h;
  stepFor(world, 0.1);
  assert.equal(actionTarget(world)?.kind, 'lift');
});

test('a thermos splashes where its throw ends, striking every enemy near it at once', () => {
  const world = worldWith(ROWS, [{ type: 'stoner', col: 9 }, { type: 'stoner', col: 10 }, { type: 'stoner', col: 20 }]);
  const thermos = place(world, 'thermos', 5);
  fling(thermos);
  const events = stepFor(world, 1);
  assert.equal(events.filter((event) => event.type === 'spilled').length, 1);
  assert.equal(events.filter((event) => event.type === 'struck').length, 2);
  const standing = world.enemies.filter((enemy) => !enemy.defeated);
  assert.equal(standing.length, 1);
  assert.ok(standing[0].x > 15 * TILE, 'the one far off was struck');
  assert.equal(thermos.wear, 1);
});

test('a torch thrown lies shining, and shows what is hidden in its light', () => {
  const rows = ['..............................', '.@......................h.....', '##############################'];
  const world = worldWith(rows);
  const hidden = world.items.find((item) => !item.revealed);
  assert.ok(hidden, 'the test level has no hidden item');
  const torch = place(world, 'torch', 14);
  fling(torch);
  const events = stepFor(world, 1);
  assert.ok(events.some((event) => event.type === 'lit'));
  assert.ok(isShining(torch));
  assert.equal(hidden.revealed, true, 'the light missed it');
  stepFor(world, PROPS.torch.beam.time);
  assert.ok(!isShining(torch), 'it shines for ever');
});

test('a megaphone lying blaring draws enemies near it to stand by it, but not a boss', () => {
  const level = makeLevel(ROWS);
  const megaphone = createProp('megaphone', 10, 1, TILE);
  const lure = { x: megaphone.x + megaphone.w / 2, y: megaphone.y + megaphone.h, range: PROPS.megaphone.lure.range };
  const dealer = createEnemy('dealer', 15, 1, TILE);
  const boss = createEnemy('prosecutor', 14, 1, TILE);
  const far = createEnemy('stoner', 28, 1, TILE);
  const player = { x: 400, y: 0, w: 10, h: 22 };
  for (let i = 0; i < Math.round(4 / STEP); i++) {
    for (const enemy of [dealer, boss, far]) updateEnemy(enemy, { level, player, lures: [lure] }, STEP);
  }
  assert.ok(Math.abs(dealer.x + dealer.w / 2 - lure.x) <= 12, `the dealer stands at ${dealer.x}`);
  assert.equal(dealer.vx, 0, 'he keeps walking');
  assert.ok(boss.x > 13 * TILE, 'the boss came to listen');
  assert.ok(far.x > 25 * TILE, 'one out of reach came');
});

test('a megaphone thrown in a level blares, and an enemy near it comes to it', () => {
  const world = worldWith(ROWS, [{ type: 'stoner', col: 14 }]);
  const megaphone = place(world, 'megaphone', 5);
  fling(megaphone);
  const events = stepFor(world, 3);
  assert.ok(events.some((event) => event.type === 'blare'));
  const stoner = world.enemies[0];
  assert.ok(stoner.x + stoner.w / 2 - (megaphone.x + megaphone.w / 2) < 3 * TILE, `the stoner stays at ${stoner.x}`);
});

test("a spent prop can't be picked up again", () => {
  const world = worldWith();
  const torch = place(world, 'torch', 2);
  torch.wear = THROWS - 1;
  fling(torch);
  stepFor(world, 1);
  assert.ok(torch.spent && world.props.includes(torch), 'it should still lie shining');
  const { player } = world;
  player.x = torch.x - player.w;
  stepFor(world, 0.1);
  assert.notEqual(actionTarget(world)?.kind, 'lift');
});
