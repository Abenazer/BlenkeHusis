import test from 'node:test';
import assert from 'node:assert/strict';
import { PALETTE } from '../src/palette.js';
import { createImage, getPixel, mirrored, noise, parsePixels, stamp } from '../src/pixels.js';

const LEGEND = { k: 'ink', w: 'white' };

test('a pixel map becomes palette colours, with dots transparent', () => {
  const image = parsePixels(['k.', '.w'], LEGEND);
  assert.equal(image.width, 2);
  assert.equal(image.height, 2);
  assert.equal(getPixel(image, 0, 0), PALETTE.ink);
  assert.equal(getPixel(image, 1, 0), null);
  assert.equal(getPixel(image, 1, 1), PALETTE.white);
});

test('a pixel map with uneven rows or an unknown character fails loudly', () => {
  assert.throws(() => parsePixels(['kk', 'k'], LEGEND), /row 1 is 1 wide/);
  assert.throws(() => parsePixels(['kx'], LEGEND), /'x' at 1,0/);
  assert.throws(() => parsePixels(['k'], { k: 'no_such_colour' }), /Unknown palette colour/);
});

test('stamping leaves what is under transparent pixels', () => {
  const target = parsePixels(['www'], LEGEND);
  stamp(target, parsePixels(['k.k'], LEGEND), 0, 0);
  assert.deepEqual(target.pixels, [PALETTE.ink, PALETTE.white, PALETTE.ink]);
});

test('stamping past the edge is clipped', () => {
  const target = createImage(2, 1);
  stamp(target, parsePixels(['kkk'], LEGEND), 1, 0);
  assert.deepEqual(target.pixels, [null, PALETTE.ink]);
});

test('mirroring flips left and right', () => {
  const image = mirrored(parsePixels(['kw.'], LEGEND));
  assert.deepEqual(image.pixels, [null, PALETTE.white, PALETTE.ink]);
});

test('noise is the same every time and lies in [0, 1)', () => {
  const values = [];
  for (let i = 0; i < 1000; i++) values.push(noise(i % 37, Math.floor(i / 37), 7));
  assert.deepEqual(values, values.map((_, i) => noise(i % 37, Math.floor(i / 37), 7)));
  assert.ok(values.every((value) => value >= 0 && value < 1));
  assert.ok(new Set(values).size > 900);
});
