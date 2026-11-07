import test from 'node:test';
import assert from 'node:assert/strict';
import { STEP, TILE } from '../src/config.js';
import { isAreaFree, moveBody } from '../src/physics.js';
import { makeLevel } from './helpers.js';

const level = makeLevel([
  '@.........',
  '..........',
  '.....#....',
  '..........',
  '..___.....',
  '..........',
  '##########',
]);

function box(x, y, vx = 0, vy = 0) {
  return { x, y, w: 10, h: 20, vx, vy };
}

test('a falling box lands on the ground', () => {
  const body = box(20, 6 * TILE - 21, 0, 300);
  const hit = moveBody(body, level, STEP);
  assert.equal(hit.onGround, true);
  assert.equal(body.y, 6 * TILE - 20);
  assert.equal(body.vy, 0);
});

test('a box moving into a wall stops against it', () => {
  const body = box(5 * TILE - 12, 2 * TILE, 300, 0);
  const hit = moveBody(body, level, STEP);
  assert.equal(hit.hitWall, 1);
  assert.deepEqual(hit.wallTiles, [{ col: 5, row: 2 }]);
  assert.equal(body.x, 5 * TILE - 10);
});

test('a box jumping into a tile hits its head and reports the tile', () => {
  const body = box(5 * TILE + 3, 3 * TILE + 2, 0, -300);
  const hit = moveBody(body, level, STEP);
  assert.equal(hit.hitCeiling, true);
  assert.deepEqual(hit.ceilingTiles, [{ col: 5, row: 2 }]);
  assert.equal(body.y, 3 * TILE);
});

test('a one-way platform lets a box up through it', () => {
  const body = box(2 * TILE + 2, 4 * TILE + 4, 0, -300);
  const hit = moveBody(body, level, STEP);
  assert.equal(hit.hitCeiling, false);
  assert.ok(body.y < 4 * TILE + 4);
});

test('a one-way platform holds a box landing on it from above', () => {
  const body = box(2 * TILE + 2, 4 * TILE - 21, 0, 300);
  const hit = moveBody(body, level, STEP);
  assert.equal(hit.onGround, true);
  assert.equal(hit.groundOneWay, true);
  assert.equal(body.y, 4 * TILE - 20);
});

test('a box dropping through ignores one-way platforms', () => {
  const body = box(2 * TILE + 2, 4 * TILE - 20, 0, 300);
  const hit = moveBody(body, level, STEP, { dropThrough: true });
  assert.equal(hit.onGround, false);
  assert.ok(body.y > 4 * TILE - 20);
});

test('a box half inside a one-way platform is not pulled up onto it', () => {
  const body = box(2 * TILE + 2, 4 * TILE - 12, 0, 300);
  const hit = moveBody(body, level, STEP);
  assert.equal(hit.onGround, false);
});

test('a very fast box does not pass through a floor', () => {
  const body = box(20, 3 * TILE, 0, 5000);
  const hit = moveBody(body, level, STEP);
  assert.equal(hit.onGround, true);
  assert.equal(body.y, 6 * TILE - 20);
});

test('an area is free only when it overlaps no solid tile', () => {
  assert.equal(isAreaFree(level, { x: 0, y: 0, w: 16, h: 16 }), true);
  assert.equal(isAreaFree(level, { x: 5 * TILE + 15, y: 2 * TILE, w: 4, h: 4 }), false);
  // One-way platforms don't block standing up.
  assert.equal(isAreaFree(level, { x: 2 * TILE, y: 4 * TILE, w: 16, h: 16 }), true);
});
