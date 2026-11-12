import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { BACKGROUND_LAYERS, HORIZON } from '../src/art/backgrounds.js';
import { ENEMY_ART, enemyFrameSize, PROJECTILE_ART } from '../src/art/enemies.js';
import { glowFrames, HUD_ICONS, ITEM_ART } from '../src/art/items.js';
import { PLAYER, TILE, VIEW_WIDTH } from '../src/config.js';
import { ENEMIES } from '../src/enemies.js';
import { HAZARD_BOXES, LEAK_WIDTH } from '../src/hazards.js';
import { GOAL_SIZE } from '../src/landmarks.js';
import { CITIZENS } from '../src/citizens.js';
import { PUMP_SIZE } from '../src/station.js';
import { HOUSE_SIZE } from '../src/art/station.js';
import { PROP_ART, SIGN_ART, wornLooks } from '../src/art/props.js';
import { PLATFORM_ART } from '../src/art/tiles.js';
import { EFFECT_ART } from '../src/art/effects.js';
import { PROPS } from '../src/props.js';
import { ITEMS } from '../src/items.js';
import { isOneWay, isSolid, TILE_TYPES, tileName } from '../src/level.js';
import { isPaletteColour } from '../src/palette.js';
import { PROJECTILES } from '../src/projectiles.js';
import { coloursIn, getPixel } from '../src/pixels.js';
import { SCENERY } from '../src/scenery.js';
import { SCENERY_ART } from '../src/art/scenery.js';
import {
  BACKGROUND_SPRITES,
  backgroundFrame,
  characterLook,
  AWAITING,
  CHECKPOINT_SPRITE,
  checkpointLook,
  CITIZEN_SPRITES,
  citizenLook,
  deliveredSheets,
  EFFECT_SPRITES,
  effectLook,
  ENEMY_SPRITES,
  enemyLook,
  GOAL_SPRITE,
  goalLook,
  HORIZON_SPRITE,
  HUD_SPRITES,
  ITEM_SPRITES,
  LEAK_SPRITE,
  leakLook,
  MANIFEST,
  PLATFORM_SPRITE,
  PLAYER_SPRITE,
  PROJECTILE_SPRITES,
  projectileLook,
  PROP_SPRITES,
  SCENERY_SPRITES,
  sceneryLook,
  sceneryPieces,
  SIGN_SPRITE,
  STATION_SPRITES,
  onlyFrame,
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

// The smallest box holding every opaque pixel: { left, top, right, bottom },
// right and bottom exclusive.
function opaqueBox(image) {
  const box = { left: image.width, top: image.height, right: 0, bottom: 0 };
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if (getPixel(image, x, y) === null) continue;
      box.left = Math.min(box.left, x);
      box.top = Math.min(box.top, y);
      box.right = Math.max(box.right, x + 1);
      box.bottom = Math.max(box.bottom, y + 1);
    }
  }
  return box;
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
  for (const { sprite } of sheets) {
    const known = [PLAYER_SPRITE, CHECKPOINT_SPRITE, HORIZON_SPRITE, GOAL_SPRITE, SIGN_SPRITE, PLATFORM_SPRITE, LEAK_SPRITE].includes(sprite) || CITIZEN_SPRITES.includes(sprite) || STATION_SPRITES[sprite] || EFFECT_SPRITES[sprite] || PROP_SPRITES.includes(sprite) || TILE_SPRITES[sprite] || SCENERY_SPRITES[sprite]
      || ENEMY_SPRITES[sprite] || PROJECTILE_SPRITES.includes(sprite)
      || BACKGROUND_SPRITES.includes(sprite) || ITEM_SPRITES[sprite] || HUD_SPRITES[sprite];
    assert.ok(known, `unknown sprite ${sprite}`);
  }
  for (const char of Object.values(TILE_SPRITES)) assert.ok(TILE_TYPES[char], `no tile ${char}`);
  const layers = BACKGROUND_LAYERS.map((layer) => layer.name);
  for (const name of BACKGROUND_SPRITES) assert.ok(layers.includes(name), `no backdrop layer ${name}`);
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

