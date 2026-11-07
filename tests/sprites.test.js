import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { PLAYER, TILE } from '../src/config.js';
import { HAZARD_BOXES } from '../src/hazards.js';
import { isOneWay, isSolid, TILE_TYPES, tileName } from '../src/level.js';
import { isPaletteColour } from '../src/palette.js';
import { coloursIn, getPixel } from '../src/pixels.js';
import {
  characterLook,
  deliveredSheets,
  MANIFEST,
  PLAYER_SPRITE,
  sheetFrames,
  SPRITES_PATH,
  TILE_SPRITES,
  tileLook,
} from '../src/sprites.js';
import { crop, readPng } from './png.js';

// The same limits as the art drawn in code (tests/art.test.js).
const MAX_COLOURS = 15;
const PLAYER_SIZE = { width: 24, height: 32 };
const ANIMATIONS_PLAYED = ['idle', 'walk', 'run', 'jump', 'fall', 'crouch', 'hurt'];

const manifest = JSON.parse(readFileSync(join(SPRITES_PATH, MANIFEST), 'utf8'));
const sheets = deliveredSheets(manifest);

// Each delivered sheet read: its description, and each frame as a pixel
// image.
function load(sheet) {
  const description = JSON.parse(readFileSync(join(SPRITES_PATH, sheet.description), 'utf8'));
  const picture = readPng(readFileSync(join(SPRITES_PATH, sheet.image)), sheet.image);
  const frames = sheetFrames(description);
  const images = Object.fromEntries(Object.entries(frames).map(([name, frame]) => [name, crop(picture, frame)]));
  return { description, picture, frames, images };
}
const loaded = Object.fromEntries(sheets.map((sheet) => [sheet.sprite, load(sheet)]));

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

