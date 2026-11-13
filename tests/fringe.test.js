import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TILE } from '../src/config.js';
import { FRINGE_RAISE, fringeRows, hasFringe, liftAboveGrass } from '../src/fringe.js';
import { ITEMS } from '../src/items.js';
import { getPixel } from '../src/pixels.js';
import { makeLevel, rgba } from './helpers.js';
import { loadDelivered } from './png.js';

const cup = ITEMS.sampleCup.char;

test('grass with open air above has a fringe', () => {
  const level = makeLevel(['@' + cup + '.', '###']);
  assert.equal(hasFringe(level, 0, 1), true);
  assert.equal(hasFringe(level, 1, 1), true, 'under an item, whose tile is empty');
  assert.equal(hasFringe(level, 2, 1), true);
});

test('grass under more ground, a hazard or a wall has none, nor has anything but grass', () => {
  const level = makeLevel(['@^,B#.', '######', 'ZZZZZZ']);
  for (let col = 1; col <= 4; col++) assert.equal(hasFringe(level, col, 1), false, `under ${level.tiles[col]}`);
  assert.equal(hasFringe(level, 5, 2), false, 'concrete grows no grass');
});

test("grass in a secret room grows a fringe once the room's inside shows", () => {
  const level = makeLevel(['@;:', '###']);
  assert.equal(hasFringe(level, 1, 1), true);
  assert.equal(hasFringe(level, 2, 1), false, 'behind the hidden wall');
});

test('the fringe counts down to the last gap between the blades and as many rows more as it is raised', () => {
  // A 2×4 picture with a gap in row 1.
  const image = { width: 2, height: 4, pixels: ['#000000', null, null, '#000000', '#000000', '#000000', '#000000', '#000000'] };
  assert.equal(fringeRows(rgba(image), 2, 4, 1), 3);
  assert.equal(fringeRows(rgba(image), 2, 4, 5), 4, 'never more than the picture');
});

// The tile with its fringe drawn over it, raised, as the page draws them:
// the part of the tile the fringe falls on, rows 0 to the tile's height.
function withFringe(tile) {
  const rows = fringeRows(rgba(tile), tile.width, tile.height);
  const pixels = [];
  for (let y = 0; y < tile.height; y++) {
    for (let x = 0; x < tile.width; x++) {
      const fringe = y + FRINGE_RAISE < rows ? getPixel(tile, x, y + FRINGE_RAISE) : null;
      pixels.push(fringe ?? getPixel(tile, x, y));
    }
  }
  return pixels;
}

function lawnTops() {
  return Object.entries(loadDelivered().ground_grass.images).filter(([name]) => name.startsWith('top'));
}

test('a lawn with its fringe over it has no gap left for the backdrop to show through', () => {
  for (const [name, tile] of lawnTops()) {
    const pixels = withFringe(tile);
    assert.ok(pixels.every((pixel) => pixel !== null), `${name} shows a gap`);
  }
});

test('a pickup resting on a lawn is lifted above the whole fringe, elsewhere not at all', () => {
  const level = makeLevel(['@' + cup + cup + '.', '##ZZ']);
  const ground = TILE;
  assert.equal(liftAboveGrass(level, 1.5 * TILE, ground), FRINGE_RAISE);
  assert.equal(liftAboveGrass(level, 2.5 * TILE, ground), 0, 'on concrete');
  assert.equal(liftAboveGrass(level, 1.5 * TILE, ground - TILE / 2), 0, 'well above the grass');
});

test('a pickup dropping onto a lawn settles into its lift without a jump', () => {
  const level = makeLevel(['@' + cup, '##']);
  let drawnBefore = -Infinity;
  for (let bottom = TILE - 8; bottom <= TILE; bottom += 0.25) {
    const drawn = bottom - liftAboveGrass(level, 1.5 * TILE, bottom);
    assert.ok(drawn >= drawnBefore, `it moved up at ${bottom}`);
    assert.ok(drawn - drawnBefore <= 0.25 + 1e-9 || drawnBefore === -Infinity, `it jumped at ${bottom}`);
    drawnBefore = drawn;
  }
  assert.equal(drawnBefore, TILE - FRINGE_RAISE);
});
