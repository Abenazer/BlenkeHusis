import test from 'node:test';
import assert from 'node:assert/strict';
import { TILE } from '../src/config.js';
import { parseLevel } from '../src/level.js';
import { moveBody, pushBody } from '../src/physics.js';
import { createPlatforms, PLATFORM_PERIOD, PLATFORM_TRAVEL, platformOffset, updatePlatforms } from '../src/platforms.js';
import { makeLevel } from './helpers.js';

test('neighbouring platform characters join into one platform', () => {
  const level = parseLevel({ id: 'x', rows: ['@HHH.V', 'VV....'] });
  const platforms = createPlatforms(level.markers);
  assert.deepEqual(platforms.map(({ axis, col, row, tiles }) => [axis, col, row, tiles]), [
    ['horizontal', 1, 0, 3],
    ['vertical', 5, 0, 1],
    ['vertical', 0, 1, 2],
  ]);
});

test('a platform goes its travel and back in a period, easing at the ends', () => {
  assert.equal(platformOffset('horizontal', 0), 0);
  assert.ok(Math.abs(platformOffset('horizontal', PLATFORM_PERIOD / 2) - PLATFORM_TRAVEL.horizontal) < 1e-9);
  assert.ok(Math.abs(platformOffset('vertical', PLATFORM_PERIOD)) < 1e-9);
  const nearEnd = platformOffset('horizontal', 0.01);
  const midway = platformOffset('horizontal', PLATFORM_PERIOD / 4 + 0.01) - platformOffset('horizontal', PLATFORM_PERIOD / 4);
  assert.ok(nearEnd < midway, 'it should start slowly');
});

test('a vertical platform rises from where it is written', () => {
  const level = parseLevel({ id: 'x', rows: ['@....', '..V..'] });
  const [platform] = createPlatforms(level.markers);
  updatePlatforms([platform], PLATFORM_PERIOD / 2);
  assert.equal(platform.x, 2 * TILE);
  assert.ok(Math.abs(platform.y - (TILE - PLATFORM_TRAVEL.vertical)) < 1e-9);
  assert.ok(platform.dy < 0);
});

test('a falling body lands on a platform from above, and passes it from below', () => {
  const level = makeLevel(['@....', '.....', '.....', '.....']);
  const platform = { x: 0, y: 2 * TILE, w: 2 * TILE, h: 6 };
  const falling = { x: 4, y: TILE, w: 10, h: 14, vx: 0, vy: 300 };
  const hit = moveBody(falling, level, 0.1, { platforms: [platform] });
  assert.equal(hit.platform, platform);
  assert.equal(hit.groundOneWay, true);
  assert.equal(falling.y + falling.h, platform.y);
  const rising = { x: 4, y: 2 * TILE + 4, w: 10, h: 14, vx: 0, vy: -300 };
  assert.equal(moveBody(rising, level, 0.1, { platforms: [platform] }).onGround, false);
  const dropping = { x: 4, y: TILE, w: 10, h: 14, vx: 0, vy: 300 };
  assert.equal(moveBody(dropping, level, 0.1, { platforms: [platform], dropThrough: true }).platform, null);
});

test('being carried stops at a wall but keeps the body\'s own speed', () => {
  const level = makeLevel(['@..#', '....']);
  const body = { x: 2 * TILE, y: 0, w: 10, h: 14, vx: 33, vy: 0 };
  pushBody(body, level, TILE);
  assert.equal(body.x, 3 * TILE - body.w);
  assert.equal(body.vx, 33);
});
