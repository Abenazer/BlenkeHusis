import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFEATED_TIME, HIT_TIME, isGone, nextRandom, updateEnemy, woundEnemy } from '../src/ai.js';
import { STEP, TILE } from '../src/config.js';
import { createEnemy, ENEMIES, PROSECUTOR_LINES, SLOGANS } from '../src/enemies.js';
import { createPlayer } from '../src/player.js';
import { makeLevel } from './helpers.js';

// A ledge from column 2 to 13, with a drop on both sides.
const ledge = makeLevel([
  '................',
  '................',
  '.@..............',
  '..############..',
  '..############..',
]);

function enemyOn(level, type, col, row = 2) {
  const enemy = createEnemy(type, col, row, TILE);
  return enemy;
}

// Steps the enemy with Blenke standing at column `at`; returns its events.
function run(enemy, level, seconds, at = 0) {
  const player = createPlayer((at + 0.5) * TILE, 3 * TILE);
  const events = [];
  for (let i = 0; i < Math.round(seconds / STEP); i++) events.push(...updateEnemy(enemy, { level, player }, STEP));
  return events;
}

test('pacing enemies turn at ledges instead of falling off', () => {
  const enemy = enemyOn(ledge, 'ideologue', 3);
  for (let i = 0; i < 20; i++) {
    run(enemy, ledge, 0.5, 40);
    assert.ok(enemy.x >= 2 * TILE - 1 && enemy.x + enemy.w <= 14 * TILE + 1, `walked off at ${enemy.x}`);
    assert.ok(enemy.onGround);
  }
});

test('the dealer runs from Blenke when he comes near, and stops cornered at a ledge', () => {
  const enemy = enemyOn(ledge, 'dealer', 10);
  run(enemy, ledge, 0.2, 40);
  assert.ok(Math.abs(enemy.vx) <= ENEMIES.dealer.speed);
  run(enemy, ledge, 0.1, 8);
  assert.equal(enemy.vx, ENEMIES.dealer.fleeSpeed);
  run(enemy, ledge, 2, 8);
  assert.equal(enemy.vx, 0);
  assert.ok(enemy.x + enemy.w <= 14 * TILE + 1, 'he ran off the ledge');
});

test('the party people wander at random, but the same way every time', () => {
  const trace = () => {
    const enemy = enemyOn(ledge, 'partyPerson', 7);
    const xs = [];
    for (let i = 0; i < 10; i++) {
      run(enemy, ledge, 0.5, 40);
      xs.push(enemy.x);
    }
    return xs;
  };
  const first = trace();
  assert.deepEqual(trace(), first);
  assert.ok(new Set(first.map(Math.round)).size > 3, 'they hardly moved');
});

test('random numbers are in [0, 1) and differ', () => {
  const enemy = createEnemy('partyPerson', 3, 4, TILE);
  const values = Array.from({ length: 100 }, () => nextRandom(enemy));
  assert.ok(values.every((value) => value >= 0 && value < 1));
  assert.ok(new Set(values).size > 90);
});

test('the bureaucrat throws paperwork at Blenke only when he is in range', () => {
  const far = enemyOn(ledge, 'bureaucrat', 12);
  assert.equal(run(far, ledge, 5, 12 + 30).length, 0);
  const near = enemyOn(ledge, 'bureaucrat', 12);
  const throws = run(near, ledge, 5, 5).filter((event) => event.type === 'throw');
  assert.equal(throws.length, Math.floor(5 / ENEMIES.bureaucrat.throwEvery));
  assert.equal(near.facing, -1, 'he faces Blenke');
  assert.ok(throws[0].projectile.vx < 0);
});

test('the technician lobs a tube that comes down near Blenke', () => {
  const enemy = enemyOn(ledge, 'technician', 12);
  const [thrown] = run(enemy, ledge, 3, 6).filter((event) => event.type === 'throw');
  assert.equal(thrown.projectile.type, 'tube');
  assert.ok(thrown.projectile.vy < 0, 'it goes up first');
});

