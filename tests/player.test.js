import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAYER, TILE } from '../src/config.js';
import { bounce, createPlayer, knockBack } from '../src/player.js';
import { createDriver, makeLevel } from './helpers.js';

const GROUND = 10 * TILE;

// Ground on rows 10–11, Lelle starting at column 2.
const flat = makeLevel([
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..@...........................',
  '##############################',
  '##############################',
]);

function playerOn(level, col = 2, row = 9) {
  const player = createPlayer((col + 0.5) * TILE, (row + 1) * TILE);
  createDriver().step(player, level, 2);
  return player;
}

function feet(player) {
  return player.y + player.h;
}

function jumpHeight(player, level, holdSteps) {
  const driver = createDriver();
  const startFeet = feet(player);
  let highest = startFeet;
  driver.press('jump');
  for (let i = 0; i < 90; i++) {
    if (i === holdSteps) driver.release('jump');
    driver.step(player, level);
    highest = Math.min(highest, feet(player));
  }
  return startFeet - highest;
}

test('Lelle stands still on the ground', () => {
  const player = playerOn(flat);
  createDriver().step(player, flat, 30);
  assert.equal(player.onGround, true);
  assert.equal(feet(player), GROUND);
  assert.equal(player.vx, 0);
});

test('walking and running reach their top speeds and no more', () => {
  const walker = playerOn(flat);
  const walk = createDriver();
  walk.press('right');
  walk.step(walker, flat, 60);
  assert.equal(walker.vx, PLAYER.walkSpeed);

  const runner = playerOn(flat);
  const run = createDriver();
  run.press('right');
  run.press('run');
  run.step(runner, flat, 60);
  assert.equal(runner.vx, PLAYER.runSpeed);
});

test('letting go of the direction stops Lelle within a few steps', () => {
  const player = playerOn(flat);
  const driver = createDriver();
  driver.press('right');
  driver.step(player, flat, 60);
  driver.release('right');
  driver.step(player, flat, 8);
  assert.equal(player.vx, 0);
});

test('turning around is quicker than starting from rest', () => {
  const player = playerOn(flat);
  const driver = createDriver();
  driver.press('right');
  driver.step(player, flat, 60);
  driver.release('right');
  driver.press('left');
  driver.step(player, flat, 5);
  assert.ok(player.vx < PLAYER.walkSpeed - 5 * PLAYER.groundAccel / 60);
  assert.equal(player.facing, -1);
});

test('a held jump reaches between four and five tiles', () => {
  const height = jumpHeight(playerOn(flat), flat, 90);
  assert.ok(height > 4 * TILE && height < 5 * TILE, `jumped ${height} px`);
});

test('a tap gives a short hop, well under half a full jump', () => {
  const full = jumpHeight(playerOn(flat), flat, 90);
  const tap = jumpHeight(playerOn(flat), flat, 1);
  assert.ok(tap < full / 2, `tap ${tap} px, full ${full} px`);
  assert.ok(tap > TILE, `tap ${tap} px`);
});

test('a running jump goes higher than a standing one', () => {
  const standing = jumpHeight(playerOn(flat), flat, 90);
  const runner = playerOn(flat);
  const driver = createDriver();
  driver.press('right');
  driver.press('run');
  driver.step(runner, flat, 40);
  const running = jumpHeight(runner, flat, 90);
  assert.ok(running > standing);
});

test('jumping emits a jump event, and landing a land event', () => {
  const player = playerOn(flat);
  const driver = createDriver();
  driver.press('jump');
  const events = driver.step(player, flat, 90);
  assert.deepEqual(events.map((event) => event.type), ['jump', 'land']);
});

// Ground ends after column 5; a pit beyond it.
const ledge = makeLevel([
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..@...........................',
  '######........................',
  '######........................',
]);

function walkOffLedge(stepsAfter) {
  const player = playerOn(ledge);
  const driver = createDriver();
  driver.press('right');
  while (player.onGround) driver.step(player, ledge);
  driver.step(player, ledge, stepsAfter);
  driver.press('jump');
  driver.step(player, ledge);
  return player;
}

test('coyote time: a jump just after walking off a ledge still works', () => {
  assert.ok(walkOffLedge(3).vy < 0);
});

test('coyote time runs out: a late jump does nothing', () => {
  assert.ok(walkOffLedge(12).vy > 0);
});

function dropAndPressJump(stepsBeforeLanding) {
  const player = playerOn(flat, 2, 2);
  const driver = createDriver();
  // Find how many steps the fall takes, then replay it with the press.
  const probe = playerOn(flat, 2, 2);
  let fallSteps = 0;
  while (!probe.onGround) {
    driver.step(probe, flat);
    fallSteps++;
  }
  driver.step(player, flat, fallSteps - stepsBeforeLanding);
  driver.press('jump');
  driver.step(player, flat, stepsBeforeLanding + 2);
  return player;
}

