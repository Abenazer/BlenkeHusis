import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { BACKGROUND_LAYERS, HORIZON } from '../src/art/backgrounds.js';
import { stationSign } from '../src/art/board.js';
import { glowFrames } from '../src/art/glow.js';
import { HOUSE_SIZE } from '../src/art/station.js';
import { CITIZEN_ART as JORDBRO_CITIZEN_ART } from '../src/art/jordbro.js';
import { CITIZEN_ART, SCENERY_ART } from '../src/art/tif.js';
import { PLAYER, TILE, VIEW_WIDTH } from '../src/config.js';
import { ENEMIES } from '../src/enemies.js';
import { HAZARD_BOXES, LEAK_WIDTH } from '../src/hazards.js';
import { GOAL_SIZE } from '../src/landmarks.js';
import { CITIZENS } from '../src/citizens.js';
import { ICON_SIZES, ITEM_ICONS } from '../src/hud.js';
import { PUMP_SIZE } from '../src/station.js';
import { PLATFORM_THICKNESS } from '../src/platforms.js';
import { PROPS } from '../src/props.js';
import { ITEMS } from '../src/items.js';
import { isOneWay, isSecret, isSolid, TILE_TYPES, tileName } from '../src/level.js';
import { isPaletteColour } from '../src/palette.js';
import { PROJECTILES } from '../src/projectiles.js';
import { coloursIn, getPixel, opaqueBox } from '../src/pixels.js';
import { SCENERY } from '../src/scenery.js';
import { LEVELS, TRY_LEVELS } from '../src/levels/index.js';
import {
  BACKGROUND_SPRITES,
  backgroundFrame,
  characterLook,
  CHECKPOINT_SPRITE,
  checkpointLook,
  CITIZEN_SPRITES,
  citizenLook,
  deliveredSheets,
  EFFECT_SPRITES,
  effectLook,
  ENEMY_EXTRA_SPRITES,
  ENEMY_SPRITES,
  enemyLook,
  GOAL_SPRITE,
  goalLook,
  HORIZON_SPRITE,
  HUD_SPRITES,
  ITEM_HUD_LOOKS,
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
  STATION_SIGN_SPRITE,
  TILE_SPRITES,
  tileLook,
} from '../src/sprites.js';
import { loadDelivered } from './png.js';

// One SNES palette per sprite: 15 colours and transparent.
const MAX_COLOURS = 15;
const PLAYER_SIZE = { width: 24, height: 32 };
const ANIMATIONS_PLAYED = ['idle', 'walk', 'run', 'jump', 'fall', 'crouch', 'hurt'];

const manifest = JSON.parse(readFileSync(join(SPRITES_PATH, MANIFEST), 'utf8'));
const sheets = deliveredSheets(manifest);
const loaded = loadDelivered();

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
  for (const { sprite } of sheets) {
    const known = [PLAYER_SPRITE, CHECKPOINT_SPRITE, HORIZON_SPRITE, GOAL_SPRITE, SIGN_SPRITE, STATION_SIGN_SPRITE, PLATFORM_SPRITE, LEAK_SPRITE].includes(sprite) || CITIZEN_SPRITES.includes(sprite) || STATION_SPRITES[sprite] || EFFECT_SPRITES[sprite] || PROP_SPRITES[sprite] || TILE_SPRITES[sprite] || SCENERY_SPRITES[sprite]
      || ENEMY_SPRITES[sprite] || ENEMY_EXTRA_SPRITES[sprite] || PROJECTILE_SPRITES[sprite]
      || BACKGROUND_SPRITES.includes(sprite) || ITEM_SPRITES[sprite] || HUD_SPRITES[sprite];
    assert.ok(known, `unknown sprite ${sprite}`);
  }
  for (const char of Object.values(TILE_SPRITES)) assert.ok(TILE_TYPES[char], `no tile ${char}`);
  const layers = BACKGROUND_LAYERS.map((layer) => layer.name);
  for (const name of BACKGROUND_SPRITES) assert.ok(layers.includes(name), `no backdrop layer ${name}`);
});