test('each enemy sprite draws one known type and colour variant, and every one has its own', () => {
  const drawn = Object.values(ENEMY_SPRITES).map(({ type, variant }) => `${type} ${variant}`);
  assert.equal(new Set(drawn).size, drawn.length, 'two sprites draw the same enemy');
  const enemies = Object.entries(ENEMY_ART)
    .filter(([type]) => !AWAITING.enemies.includes(type))
    .flatMap(([type, looks]) => looks.map((_, variant) => `${type} ${variant}`));
  assert.deepEqual([...drawn].sort(), [...enemies].sort());
  for (const type of AWAITING.enemies) assert.ok(ENEMY_ART[type], `${type} awaits a sheet but isn't an enemy`);
  for (const { type } of Object.values(ENEMY_SPRITES)) assert.ok(ENEMIES[type], `no enemy ${type}`);
});

test("enemy sheets: the game's own size for them, placed by their feet, an act frame where they throw", () => {
  for (const [sprite, { type }] of Object.entries(ENEMY_SPRITES)) {
    if (!loaded[sprite]) continue;
    const { description, frames, images } = loaded[sprite];
    const { move, act, defeated } = enemyLook(description);
    assert.equal(act !== null, Boolean(ENEMIES[type].throws), `${sprite}: an act frame only where it throws or shouts`);
    for (const name of [...move, act, defeated].filter(Boolean)) {
      const frame = frames[name];
      assert.ok(frame, `${sprite} lacks frame ${name}`);
      assert.equal(frame.originY, frame.h, `${sprite} ${name} is not placed by its feet`);
      assert.ok(frame.originX - ENEMIES[type].width / 2 >= 0 && frame.originX + ENEMIES[type].width / 2 <= frame.w, `${sprite} ${name}: origin ${frame.originX}`);
      assert.equal(rowsUsed(images[name]).bottom, frame.h - 1, `${sprite} ${name} floats`);
    }
    // As tall as the enemy drawn in code (the author, 2026-11-08); a step
    // that sinks the head or a hand held up may take a pixel off.
    for (const name of [...move, act].filter(Boolean)) {
      const { top, bottom } = rowsUsed(images[name]);
      const figure = bottom - top + 1;
      assert.ok(figure <= enemyFrameSize(type).height && figure >= enemyFrameSize(type).height - 1, `${sprite} ${name} is ${figure} px tall`);
    }
  }
});

test('an enemy sheet without a move and a defeated animation is refused', () => {
  const meta = { sprite: 'stoner' };
  assert.deepEqual(enemyLook({ animations: { move: ['a', 'b'], defeated: ['d'] }, meta }), { move: ['a', 'b'], act: null, defeated: 'd' });
  assert.deepEqual(enemyLook({ animations: { move: ['a'], act: ['t'], defeated: ['d'] }, meta }), { move: ['a'], act: 't', defeated: 'd' });
  assert.throws(() => enemyLook({ animations: { move: ['a'] }, meta }), /a move and a defeated/);
  assert.throws(() => enemyLook({ animations: { defeated: ['d'] }, meta }), /a move and a defeated/);
});

test('every projectile type has a sprite named after it, and every projectile sprite a type', () => {
  const awaited = (type) => !AWAITING.projectiles.includes(type);
  assert.deepEqual([...PROJECTILE_SPRITES].sort(), Object.keys(PROJECTILES).filter(awaited).sort());
  assert.deepEqual([...PROJECTILE_SPRITES].sort(), Object.keys(PROJECTILE_ART).filter(awaited).sort());
});

test('projectile sheets: as big as the ones drawn in code, every frame centred on its origin', () => {
  for (const sprite of PROJECTILE_SPRITES) {
    if (!loaded[sprite]) continue;
    const { description, frames, images } = loaded[sprite];
    const { frames: names } = projectileLook(description);
    // The first frame is the thing as it is drawn in code (the author,
    // 2026-11-08: the size it has now); the others may turn it.
    const first = opaqueBox(images[names[0]]);
    const drawn = PROJECTILE_ART[sprite].frames[0];
    assert.deepEqual([first.right - first.left, first.bottom - first.top], [drawn.width, drawn.height], `${sprite} ${names[0]}`);
    for (const name of names) {
      const frame = frames[name];
      assert.ok(frame, `${sprite} lacks frame ${name}`);
      const box = opaqueBox(images[name]);
      // Drawn on the thrown thing's middle: half a pixel off at most, where
      // a side is odd.
      assert.ok(Math.abs((box.left + box.right) / 2 - frame.originX) <= 0.5, `${sprite} ${name} is not centred across its origin`);
      assert.ok(Math.abs((box.top + box.bottom) / 2 - frame.originY) <= 0.5, `${sprite} ${name} is not centred down its origin`);
    }
  }
});

