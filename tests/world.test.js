import test from 'node:test';
import assert from 'node:assert/strict';
import { STEP, TILE } from '../src/config.js';
import { beginStep, createInput } from '../src/input.js';
import { ITEMS } from '../src/items.js';
import { BREMER_PUPIL_LINES, JORDBRO_CHILD_LINES, JUNIOR_LINES, PLEAS, SKOGAS_YOUTH_LINES } from '../src/citizens.js';
import { START_HEALTH, START_LIVES } from '../src/config.js';
import { ENEMIES } from '../src/enemies.js';
import { EMPTY, OPEN_CRATE, ROOM, tileAt } from '../src/level.js';
import { POWER_UPS, startPowerUp } from '../src/powerups.js';
import { HELP_POINTS, RANKS, SAMPLES_PER_LIFE } from '../src/score.js';
import { HIT_TIME } from '../src/ai.js';
import {
  actionTarget,
  bossLine,
  CHECKPOINT_LINE,
  COMPLETE_LINE,
  COMPLETE_TIME,
  createWorld,
  DEFEAT_LINE,
  DOWN_TIME,
  GAME_OVER_LINE,
  GAME_OVER_TIME,
  HELP_LINE,
  HURRY_TIME,
  isGameOverDone,
  isLevelDone,
  LOSS_LINES,
  POPUP_TIME,
  QUIET_LINE,
  QUIET_TIME,
  REVEAL_DISTANCE,
  SECRET_LINE,
  stepWorld,
  TEST_LINE,
  TICK_TIME,
} from '../src/world.js';
import { createDriver } from './helpers.js';
import { HOLD_TIME, HOSE_GAP } from '../src/station.js';

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

test('a run carries its score and lives into the next level, with the combo started over', () => {
  const first = createWorld(definition);
  first.score.points = 1234;
  first.score.chain = 3;
  first.score.comboTime = 1;
  first.lives = 2;
  const next = createWorld(definition, { score: first.score, lives: first.lives });
  assert.equal(next.score.points, 1234);
  assert.equal(next.score.chain, 0);
  assert.equal(next.score.comboTime, 0);
  assert.equal(next.lives, 2);
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
  assert.deepEqual(unplaced(lost), { type: 'lifeLost', cause: 'pit', lives: START_LIVES - 1 });
  assert.equal(world.messages.current.text, LOSS_LINES.pit);
  stepFor(world, input, DOWN_TIME);
  assert.equal(world.player.x, 1.5 * TILE - world.player.w / 2);
  assert.ok(world.player.invulnerable > 0, 'he gets a moment to move');
});

// An event without where it happened (which only the particles need).
function unplaced({ x, y, top, ...event }) {
  return event;
}

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
  assert.deepEqual(collected.map(unplaced), [{ type: 'collected', item: 'sampleCup', points: ITEMS.sampleCup.points, chain: 1 }]);
  assert.equal(world.items[0].collected, true);
  assert.equal(world.score.samples, 1);
  assert.equal(world.popups[0].text, `+${ITEMS.sampleCup.points}`);
});

test('points that cross a rank promote Blenke, and the line says so', () => {
  const world = worldWith('.@u...');
  world.score.points = RANKS[1].points - 1;
  const events = walkRight(world, 30);
  assert.deepEqual(events.filter((event) => event.type === 'promoted').map((event) => event.rank), [RANKS[1].title]);
  const lines = [world.messages.current, ...world.messages.waiting].map((message) => message?.text);
  assert.ok(lines.includes(`BEFORDRAD TILL ${RANKS[1].title.toUpperCase()}!`), lines.join(' | '));
});

test('past the goal Blenke walks on to the filling station by himself, pours his samples and then the level is done', () => {
  const world = createWorld({ id: 'station', name: 'Station', rows: ['............', '.@uuG....M..', '############'] });
  const driver = createDriver();
  driver.press('right');
  beginStep(driver.input);
  assert.ok(stepUntil(world, driver.input, 'levelComplete', 120));
  assert.equal(world.score.carried, 2);
  const still = createInput();
  const hoseIn = stepUntil(world, still, 'hoseIn', 300);
  assert.ok(hoseIn, 'he never reached the pump');
  const { player, station } = world;
  assert.equal(player.x + player.w, station.x - HOSE_GAP, 'he stands at the hose\'s length from the pump');
  assert.equal(player.facing, 1);
  assert.equal(isLevelDone(world), false);
  const stopped = stepUntil(world, still, 'gaugeStopped', 300);
  assert.ok(stopped);
  assert.equal(world.score.carried, 0);
  assert.equal(world.score.samples, 2, 'the samples collected still count');
  assert.equal(station.poured, 2);
  assert.equal(isLevelDone(world), false, 'the needle rests a moment first');
  stepFor(world, still, HOLD_TIME + STEP);
  assert.equal(isLevelDone(world), true);
});

