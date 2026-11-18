import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BACKGROUND_LAYERS, DRAWN_LAYERS, HORIZON } from '../src/art/backgrounds.js';
import { isPaletteColour } from '../src/palette.js';
import { BACKDROPS, backdropBands, DEFAULT_BACKDROP } from '../src/backdrop.js';
import { TILE, VIEW_HEIGHT } from '../src/config.js';
import { parseLevel, pixelHeight } from '../src/level.js';
import { LEVELS, TRY_LEVELS } from '../src/levels/index.js';
import { rgba } from './helpers.js';
import { loadDelivered } from './png.js';

// Each layer's picture: the asset factory's sheet, or the one drawn in
// code while it is not yet delivered.
const delivered = loadDelivered();
const imageOfLayer = (layer) => delivered[layer.name]?.images[layer.name] ?? DRAWN_LAYERS[layer.name];

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
    const image = imageOfLayer(layer);
    assert.ok(image, `nothing draws ${layer.name}`);
    const bands = backdropBands(rgba(image), image.width, image.height, TILE);
    assert.equal(bands[0].from, 0);
    assert.equal(bands.at(-1).to, image.height);
    bands.slice(1).forEach((band, i) => assert.equal(band.from, bands[i].to, `${layer.name}: a gap in the bands`));
    assert.deepEqual(redraw(image, bands), image.pixels, layer.name);
  }
});

test('backdrop layers repeat in whole tiles, back to front, the sky covering the view', () => {
  for (const layer of BACKGROUND_LAYERS) {
    assert.equal(imageOfLayer(layer).width % TILE, 0, `${layer.name} is not a whole number of tiles wide`);
  }
  const factors = BACKGROUND_LAYERS.map((layer) => layer.factor);
  assert.deepEqual(factors, [...factors].sort((a, b) => a - b));
  // Each backdrop's first layer is its sky: still, from the top, opaque
  // and as tall as the view.
  for (const [name, layers] of Object.entries(BACKDROPS)) {
    const sky = BACKGROUND_LAYERS.find((layer) => layer.name === layers[0]);
    assert.ok(sky && sky.factor === 0 && sky.top === 0, `${name} starts with no still sky`);
    const image = imageOfLayer(sky);
    assert.ok(image.height >= VIEW_HEIGHT, name);
    assert.ok(image.pixels.every((value) => value !== null), name);
  }
});

test('the horizon lies between the clouds and the flats, its foot hidden behind the flats', () => {
  const clouds = BACKGROUND_LAYERS.find((layer) => layer.name === 'clouds');
  const flats = BACKGROUND_LAYERS.find((layer) => layer.name === 'flats');
  assert.ok(HORIZON.factor > clouds.factor && HORIZON.factor < flats.factor);
  assert.equal(HORIZON.period % TILE, 0, 'its strip is not a whole number of tiles wide');
  // The two layers drift apart up and down by the difference in their
  // factors as the camera rises; the foot must stay under the flats then too.
  const rise = Math.max(...[...LEVELS, ...TRY_LEVELS].map((definition) => pixelHeight(parseLevel(definition)))) - VIEW_HEIGHT;
  assert.ok(HORIZON.base - (flats.factor - HORIZON.factor) * rise >= flats.top + imageOfLayer(flats).height);
});

test('the sky is mostly filled, not drawn', () => {
  const sky = imageOfLayer(BACKGROUND_LAYERS.find((layer) => layer.name === 'sky'));
  const bands = backdropBands(rgba(sky), sky.width, sky.height, TILE);
  const filled = bands.filter((band) => band.colour).reduce((rows, band) => rows + band.to - band.from, 0);
  assert.ok(filled > sky.height * 0.6, `${filled} of ${sky.height} rows filled`);
});

test('every backdrop shows known layers, the sky among them to cover the view, and every layer shows in one', () => {
  const known = [...BACKGROUND_LAYERS.map((layer) => layer.name), HORIZON.name];
  for (const [name, layers] of Object.entries(BACKDROPS)) {
    for (const layer of layers) assert.ok(known.includes(layer), `${name}: unknown layer '${layer}'`);
    const order = layers.filter((layer) => layer !== HORIZON.name).map((layer) => known.indexOf(layer));
    assert.deepEqual(order, [...order].sort((a, b) => a - b), `${name} is not back to front`);
  }
  const shown = new Set(Object.values(BACKDROPS).flat());
  for (const layer of known) assert.ok(shown.has(layer), `no backdrop shows '${layer}'`);
  assert.deepEqual(BACKDROPS[DEFAULT_BACKDROP], ['sky', 'clouds', 'horizon', 'flats', 'gardens']);
});