test('a projectile sheet without a fly animation and its playback is refused', () => {
  const meta = { sprite: 'tube' };
  assert.deepEqual(projectileLook({ animations: { fly: ['a', 'b'] }, meta: { ...meta, playback: { fly: { fps: 8 } } } }), { frames: ['a', 'b'], fps: 8 });
  assert.throws(() => projectileLook({ animations: {}, meta: { ...meta, playback: {} } }), /fly animation/);
  assert.throws(() => projectileLook({ animations: { fly: ['a'] }, meta: { ...meta, playback: {} } }), /no playback for fly/);
});

test('the checkpoint\'s sheet: unlit and lit, every frame the same size, standing on the middle of its foot', { skip: !loaded[CHECKPOINT_SPRITE] }, () => {
  const { description, frames, images } = loaded[CHECKPOINT_SPRITE];
  const { unlit, lit } = checkpointLook(description);
  const sizes = new Set(Object.values(frames).map((frame) => `${frame.w}x${frame.h}`));
  assert.equal(sizes.size, 1, `frames of sizes ${[...sizes]}`);
  for (const name of [unlit, ...lit]) {
    const frame = frames[name];
    assert.ok(frame, `no frame ${name}`);
    assert.equal(frame.originY, frame.h, `${name} is not placed by its foot`);
    assert.equal(frame.originX, frame.w / 2, `${name} is not placed by its middle`);
    assert.equal(rowsUsed(images[name]).bottom, frame.h - 1, `${name} floats`);
  }
});

test('scenery sheets: the looks of known pieces, standing on their bottom row, placed by their left edge', () => {
  for (const sprite of Object.keys(SCENERY_SPRITES)) {
    for (const type of sceneryPieces(sprite)) {
      assert.ok(SCENERY[type], `no scenery ${type}`);
      if (!loaded[sprite]) continue;
      const { description, frames, images } = loaded[sprite];
      const look = sceneryLook(description, type);
      assert.ok(look.fps > 0 && look.frames.length > 0, `${sprite} has nothing to show for ${type}`);
      for (const name of look.frames) {
        const frame = frames[name];
        assert.equal(frame.originY, frame.h, `${sprite} ${name} is not placed by its foot`);
        assert.equal(rowsUsed(images[name]).bottom, frame.h - 1, `${sprite} ${name} floats`);
        // Nothing left of the origin; a piece may leave its first columns
        // empty, as the slide drawn in code does. Except the police car (a
        // Saab drawn to its own size), each is the size SCENERY gives it.
        const box = opaqueBox(images[name]);
        assert.ok(box.left >= frame.originX, `${sprite} ${name} reaches left of its origin`);
        if (sprite !== 'police_car') {
          assert.ok(box.right - frame.originX <= SCENERY[type].width, `${sprite} ${name} is wider than its piece`);
          assert.equal(frame.originY - box.top, SCENERY[type].height, `${sprite} ${name} is not as tall as its piece`);
        }
      }
    }
  }
});

test('every piece of scenery has a look: drawn in code, or by a delivered sheet', () => {
  const delivered = sheets.flatMap(({ sprite }) => sceneryPieces(sprite));
  for (const type of Object.keys(SCENERY)) assert.ok(SCENERY_ART[type] || delivered.includes(type), `nothing draws ${type}`);
  assert.equal(new Set(delivered).size, delivered.length, 'a piece drawn by two sheets');
});

