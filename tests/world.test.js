import test from 'node:test';
import assert from 'node:assert/strict';
import { STEP, TILE } from '../src/config.js';
import { beginStep, createInput } from '../src/input.js';
import { ITEMS } from '../src/items.js';
import { START_HEALTH, START_LIVES } from '../src/config.js';
import { ENEMIES } from '../src/enemies.js';
import {
  createWorld,
  DEFEAT_LINE,
  DOWN_TIME,
  GAME_OVER_LINE,
  GAME_OVER_TIME,
  isGameOverDone,
  LOSS_LINES,
  POPUP_TIME,
  QUIET_LINE,
  QUIET_TIME,
  REVEAL_DISTANCE,
  stepWorld,
} from '../src/world.js';
import { createDriver } from './helpers.js';

const definition = {
  id: 'pit',
  name: 'Pit',
  rows: [
    '..........',
    '..........',
    '.@........',
    '###...####',
  ],
};

test('Blenke starts standing on the start tile', () => {
  const world = createWorld(definition);
  const input = createInput();
  stepWorld(world, input, STEP);
  assert.equal(world.player.onGround, true);
  assert.equal(world.player.y + world.player.h, 3 * TILE);
});

function stepUntil(world, input, type, steps = 600) {
  for (let i = 0; i < steps; i++) {
    const event = stepWorld(world, input, STEP).find((candidate) => candidate.type === type);
    if (event) return event;
  }
  return null;
}

function stepFor(world, input, seconds) {
  const events = [];
  for (let i = 0; i < Math.ceil(seconds / STEP); i++) events.push(...stepWorld(world, input, STEP));
  return events;
}

test('falling out of the level costs a life and, after a pause, puts Blenke back at the start', () => {
  const world = createWorld(definition);
  const input = createInput();
  world.player.x = 4 * TILE;
  const lost = stepUntil(world, input, 'lifeLost');
  assert.deepEqual(lost, { type: 'lifeLost', cause: 'pit', lives: START_LIVES - 1 });
  assert.equal(world.messages.current.text, LOSS_LINES.pit);
  stepFor(world, input, DOWN_TIME);
  assert.equal(world.player.x, 1.5 * TILE - world.player.w / 2);
  assert.ok(world.player.invulnerable > 0, 'he gets a moment to move');
});

// Blenke stands at column 1; whatever is at column 2 is in his way.
function worldWith(row, extra = {}) {
  return createWorld({ id: 'items', name: 'Items', rows: ['......', row, '######'], ...extra });
}

function walkRight(world, steps) {
  const driver = createDriver();
  driver.press('right');
  const events = [];
  for (let i = 0; i < steps; i++) {
    beginStep(driver.input);
    events.push(...stepWorld(world, driver.input, STEP));
  }
  return events;
}

test('walking into an item picks it up, scores it and floats its points', () => {
  const world = worldWith('.@u...');
  const events = walkRight(world, 30);
  const collected = events.filter((event) => event.type === 'collected');
  assert.deepEqual(collected, [{ type: 'collected', item: 'sampleCup', points: ITEMS.sampleCup.points }]);
  assert.equal(world.items[0].collected, true);
  assert.equal(world.score.samples, 1);
  assert.equal(world.popups[0].text, `+${ITEMS.sampleCup.points}`);
});

test('an item is only picked up once, and its points float away', () => {
  const world = worldWith('.@u...');
  walkRight(world, 30);
  const later = walkRight(world, Math.ceil(POPUP_TIME / STEP));
  assert.equal(later.filter((event) => event.type === 'collected').length, 0);
  assert.equal(world.popups.length, 0);
});

test('an item with a line says it after the level name', () => {
  const world = worldWith('.@b...');
  walkRight(world, 30);
  assert.deepEqual(world.messages.waiting.map((message) => message.text), [ITEMS.bag.messages[0]]);
  assert.equal(world.messages.current.text, 'Items');
});

test('a hidden item shows only once Blenke comes close, before he takes it', () => {
  const world = createWorld({ id: 'hidden', name: 'Hidden', rows: ['..........', '.@.......h', '##########'] });
  const [canister] = world.items;
  for (let i = 0; i < 120 && !canister.revealed; i++) walkRight(world, 1);
  assert.equal(canister.revealed, true);
  assert.equal(canister.collected, false);
  const gap = canister.x + canister.w / 2 - (world.player.x + world.player.w / 2);
  assert.ok(gap <= REVEAL_DISTANCE && gap > REVEAL_DISTANCE - 4, `revealed ${gap} away`);
  walkRight(world, 60);
  assert.equal(canister.collected, true);
});

test('running out of time costs a life, and the clock starts again', () => {
  const world = worldWith('.@....', { time: 1 });
  const input = createInput();
  const lost = stepUntil(world, input, 'lifeLost', 90);
  assert.equal(lost.cause, 'time');
  assert.equal(world.timeLeft, 0);
  stepFor(world, input, DOWN_TIME);
  assert.ok(world.timeLeft > 0.9);
});

