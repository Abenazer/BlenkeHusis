import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BACKGROUND_LAYERS } from '../src/art/backgrounds.js';
import { backdropBands } from '../src/backdrop.js';
import { TILE } from '../src/config.js';
import { rgba } from './helpers.js';

// Draws the bands back into a pixel image, as the page draws them: a fill
// across the row, or the rows copied column by column, skipping empty ones.
function redraw(image, bands) {
  const pixels = new Array(image.width * image.height).fill(null);
  for (const band of bands) {
    for (let row = band.from; row < band.to; row++) {
      for (let x = 0; x < image.width; x++) {
        const index = row * image.width + x;
        if (band.colour) pixels[index] = band.colour;
        else if (band.columns[Math.floor(x / TILE)]) pixels[index] = image.pixels[index];
      }
    }
  }
  return pixels;
}

function imageOf(rows, legend) {
  const pixels = rows.flatMap((row) => [...row].map((char) => legend[char] ?? null));
  return { width: rows[0].length, height: rows.length, pixels };
}

test('rows of one opaque colour are filled, in one band per run of a colour', () => {
  const image = imageOf(['aaaa', 'aaaa', 'bbbb', 'abab', 'aaaa'], { a: '#102030', b: '#ffffff' });
  const bands = backdropBands(rgba(image), 4, 5, 2);
  assert.deepEqual(bands, [
    { from: 0, to: 2, colour: '#102030' },
    { from: 2, to: 3, colour: '#ffffff' },
    { from: 3, to: 4, columns: [true, true] },
    { from: 4, to: 5, colour: '#102030' },
  ]);
});

test('rows that vary are drawn in columns, and a column with nothing in it is skipped', () => {
  const image = imageOf(['....', '..a.', '..a.', '....'], { a: '#102030' });
  assert.deepEqual(backdropBands(rgba(image), 4, 4, 2), [{ from: 0, to: 4, columns: [false, true] }]);
});

test('every backdrop layer drawn in bands is the same picture', () => {
  for (const layer of BACKGROUND_LAYERS) {
    const { image } = layer;
    const bands = backdropBands(rgba(image), image.width, image.height, TILE);
    assert.equal(bands[0].from, 0);
    assert.equal(bands.at(-1).to, image.height);
    bands.slice(1).forEach((band, i) => assert.equal(band.from, bands[i].to, `${layer.name}: a gap in the bands`));
    assert.deepEqual(redraw(image, bands), image.pixels, layer.name);
  }
});

test('the sky is mostly filled, not drawn', () => {
  const sky = BACKGROUND_LAYERS.find((layer) => layer.name === 'sky');
  const bands = backdropBands(rgba(sky.image), sky.image.width, sky.image.height, TILE);
  const filled = bands.filter((band) => band.colour).reduce((rows, band) => rows + band.to - band.from, 0);
  assert.ok(filled > sky.image.height * 0.6, `${filled} of ${sky.image.height} rows filled`);
});