test('a scenery sheet shows its one frame or plays its one animation, or gives each piece its frame', () => {
  assert.deepEqual(sceneryLook({ frames: { kiosk: {} }, animations: {}, meta: { sprite: 'kiosk' } }, 'kiosk'), { frames: ['kiosk'], fps: 1 });
  const flag = { frames: { a: {}, b: {} }, animations: { wave: ['a', 'b'] }, meta: { sprite: 'flagpole', playback: { wave: { fps: 5 } } } };
  assert.deepEqual(sceneryLook(flag, 'flagpole'), { frames: ['a', 'b'], fps: 5 });
  const hut = { frames: { parties: {}, referendum: {} }, animations: {}, meta: { sprite: 'election_hut' } };
  assert.deepEqual(sceneryLook(hut, 'electionHut'), { frames: ['parties'], fps: 1 });
  assert.deepEqual(sceneryLook(hut, 'referendumHut'), { frames: ['referendum'], fps: 1 });
  assert.throws(() => sceneryLook({ ...hut, frames: { parties: {} } }, 'referendumHut'), /no frame referendum/);
  assert.throws(() => sceneryLook(hut, 'kiosk'), /does not draw kiosk/);
  assert.throws(() => sceneryLook({ frames: { a: {}, b: {} }, animations: {}, meta: { sprite: 'kiosk' } }, 'kiosk'), /one frame, has 2/);
});

test('the horizon\'s sheet: one landmark standing on its foot, narrow enough never to show twice at once', { skip: !loaded[HORIZON_SPRITE] }, () => {
  const { description, frames, images } = loaded[HORIZON_SPRITE];
  const name = onlyFrame(description);
  const frame = frames[name];
  assert.equal(frame.originY, frame.h, 'not placed by its foot');
  assert.equal(rowsUsed(images[name]).bottom, frame.h - 1, 'it floats');
  assert.ok(frame.w + VIEW_WIDTH <= HORIZON.period, `${frame.w} px wide, recurring every ${HORIZON.period}`);
  assert.ok(HORIZON.x - frame.originX >= 0 && HORIZON.x - frame.originX + frame.w <= HORIZON.period, 'it does not fit its strip');
  assert.ok(HORIZON.base - frame.originY >= 0, 'its top is above the layer');
});

test('every item has a sprite, and every item sprite an item', () => {
  assert.deepEqual(Object.values(ITEM_SPRITES).sort(), Object.keys(ITEMS).filter((type) => !AWAITING.items.includes(type)).sort());
  for (const type of AWAITING.items) assert.ok(ITEMS[type], `${type} awaits a sheet but isn't an item`);
});

test('item sheets: one look the size of the one drawn in code, standing on the middle of its bottom row', () => {
  for (const [sprite, type] of Object.entries(ITEM_SPRITES)) {
    if (!loaded[sprite]) continue;
    const { description, frames, images } = loaded[sprite];
    const name = onlyFrame(description);
    const frame = frames[name];
    // The HUD lays its icons out by the code-drawn sizes (src/hud.js).
    const drawn = ITEM_ART[type];
    assert.deepEqual([frame.w, frame.h], [drawn.width, drawn.height], `${sprite} is not the size drawn in code`);
    assert.equal(frame.originY, frame.h, `${sprite} is not placed by its bottom`);
    assert.equal(frame.originX, Math.ceil(frame.w / 2), `${sprite} is not placed by its middle`);
    const { top, bottom } = rowsUsed(images[name]);
    assert.equal(bottom, frame.h - 1, `${sprite} floats`);
    assert.equal(top, 0, `${sprite} has empty rows on top`);
    if (ITEMS[type].category === 'powerUp') {
      for (const glow of glowFrames(images[name])) assert.ok(glow.width <= TILE && glow.height <= TILE, `${sprite}'s glow is bigger than a tile`);
    }
  }
});

