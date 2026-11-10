import test from 'node:test';
import assert from 'node:assert/strict';
import { BACKGROUND_LAYERS, HORIZON } from '../src/art/backgrounds.js';
import { CITIZEN_ART } from '../src/art/citizens.js';
import { EFFECT_ART } from '../src/art/effects.js';
import { PROP_ART, SIGN_ART } from '../src/art/props.js';
import { CITIZENS } from '../src/citizens.js';
import { CHECKPOINT_SIZE, GOAL_SIZE } from '../src/landmarks.js';
import { SCENERY } from '../src/scenery.js';
import { PROPS } from '../src/props.js';
import { BOSS_PIPS, ENEMY_ART, ENEMY_PIVOT, ENEMY_SIZE, enemyFrameSize, PROJECTILE_ART } from '../src/art/enemies.js';
import { CHECKPOINT_ART, GOAL_ART, SCENERY_ART, stationSign } from '../src/art/scenery.js';
import { HOUSE_SIZE, NEEDLE_STEPS, needleStep, STATION_ART } from '../src/art/station.js';
import { PUMP_SIZE } from '../src/station.js';
import { HUD_ICONS, ITEM_ART, POWER_UP_GLOW } from '../src/art/items.js';
import { PLAYER_ANIMATIONS, PLAYER_FRAMES, PLAYER_PIVOT, PLAYER_PLAYBACK, PLAYER_SIZE } from '../src/art/player.js';
import { LEAK_ART, PLATFORM_ART, TILE_ART } from '../src/art/tiles.js';
import { TOUCH_ART, TURN_ART } from '../src/art/touch.js';
import { bigText, GAME_OVER_HEADING, LOGO, TAG_LETTER_ART } from '../src/art/logo.js';
import { PLAYER, TILE, VIEW_HEIGHT, VIEW_WIDTH } from '../src/config.js';
import { ENEMIES } from '../src/enemies.js';
import { LEAK_WIDTH } from '../src/hazards.js';
import { ITEMS } from '../src/items.js';
import { isOneWay, isSolid, parseLevel, pixelHeight, TILE_TYPES } from '../src/level.js';
import { LEVELS, TRY_LEVELS } from '../src/levels/index.js';
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

const playerFrames = Object.values(PLAYER_FRAMES);
const tileImages = Object.values(TILE_ART).flatMap((art) => [...(art.top ?? []), ...(art.fill ?? [])]);
const layerImages = BACKGROUND_LAYERS.map((layer) => layer.image);
const itemImages = [...Object.values(ITEM_ART), ...Object.values(HUD_ICONS)];
const enemyLooks = Object.values(ENEMY_ART).flat();
const enemyImages = enemyLooks.flatMap((look) => [...look.move, look.act, look.defeated].filter(Boolean));
const projectileImages = Object.values(PROJECTILE_ART).flatMap((art) => art.frames);
const citizenImages = Object.values(CITIZEN_ART).flatMap((look) => [look.stand, look.wave]);
const otherImages = [
  ...Object.values(POWER_UP_GLOW.frames).flat(),
  PLATFORM_ART,
  ...LEAK_ART.frames,
  ...Object.values(PROP_ART),
  SIGN_ART,
  ...citizenImages,
  ...Object.values(EFFECT_ART).flatMap((effect) => effect.frames),
  ...Object.values(SCENERY_ART),
  CHECKPOINT_ART.unlit,
  ...CHECKPOINT_ART.lit,
  ...GOAL_ART.frames,
  ...Object.values(BOSS_PIPS),
  STATION_ART.house,
  STATION_ART.pump,
  STATION_ART.hose,
  ...STATION_ART.needles,
];
const tagImages = Object.values(TAG_LETTER_ART).flatMap((letters) => Object.values(letters));
const touchImages = [TOUCH_ART.pad, ...['knob', 'jump', 'act', 'pause'].flatMap((name) => Object.values(TOUCH_ART[name]))];

