import test from 'node:test';
import assert from 'node:assert/strict';
import { BACKGROUND_LAYERS } from '../src/art/backgrounds.js';
import { LELLE_ANIMATIONS, LELLE_FRAMES, LELLE_PIVOT, LELLE_PLAYBACK, LELLE_SIZE } from '../src/art/lelle.js';
import { TILE_ART } from '../src/art/tiles.js';
import { PLAYER, TILE, VIEW_HEIGHT } from '../src/config.js';
import { isOneWay, isSolid, TILE_TYPES } from '../src/level.js';
import { isPaletteColour } from '../src/palette.js';
import { coloursIn, getPixel } from '../src/pixels.js';

// One SNES palette per sprite: 15 colours and transparent.
const MAX_COLOURS = 15;

function allColours(images) {
  const colours = new Set();
  for (const image of images) for (const value of coloursIn(image)) colours.add(value);
  return colours;
}

function rowsUsed(image) {
  const rows = [];
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if (getPixel(image, x, y) !== null) {
        rows.push(y);
        break;
      }
    }
  }
  return { top: rows[0], bottom: rows[rows.length - 1] };
}

const lelleFrames = Object.values(LELLE_FRAMES);
const tileImages = Object.values(TILE_ART).flatMap((art) => [...(art.top ?? []), ...(art.fill ?? [])]);
const layerImages = BACKGROUND_LAYERS.map((layer) => layer.image);

test('all art is drawn in the master palette', () => {
  for (const colour of allColours([...lelleFrames, ...tileImages, ...layerImages])) {
    assert.ok(isPaletteColour(colour), `${colour} is not in the palette`);
  }
});

test('Lelle keeps to one 15-colour palette in frames of his size', () => {
  const colours = allColours(lelleFrames).size;
  assert.ok(colours <= MAX_COLOURS, `Lelle has ${colours} colours`);
  for (const [name, frame] of Object.entries(LELLE_FRAMES)) {
    assert.equal(frame.width, LELLE_SIZE.width, name);
    assert.equal(frame.height, LELLE_SIZE.height, name);
  }
  assert.deepEqual(LELLE_PIVOT, { x: LELLE_SIZE.width / 2, y: LELLE_SIZE.height });
});

test('every animation the game plays exists, with its frames and playback', () => {
  for (const name of ['idle', 'walk', 'run', 'jump', 'fall', 'crouch']) {
    assert.ok(LELLE_ANIMATIONS[name]?.length > 0, `no animation ${name}`);
    assert.ok(LELLE_PLAYBACK[name]?.fps > 0, `no playback for ${name}`);
    for (const frame of LELLE_ANIMATIONS[name]) assert.ok(LELLE_FRAMES[frame], `${name} lacks frame ${frame}`);
  }
});

test('Lelle stands on the bottom of his frame except mid-stride or in the air', () => {
  const grounded = ['idle', 'walk', 'crouch'].flatMap((name) => LELLE_ANIMATIONS[name]);
  for (const name of grounded) assert.equal(rowsUsed(LELLE_FRAMES[name]).bottom, LELLE_SIZE.height - 1, name);
});

test('crouching, Lelle fits a one-tile-high tunnel', () => {
  assert.ok(PLAYER.crouchHeight <= TILE);
  for (const name of LELLE_ANIMATIONS.crouch) {
    const { top, bottom } = rowsUsed(LELLE_FRAMES[name]);
    assert.ok(bottom - top + 1 <= TILE, `${name} is ${bottom - top + 1} high`);
  }
});

test('every tile type has art, tile-sized, solid tiles without holes', () => {
  for (const [char, type] of Object.entries(TILE_TYPES)) {
    const art = TILE_ART[char];
    assert.ok(art?.top?.length > 0, `no art for tile ${char} (${type.name})`);
    if (isSolid(char)) assert.ok(art.fill?.length > 0, `no fill for solid tile ${char}`);
    const images = [...art.top, ...(art.fill ?? [])];
    assert.ok(allColours(images).size <= MAX_COLOURS, `tile ${char} has too many colours`);
    for (const image of images) {
      assert.equal(image.width, TILE);
      assert.equal(image.height, TILE);
    }
    if (isSolid(char)) {
      for (const image of art.fill) assert.ok(image.pixels.every((value) => value !== null), `tile ${char} has a hole`);
    }
    if (isOneWay(char)) assert.notEqual(getPixel(art.top[0], 0, 0), null, `one-way tile ${char} has no top surface`);
  }
});

test('backdrop layers repeat in whole tiles, back to front, the sky covering the view', () => {
  for (const layer of BACKGROUND_LAYERS) {
    assert.equal(layer.image.width % TILE, 0, `${layer.name} is not a whole number of tiles wide`);
  }
  const factors = BACKGROUND_LAYERS.map((layer) => layer.factor);
  assert.deepEqual(factors, [...factors].sort((a, b) => a - b));
  const [sky] = BACKGROUND_LAYERS;
  assert.equal(sky.factor, 0);
  assert.equal(sky.top, 0);
  assert.ok(sky.image.height >= VIEW_HEIGHT);
  assert.ok(sky.image.pixels.every((value) => value !== null));
});