test('HUD sheets: every frame an icon the size of the one drawn in code, placed by its top left', () => {
  for (const [sprite, icons] of Object.entries(HUD_SPRITES)) {
    for (const icon of Object.values(icons)) assert.ok(HUD_ICONS[icon], `no HUD icon ${icon}`);
    if (!loaded[sprite]) continue;
    const { frames } = loaded[sprite];
    assert.deepEqual(Object.keys(frames).sort(), Object.keys(icons).sort(), `${sprite}'s frames`);
    for (const [name, icon] of Object.entries(icons)) {
      const frame = frames[name];
      // The HUD lays its icons out by the code-drawn sizes (src/hud.js).
      assert.deepEqual([frame.w, frame.h], [HUD_ICONS[icon].width, HUD_ICONS[icon].height], `${sprite} ${name}`);
      assert.deepEqual([frame.originX, frame.originY], [0, 0], `${sprite} ${name} is not placed by its top left`);
    }
  }
});

test("the goal's sheet: its flag waving, every frame standing on the middle of its foot, the pole at its left", { skip: !loaded[GOAL_SPRITE] }, () => {
  const { description, frames, images } = loaded[GOAL_SPRITE];
  const { frames: names } = goalLook(description);
  for (const name of names) {
    const frame = frames[name];
    assert.ok(frame, `no frame ${name}`);
    assert.equal(frame.originY, frame.h, `${name} is not placed by its foot`);
    assert.equal(rowsUsed(images[name]).bottom, frame.h - 1, `${name} floats`);
    // The pole is what counts as reaching the goal (goalPole in
    // src/landmarks.js), standing at the goal's left edge.
    const box = opaqueBox(images[name]);
    assert.deepEqual([box.right - box.left, box.bottom - box.top], [GOAL_SIZE.width, GOAL_SIZE.height], `${name} is not the goal's size`);
    assert.equal(frame.originX - box.left, GOAL_SIZE.width / 2, `${name} is not placed by its middle`);
  }
});

test('a goal sheet without a wave animation and its playback is refused', () => {
  const meta = { sprite: 'goal' };
  assert.deepEqual(goalLook({ animations: { wave: ['a', 'b'] }, meta: { ...meta, playback: { wave: { fps: 5 } } } }), { frames: ['a', 'b'], fps: 5 });
  assert.throws(() => goalLook({ animations: {}, meta: { ...meta, playback: {} } }), /wave animation/);
  assert.throws(() => goalLook({ animations: { wave: ['a'] }, meta: { ...meta, playback: {} } }), /no playback for wave/);
});

test('every prop but those awaiting one has a sheet', () => {
  assert.deepEqual([...PROP_SPRITES].sort(), Object.keys(PROPS).filter((type) => !AWAITING.props.includes(type)).sort());
  for (const type of AWAITING.props) assert.ok(PROPS[type], `${type} awaits a sheet but isn't a prop`);
});

test('prop sheets: one look the size of the one drawn in code, standing on the middle of its bottom row', () => {
  for (const sprite of PROP_SPRITES) {
    assert.ok(PROPS[sprite], `no prop ${sprite}`);
    if (!loaded[sprite]) continue;
    const { description, frames, images } = loaded[sprite];
    const name = onlyFrame(description);
    const frame = frames[name];
    const box = opaqueBox(images[name]);
    assert.deepEqual([box.right - box.left, box.bottom - box.top], [PROP_ART[sprite].width, PROP_ART[sprite].height], `${sprite} is not the size drawn in code`);
    assert.equal(frame.originY, box.bottom, `${sprite} is not placed by its bottom`);
    assert.equal(frame.originX - box.left, PROP_ART[sprite].width / 2, `${sprite} is not placed by its middle`);
    const worn = wornLooks(images[name]);
    for (const look of worn) for (const value of coloursIn(look)) assert.ok(isPaletteColour(value), `${sprite} worn: ${value}`);
    assert.ok(new Set(worn.flatMap((look) => [...coloursIn(look)])).size <= 15, `${sprite} worn has too many colours`);
  }
});

test("the sign's sheet: one look filling its tile, placed by its top left", { skip: !loaded[SIGN_SPRITE] }, () => {
  const { description, frames } = loaded[SIGN_SPRITE];
  const frame = frames[onlyFrame(description)];
  assert.deepEqual([frame.w, frame.h], [SIGN_ART.width, SIGN_ART.height]);
  assert.deepEqual([frame.originX, frame.originY], [0, 0]);
});