test('all art is drawn in the master palette', () => {
  const everything = [...playerFrames, ...tileImages, ...layerImages, ...itemImages, ...enemyImages, ...projectileImages, ...otherImages, ...touchImages, ...tagImages, TURN_ART];
  for (const colour of allColours(everything)) {
    assert.ok(isPaletteColour(colour), `${colour} is not in the palette`);
  }
});

test('the touch controls keep to one palette, round and odd-sized so they centre on their place', () => {
  const colours = allColours(touchImages).size;
  assert.ok(colours <= MAX_COLOURS, `the touch controls have ${colours} colours`);
  for (const image of touchImages) {
    assert.equal(image.width, image.height);
    assert.equal(image.width % 2, 1);
  }
});

test('Blenke keeps to one 15-colour palette in frames of his size', () => {
  const colours = allColours(playerFrames).size;
  assert.ok(colours <= MAX_COLOURS, `Blenke has ${colours} colours`);
  for (const [name, frame] of Object.entries(PLAYER_FRAMES)) {
    assert.equal(frame.width, PLAYER_SIZE.width, name);
    assert.equal(frame.height, PLAYER_SIZE.height, name);
  }
  assert.deepEqual(PLAYER_PIVOT, { x: PLAYER_SIZE.width / 2, y: PLAYER_SIZE.height });
});

test('every animation the game plays exists, with its frames and playback', () => {
  for (const name of ['idle', 'walk', 'run', 'jump', 'fall', 'crouch', 'hurt']) {
    assert.ok(PLAYER_ANIMATIONS[name]?.length > 0, `no animation ${name}`);
    assert.ok(PLAYER_PLAYBACK[name]?.fps > 0, `no playback for ${name}`);
    for (const frame of PLAYER_ANIMATIONS[name]) assert.ok(PLAYER_FRAMES[frame], `${name} lacks frame ${frame}`);
  }
});

test('Blenke stands on the bottom of his frame except mid-stride or in the air', () => {
  const grounded = ['idle', 'walk', 'crouch'].flatMap((name) => PLAYER_ANIMATIONS[name]);
  for (const name of grounded) assert.equal(rowsUsed(PLAYER_FRAMES[name]).bottom, PLAYER_SIZE.height - 1, name);
});