test('the countryside fills the sky above its cottages: Hanveden on the horizon, fields before it', () => {
  const layer = (name) => BACKGROUND_LAYERS.find((candidate) => candidate.name === name);
  assert.deepEqual(BACKDROPS.countryside, ['sky', 'clouds', 'hanveden', 'fields', 'gardens']);
  // Solid from its first opaque row down, so no sky shows through below its line.
  for (const name of ['hanveden', 'fields']) {
    const image = imageOfLayer(layer(name));
    for (let x = 0; x < image.width; x++) {
      let reached = false;
      for (let y = 0; y < image.height; y++) {
        const opaque = image.pixels[y * image.width + x] !== null;
        assert.ok(opaque || !reached, `${name} has a hole at ${x}, ${y}`);
        reached ||= opaque;
      }
    }
  }
  // Stacked as seen at the camera's lowest: the ridge's top over the
  // forest edge's, and that over the cottages' roofs.
  const firstRow = (shown) => {
    const image = imageOfLayer(shown);
    return image.pixels.findIndex((value) => value !== null) / image.width | 0;
  };
  const ridgeTop = layer('hanveden').top + firstRow(layer('hanveden'));
  const edgeTop = layer('fields').top + firstRow(layer('fields'));
  assert.ok(ridgeTop < edgeTop && edgeTop < layer('gardens').top, `${ridgeTop}, ${edgeTop}`);
});

test('the city stands its towers over the houses, the houses on the street, all in the palette', () => {
  const layer = (name) => BACKGROUND_LAYERS.find((candidate) => candidate.name === name);
  assert.deepEqual(BACKDROPS.city, ['night_sky', 'skyline', 'city_blocks', 'street']);
  for (const name of BACKDROPS.city) {
    for (const value of imageOfLayer(layer(name)).pixels) if (value !== null) assert.ok(isPaletteColour(value), `${name}: ${value}`);
  }
  // Where most of a layer's columns begin, at the camera's lowest.
  const roofline = (name) => {
    const image = imageOfLayer(layer(name));
    const tops = [];
    for (let x = 0; x < image.width; x++) {
      let y = 0;
      while (y < image.height && image.pixels[y * image.width + x] === null) y += 1;
      tops.push(layer(name).top + y);
    }
    return tops.sort((a, b) => a - b)[tops.length >> 1];
  };
  assert.ok(roofline('skyline') + 6 < roofline('city_blocks'), 'the city across the water shows over the roofs');
  // At the camera's lowest the street's pavement reaches up to the houses'
  // foot, so no gap shows between them.
  const blocks = layer('city_blocks');
  const street = imageOfLayer(layer('street'));
  const pavement = street.pixels.findIndex((value, index) => index % street.width === 0 && value !== null) / street.width | 0;
  assert.ok(layer('street').top + pavement <= blocks.top + imageOfLayer(blocks).height);
});

test('the small town stands no house higher than four floors, their roofs over the cottages, all in the palette', () => {
  const layer = (name) => BACKGROUND_LAYERS.find((candidate) => candidate.name === name);
  assert.deepEqual(BACKDROPS.smalltown, ['sky', 'clouds', 'low_flats', 'gardens']);
  const image = imageOfLayer(layer('low_flats'));
  for (const value of image.pixels) if (value !== null) assert.ok(isPaletteColour(value), `low_flats: ${value}`);
  // The houses stand on the lawn, its first row opaque all the way across;
  // a floor is six pixels, a roof and chimney a few more.
  const row = (shown, y) => shown.pixels.slice(y * shown.width, (y + 1) * shown.width);
  let lawn = 0;
  while (row(image, lawn).some((value) => value === null)) lawn += 1;
  const firstRow = (shown) => shown.pixels.findIndex((value) => value !== null) / shown.width | 0;
  assert.ok(lawn - firstRow(image) <= 4 * 6 + 6, `${lawn - firstRow(image)} pixels high`);
  // At the camera's lowest the highest roofs show over the gardens' tops,
  // and the lawn reaches down behind their hedge.
  const gardens = imageOfLayer(layer('gardens'));
  let hedge = 0;
  while (row(gardens, hedge).some((value) => value === null)) hedge += 1;
  assert.ok(layer('low_flats').top + firstRow(image) < layer('gardens').top + firstRow(gardens), 'hidden behind the gardens');
  assert.ok(layer('low_flats').top + lawn < layer('gardens').top + hedge, 'no lawn shows');
});