function filesUnder(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

test('every delivered file is in the manifest, with its checksum', () => {
  for (const { path, sha256 } of manifest.files) {
    const actual = createHash('sha256').update(readFileSync(join(SPRITES_PATH, path))).digest('hex');
    assert.equal(actual, sha256, `${path} is not what was delivered`);
  }
  const listed = new Set([MANIFEST, ...manifest.files.map((file) => file.path)]);
  const unlisted = filesUnder(SPRITES_PATH).map((path) => path.slice(SPRITES_PATH.length + 1)).filter((path) => !listed.has(path));
  assert.deepEqual(unlisted, []);
});

test('the game knows what every delivered sprite replaces', () => {
  for (const { sprite } of sheets) assert.ok(sprite === PLAYER_SPRITE || TILE_SPRITES[sprite], `unknown sprite ${sprite}`);
  for (const char of Object.values(TILE_SPRITES)) assert.ok(TILE_TYPES[char], `no tile ${char}`);
});

test('every sheet is in the master palette, 15 colours at most, its frames on the sheet', () => {
  for (const [sprite, { picture, frames, images }] of Object.entries(loaded)) {
    const colours = new Set(Object.values(images).flatMap((image) => [...coloursIn(image)]));
    for (const colour of colours) assert.ok(isPaletteColour(colour), `${sprite}: ${colour} is not in the palette`);
    assert.ok(colours.size <= MAX_COLOURS, `${sprite} has ${colours.size} colours`);
    for (const [name, frame] of Object.entries(frames)) {
      assert.ok(frame.x + frame.w <= picture.width && frame.y + frame.h <= picture.height, `${sprite} ${name} is off the sheet`);
    }
  }
});

test("Blenke's sheet: his size, a pivot at his feet, every animation the game plays", { skip: !loaded[PLAYER_SPRITE] }, () => {
  const { description, frames, images } = loaded[PLAYER_SPRITE];
  const { animations, playback } = characterLook(description);
  for (const [name, frame] of Object.entries(frames)) {
    assert.deepEqual([frame.w, frame.h], [PLAYER_SIZE.width, PLAYER_SIZE.height], name);
    assert.equal(frame.originY, PLAYER_SIZE.height, `${name} is not placed by its feet`);
    // His 10-pixel body, centred on the origin, stays inside the frame.
    assert.ok(frame.originX - PLAYER.width / 2 >= 0 && frame.originX + PLAYER.width / 2 <= frame.w, `${name}: origin ${frame.originX}`);
  }
  for (const name of ANIMATIONS_PLAYED) {
    assert.ok(animations[name]?.length > 0, `no animation ${name}`);
    assert.ok(playback[name]?.fps > 0, `no playback for ${name}`);
    for (const frame of animations[name]) assert.ok(images[frame], `${name} lacks frame ${frame}`);
  }
  for (const name of ['idle', 'walk', 'crouch'].flatMap((animation) => animations[animation])) {
    assert.equal(rowsUsed(images[name]).bottom, PLAYER_SIZE.height - 1, `${name} floats`);
  }
  for (const name of animations.crouch) {
    const { top, bottom } = rowsUsed(images[name]);
    assert.ok(bottom - top + 1 <= TILE, `${name} is ${bottom - top + 1} high crouched`);
  }
});

test('tile sheets: tile-sized, solid ones and liquids without holes, liquids moving', () => {
  for (const [sprite, char] of Object.entries(TILE_SPRITES)) {
    if (!loaded[sprite]) continue;
    const { description, images } = loaded[sprite];
    const type = TILE_TYPES[char];
    const look = tileLook(description, isSolid(char));
    for (const [name, image] of Object.entries(images)) assert.deepEqual([image.width, image.height], [TILE, TILE], `${sprite} ${name}`);
    if (isSolid(char)) assert.ok(look.fill?.length > 0, `${sprite} has nothing to fill with`);
    if ((isSolid(char) && !type.seeThrough) || type.liquid) {
      for (const name of look.fill) assert.ok(images[name].pixels.every((value) => value !== null), `${sprite} ${name} has a hole`);
    }
    if (type.liquid) assert.ok(look.fps > 0, `${sprite} doesn't move`);
    if (isOneWay(char)) for (const name of look.top) assert.notEqual(getPixel(images[name], 0, 0), null, `${sprite} ${name} has no top surface`);
  }
});

test('hazards are drawn where they hurt: liquid surfaces and the needles', () => {
  for (const [sprite, char] of Object.entries(TILE_SPRITES)) {
    const box = HAZARD_BOXES[tileName(char)];
    if (!loaded[sprite] || !box) continue;
    const { description, images } = loaded[sprite];
    for (const name of tileLook(description, isSolid(char)).top) {
      const { top } = rowsUsed(images[name]);
      assert.ok(Math.abs(top - box.y) <= 1, `${sprite} ${name} starts at y = ${top}, the game counts from y = ${box.y}`);
    }
  }
});

const description = (frames, extra = {}) => ({
  frames: Object.fromEntries(frames.map((name) => [name, { frame: { x: 0, y: 0, w: 16, h: 16 }, origin: { x: 0, y: 0 } }])),
  meta: { sprite: 'test' },
  ...extra,
});

test('a tile sheet with one look uses it as fill under solid tiles only', () => {
  assert.deepEqual(tileLook(description(['top_1']), true), { top: ['top_1'], fill: ['top_1'] });
  assert.deepEqual(tileLook(description(['top_1']), false), { top: ['top_1'], fill: undefined });
  assert.deepEqual(tileLook(description(['top_1', 'top_2', 'fill_1']), true), { top: ['top_1', 'top_2'], fill: ['fill_1'] });
  assert.throws(() => tileLook(description(['side_1']), true), /no top frames/);
});

test('an animated tile sheet plays its frames in order at its rate', () => {
  const look = tileLook(
    description(['top_2', 'top_1'], { animations: { top: ['top_1', 'top_2'] }, meta: { sprite: 'w', playback: { top: { fps: 3 } } } }),
    false,
  );
  assert.deepEqual(look, { top: ['top_1', 'top_2'], fill: undefined, fps: 3 });
});

test('a sprite delivered without its picture or description is refused', () => {
  assert.throws(() => deliveredSheets({ files: [{ sprite: 'x', path: 'tiles/x.png' }] }), /without its picture or description/);
});