test("the moving platform's sheet: one tile-wide piece the size drawn in code, placed by its top left", { skip: !loaded[PLATFORM_SPRITE] }, () => {
  const { description, frames } = loaded[PLATFORM_SPRITE];
  const frame = frames[onlyFrame(description)];
  assert.deepEqual([frame.w, frame.h], [PLATFORM_ART.width, PLATFORM_ART.height]);
  assert.deepEqual([frame.originX, frame.originY], [0, 0]);
});

test("the leak's sheet: a running stream a tile high, every frame the width of the leak, placed by its top left", { skip: !loaded[LEAK_SPRITE] }, () => {
  const { description, frames, images } = loaded[LEAK_SPRITE];
  const { frames: names } = leakLook(description);
  for (const name of names) {
    const frame = frames[name];
    assert.ok(frame, `no frame ${name}`);
    assert.deepEqual([frame.w, frame.h], [LEAK_WIDTH, TILE], name);
    assert.deepEqual([frame.originX, frame.originY], [0, 0], name);
    // Stacked pieces must join: no gap at the top or bottom of a piece.
    const { top, bottom } = rowsUsed(images[name]);
    assert.deepEqual([top, bottom], [0, TILE - 1], `${name} leaves a gap`);
  }
});

test('a leak sheet without a run animation and its playback is refused', () => {
  const meta = { sprite: 'leak' };
  assert.deepEqual(leakLook({ animations: { run: ['a'] }, meta: { ...meta, playback: { run: { fps: 12 } } } }), { frames: ['a'], fps: 12 });
  assert.throws(() => leakLook({ animations: {}, meta: { ...meta, playback: {} } }), /run animation/);
  assert.throws(() => leakLook({ animations: { run: ['a'] }, meta: { ...meta, playback: {} } }), /no playback for run/);
});

test("citizen sheets: the enemies' frame, standing and waving, every frame on the middle of its feet", () => {
  for (const sprite of CITIZEN_SPRITES) {
    assert.ok(CITIZENS[sprite], `no citizen ${sprite}`);
    if (!loaded[sprite]) continue;
    const { description, frames, images } = loaded[sprite];
    const { stand, wave } = citizenLook(description);
    // The game hangs citizens like the enemies (the author, 2026-11-08: a
    // 20×25 frame, pivot [8, 25]).
    for (const name of [...stand.frames, ...wave.frames]) {
      const frame = frames[name];
      assert.ok(frame, `${sprite} lacks frame ${name}`);
      assert.deepEqual([frame.w, frame.h, frame.originX, frame.originY], [20, 25, 8, 25], `${sprite} ${name}`);
      assert.equal(rowsUsed(images[name]).bottom, frame.h - 1, `${sprite} ${name} floats`);
    }
  }
});

test('a citizen sheet without standing and waving is refused', () => {
  const meta = { sprite: 'pensioner' };
  const playback = { stand: { fps: 2 }, wave: { fps: 4 } };
  assert.deepEqual(citizenLook({ animations: { stand: ['s'], wave: ['a', 'b'] }, meta: { ...meta, playback } }), { stand: { frames: ['s'], fps: 2 }, wave: { frames: ['a', 'b'], fps: 4 } });
  assert.throws(() => citizenLook({ animations: { stand: ['s'] }, meta: { ...meta, playback } }), /wave animation/);
});

test("the station's sheets: the house and the pump within the size drawn in code, standing on their bottom left", () => {
  const sizes = { house: HOUSE_SIZE, pump: PUMP_SIZE };
  for (const [sprite, part] of Object.entries(STATION_SPRITES)) {
    if (!loaded[sprite]) continue;
    const { description, frames, images } = loaded[sprite];
    const name = onlyFrame(description);
    const frame = frames[name];
    const box = opaqueBox(images[name]);
    assert.ok(box.left >= frame.originX && box.right - frame.originX <= sizes[part].width, `${sprite} is not ${sizes[part].width} wide from its origin`);
    assert.equal(box.bottom, frame.originY, `${sprite} is not placed by its foot`);
    // The pump's gauge, like the one drawn in code, leaves its top rows
    // empty.
    assert.ok(frame.originY - box.top <= sizes[part].height, `${sprite} is taller than drawn in code`);
  }
});