test('the ideologue shouts one slogan after another', () => {
  const enemy = enemyOn(ledge, 'ideologue', 8);
  const shouts = run(enemy, ledge, ENEMIES.ideologue.throwEvery * 2 + 0.1, 40).filter((event) => event.type === 'shout');
  assert.deepEqual(shouts.map((event) => event.text), SLOGANS.slice(0, 2));
});

test('the stoner hands out a few samples, then no more', () => {
  const enemy = enemyOn(ledge, 'stoner', 8);
  const drops = run(enemy, ledge, ENEMIES.stoner.dropEvery * (ENEMIES.stoner.drops + 2), 40).filter((event) => event.type === 'drop');
  assert.equal(drops.length, ENEMIES.stoner.drops);
  assert.ok(drops.every((event) => event.item === 'sampleCup'));
  assert.ok(Math.abs(enemy.x - (8.5 * TILE - enemy.w / 2)) < TILE, 'he barely moved');
});

test('a defeated enemy lies still a moment, then is gone; one in a pit at once', () => {
  const enemy = enemyOn(ledge, 'dealer', 6);
  enemy.defeated = true;
  run(enemy, ledge, DEFEATED_TIME / 2, 40);
  assert.equal(isGone(enemy, ledge), false);
  run(enemy, ledge, DEFEATED_TIME, 40);
  assert.equal(isGone(enemy, ledge), true);
  const fallen = enemyOn(ledge, 'dealer', 0, 2);
  run(fallen, ledge, 2, 40);
  assert.equal(isGone(fallen, ledge), true);
});

// A long courtroom floor, from column 0 to 29.
const courtroom = makeLevel([
  '..............................',
  '..............................',
  '.@............................',
  '##############################',
]);

test('the prosecutor waits until Blenke comes, then says so', () => {
  const enemy = enemyOn(courtroom, 'prosecutor', 25);
  const far = run(enemy, courtroom, 3, 1);
  assert.equal(enemy.awake, false);
  assert.deepEqual(far, []);
  const near = run(enemy, courtroom, STEP, 16);
  assert.ok(near.some((event) => event.type === 'bossAwake'));
  assert.equal(enemy.saying, PROSECUTOR_LINES.wake);
});

test('the awake prosecutor lobs binders and every third attack skims a document along the floor', () => {
  const enemy = enemyOn(courtroom, 'prosecutor', 25);
  enemy.awake = true;
  const thrown = run(enemy, courtroom, ENEMIES.prosecutor.throwEvery * 3 + 0.1, 16).filter((event) => event.type === 'throw');
  assert.deepEqual(thrown.map((event) => event.projectile.type), ['binder', 'binder', 'brief']);
  const brief = thrown[2].projectile;
  assert.equal(brief.vy, 0);
  assert.ok(brief.y + brief.h > enemy.y + enemy.h - TILE / 2, 'the document flies low, to be jumped');
  assert.ok(brief.vx < 0, 'towards Blenke');
});

test('a wound stuns the prosecutor a moment and makes him attack sooner', () => {
  const calm = enemyOn(courtroom, 'prosecutor', 25);
  const angry = enemyOn(courtroom, 'prosecutor', 25);
  calm.awake = true;
  angry.awake = true;
  assert.equal(woundEnemy(angry), true);
  assert.equal(angry.health, ENEMIES.prosecutor.health - 1);
  assert.equal(woundEnemy(angry), false, 'no second hit while stunned');
  assert.equal(angry.health, ENEMIES.prosecutor.health - 1);
  assert.deepEqual(run(angry, courtroom, HIT_TIME - STEP, 16), [], 'stunned, he does nothing');
  const firstThrow = (enemy) => {
    for (let t = 0; t < 5; t += STEP) if (run(enemy, courtroom, STEP, 16).some((event) => event.type === 'throw')) return t;
    return Infinity;
  };
  assert.ok(firstThrow(angry) < firstThrow(calm));
});