test('a long time without a pickup earns a nudge', () => {
  const world = worldWith('.@....');
  const input = createInput();
  for (let i = 0; i < Math.ceil(QUIET_TIME / STEP) + 1; i++) stepWorld(world, input, STEP);
  assert.equal(world.messages.current.text, QUIET_LINE);
});

// Blenke drops onto whatever stands under him.
function dropOnto(row, extra = {}) {
  const world = createWorld({ id: 'drop', name: 'Drop', rows: ['.@......', '........', '........', row, '########'], ...extra });
  return world;
}

test('landing on an enemy defeats it, bounces Blenke and scores less than minor possession', () => {
  const world = dropOnto('.Y......');
  const input = createInput();
  const stomp = stepUntil(world, input, 'stomp', 120);
  assert.equal(stomp.enemy, 'bureaucrat');
  assert.ok(stomp.points < ITEMS.possession.points);
  assert.ok(world.player.vy < 0, 'he bounces');
  assert.equal(world.player.health, START_HEALTH);
  assert.equal(world.score.defeated, 1);
  assert.ok(world.messages.waiting.some((message) => message.text === DEFEAT_LINE));
  stepFor(world, input, 1);
  assert.equal(world.enemies.length, 0, 'it is gone after lying flat');
});

test('a defeated enemy drops what it carries', () => {
  const world = dropOnto('.L......');
  const input = createInput();
  assert.ok(stepUntil(world, input, 'stomp', 120), 'no stomp');
  const dropped = world.items.find((item) => item.type === ENEMIES.technician.carries);
  assert.ok(dropped, 'nothing dropped');
  stepFor(world, input, 1.5);
  assert.ok(dropped.collected || !dropped.falling, 'it lands, or Blenke catches it');
});

test('walking into an enemy hurts Blenke and knocks him back; then he is safe a while', () => {
  const world = worldWith('.@.P..');
  world.enemies[0].type = 'bureaucrat';
  const events = walkRight(world, 30);
  const hurt = events.filter((event) => event.type === 'hurt');
  assert.equal(hurt.length, 1);
  assert.equal(world.player.health, START_HEALTH - 1);
  assert.ok(world.player.invulnerable > 0);
});

test('the stoner harms no one', () => {
  const world = worldWith('.@S...');
  const events = walkRight(world, 60);
  assert.ok(!events.some((event) => event.type === 'hurt'));
});

test('the last hit costs a life, and the last life ends the game, which then starts over', () => {
  const world = worldWith('.@....');
  world.lives = 1;
  world.player.health = 1;
  world.projectiles.push({ type: 'tube', x: world.player.x, y: world.player.y, px: 0, py: 0, w: 4, h: 8, vx: 0, vy: 0, age: 0 });
  const input = createInput();
  const events = stepFor(world, input, STEP);
  assert.ok(events.some((event) => event.type === 'lifeLost' && event.cause === 'hurt'));
  assert.ok(events.some((event) => event.type === 'gameOver'));
  assert.equal(world.messages.current.text, GAME_OVER_LINE);
  assert.equal(isGameOverDone(world), false);
  stepFor(world, input, GAME_OVER_TIME + STEP);
  assert.equal(isGameOverDone(world), true);
});

test('deep water drowns, and slime hurts', () => {
  const water = createWorld({ id: 'w', name: 'W', rows: ['.@....', '##~~##', '######'] });
  const slime = createWorld({ id: 's', name: 'S', rows: ['.@....', '##%%##', '######'] });
  assert.equal(stepUntil(water, walkingInput(), 'lifeLost', 120)?.cause, 'water');
  assert.equal(stepUntil(slime, walkingInput(), 'hurt', 120)?.health, START_HEALTH - 1);
});

function walkingInput() {
  const driver = createDriver();
  driver.press('right');
  beginStep(driver.input);
  return driver.input;
}

test('a moving platform carries Blenke along', () => {
  const world = createWorld({ id: 'p', name: 'P', rows: ['........', '.@......', '.HH.....', '........', '........'] });
  const input = createInput();
  stepFor(world, input, 0.2);
  assert.ok(world.player.platform, 'he stands on it');
  const before = world.player.x;
  stepFor(world, input, 1);
  assert.ok(world.player.x - before > TILE, 'he went along');
  assert.equal(world.player.y + world.player.h, world.platforms[0].y);
});

test('enemies throw at Blenke, and a hit by what they throw hurts', () => {
  const world = worldWith('.@...Y');
  const input = createInput();
  const thrown = stepUntil(world, input, 'throw', 300);
  assert.equal(thrown.projectile.type, 'paper');
  assert.ok(stepUntil(world, input, 'hurt', 300), 'the paperwork never hit him');
});

test('party people next to each other wear different colours', () => {
  const world = worldWith('.@PPP.');
  assert.deepEqual(world.enemies.map((enemy) => enemy.variant), [0, 1, 2]);
});