// The game has no other pictures of these (src/render.js refuses to start
// without them); only the few the factory never drew are drawn in code,
// and Tungelsta IF until batch 13 comes (src/art/tif.js) and Jordbro's
// children until batch 14 (src/art/jordbro.js), never both.
test('everything the game draws is delivered, but what is drawn in code', () => {
  const missing = (sprites) => sprites.filter((sprite) => !loaded[sprite]);
  const spritesOf = (map, types) => types.map((type) => Object.keys(map).find((sprite) => map[sprite] === type) ?? `(no sprite for ${type})`);
  assert.deepEqual(missing([PLAYER_SPRITE, CHECKPOINT_SPRITE, GOAL_SPRITE, SIGN_SPRITE, STATION_SIGN_SPRITE, PLATFORM_SPRITE, LEAK_SPRITE, HORIZON_SPRITE]), []);
  // Secret tiles look like the tile they hide in.
  const tiles = Object.keys(TILE_TYPES).filter((char) => !isSecret(char));
  assert.deepEqual(missing(spritesOf(TILE_SPRITES, tiles)), [], 'tiles');
  const enemies = Object.entries(ENEMIES).flatMap(([type, enemy]) => Array.from({ length: enemy.variants ?? 1 }, (_, variant) => `${type} ${variant}`));
  const enemySprites = enemies.map((key) => Object.keys(ENEMY_SPRITES).find((sprite) => `${ENEMY_SPRITES[sprite].type} ${ENEMY_SPRITES[sprite].variant}` === key) ?? `(no sprite for ${key})`);
  assert.deepEqual(missing(enemySprites), [], 'enemies');
  assert.deepEqual(missing(spritesOf(ENEMY_EXTRA_SPRITES, ['musicNote', 'skateboard'])), [], "the subcultures' extras");
  assert.deepEqual(missing(spritesOf(PROJECTILE_SPRITES, Object.keys(PROJECTILES))), [], 'projectiles');
  assert.deepEqual(missing(spritesOf(ITEM_SPRITES, Object.keys(ITEMS).filter((type) => !ITEM_HUD_LOOKS[type]))), [], 'items, but those drawn as a HUD icon');
  assert.deepEqual(missing(spritesOf(PROP_SPRITES, Object.keys(PROPS))), [], 'props');
  assert.deepEqual(missing(Object.keys(CITIZENS)), Object.keys({ ...CITIZEN_ART, ...JORDBRO_CITIZEN_ART }), 'citizens, but those drawn in code');
  assert.deepEqual(missing([...Object.keys(EFFECT_SPRITES), ...Object.keys(STATION_SPRITES), ...Object.keys(HUD_SPRITES)]), [], 'effects, the station and the HUD');
  const pieces = Object.keys(SCENERY).filter((type) => !SCENERY[type].named);
  const sceneryDrawn = sheets.flatMap(({ sprite }) => sceneryPieces(sprite));
  assert.deepEqual(pieces.filter((type) => !sceneryDrawn.includes(type)), Object.keys(SCENERY_ART), 'scenery, but what is drawn in code');
  assert.equal(new Set(sceneryDrawn).size, sceneryDrawn.length, 'a piece drawn by two sheets');
  assert.deepEqual(BACKGROUND_LAYERS.filter((layer) => !loaded[layer.name]).map((layer) => layer.name), [], 'backdrop layers');
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

test("Blenke's sheet: his size, a pivot at his feet, every animation the game plays", () => {
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
  const enemies = Object.entries(ENEMIES).flatMap(([type, enemy]) => Array.from({ length: enemy.variants ?? 1 }, (_, variant) => `${type} ${variant}`));
  assert.deepEqual([...drawn].sort(), [...enemies].sort());
});

// How tall an enemy stands (the author, 2026-11-08: as tall as the ones
// first drawn in code), give or take a pixel for a hand held up: the
// bosses taller, the raggare's car lower and the progg activist under her
// banner.
const STANDING_HEIGHT = { raggare: 18, proggActivist: 36 };
const standingHeight = (type) => STANDING_HEIGHT[type] ?? (ENEMIES[type].boss ? 32 : 24);
// Those with a pose of their own besides moving: throwing or shouting,
// the hippie playing, the headbanger diving and the breakdancer's freeze.
const actsBesidesThrowing = ['hippie', 'headbanger', 'breakdancer'];

test('enemy sheets: their height, placed by their feet, a pose where they act, flattened when defeated', () => {
  const height = (image) => rowsUsed(image).bottom - rowsUsed(image).top + 1;
  const lift = (image) => image.height - 1 - rowsUsed(image).bottom;
  for (const [sprite, { type }] of Object.entries(ENEMY_SPRITES)) {
    const enemy = ENEMIES[type];
    const { description, frames, images } = loaded[sprite];
    const { move, act, defeated } = enemyLook(description);
    assert.equal(act !== null, Boolean(enemy.throws) || actsBesidesThrowing.includes(type), `${sprite}: an act frame only where the game shows one`);
    for (const name of [...move, ...(act ? [act] : []), defeated]) {
      const frame = frames[name];
      assert.ok(frame, `${sprite} lacks frame ${name}`);
      assert.equal(frame.originY, frame.h, `${sprite} ${name} is not placed by its feet`);
      assert.ok(frame.originX - enemy.width / 2 >= 0 && frame.originX + enemy.width / 2 <= frame.w, `${sprite} ${name}: origin ${frame.originX}`);
      assert.ok(enemy.height <= frame.h, `${sprite} ${name} is lower than ${type} is`);
    }
    // On their feet, but the hippie sits to play and the headbanger dives
    // through the air.
    for (const name of [...move, defeated, ...(act && type !== 'headbanger' ? [act] : [])]) {
      assert.equal(lift(images[name]), 0, `${sprite} ${name} is ${lift(images[name])} px off the ground`);
    }
    // The first frame stands up; the others may bob or bang a head.
    const [standing] = move;
    assert.ok(Math.abs(height(images[standing]) - standingHeight(type)) <= 1, `${sprite} ${standing} is ${height(images[standing])} px tall, not ${standingHeight(type)}`);
    const top = (name) => rowsUsed(images[name]).top;
    assert.ok(top(defeated) > top(move[0]) + enemy.height / 3, `${sprite} isn't flattened`);
  }
});

test('an enemy sheet without a move and a defeated animation is refused', () => {
  const meta = { sprite: 'stoner' };
  assert.deepEqual(enemyLook({ animations: { move: ['a', 'b'], defeated: ['d'] }, meta }), { move: ['a', 'b'], act: null, defeated: 'd' });
  assert.deepEqual(enemyLook({ animations: { move: ['a'], act: ['t'], defeated: ['d'] }, meta }), { move: ['a'], act: 't', defeated: 'd' });
  assert.throws(() => enemyLook({ animations: { move: ['a'] }, meta }), /a move and a defeated/);
  assert.throws(() => enemyLook({ animations: { defeated: ['d'] }, meta }), /a move and a defeated/);
});

test('every projectile type has a sprite, and every projectile sprite a type', () => {
  assert.deepEqual(Object.values(PROJECTILE_SPRITES).sort(), Object.keys(PROJECTILES).sort());
});

test('projectile sheets: about the size of what is thrown, every frame centred on its origin', () => {
  for (const [sprite, type] of Object.entries(PROJECTILE_SPRITES)) {
    const { description, frames, images } = loaded[sprite];
    const { frames: names } = projectileLook(description);
    const projectile = PROJECTILES[type];
    for (const name of names) {
      const frame = frames[name];
      assert.ok(frame, `${sprite} lacks frame ${name}`);
      const box = opaqueBox(images[name]);
      assert.ok(Math.max(box.right - box.left, box.bottom - box.top) <= 2 * Math.max(projectile.width, projectile.height), `${sprite} ${name} is drawn too big`);
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

test('the checkpoint\'s sheet: unlit and lit, every frame the same size, standing on the middle of its foot', () => {
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

test('the horizon\'s sheet: one landmark standing on its foot, narrow enough never to show twice at once', () => {
  const { description, frames, images } = loaded[HORIZON_SPRITE];
  const name = onlyFrame(description);
  const frame = frames[name];
  assert.equal(frame.originY, frame.h, 'not placed by its foot');
  assert.equal(rowsUsed(images[name]).bottom, frame.h - 1, 'it floats');
  assert.ok(frame.w + VIEW_WIDTH <= HORIZON.period, `${frame.w} px wide, recurring every ${HORIZON.period}`);
  assert.ok(HORIZON.x - frame.originX >= 0 && HORIZON.x - frame.originX + frame.w <= HORIZON.period, 'it does not fit its strip');
  assert.ok(HORIZON.base - frame.originY >= 0, 'its top is above the layer');
});

test("the station name board's sheet: blank, the board's size, standing on its bottom left, every level's name written on it", () => {
  const { description, frames, images } = loaded[STATION_SIGN_SPRITE];
  const name = onlyFrame(description);
  const frame = frames[name];
  const blank = images[name];
  const box = opaqueBox(blank);
  assert.deepEqual([box.right - box.left, box.bottom - box.top], [SCENERY.stationSign.width, SCENERY.stationSign.height]);
  assert.deepEqual([frame.originX, frame.originY], [box.left, box.bottom]);
  for (const { id, stationName } of [...LEVELS, ...TRY_LEVELS]) {
    if (!stationName) continue;
    const board = stationSign(stationName, blank);
    assert.ok(coloursIn(board).size <= MAX_COLOURS, id);
    assert.ok(board.pixels.some((value, i) => value !== blank.pixels[i]), `${id}'s board shows no name`);
    // The name on the board's face: nothing written outside the board.
    assert.deepEqual(opaqueBox(board), box, `${id}'s name runs off the board`);
  }
  assert.throws(() => stationSign('W'.repeat(40), blank), /doesn't fit/);
});

test("the subcultures' extras: the skater's board rolls as a deck by its top left, the hippie's note rises by its foot", () => {
  const board = loaded.skateboard.frames.skateboard;
  assert.deepEqual([board.originX, board.originY], [0, 0]);
  assert.deepEqual([board.w, board.h], [ENEMIES.skater.board.width, ENEMIES.skater.board.height]);
  const note = loaded.music_note.frames.music_note;
  assert.equal(note.originY, note.h);
  assert.ok(Math.abs(note.originX - note.w / 2) <= 0.5);
});

test('every item has a sprite or a HUD icon, and every item sprite an item', () => {
  assert.deepEqual([...Object.values(ITEM_SPRITES), ...Object.keys(ITEM_HUD_LOOKS)].sort(), Object.keys(ITEMS).sort());
});

test("an item drawn as a HUD icon is one of the HUD's frames, within a tile", () => {
  for (const [type, { sprite, frame }] of Object.entries(ITEM_HUD_LOOKS)) {
    assert.ok(ITEMS[type], `${type} is an item`);
    assert.ok(HUD_SPRITES[sprite]?.[frame], `${type}'s HUD frame ${sprite} ${frame}`);
    const { w, h } = loaded[sprite].frames[frame];
    assert.ok(w <= TILE && h <= TILE, `${type} is bigger than a tile`);
  }
});

test('item sheets: one look within its tile, trimmed to its outline, standing on the middle of its bottom row', () => {
  for (const [sprite, type] of Object.entries(ITEM_SPRITES)) {
    const { description, frames, images } = loaded[sprite];
    const name = onlyFrame(description);
    const frame = frames[name];
    assert.ok(frame.w <= TILE && frame.h <= TILE, `${sprite} is bigger than a tile`);
    const icon = Object.keys(ITEM_ICONS).find((name) => ITEM_ICONS[name] === type);
    // The HUD lays its icons out by their sizes (src/hud.js).
    if (icon) assert.deepEqual([frame.w, frame.h], [ICON_SIZES[icon].width, ICON_SIZES[icon].height], `${sprite} is not the HUD's ${icon} icon's size`);
    assert.equal(frame.originY, frame.h, `${sprite} is not placed by its bottom`);
    // Half a pixel off at most, where its width is odd.
    assert.ok(Math.abs(frame.originX - frame.w / 2) <= 0.5, `${sprite} is not placed by its middle`);
    const { top, bottom } = rowsUsed(images[name]);
    assert.equal(bottom, frame.h - 1, `${sprite} floats`);
    assert.equal(top, 0, `${sprite} has empty rows on top`);
    if (ITEMS[type].category === 'powerUp') {
      for (const glow of glowFrames(images[name])) assert.ok(glow.width <= TILE && glow.height <= TILE, `${sprite}'s glow is bigger than a tile`);
    }
  }
});

test('HUD sheets: every frame an icon of the size the HUD lays it out by, placed by its top left', () => {
  const icons = [...Object.values(HUD_SPRITES).flatMap((names) => Object.values(names)), ...Object.keys(ITEM_ICONS)];
  assert.deepEqual(icons.sort(), Object.keys(ICON_SIZES).sort());
  for (const [sprite, icons] of Object.entries(HUD_SPRITES)) {
    const { frames } = loaded[sprite];
    assert.deepEqual(Object.keys(frames).sort(), Object.keys(icons).sort(), `${sprite}'s frames`);
    for (const [name, icon] of Object.entries(icons)) {
      const frame = frames[name];
      assert.deepEqual([frame.w, frame.h], [ICON_SIZES[icon].width, ICON_SIZES[icon].height], `${sprite} ${name}`);
      assert.deepEqual([frame.originX, frame.originY], [0, 0], `${sprite} ${name} is not placed by its top left`);
    }
  }
});

test("the goal's sheet: its flag waving, every frame standing on the middle of its foot, the pole at its left", () => {
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

test('every prop has a sprite, and every prop sprite a prop', () => {
  assert.deepEqual(Object.values(PROP_SPRITES).sort(), Object.keys(PROPS).sort());
});

test('prop sheets: one look the size of its body, standing on the middle of its bottom row', () => {
  for (const [sprite, type] of Object.entries(PROP_SPRITES)) {
    const { description, frames, images } = loaded[sprite];
    const name = onlyFrame(description);
    const frame = frames[name];
    const box = opaqueBox(images[name]);
    assert.deepEqual([box.right - box.left, box.bottom - box.top], [PROPS[type].width, PROPS[type].height], `${sprite} is not the size of its body`);
    assert.equal(frame.originY, box.bottom, `${sprite} is not placed by its bottom`);
    assert.equal(frame.originX - box.left, PROPS[type].width / 2, `${sprite} is not placed by its middle`);
  }
});

test("the sign's sheet: one look filling its tile, placed by its top left", () => {
  const { description, frames } = loaded[SIGN_SPRITE];
  const frame = frames[onlyFrame(description)];
  assert.deepEqual([frame.w, frame.h], [TILE, TILE]);
  assert.deepEqual([frame.originX, frame.originY], [0, 0]);
});

test("the moving platform's sheet: one piece a tile wide and the platform's thickness, placed by its top left", () => {
  const { description, frames } = loaded[PLATFORM_SPRITE];
  const frame = frames[onlyFrame(description)];
  assert.deepEqual([frame.w, frame.h], [TILE, PLATFORM_THICKNESS]);
  assert.deepEqual([frame.originX, frame.originY], [0, 0]);
});

test("the leak's sheet: a running stream a tile high, every frame the width of the leak, placed by its top left", () => {
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

test("the station's sheets: the house and the pump within their size, standing on their bottom left", () => {
  const sizes = { house: HOUSE_SIZE, pump: PUMP_SIZE };
  for (const [sprite, part] of Object.entries(STATION_SPRITES)) {
    const { description, frames, images } = loaded[sprite];
    const name = onlyFrame(description);
    const frame = frames[name];
    const box = opaqueBox(images[name]);
    assert.ok(box.left >= frame.originX && box.right - frame.originX <= sizes[part].width, `${sprite} is not ${sizes[part].width} wide from its origin`);
    assert.equal(box.bottom, frame.originY, `${sprite} is not placed by its foot`);
    // The pump's gauge may leave its top rows empty.
    assert.ok(frame.originY - box.top <= sizes[part].height, `${sprite} is taller than ${sizes[part].height}`);
  }
});

test('effect sheets: frames of one size to play, each with its origin inside it', () => {
  for (const sprite of Object.keys(EFFECT_SPRITES)) {
    const { description, frames } = loaded[sprite];
    const { frames: names, fps } = effectLook(description);
    assert.ok(names.length > 0 && fps > 0, `${sprite} has nothing to play`);
    for (const name of names) {
      const frame = frames[name];
      assert.ok(frame, `${sprite} lacks frame ${name}`);
      assert.deepEqual([frame.w, frame.h], [frames[names[0]].w, frames[names[0]].h], `${sprite} ${name}`);
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

// The colour most of a tile's fill is painted in.
function mainColour(image) {
  const counts = new Map();
  for (const value of image.pixels) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1])[0][0];
}

test('the facades each have a colour of their own', () => {
  const facades = ['B', 'W', 'Ä', 'Ö', 'Å', 'ä', 'ö', 'å'];
  const colours = facades.map((char) => {
    const sprite = Object.keys(TILE_SPRITES).find((name) => TILE_SPRITES[name] === char);
    const { description, images } = loaded[sprite];
    return mainColour(images[tileLook(description, true).fill[0]]);
  });
  assert.equal(new Set(colours).size, facades.length, colours.join(' '));
  for (const char of facades) assert.ok(isSolid(char), `${char} is a wall`);
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

test('backdrop sheets: wrapping by whole tiles, the bottom row the colour under them', () => {
  for (const layer of BACKGROUND_LAYERS.filter(({ name }) => BACKGROUND_SPRITES.includes(name))) {
    const { description, images } = loaded[layer.name];
    assert.deepEqual(backgroundFrame(description), sheetFrames(description)[layer.name]);
    const image = images[layer.name];
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
