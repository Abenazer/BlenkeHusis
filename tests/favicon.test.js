import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HUD_ICONS } from '../src/art/items.js';
import { getPixel } from '../src/pixels.js';
import { readPng } from './png.js';

// The favicon is Blenke's head from the HUD, blown up by whole pixels and
// centred; when the head is drawn anew, the favicon must follow.
const FAVICON = 'assets/favicon.png';
const SIZE = 32;

test('the favicon is Blenke\'s HUD head, scaled by whole pixels', () => {
  const favicon = readPng(readFileSync(FAVICON), FAVICON);
  assert.equal(favicon.width, SIZE);
  assert.equal(favicon.height, SIZE);
  const head = HUD_ICONS.lives;
  const scale = Math.floor(SIZE / Math.max(head.width, head.height));
  const left = Math.floor((SIZE - head.width * scale) / 2);
  const top = Math.floor((SIZE - head.height * scale) / 2);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const inside = x >= left && y >= top && x < left + head.width * scale && y < top + head.height * scale;
      const expected = inside ? getPixel(head, Math.floor((x - left) / scale), Math.floor((y - top) / scale)) : null;
      assert.equal(getPixel(favicon, x, y), expected, `pixel ${x},${y}`);
    }
  }
});

test('the page links the favicon', () => {
  assert.match(readFileSync('index.html', 'utf8'), /<link rel="icon"[^>]*href="assets\/favicon\.png"/);
});
