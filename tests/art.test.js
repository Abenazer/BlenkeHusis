import test from 'node:test';
import assert from 'node:assert/strict';
import { BACKGROUND_LAYERS } from '../src/art/backgrounds.js';
import { ENEMY_ART, ENEMY_PIVOT, ENEMY_SIZE, PROJECTILE_ART } from '../src/art/enemies.js';
import { HUD_ICONS, ITEM_ART } from '../src/art/items.js';
import { LELLE_ANIMATIONS, LELLE_FRAMES, LELLE_PIVOT, LELLE_PLAYBACK, LELLE_SIZE } from '../src/art/lelle.js';
import { LEAK_ART, PLATFORM_ART, TILE_ART } from '../src/art/tiles.js';
import { PLAYER, TILE, VIEW_HEIGHT } from '../src/config.js';
import { ENEMIES } from '../src/enemies.js';
import { LEAK_WIDTH } from '../src/hazards.js';
import { ITEMS } from '../src/items.js';
import { isOneWay, isSolid, TILE_TYPES } from '../src/level.js';
import { PLATFORM_THICKNESS } from '../src/platforms.js';
import { PROJECTILES } from '../src/projectiles.js';
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
const itemImages = [...Object.values(ITEM_ART), ...Object.values(HUD_ICONS)];
const enemyLooks = Object.values(ENEMY_ART).flat();
const enemyImages = enemyLooks.flatMap((look) => [...look.move, look.act, look.defeated].filter(Boolean));
const projectileImages = Object.values(PROJECTILE_ART).flatMap((art) => art.frames);
const otherImages = [PLATFORM_ART, ...LEAK_ART.frames];

test('all art is drawn in the master palette', () => {
  const everything = [...lelleFrames, ...tileImages, ...layerImages, ...itemImages, ...enemyImages, ...projectileImages, ...otherImages];
  for (const colour of allColours(everything)) {
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
  for (const name of ['idle', 'walk', 'run', 'jump', 'fall', 'crouch', 'hurt']) {
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

test('every tile type has art, tile-sized, solid tiles and liquids without holes', () => {
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
    if ((isSolid(char) && !type.seeThrough) || type.liquid) {
      for (const image of art.fill) assert.ok(image.pixels.every((value) => value !== null), `tile ${char} has a hole`);
    }
    if (type.liquid) assert.ok(art.fps > 0 && art.fill.length > 0, `liquid ${char} doesn't move`);
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

test('every item has art that fits its tile, trimmed to its outline, in one palette', () => {
  for (const type of Object.keys(ITEMS)) {
    const image = ITEM_ART[type];
    assert.ok(image, `no art for item ${type}`);
    assert.ok(image.width <= TILE && image.height <= TILE, `${type} is bigger than a tile`);
    assert.ok(coloursIn(image).size <= MAX_COLOURS, `${type} has too many colours`);
    const { top, bottom } = rowsUsed(image);
    assert.equal(top, 0, `${type} has empty rows on top`);
    assert.equal(bottom, image.height - 1, `${type} has empty rows below`);
  }
});

test('every enemy has a look per variant: moving frames, its act, defeated, in one palette', () => {
  for (const [type, enemy] of Object.entries(ENEMIES)) {
    const looks = ENEMY_ART[type];
    assert.equal(looks?.length, enemy.variants ?? 1, `${type} has the wrong number of looks`);
    for (const look of looks) {
      assert.ok(look.move.length > 0, `${type} has no frames`);
      if (enemy.throws) assert.ok(look.act, `${type} throws without a pose for it`);
      const images = [...look.move, look.act, look.defeated].filter(Boolean);
      assert.ok(allColours(images).size <= MAX_COLOURS, `${type} has too many colours`);
      for (const image of images) {
        assert.equal(image.width, ENEMY_SIZE.width, type);
        assert.equal(image.height, ENEMY_SIZE.height, type);
      }
      for (const image of [...look.move, look.defeated]) assert.equal(rowsUsed(image).bottom, ENEMY_SIZE.height - 1, `${type} floats`);
      assert.ok(rowsUsed(look.defeated).top > rowsUsed(look.move[0]).top + enemy.height / 3, `${type} isn't flattened`);
    }
    assert.ok(enemy.width <= ENEMY_SIZE.width && enemy.height <= ENEMY_SIZE.height, `${type} is bigger than its frame`);
  }
  assert.deepEqual(ENEMY_PIVOT, { x: ENEMY_SIZE.width / 2, y: ENEMY_SIZE.height });
});

test('everything thrown has frames about its own size', () => {
  for (const [type, projectile] of Object.entries(PROJECTILES)) {
    const art = PROJECTILE_ART[type];
    assert.ok(art?.fps > 0 && art.frames.length > 0, `no art for ${type}`);
    for (const image of art.frames) {
      assert.ok(Math.max(image.width, image.height) <= 2 * Math.max(projectile.width, projectile.height), `${type} is drawn too big`);
    }
  }
});

test('the moving platform and the sewage stream fit what they draw', () => {
  assert.equal(PLATFORM_ART.width, TILE);
  assert.equal(PLATFORM_ART.height, PLATFORM_THICKNESS);
  for (const image of LEAK_ART.frames) {
    assert.equal(image.width, LEAK_WIDTH);
    assert.equal(image.height, TILE);
  }
});