test('jump buffering: a press just before landing jumps on landing', () => {
  assert.ok(dropAndPressJump(5).vy < 0);
});

test('jump buffering runs out: a press long before landing does nothing', () => {
  const player = dropAndPressJump(20);
  assert.equal(player.onGround, true);
});

// A tunnel one tile high under columns 6–11.
const tunnel = makeLevel([
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '......ZZZZZZ..................',
  '..@...........................',
  '##############################',
  '##############################',
]);

test('crouching lowers Lelle, and he crawls through a low tunnel', () => {
  const player = playerOn(tunnel);
  const driver = createDriver();
  driver.press('down');
  driver.step(player, tunnel);
  assert.equal(player.h, PLAYER.crouchHeight);
  assert.equal(feet(player), GROUND);
  driver.press('right');
  while (player.x < 12 * TILE) driver.step(player, tunnel);
  driver.release('down');
  driver.step(player, tunnel);
  assert.equal(player.h, PLAYER.height);
});

test('Lelle stays crouched under a low ceiling until there is room', () => {
  const player = playerOn(tunnel);
  const driver = createDriver();
  driver.press('down');
  driver.press('right');
  while (player.x < 8 * TILE) driver.step(player, tunnel);
  driver.release('down');
  driver.release('right');
  driver.step(player, tunnel, 10);
  assert.equal(player.h, PLAYER.crouchHeight);
});

test('walking into the low tunnel standing up is blocked', () => {
  const player = playerOn(tunnel);
  const driver = createDriver();
  driver.press('right');
  driver.step(player, tunnel, 120);
  assert.equal(player.x + player.w, 6 * TILE);
});

// A one-way platform on row 6 over the ground.
const platform = makeLevel([
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..@...........................',
  '.______.......................',
  '..............................',
  '..............................',
  '..............................',
  '##############################',
  '##############################',
]);

test('down and jump drop through a one-way platform', () => {
  const player = playerOn(platform, 2, 5);
  assert.equal(feet(player), 6 * TILE);
  const driver = createDriver();
  driver.press('down');
  driver.step(player, platform);
  driver.press('jump');
  driver.step(player, platform, 40);
  assert.equal(feet(player), GROUND);
});

test('jump alone from a one-way platform jumps up', () => {
  const player = playerOn(platform, 2, 5);
  const driver = createDriver();
  driver.press('jump');
  driver.step(player, platform, 5);
  assert.ok(feet(player) < 6 * TILE);
});

test('jumping into a solid tile reports a bump with the tile', () => {
  const open = makeLevel([
    '..........',
    '..........',
    '..........',
    '..........',
    '..........',
    '..........',
    '..ZZZ.....',
    '..........',
    '..........',
    '...@......',
    '##########',
    '##########',
  ]);
  const jumper = playerOn(open, 3, 9);
  const driver = createDriver();
  driver.press('jump');
  const events = driver.step(jumper, open, 20);
  const bump = events.find((event) => event.type === 'bump');
  assert.ok(bump, 'no bump event');
  assert.deepEqual(bump.tiles, [{ col: 3, row: 6 }]);
});

test('in a puddle Lelle slides much further before he stops', () => {
  const puddle = makeLevel([
    '..............................',
    '..@...........................',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    '##############################',
  ]);
  const dry = makeLevel([
    '..............................',
    '..@...........................',
    '..............................',
    '##############################',
  ]);
  const slide = (level) => {
    const player = playerOn(level, 2, 2);
    player.vx = PLAYER.walkSpeed;
    const from = player.x;
    createDriver().step(player, level, 120);
    return player.x - from;
  };
  assert.ok(slide(puddle) > 4 * slide(dry), `${slide(puddle)} against ${slide(dry)}`);
});

test('a hit knocks Lelle back and up, takes the controls a moment and leaves him safe a while', () => {
  const player = playerOn(flat);
  knockBack(player, player.x + player.w);
  assert.ok(player.vx < 0 && player.vy < 0);
  assert.equal(player.invulnerable, PLAYER.invulnerableTime);
  const driver = createDriver();
  driver.press('right');
  driver.step(player, flat, 5);
  assert.ok(player.vx < 0, 'the controls should be gone');
  driver.step(player, flat, Math.ceil(PLAYER.hurtTime * 60) + 30);
  assert.ok(player.vx > 0, 'the controls should be back');
  assert.ok(player.invulnerable > 0);
});

test('a stomp bounces Lelle higher with jump held', () => {
  const low = playerOn(flat);
  const high = playerOn(flat);
  bounce(low, false);
  bounce(high, true);
  assert.equal(low.vy, -PLAYER.stompBounce);
  assert.equal(high.vy, -PLAYER.stompJumpBounce);
  assert.equal(high.jumping, true);
});