test("a pickup's counts hop on the HUD", () => {
  const world = worldWith('.@u...');
  const driver = createDriver();
  driver.press('right');
  beginStep(driver.input);
  assert.ok(stepUntil(world, driver.input, 'collected', 60));
  assert.ok(world.hops.score < STEP * 2 && world.hops.samples < STEP * 2);
  assert.equal(world.hops.possession, Infinity, 'no possession was found');
});

test('a heart lost and a life lost each hop their place on the HUD', () => {
  const world = worldWith('.@....');
  world.projectiles.push({ type: 'tube', x: world.player.x, y: world.player.y, px: 0, py: 0, w: 4, h: 8, vx: 0, vy: 0, age: 0 });
  stepFor(world, createInput(), STEP);
  assert.ok(world.hops.health < 1 && world.hops.lives === Infinity);
  waitOutStop(world);
  world.player.health = 1;
  world.player.invulnerable = 0;
  world.projectiles.push({ type: 'tube', x: world.player.x, y: world.player.y, px: 0, py: 0, w: 4, h: 8, vx: 0, vy: 0, age: 0 });
  stepFor(world, createInput(), STEP);
  assert.ok(world.hops.lives < 1);
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

test('the clock warns once as it runs low and ticks through its last seconds', () => {
  const world = worldWith('.@....', { time: HURRY_TIME + 1 });
  const events = stepFor(world, createInput(), HURRY_TIME + 0.5);
  assert.equal(events.filter((event) => event.type === 'hurry').length, 1);
  const ticks = events.filter((event) => event.type === 'tick').map((event) => event.left);
  assert.deepEqual(ticks, Array.from({ length: TICK_TIME }, (_, i) => TICK_TIME - i), 'as the HUD shows each second');
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

test('the last hit costs a life, and the last life ends the game after a while', () => {
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
  waitOutStop(world);
  stepFor(world, input, GAME_OVER_TIME + STEP);
  assert.equal(isGameOverDone(world), true);
});

test('a life lost to one enemy is not followed by a stomp on the next in the same step', () => {
  // The party person stands on the ground, the stoner lower down in a pit
  // beside it; Blenke drops between them, his feet below the party
  // person's head but within stomping reach of the stoner's.
  const world = createWorld({ id: 'pit', name: 'Pit', rows: ['@.......', '........', '..PS....', '###.####', '########'] });
  const [partyPerson, stoner] = world.enemies;
  partyPerson.x = 2 * TILE + 2;
  stoner.x = 3 * TILE + 2;
  stoner.y = stoner.py = 4 * TILE - stoner.h;
  world.player.health = 1;
  world.player.x = 3 * TILE - world.player.w / 2;
  world.player.y = 3 * TILE - 2 - world.player.h;
  world.player.vy = 0;
  const types = stepWorld(world, createInput(), STEP).map((event) => event.type);
  assert.ok(types.includes('lifeLost'));
  assert.ok(!types.includes('stomp'), types.join(', '));
  assert.equal(stoner.defeated, false);
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

// Steps the world with what the driver holds.
function stepWith(world, driver, steps = 1) {
  const events = [];
  for (let i = 0; i < steps; i++) {
    beginStep(driver.input);
    events.push(...stepWorld(world, driver.input, STEP));
  }
  return events;
}

// One press of the act key, and a step after it.
function pressAct(world, driver) {
  driver.press('act');
  const events = stepWith(world, driver);
  driver.release('act');
  return [...events, ...stepWith(world, driver)];
}

// Walks right until the act key would do `kind`.
function walkUntil(world, driver, kind) {
  driver.press('right');
  for (let i = 0; i < 120 && actionTarget(world)?.kind !== kind; i++) stepWith(world, driver);
  driver.release('right');
  stepWith(world, driver, 20);
  assert.equal(actionTarget(world)?.kind, kind);
}

test('jumping into a crate from below opens it, and what it held pops out on top', () => {
  const world = createWorld({ id: 'c', name: 'C', rows: ['......', '..K...', '..?...', '......', '..@...', '######'] });
  const driver = createDriver();
  stepWith(world, driver, 5);
  driver.press('jump');
  const events = stepWith(world, driver, 30);
  const opened = events.find((event) => event.type === 'crateOpened');
  assert.deepEqual(opened, { type: 'crateOpened', contents: 'policeCoffee', col: 2, row: 2 });
  assert.equal(tileAt(world.level, 2, 2), OPEN_CRATE);
  stepWith(world, driver, 60);
  const coffee = world.items.find((item) => item.type === 'policeCoffee');
  assert.equal(coffee.falling, false);
  assert.equal(coffee.y + coffee.h + 2, 2 * TILE, 'it rests on the crate');
});

test('a picked-up power-up goes to work, and says so when it runs out', () => {
  const world = worldWith('.@K...');
  const events = walkRight(world, 30);
  assert.ok(events.some((event) => event.type === 'powerUp' && event.powerUp === 'policeCoffee'));
  assert.equal(world.powerUp.type, 'policeCoffee');
  const later = stepFor(world, createInput(), POWER_UPS.policeCoffee.time);
  assert.ok(later.some((event) => event.type === 'powerUpEnded'));
  assert.equal(world.powerUp, null);
  const said = [world.messages.current, ...world.messages.waiting].map((message) => message?.text);
  assert.ok(said.includes(POWER_UPS.policeCoffee.ends));
});

test('an extra life adds a life and hops it on the HUD', () => {
  const world = worldWith('.@ü...');
  const events = walkRight(world, 30);
  assert.deepEqual(events.filter((event) => event.type === 'lifeGained').map(unplaced), [{ type: 'lifeGained', lives: START_LIVES + 1 }]);
  assert.equal(world.lives, START_LIVES + 1);
  assert.ok(world.hops.lives < 1);
  assert.equal(world.tally.extra, 1);
});

test('the hundredth sample earns an extra life, and the line says so', () => {
  const world = worldWith('.@u...');
  world.score.samples = SAMPLES_PER_LIFE - 1;
  const events = walkRight(world, 30);
  assert.ok(events.some((event) => event.type === 'lifeGained'));
  assert.equal(world.lives, START_LIVES + 1);
  const lines = [world.messages.current, ...world.messages.waiting].map((message) => message?.text);
  assert.ok(lines.includes(`${SAMPLES_PER_LIFE} PROV! STATISTIKEN BELÖNAR DIG MED ETT EXTRA LIV.`), lines.join(' | '));
});

test('a heart gives back a heart lost, but none past full health', () => {
  const hurt = worldWith('.@ç...');
  hurt.player.health = 1;
  walkRight(hurt, 30);
  assert.equal(hurt.player.health, 2);
  assert.ok(hurt.hops.health < 1);
  const whole = worldWith('.@ç...');
  const events = walkRight(whole, 30);
  assert.equal(whole.player.health, START_HEALTH);
  assert.equal(whole.hops.health, Infinity, 'no heart changed');
  assert.ok(events.some((event) => event.type === 'healed'), 'it is still heard');
  assert.equal(whole.score.points, ITEMS.heart.points);
});

test('a new power-up takes the place of the one at work', () => {
  const world = worldWith('.@KX..');
  walkRight(world, 40);
  assert.equal(world.powerUp.type, 'helicopter');
});

function hitByTube(world) {
  const { player } = world;
  world.projectiles.push({ type: 'tube', x: player.x, y: player.y, px: 0, py: 0, w: 4, h: 8, vx: 0, vy: 0, age: 0 });
  return stepFor(world, createInput(), STEP);
}

test('the paperwork shield takes a hit for Blenke, once', () => {
  const world = worldWith('.@....');
  world.powerUp = startPowerUp('paperworkShield');
  const events = hitByTube(world);
  assert.ok(events.some((event) => event.type === 'shielded'));
  assert.equal(world.player.health, START_HEALTH);
  assert.equal(world.powerUp, null);
  assert.ok(world.player.invulnerable > 0, 'he is safe a moment, as after any hit');
});

test('Blenke picks up a cone, carries it and throws it at an enemy, which it puts out of action', () => {
  const world = createWorld({ id: 't', name: 'T', rows: ['..........', '.@v....S..', '##########'] });
  const driver = createDriver();
  walkUntil(world, driver, 'lift');
  assert.ok(pressAct(world, driver).some((event) => event.type === 'lifted'));
  const [cone] = world.props;
  assert.equal(world.carrying, cone);
  driver.press('right');
  stepWith(world, driver, 10);
  driver.release('right');
  assert.ok(cone.x > world.player.x, 'carried in front of him');
  const events = [...pressAct(world, driver), ...stepWith(world, driver, 90)];
  assert.ok(events.some((event) => event.type === 'tossed'));
  const struck = events.find((event) => event.type === 'struck');
  assert.equal(struck?.enemy, 'stoner');
  assert.equal(world.score.defeated, 1);
  assert.equal(world.carrying, null);
  assert.ok(!cone.thrown && cone.onGround, 'it lies where it landed');
});

test('a thrown cone opens a crate standing on the ground', () => {
  const world = createWorld({ id: 't', name: 'T', rows: ['..........', '.@v.....?.', '##########'] });
  const driver = createDriver();
  walkUntil(world, driver, 'lift');
  pressAct(world, driver);
  const events = [...pressAct(world, driver), ...stepWith(world, driver, 90)];
  assert.equal(events.find((event) => event.type === 'crateOpened')?.contents, 'sampleCup');
});

test('helping a citizen is worth next to nothing, and says so', () => {
  const world = createWorld({ id: 'h', name: 'H', rows: ['......', '.@.m..', '######'] });
  const driver = createDriver();
  walkUntil(world, driver, 'help');
  assert.ok(world.citizens[0].near, 'she pleads as he comes');
  const events = pressAct(world, driver);
  assert.deepEqual(events.find((event) => event.type === 'helped'), { type: 'helped', points: HELP_POINTS });
  assert.equal(world.score.helped, 1);
  assert.ok(world.messages.waiting.some((message) => message.text === HELP_LINE));
  assert.notEqual(actionTarget(world)?.kind, 'help', 'once is enough');
});

test("testing one of TIF's juniors is worth as little as helping, and is negative", () => {
  const world = createWorld({ id: 'j', name: 'J', rows: ['......', '.@.é..', '######'] });
  const driver = createDriver();
  walkUntil(world, driver, 'test');
  assert.equal(world.citizens[0].plea, JUNIOR_LINES[0]);
  const events = pressAct(world, driver);
  assert.deepEqual(events.find((event) => event.type === 'helped'), { type: 'helped', points: HELP_POINTS });
  assert.equal(world.score.helped, 1);
  assert.ok(world.messages.waiting.some((message) => message.text === TEST_LINE));
  assert.notEqual(actionTarget(world)?.kind, 'test', 'once is enough');
});

for (const [char, lines, who] of [['ñ', JORDBRO_CHILD_LINES, "Jordbro's children"], ['æ', BREMER_PUPIL_LINES, "Fredrika Bremergymnasiet's pupils"], ['ß', SKOGAS_YOUTH_LINES, "Skogås centrum's youngsters"]]) {
  test(`${who} can be tested too, and are negative`, () => {
    const world = createWorld({ id: 't', name: 'T', rows: ['......', `.@.${char}..`, '######'] });
    const driver = createDriver();
    walkUntil(world, driver, 'test');
    assert.equal(world.citizens[0].plea, lines[0]);
    const events = pressAct(world, driver);
    assert.deepEqual(events.find((event) => event.type === 'helped'), { type: 'helped', points: HELP_POINTS });
    assert.ok(world.messages.waiting.some((message) => message.text === TEST_LINE));
  });
}

test('each kind of citizen says its own lines in turn, whoever stands between', () => {
  const world = createWorld({ id: 'c', name: 'C', rows: ['..........', '.@méméé...', '##########'] });
  assert.deepEqual(world.citizens.map((citizen) => citizen.plea), [PLEAS[0], JUNIOR_LINES[0], PLEAS[1], JUNIOR_LINES[1], JUNIOR_LINES[2]]);
});

test('reading a sign shows its text', () => {
  const world = createWorld({ id: 's', name: 'S', rows: ['....', '.@i.', '####'], signs: ['ALLT ÄR UNDER KONTROLL.'] });
  const driver = createDriver();
  stepWith(world, driver, 5);
  pressAct(world, driver);
  assert.equal(world.messages.current.text, 'ALLT ÄR UNDER KONTROLL.');
});

test('a hit makes Blenke drop what he carries, and a lost life takes the power-up', () => {
  const world = createWorld({ id: 'd', name: 'D', rows: ['......', '.@v...', '######'] });
  const driver = createDriver();
  walkUntil(world, driver, 'lift');
  pressAct(world, driver);
  world.powerUp = startPowerUp('superBladder');
  world.player.health = 1;
  const events = hitByTube(world);
  assert.ok(events.some((event) => event.type === 'lifeLost'));
  assert.equal(world.carrying, null);
  assert.equal(world.props[0].carried, false);
  assert.equal(world.powerUp, null);
});

function said(world) {
  return [world.messages.current, ...world.messages.waiting].map((message) => message?.text);
}

test('passing a checkpoint lights it, and a lost life starts Blenke there instead of at the start', () => {
  const world = createWorld({ id: 'c', name: 'C', rows: ['..........', '.@...C....', '######...#'] });
  const events = walkRight(world, 60);
  assert.deepEqual(events.filter((event) => event.type === 'checkpoint'), [{ type: 'checkpoint', col: 5 }]);
  assert.equal(world.checkpoints[0].passed, true);
  assert.ok(world.checkpoints[0].passedTime > 0 && world.checkpoints[0].passedTime < 1, 'it counts from when it lit');
  assert.ok(said(world).includes(CHECKPOINT_LINE));
  assert.equal(stepUntil(world, walkingInput(), 'lifeLost', 300)?.cause, 'pit');
  stepFor(world, createInput(), DOWN_TIME);
  assert.equal(world.player.x + world.player.w / 2, 5.5 * TILE);
  assert.equal(world.player.y + world.player.h, 2 * TILE);
});

test('a checkpoint passed once is not announced again', () => {
  const world = createWorld({ id: 'c', name: 'C', rows: ['.@.C....', '########'] });
  walkRight(world, 60);
  world.player.x = TILE;
  const again = walkRight(world, 60);
  assert.ok(!again.some((event) => event.type === 'checkpoint'));
});

test('touching the goal completes the level: everything stops but Blenke landing, and then it is done', () => {
  const world = createWorld({ id: 'g', name: 'G', rows: ['.........', '.@...G.S.', '#########'] });
  const events = walkRight(world, 90);
  const complete = events.find((event) => event.type === 'levelComplete');
  assert.ok(complete, 'never reached the goal');
  assert.ok(complete.timeLeft > 0);
  assert.equal(world.complete, true);
  assert.equal(world.messages.current.text, COMPLETE_LINE);
  const clock = world.timeLeft;
  const stoner = world.enemies[0];
  const where = stoner.x;
  assert.equal(isLevelDone(world), false);
  stepFor(world, createInput(), COMPLETE_TIME);
  assert.equal(world.timeLeft, clock, 'the clock stops');
  assert.equal(stoner.x, where, 'enemies stop');
  assert.equal(world.player.onGround, true);
  assert.equal(isLevelDone(world), true);
});

test('walking into a secret wall shows the room behind it, once', () => {
  const world = createWorld({ id: 's', name: 'S', rows: ['BBBBBB', '.@.::B', '.@.::B'.replace('@', '.'), '######'] });
  const events = walkRight(world, 40);
  assert.deepEqual(events.filter((event) => event.type === 'secretFound').length, 1);
  assert.equal(tileAt(world.level, 4, 2), ROOM);
  assert.ok(said(world).includes(SECRET_LINE));
});

test('walking into secret asphalt shows the room behind it too', () => {
  const world = createWorld({ id: 's', name: 'S', rows: ['AAAAAA', '...[[A', '.@.[[A', '######'] });
  const events = walkRight(world, 40);
  assert.equal(events.filter((event) => event.type === 'secretFound').length, 1);
  assert.equal(tileAt(world.level, 3, 1), ROOM);
  assert.equal(world.tally.rooms, 1);
});

// A courtroom: Blenke at column 1, the prosecutor at column 6, a gate at
// column 8 before the goal.
function courtroom() {
  return createWorld({ id: 'r', name: 'R', rows: ['..........', '..........', '.@....R.|G', '##########'] });
}

// The hit-stop after a blow holds everything; these steps change nothing
// else.
function waitOutStop(world) {
  while (world.impact.stop > 0) stepWorld(world, createInput(), STEP);
}

// Drops Blenke onto the prosecutor's head.
function stompBoss(world) {
  const [boss] = world.enemies;
  world.player.x = boss.x - 1;
  world.player.y = boss.y - world.player.h - 4;
  world.player.vy = 100;
  for (let i = 0; i < 30; i++) {
    const event = stepWorld(world, createInput(), STEP).find((candidate) => candidate.type === 'wounded' || candidate.type === 'stomp');
    if (!event) continue;
    waitOutStop(world);
    return event;
  }
  return null;
}

test('the prosecutor takes three stomps, safe a moment after each; beaten, he opens the gate', () => {
  const world = courtroom();
  const [boss] = world.enemies;
  // After each stomp Blenke is taken back to the start, out of the way.
  const stepBack = () => {
    world.player.x = TILE;
    world.player.y = 3 * TILE - world.player.h;
    world.player.vy = 0;
  };
  assert.equal(tileAt(world.level, 8, 2), '|');
  const first = stompBoss(world);
  assert.deepEqual(unplaced(first), { type: 'wounded', how: 'stomp', enemy: 'prosecutor', health: ENEMIES.prosecutor.health - 1 });
  assert.equal(world.score.defeated, 0);
  assert.ok(world.player.vx < 0, 'he throws Blenke off his head');
  world.player.x = boss.x;
  world.player.y = boss.y + boss.h - world.player.h;
  world.player.vy = 0;
  world.player.invulnerable = 0;
  assert.ok(!stepFor(world, createInput(), STEP).some((event) => event.type === 'hurt'), 'stunned, he does not hurt');
  for (let hit = 1; hit < ENEMIES.prosecutor.health; hit++) {
    stepBack();
    stepFor(world, createInput(), HIT_TIME);
    world.player.invulnerable = Infinity;
    assert.ok(stompBoss(world), `hit ${hit + 1} missed`);
  }
  assert.equal(boss.defeated, true);
  assert.equal(world.score.defeated, 1);
  assert.equal(tileAt(world.level, 8, 2), EMPTY);
  assert.ok(said(world).includes(bossLine('prosecutor')));
});

test('a gate opens once every boss left of it is beaten, so the next boss keeps its own shut', () => {
  const world = createWorld({ id: 'r', name: 'R', rows: ['.'.repeat(17), '.'.repeat(17), '.@....R.|....R.|G', '#'.repeat(17)] });
  const [first, second] = world.enemies;
  for (let hit = 0; hit < ENEMIES.prosecutor.health; hit++) {
    world.player.x = TILE;
    world.player.y = 3 * TILE - world.player.h;
    world.player.vy = 0;
    stepFor(world, createInput(), HIT_TIME);
    world.player.invulnerable = Infinity;
    assert.ok(stompBoss(world), `hit ${hit + 1} missed`);
  }
  assert.equal(first.defeated, true);
  assert.equal(second.defeated, false);
  assert.equal(tileAt(world.level, 8, 2), EMPTY, 'the first gate opens');
  assert.equal(tileAt(world.level, 15, 2), '|', 'the second boss keeps its gate');
});

test('a thrown cone wounds the prosecutor too', () => {
  const world = createWorld({ id: 'r', name: 'R', rows: ['..........', '.@v....R..', '##########'] });
  const driver = createDriver();
  walkUntil(world, driver, 'lift');
  pressAct(world, driver);
  const events = [...pressAct(world, driver), ...stepWith(world, driver, 90)];
  assert.equal(events.find((event) => event.type === 'wounded')?.how, 'struck');
  assert.equal(world.enemies[0].health, ENEMIES.prosecutor.health - 1);
});