test('every power-up effect has a sprite, and every effect sprite an effect', () => {
  assert.deepEqual(Object.values(EFFECT_SPRITES).sort(), Object.keys(EFFECT_ART).sort());
});

test('effect sheets: every frame the size drawn in code, its origin inside it, moving ones at their rate', () => {
  for (const [sprite, effect] of Object.entries(EFFECT_SPRITES)) {
    if (!loaded[sprite]) continue;
    const { description, frames } = loaded[sprite];
    const { frames: names, fps } = effectLook(description);
    const drawn = EFFECT_ART[effect];
    assert.equal(names.length, drawn.frames.length, `${sprite} has ${names.length} frames`);
    if (drawn.frames.length > 1) assert.equal(fps, drawn.fps, `${sprite} plays at ${fps} fps`);
    for (const name of names) {
      const frame = frames[name];
      assert.ok(frame, `${sprite} lacks frame ${name}`);
      assert.deepEqual([frame.w, frame.h], [drawn.frames[0].width, drawn.frames[0].height], `${sprite} ${name}`);
      assert.ok(frame.originX >= 0 && frame.originX <= frame.w && frame.originY >= 0 && frame.originY <= frame.h, `${sprite} ${name}'s origin is outside it`);
    }
  }
});

test('an effect sheet plays its one animation, or shows its one frame', () => {
  const meta = { sprite: 'rotor', playback: { spin: { fps: 16 } } };
  assert.deepEqual(effectLook({ frames: { a: {}, b: {} }, animations: { spin: ['a', 'b'] }, meta }), { frames: ['a', 'b'], fps: 16 });
  assert.deepEqual(effectLook({ frames: { note: {} }, animations: {}, meta: { sprite: 'note' } }), { frames: ['note'], fps: 1 });
  assert.throws(() => effectLook({ frames: {}, animations: { a: ['x'], b: ['y'] }, meta }), /more than one animation/);
});

test('a scenery sheet must have exactly one look', () => {
  const meta = { sprite: 'police_car' };
  assert.equal(onlyFrame({ frames: { parked: {} }, meta }), 'parked');
  assert.throws(() => onlyFrame({ frames: {}, meta }), /one frame, has 0/);
  assert.throws(() => onlyFrame({ frames: { a: {}, b: {} }, meta }), /one frame, has 2/);
});

test('a checkpoint sheet without both looks is refused', () => {
  const meta = { sprite: 'checkpoint', playback: { lit: { fps: 4 } } };
  assert.deepEqual(checkpointLook({ animations: { unlit: ['u'], lit: ['a', 'b'] }, meta }), { unlit: 'u', lit: ['a', 'b'], fps: 4 });
  assert.throws(() => checkpointLook({ animations: { unlit: ['u'] }, meta }), /an unlit and a lit/);
  assert.throws(() => checkpointLook({ animations: { unlit: ['u'], lit: ['a'] }, meta: { sprite: 'checkpoint' } }), /no playback/);
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

test('backdrop sheets: the size of their layer, wrapping by whole tiles, the bottom row the colour under them', () => {
  for (const layer of BACKGROUND_LAYERS) {
    if (!loaded[layer.name]) continue;
    const { description, images } = loaded[layer.name];
    assert.deepEqual(backgroundFrame(description), sheetFrames(description)[layer.name]);
    const image = images[layer.name];
    assert.deepEqual([image.width, image.height], [layer.image.width, layer.image.height], layer.name);
    assert.equal(image.width % TILE, 0, `${layer.name} doesn't wrap by whole tiles`);
    if (!layer.fill) continue;
    for (let x = 0; x < image.width; x++) {
      assert.equal(getPixel(image, x, image.height - 1), layer.fill, `${layer.name}'s bottom row at x = ${x}`);
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

test('a backdrop sheet without a frame named after it is refused', () => {
  assert.throws(() => backgroundFrame(description(['sky_1'], { meta: { sprite: 'sky' } })), /no frame named after it/);
});

test('a sprite delivered without its picture or description is refused', () => {
  assert.throws(() => deliveredSheets({ files: [{ sprite: 'x', path: 'tiles/x.png' }] }), /without its picture or description/);
});
