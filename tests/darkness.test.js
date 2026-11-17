import test from 'node:test';
import assert from 'node:assert/strict';
import { TILE } from '../src/config.js';
import { BLOCK, DARKEST, darknessAt, darkTiles, lightsOf, PLAYER_LIGHT } from '../src/darkness.js';
import { DARK, parseLevel, tileAt } from '../src/level.js';
import { createProjectile } from '../src/projectiles.js';
import { createProp } from '../src/props.js';
import { createWorld } from '../src/world.js';

// A dark passage from column 4 on, a sample cup inside it.
const PASSAGE = [
  '@...&&&&&&&&&&&&',
  '....&&&&&u&&&&&&',
  '################',
];

const world = (definition = {}) => createWorld({ id: 'x', name: 'X', rows: PASSAGE, ...definition });

test('a dark passage is empty space, and what stands in it stands in the dark', () => {
  const level = parseLevel({ id: 'x', rows: PASSAGE });
  assert.equal(tileAt(level, 4, 0), DARK);
  assert.equal(tileAt(level, 9, 1), DARK, 'under the sample cup');
  assert.ok(level.markers.some((marker) => marker.type === 'item' && marker.col === 9));
});

test('far from any light a dark passage is all but black, and round Blenke it is lit', () => {
  const lights = lightsOf(world());
  assert.equal(darknessAt(lights, 14 * TILE, TILE), DARKEST);
  const { player } = world();
  assert.equal(darknessAt(lights, player.x + player.w / 2, player.y + player.h / 2), 0);
  assert.equal(darknessAt(lights, player.x + player.w / 2 + PLAYER_LIGHT.outer + 1, player.y), DARKEST);
});

test('a dark tile is one level when all of it is, and in blocks where light falls across it', () => {
  const here = world();
  here.player.x = 8 * TILE;
  const tiles = darkTiles(here.level, lightsOf(here), 0, 0, 15, 2);
  assert.equal(tiles.length, 24, 'every dark tile, the cup\'s among them, and nothing else');
  const far = tiles.find((tile) => tile.col === 15 && tile.row === 0);
  assert.deepEqual(far, { col: 15, row: 0, level: DARKEST });
  const near = tiles.find((tile) => tile.col === 8 && tile.row === 1);
  assert.ok(near.blocks ?? near.level === 0);
  const edge = tiles.find((tile) => tile.blocks);
  assert.equal(edge.blocks.length, (TILE / BLOCK) ** 2);
  assert.ok(new Set(edge.blocks).size > 1);
});

test('a street lamp in a dark passage lights a pool round its foot', () => {
  const lamp = world({ cast: [{ type: 'streetLamp', col: 12, row: 1 }] });
  const lights = lightsOf(lamp);
  assert.ok(darknessAt(lights, 12 * TILE + 8, 2 * TILE - 4) < DARKEST / 3);
  assert.equal(darknessAt(lights, 5 * TILE, TILE), DARKEST);
});

test('a lit torch lights ahead of it, not behind, and a glow stick round itself', () => {
  const lit = world();
  const torch = createProp('torch', 8, 1, TILE);
  torch.effectTime = 3;
  torch.facing = 1;
  lit.props.push(torch);
  const lights = lightsOf(lit);
  const y = torch.y + torch.h / 2;
  assert.ok(darknessAt(lights, torch.x + 40, y) < DARKEST / 3, 'ahead');
  assert.equal(darknessAt(lights, torch.x - 40, y), DARKEST, 'behind');
  lit.props.length = 0;
  lit.projectiles.push(createProjectile('glowStick', 13 * TILE, TILE, 0, 0));
  assert.equal(darknessAt(lightsOf(lit), 13 * TILE, TILE), 0);
});