test('crouching, Blenke fits a one-tile-high tunnel', () => {
  assert.ok(PLAYER.crouchHeight <= TILE);
  for (const name of PLAYER_ANIMATIONS.crouch) {
    const { top, bottom } = rowsUsed(PLAYER_FRAMES[name]);
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

test('the horizon lies between the clouds and the flats, its foot hidden behind the flats', () => {
  const clouds = BACKGROUND_LAYERS.find((layer) => layer.name === 'clouds');
  const flats = BACKGROUND_LAYERS.find((layer) => layer.name === 'flats');
  assert.ok(HORIZON.factor > clouds.factor && HORIZON.factor < flats.factor);
  assert.equal(HORIZON.period % TILE, 0, 'its strip is not a whole number of tiles wide');
  // The two layers drift apart up and down by the difference in their
  // factors as the camera rises; the foot must stay under the flats then too.
  const rise = Math.max(...[...LEVELS, ...TRY_LEVELS].map((definition) => pixelHeight(parseLevel(definition)))) - VIEW_HEIGHT;
  assert.ok(HORIZON.base - (flats.factor - HORIZON.factor) * rise >= flats.top + flats.image.height);
});

test('every level\'s station name fits its name board, in the board\'s colours', () => {
  for (const { id, stationName } of [...LEVELS, ...TRY_LEVELS]) {
    if (!stationName) continue;
    const board = stationSign(stationName);
    assert.ok(coloursIn(board).size <= MAX_COLOURS, id);
    assert.ok(coloursIn(board).size > coloursIn(SCENERY_ART.stationSign).size, `${id}'s board shows no name`);
  }
  assert.throws(() => stationSign('W'.repeat(40)), /doesn't fit/);
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

test('a power-up glows round its outline in shifting colours, and nothing else does', () => {
  const powerUps = Object.keys(ITEMS).filter((type) => ITEMS[type].category === 'powerUp');
  assert.deepEqual(Object.keys(POWER_UP_GLOW.frames).sort(), [...powerUps].sort());
  assert.ok(POWER_UP_GLOW.fps > 0);
  for (const type of powerUps) {
    const item = ITEM_ART[type];
    const frames = POWER_UP_GLOW.frames[type];
    assert.ok(new Set(frames.map((frame) => [...coloursIn(frame)].join())).size > 2, `${type}'s glow doesn't shift`);
    for (const frame of frames) {
      assert.equal(frame.width, item.width + 2, type);
      assert.equal(frame.height, item.height + 2, type);
      assert.ok(frame.width <= TILE && frame.height <= TILE, `${type}'s glow is bigger than a tile`);
      for (let y = 0; y < frame.height; y++) {
        for (let x = 0; x < frame.width; x++) {
          const under = getPixel(item, x - 1, y - 1) !== null;
          let beside = false;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) beside ||= getPixel(item, x - 1 + dx, y - 1 + dy) !== null;
          }
          assert.equal(getPixel(frame, x, y) !== null, beside && !under, `${type}'s glow at ${x},${y}`);
        }
      }
    }
  }
});

test('every enemy has a look per variant: moving frames, its act, defeated, in one palette', () => {
  for (const [type, enemy] of Object.entries(ENEMIES)) {
    const size = enemyFrameSize(type);
    const looks = ENEMY_ART[type];
    assert.equal(looks?.length, enemy.variants ?? 1, `${type} has the wrong number of looks`);
    for (const look of looks) {
      assert.ok(look.move.length > 0, `${type} has no frames`);
      if (enemy.throws) assert.ok(look.act, `${type} throws without a pose for it`);
      const images = [...look.move, look.act, look.defeated].filter(Boolean);
      assert.ok(allColours(images).size <= MAX_COLOURS, `${type} has too many colours`);
      for (const image of images) {
        assert.equal(image.width, size.width, type);
        assert.equal(image.height, size.height, type);
      }
      for (const image of [...look.move, look.defeated]) assert.equal(rowsUsed(image).bottom, size.height - 1, `${type} floats`);
      assert.ok(rowsUsed(look.defeated).top > rowsUsed(look.move[0]).top + enemy.height / 3, `${type} isn't flattened`);
    }
    assert.ok(enemy.width <= size.width && enemy.height <= size.height, `${type} is bigger than its frame`);
    if (!enemy.boss && !enemy.deck) assert.deepEqual(size, ENEMY_SIZE, `${type} is neither a boss nor carries a deck but has a frame of its own`);
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

test('every citizen has a look, standing and waving, in its frame and one palette', () => {
  for (const [type, citizen] of Object.entries(CITIZENS)) {
    const look = CITIZEN_ART[type];
    assert.ok(look?.stand && look.wave, `no art for ${type}`);
    assert.ok(allColours([look.stand, look.wave]).size <= MAX_COLOURS, `${type} has too many colours`);
    for (const image of [look.stand, look.wave]) {
      assert.equal(image.width, ENEMY_SIZE.width, type);
      assert.equal(image.height, ENEMY_SIZE.height, type);
      assert.equal(rowsUsed(image).bottom, ENEMY_SIZE.height - 1, `${type} floats`);
    }
    assert.ok(citizen.width <= ENEMY_SIZE.width && citizen.height <= ENEMY_SIZE.height, `${type} is bigger than its frame`);
  }
});

test('every prop is drawn the size of its body, and a sign fills its tile', () => {
  for (const [type, prop] of Object.entries(PROPS)) {
    assert.equal(PROP_ART[type]?.width, prop.width, type);
    assert.equal(PROP_ART[type].height, prop.height, type);
  }
  assert.equal(SIGN_ART.width, TILE);
  assert.equal(SIGN_ART.height, TILE);
});

test('every effect has frames to play', () => {
  for (const [name, effect] of Object.entries(EFFECT_ART)) {
    assert.ok(effect.fps > 0 && effect.frames.length > 0, name);
    assert.ok(allColours(effect.frames).size <= MAX_COLOURS, `${name} has too many colours`);
  }
});

test('every piece of scenery is drawn its size, standing on its bottom row, in one palette', () => {
  for (const [type, piece] of Object.entries(SCENERY)) {
    const image = SCENERY_ART[type];
    assert.ok(image, `no art for ${type}`);
    assert.equal(image.width, piece.width, type);
    assert.equal(image.height, piece.height, type);
    assert.equal(rowsUsed(image).bottom, piece.height - 1, `${type} floats`);
    assert.ok(coloursIn(image).size <= MAX_COLOURS, `${type} has too many colours`);
  }
});

test('the checkpoint and the goal are drawn their size, standing on their bottom row', () => {
  const checkpoints = [CHECKPOINT_ART.unlit, ...CHECKPOINT_ART.lit];
  assert.ok(CHECKPOINT_ART.fps > 0 && CHECKPOINT_ART.lit.length > 1, 'the light does not flash');
  assert.ok(GOAL_ART.fps > 0 && GOAL_ART.frames.length > 1, 'the flag does not wave');
  for (const [images, size] of [[checkpoints, CHECKPOINT_SIZE], [GOAL_ART.frames, GOAL_SIZE]]) {
    assert.ok(allColours(images).size <= MAX_COLOURS);
    for (const image of images) {
      assert.equal(image.width, size.width);
      assert.equal(image.height, size.height);
      assert.equal(rowsUsed(image).bottom, size.height - 1);
    }
  }
});

test('the police station and its pump stand on their bottom row, each in one palette', () => {
  for (const [image, size] of [[STATION_ART.house, HOUSE_SIZE], [STATION_ART.pump, PUMP_SIZE]]) {
    assert.equal(image.width, size.width);
    assert.equal(image.height, size.height);
    assert.equal(rowsUsed(image).bottom, size.height - 1);
    assert.ok(coloursIn(image).size <= MAX_COLOURS);
  }
  assert.ok(allColours([STATION_ART.pump, STATION_ART.hose, ...STATION_ART.needles]).size <= MAX_COLOURS, 'the pump, hose and needle share one palette');
});

test('the needle has a picture for every step from 0 to MAX, each different', () => {
  assert.equal(STATION_ART.needles.length, NEEDLE_STEPS);
  assert.equal(needleStep(0), 0);
  assert.equal(needleStep(1), NEEDLE_STEPS - 1);
  assert.equal(needleStep(2), NEEDLE_STEPS - 1, 'past MAX the needle stays at MAX');
  const pictures = new Set(STATION_ART.needles.map((image) => image.pixels.join()));
  assert.equal(pictures.size, NEEDLE_STEPS);
});

test('the logo fits the view in one palette', () => {
  assert.ok(LOGO.width <= VIEW_WIDTH && LOGO.height <= VIEW_HEIGHT / 2);
  assert.ok(coloursIn(LOGO).size <= MAX_COLOURS);
  for (const value of coloursIn(LOGO)) assert.ok(isPaletteColour(value));
});

test('big text reaches above the capitals for Å, Ä and Ö, and the game over heading fits', () => {
  const bands = Array(7).fill('red_3');
  assert.ok(bigText('Ä', 3, bands).height > bigText('A', 3, bands).height);
  assert.throws(() => bigText('A', 3, ['red_3']), /a band for each/);
  assert.ok(GAME_OVER_HEADING.width <= VIEW_WIDTH);
  assert.ok(coloursIn(GAME_OVER_HEADING).size <= MAX_COLOURS);
});
