// Draws the world straight onto the screen canvas, scaled up: the backdrop's
// layers, the scenery, the tiles (crates jolting as they open), leaking
// sewage, moving platforms, signs, checkpoints, the goal and the filling
// station, the items, citizens, the enemies (the boss with his pips) and what they throw,
// props, Blenke, the grass's fringe in front of them all (fringe.js),
// the power-up at work around him, the particles
// thrown up (particles.js), the walls of secret rooms not yet found, the
// points floating up from pickups, what people say, the act key's prompt, the HUD and the message line; and the screens
// around the play (screens.js) over it, or over the backdrop alone. The
// art is the asset factory's sprite sheets (sprites.js; sheets.js loads
// them), and what the factory never drew is pixel data from src/art/;
// this module turns each picture, or each frame of a sheet, into a small
// canvas once. Page layer: the only module
// besides main.js and diagnostics.js that draws.
//
// Everything that moves with the world is drawn piece by piece, never as one
// big picture scaled up: each tile, each tile-wide column of a backdrop layer
// and each frame of Blenke has its edges placed by toScreen, and its size runs
// to where its far edge lands. Pieces then meet without seams, keep their
// shape as the view scrolls (each only ever takes one of two sizes), and
// everything is placed by the same rule.
import { BACKGROUND_LAYERS, HORIZON } from './art/backgrounds.js';
import { FADE_LEVELS, fadeImage } from './art/cover.js';
import { BOSS_PIPS } from './art/enemies.js';
import { LINE_HEIGHT, textImage, textWidth } from './art/font.js';
import { GLOW_FPS, glowFrames } from './art/glow.js';
import { beamArt, wornLooks } from './art/props.js';
import { stationSign } from './art/board.js';
import { TOUCH_ART, TURN_ART } from './art/touch.js';
import { HOSE_TOP, HOUSE_LEFT, needleStep, STATION_ART } from './art/station.js';
import { GAME_OVER_HEADING, LOGO, TAG_LETTER_ART } from './art/logo.js';
import { SPEAKER_OFF, VOLUME_BARS } from './art/sound.js';
import { DEFEATED_TIME } from './ai.js';
import { frameName } from './animation.js';
import { BACKDROPS, backdropBands, DEFAULT_BACKDROP } from './backdrop.js';
import { FRINGE_RAISE, fringeRows, hasFringe, liftAboveGrass } from './fringe.js';
import { CITIZENS, citizenLine } from './citizens.js';
import { ENEMIES } from './enemies.js';
import { STEP, TILE, VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { isLeaking, LEAK_WIDTH } from './hazards.js';
import { HUD_BOTTOM, hudElements, ITEM_ICONS } from './hud.js';
import { isStill, shakeOffset } from './impact.js';
import { INSET, ITEMS } from './items.js';
import { EMPTY, isLiquid, isSecret, isSolid, pixelHeight, ROOM, SECRET_ASPHALT, SECRET_WALL, tileAt, tileType } from './level.js';
import { colour } from './palette.js';
import { fromRgba, mirrored, noise } from './pixels.js';
import { hasEffect, isBlinkedOut, POWER_UPS } from './powerups.js';
import { toScreen } from './projection.js';
import { isShining, PROPS } from './props.js';
import { SCENERY } from './scenery.js';
import { screenLayout, tagImageName, turnLayout } from './screens.js';
import { fadeOver, irisOver } from './transitions.js';
import { PROJECTILES } from './projectiles.js';
import { backgroundFrame, characterLook, checkpointLook, citizenLook, EFFECT_SPRITES, effectLook, enemyLook, goalLook, HUD_SPRITES, leakLook, MANIFEST, onlyFrame, projectileLook, sceneryLook, sheetFrames, SPRITES_PATH, TILE_SPRITES, tileLook } from './sprites.js';
import { actionTarget, BUMP_TIME, POPUP_TIME } from './world.js';

// Items bob gently where they float, never below their resting place: this
// high, this often a second.
const BOB_HEIGHT = 1.5;
const BOB_RATE = 1.2;
// A pickup's points start this far above the item, clear of Blenke's face,
// and float this far up before they fade.
const POPUP_START = 8;
const POPUP_RISE = 14;
// Blinking after a hit: this many times a second, shown half the time.
const BLINK_RATE = 15;
// An enemy's walk takes a step every this many pixels, and sways this
// often a second when it hardly moves.
const STRIDE = 6;
const SWAY_RATE = 1.5;
// A slogan, a plea or thanks floats this far above the speaker's head.
const SPEECH_GAP = 2;
// A phone booth jolts this high, over this long, as it lights.
const JOLT_HEIGHT = 3;
const JOLT_TIME = 0.2;
// A crate jolts this high as it opens.
const BUMP_HEIGHT = 4;
// A stunned enemy blinks this many times a second.
const STUN_BLINK_RATE = 12;
// A boss's pips sit this far over his head, this far apart.
const PIP_GAP = 3;
const PIP_SPACING = 1;
// While the hippie plays, a note rises from his guitar every this many
// seconds, this high, starting this far above his feet.
const NOTE_EVERY = 0.75;
const NOTE_RISE = 16;
const NOTE_START = 12;
// A fading enemy (the goth) is drawn in this many steps of see-through.
const FADE_STEPS = 4;
// A citizen's head is this far above his feet, as tall as an enemy.
const CITIZEN_HEIGHT = 24;
// The top of Blenke's cap, above his feet, standing and crouched.
const CAP_TOP = 27;
const CAP_TOP_CROUCHED = 16;
// A form or a banknote circles him this wide, this high, this fast.
const ORBIT_X = 13;
const ORBIT_Y = 5;
const ORBIT_RATE = 5;
// The act key's prompt over Blenke's head.
const PROMPTS = { help: 'C: HJÄLP', read: 'C: LÄS', lift: 'C: LYFT' };
// Played by touch there is no C to name: the hand button does it.
const TOUCH_PROMPTS = { help: 'HJÄLP', read: 'LÄS', lift: 'LYFT' };
const PROMPT_GAP = 4;
// Rendered lines of text are kept for reuse; past this many (the score and
// the clock make new ones all the time) the store starts over.
const MAX_TEXTS = 200;
// Behind the title the backdrop drifts by this fast, in art pixels a second.
const TITLE_DRIFT = 12;
// A two-pixel particle draws as one for the last part of its life.
const PARTICLE_SHRINK = 0.7;
// How bright a torch's light is over what it lights.
const BEAM_OPACITY = 0.3;
// How much a screen over the world dims it.
const SHADE_OPACITY = 0.75;

export function toCanvas(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');
  const data = context.createImageData(image.width, image.height);
  image.pixels.forEach((value, index) => {
    if (value === null) return;
    data.data[index * 4] = parseInt(value.slice(1, 3), 16);
    data.data[index * 4 + 1] = parseInt(value.slice(3, 5), 16);
    data.data[index * 4 + 2] = parseInt(value.slice(5, 7), 16);
    data.data[index * 4 + 3] = 255;
  });
  context.putImageData(data, 0, 0);
  return canvas;
}

function mapValues(object, convert) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, convert(value)]));
}

// One frame cut out of a loaded sheet, mirrored if asked.
function cutFrame(sheet, frame, flip) {
  const canvas = document.createElement('canvas');
  canvas.width = frame.w;
  canvas.height = frame.h;
  const context = canvas.getContext('2d');
  if (flip) {
    context.translate(frame.w, 0);
    context.scale(-1, 1);
  }
  context.drawImage(sheet, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);
  return canvas;
}

// The sheet a picture is cut from. The asset factory delivers every
// picture the game draws but the few drawn in code (src/art/), so a
// missing sheet is an error, never a picture left out.
function needed(sheet, what) {
  if (!sheet) throw new Error(`No sprite sheet for ${what}: is it in ${SPRITES_PATH}/${MANIFEST} and did it load?`);
  return sheet;
}

// A frame cut out of a sheet facing both ways, with the point it is placed
// by (facing right; mirrored, it is measured from the other side).
function facingBoth(sheet, frame) {
  return { right: cutFrame(sheet.image, frame, false), left: cutFrame(sheet.image, frame, true), width: frame.w, originX: frame.originX, originY: frame.originY };
}

// A sheet's frame by name, or an error naming what is missing.
function frameOf(sheet, frames, name) {
  const frame = frames[name];
  if (!frame) throw new Error(`Sheet '${sheet.description.meta.sprite}' has no frame ${name}`);
  return frame;
}

// Blenke's frames, each facing both ways, and his animations, from his
// sheet.
function playerLook(sheet) {
  const { description } = needed(sheet, 'Blenke');
  const frames = mapValues(sheetFrames(description), (frame) => facingBoth(sheet, frame));
  return { frames, ...characterLook(description) };
}

// Each tile's pictures as tileImageFor uses them, from its sheet.
function tileLooks(sheets) {
  const looks = Object.fromEntries(Object.values(TILE_SPRITES).map((char) => {
    const sheet = needed(sheets[char], `the tile '${char}'`);
    const frames = sheetFrames(sheet.description);
    const { top, fill, fps } = tileLook(sheet.description, isSolid(char));
    const cut = (names) => names?.map((name) => cutFrame(sheet.image, frameOf(sheet, frames, name), false));
    return [char, { top: cut(top), fill: cut(fill), fps }];
  }));
  // A secret room's wall is the brick wall it hides in; secret asphalt is
  // asphalt, top and fill alike.
  looks[SECRET_WALL] = { top: looks.B.fill };
  looks[SECRET_ASPHALT] = looks.A;
  return looks;
}

// Each lawn top's fringe (fringe.js), cut from its top rows, by the
// picture it is cut from.
function fringeLooks(tiles) {
  const fringes = new Map();
  for (const [char, art] of Object.entries(tiles)) {
    if (!tileType(char)?.fringe) continue;
    for (const top of art.top) {
      const { width, height } = top;
      const rows = fringeRows(top.getContext('2d').getImageData(0, 0, width, height).data, width, height);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = rows;
      canvas.getContext('2d').drawImage(top, 0, 0);
      fringes.set(top, canvas);
    }
  }
  return fringes;
}

// A sheet's frame cut out as it faces, with the point it is placed by.
function placedFrame(sheet, frames, name) {
  const frame = frameOf(sheet, frames, name);
  return { image: cutFrame(sheet.image, frame, false), originX: frame.originX, originY: frame.originY };
}

// The checkpoint's phone booth unlit, and lit (frames played at fps).
function landmarkCheckpoint(sheet) {
  const { description } = needed(sheet, 'the checkpoint');
  const frames = sheetFrames(description);
  const { unlit, lit, fps } = checkpointLook(description);
  return { fps, unlit: placedFrame(sheet, frames, unlit), lit: lit.map((name) => placedFrame(sheet, frames, name)) };
}

// A leaking pipe's stream, its frames played in turn.
function leakFrames(sheet) {
  const { description } = needed(sheet, 'the leak');
  const frames = sheetFrames(description);
  const { frames: names, fps } = leakLook(description);
  return { fps, frames: names.map((name) => cutFrame(sheet.image, frameOf(sheet, frames, name), false)) };
}

// Each citizen type's looks: standing, and waving while it pleads, each
// frame facing both ways.
function citizenLooks(sheets) {
  return Object.fromEntries(Object.keys(CITIZENS).map((type) => {
    const sheet = needed(sheets[type], `the citizen ${type}`);
    const frames = sheetFrames(sheet.description);
    const played = ({ frames: names, fps }) => ({ frames: names.map((name) => facingBoth(sheet, frameOf(sheet, frames, name))), fps });
    const { stand, wave } = citizenLook(sheet.description);
    return [type, { stand: played(stand), wave: played(wave) }];
  }));
}

// Each power-up effect's frames, facing both ways, at its fps.
function effectLooks(sheets) {
  return Object.fromEntries(Object.values(EFFECT_SPRITES).map((name) => {
    const sheet = needed(sheets[name], `the effect ${name}`);
    const frames = sheetFrames(sheet.description);
    const { frames: names, fps } = effectLook(sheet.description);
    return [name, { fps, frames: names.map((frameName) => facingBoth(sheet, frameOf(sheet, frames, frameName))) }];
  }));
}

// The goal's flag waving, each frame placed by the middle of its foot.
function landmarkGoal(sheet) {
  const { description } = needed(sheet, 'the goal');
  const frames = sheetFrames(description);
  const { frames: names, fps } = goalLook(description);
  return { fps, frames: names.map((name) => placedFrame(sheet, frames, name)) };
}

// A picture with one look, from its sheet.
function singleLook(sheet, what) {
  const { description } = needed(sheet, what);
  return placedFrame(sheet, sheetFrames(description), onlyFrame(description));
}

// A picture's pixels, read back from its canvas, for what is drawn in code
// over or round it.
function pixelsOf(canvas) {
  return fromRgba(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
}

// The blank name board each level's station name is written on, as
// pixels (a pixel's margin round the board), and the point it is placed
// by.
function boardLook(sheet) {
  const { image, originX, originY } = singleLook(sheet, "the station's name board");
  return { blank: pixelsOf(image), originX, originY };
}

// Each prop's looks, worn a little more by each throw: { image (whole,
// for the level editor), originX, originY, worn: [{ right, left }] by how
// worn }.
function propLooks(sheets) {
  return Object.fromEntries(Object.keys(PROPS).map((type) => {
    const look = singleLook(sheets[type], `the prop ${type}`);
    const worn = wornLooks(pixelsOf(look.image)).map((wornPixels) => ({ right: toCanvas(wornPixels), left: toCanvas(mirrored(wornPixels)) }));
    return [type, { ...look, width: look.image.width, worn }];
  }));
}

// A torch's light: its wedge facing either way, and where the lens is on
// it (the wedge's left end, halfway down).
function beamLook() {
  const art = beamArt();
  return { right: toCanvas(art), left: toCanvas(mirrored(art)), width: art.width, middle: (art.height - 1) / 2 };
}

// Each enemy type's looks, one per colour variant: { move: [frame], act:
// frame or null, defeated: frame }, each frame facing both ways.
function enemyLooks(sheets) {
  return Object.fromEntries(Object.entries(ENEMIES).map(([type, enemy]) => [type, Array.from({ length: enemy.variants ?? 1 }, (_, variant) => {
    const sheet = needed(sheets[type]?.[variant], `the enemy ${type} (variant ${variant})`);
    const frames = sheetFrames(sheet.description);
    const { move, act, defeated } = enemyLook(sheet.description);
    const placed = (name) => facingBoth(sheet, frameOf(sheet, frames, name));
    return { move: move.map(placed), act: act && placed(act), defeated: placed(defeated) };
  })]));
}

// What each type of projectile plays as it flies: { fps, frames }, each
// frame facing both ways, placed by its middle.
function projectileLooks(sheets) {
  return Object.fromEntries(Object.keys(PROJECTILES).map((type) => {
    const sheet = needed(sheets[type], `the projectile ${type}`);
    const frames = sheetFrames(sheet.description);
    const { frames: names, fps } = projectileLook(sheet.description);
    return [type, { fps, frames: names.map((name) => facingBoth(sheet, frameOf(sheet, frames, name))) }];
  }));
}

// Each collectible's picture, the point it stands by (the middle of its
// bottom row) and its pixels, which a power-up's glow rings.
function itemLooks(sheets) {
  return Object.fromEntries(Object.keys(ITEMS).map((type) => {
    const look = singleLook(sheets[type], `the item ${type}`);
    return [type, { ...look, pixels: pixelsOf(look.image) }];
  }));
}

// The HUD's icons: the head and the hearts from their sheets, and the
// items' pictures where an icon is an item.
function iconLooks(sheets, items) {
  const icons = mapValues(ITEM_ICONS, (type) => items[type].image);
  for (const [sprite, names] of Object.entries(HUD_SPRITES)) {
    const sheet = needed(sheets[sprite], `the HUD's ${sprite}`);
    const frames = sheetFrames(sheet.description);
    for (const [name, icon] of Object.entries(names)) icons[icon] = cutFrame(sheet.image, frameOf(sheet, frames, name), false);
  }
  return icons;
}

// Each piece of scenery as frames played at fps (one, still, for most),
// each placed by the origin the factory gave it. The station's name board
// is drawn with each level's name on it instead (boardLook).
function sceneryLooks(sheets) {
  return Object.fromEntries(Object.entries(SCENERY).filter(([, piece]) => !piece.named).map(([type]) => {
    const sheet = needed(sheets[type], `the scenery ${type}`);
    const frames = sheetFrames(sheet.description);
    const { frames: names, fps } = sceneryLook(sheet.description, type);
    return [type, { fps, frames: names.map((name) => placedFrame(sheet, frames, name)) }];
  }));
}

// The horizon as a layer: a strip one period wide, the landmark standing
// in it at its place, so it recurs as the strip repeats.
function horizonLayer(sheet) {
  const { description } = needed(sheet, 'the horizon');
  const frame = sheetFrames(description)[onlyFrame(description)];
  const canvas = document.createElement('canvas');
  canvas.width = HORIZON.period;
  canvas.height = frame.h;
  canvas.getContext('2d').drawImage(cutFrame(sheet.image, frame, false), HORIZON.x - frame.originX, 0);
  return { name: HORIZON.name, factor: HORIZON.factor, top: HORIZON.base - frame.originY, fill: null, canvas };
}

// A layer's rows in bands to fill or draw in columns (backdrop.js).
function withBands(layer) {
  const { canvas } = layer;
  const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  return { ...layer, bands: backdropBands(data, canvas.width, canvas.height, TILE) };
}

// Each backdrop's layers (BACKDROPS), the horizon behind the flats.
function backdropLooks(sheets, horizon) {
  const layers = backgroundLayers(sheets, horizon);
  return mapValues(BACKDROPS, (names) => layers.filter((layer) => names.includes(layer.name)));
}

// Each layer from its sheet.
function backgroundLayers(sheets, horizon) {
  const layers = BACKGROUND_LAYERS.map((layer) => {
    const sheet = needed(sheets[layer.name], `the backdrop layer ${layer.name}`);
    return { ...layer, canvas: cutFrame(sheet.image, backgroundFrame(sheet.description), false) };
  });
  layers.splice(layers.findIndex((layer) => layer.factor > HORIZON.factor), 0, horizonLayer(horizon));
  return layers.map(withBands);
}

// sprites: the sheets sheets.js has loaded, { player, checkpoint, goal,
// sign, stationSign, platform, leak, horizon, props: { type }, citizens:
// { type }, station: { part }, effects: { name }, tiles: { char },
// enemies: { type: [by variant] }, enemyExtras: { name }, projectiles:
// { type }, scenery: { type }, backgrounds: { layer }, items: { type },
// hud: { sprite } }, each { description, image }. Every picture the game
// draws must be there, but those drawn in code.
export function createRenderer(sprites) {
  const tiles = tileLooks(sprites.tiles);
  const items = itemLooks(sprites.items);
  return {
    tiles,
    fringes: fringeLooks(tiles),
    leak: leakFrames(sprites.leak),
    platform: singleLook(sprites.platform, 'the moving platform'),
    enemies: enemyLooks(sprites.enemies),
    projectiles: projectileLooks(sprites.projectiles),
    backdrops: backdropLooks(sprites.backgrounds, sprites.horizon),
    player: playerLook(sprites.player),
    items,
    glows: { fps: GLOW_FPS, frames: Object.fromEntries(Object.keys(POWER_UPS).map((type) => [type, glowFrames(items[type].pixels).map(toCanvas)])) },
    citizens: citizenLooks(sprites.citizens),
    props: propLooks(sprites.props),
    beam: beamLook(),
    sign: singleLook(sprites.sign, 'the sign'),
    scenery: sceneryLooks(sprites.scenery),
    board: boardLook(sprites.stationSign),
    named: new Map(),
    checkpoint: landmarkCheckpoint(sprites.checkpoint),
    goal: landmarkGoal(sprites.goal),
    station: {
      house: singleLook(sprites.station.house, 'the station house'),
      pump: singleLook(sprites.station.pump, "the station's pump"),
      hose: toCanvas(STATION_ART.hose),
      needles: STATION_ART.needles.map(toCanvas),
    },
    pips: mapValues(BOSS_PIPS, toCanvas),
    musicNote: singleLook(sprites.enemyExtras.musicNote, "the hippie's note"),
    skateboard: singleLook(sprites.enemyExtras.skateboard, "the skater's board"),
    effects: effectLooks(sprites.effects),
    icons: iconLooks(sprites.hud, items),
    images: {
      logo: toCanvas(LOGO),
      gameOver: toCanvas(GAME_OVER_HEADING),
      speakerOff: toCanvas(SPEAKER_OFF),
      turn: toCanvas(TURN_ART),
      ...Object.fromEntries(VOLUME_BARS.map((bar, level) => [`volume${level}`, toCanvas(bar)])),
      ...Object.fromEntries(Object.entries(TAG_LETTER_ART).flatMap(([look, letters]) =>
        Object.entries(letters).map(([letter, image]) => [tagImageName(look, letter), toCanvas(image)]))),
    },
    touch: {
      pad: toCanvas(TOUCH_ART.pad),
      ...Object.fromEntries(['knob', 'jump', 'act', 'pause'].map((name) => [name, mapValues(TOUCH_ART[name], toCanvas)])),
    },
    texts: new Map(),
    // The fade's dithered covers, made as each is first needed.
    fades: [],
    // Set when the player asks for less motion: the view never shakes.
    calm: false,
  };
}

// The frame of a looping animation at `time`. The drawn moment can be a
// little before the world's start (it lags the last step), so the time
// may be negative.
function frameAt(frames, fps, time) {
  const count = frames.length;
  return frames[((Math.floor(time * fps) % count) + count) % count];
}

function lerp(from, to, alpha) {
  return from + (to - from) * alpha;
}

// A backdrop's layers (BACKDROPS) move by their share of the camera's
// movement, sideways from the level's left edge and up and down from the
// camera's lowest position (lowestCamY), where each layer's top sits at its
// given height.
function drawBackground(ctx, renderer, backdrop, lowestCamY, camX, camY, view) {
  const { scale } = view;
  const viewBottom = view.y + view.height;
  for (const layer of renderer.backdrops[backdrop]) {
    const offsetX = camX * layer.factor;
    const offsetY = (camY - lowestCamY) * layer.factor;
    const { canvas } = layer;
    const columns = canvas.width / TILE;
    const first = Math.floor(offsetX / TILE);
    const last = Math.floor((offsetX + VIEW_WIDTH) / TILE);
    for (const band of layer.bands) {
      const top = view.y + toScreen(layer.top + band.from, offsetY, scale);
      const bottom = view.y + toScreen(layer.top + band.to, offsetY, scale);
      if (bottom <= view.y || top >= viewBottom) continue;
      if (band.colour) {
        ctx.fillStyle = band.colour;
        ctx.fillRect(view.x, top, view.width, bottom - top);
        continue;
      }
      for (let column = first; column <= last; column++) {
        const index = ((column % columns) + columns) % columns;
        if (!band.columns[index]) continue;
        const left = view.x + toScreen(column * TILE, offsetX, scale);
        const right = view.x + toScreen((column + 1) * TILE, offsetX, scale);
        ctx.drawImage(canvas, index * TILE, band.from, TILE, band.to - band.from, left, top, right - left, bottom - top);
      }
    }
    const bottom = view.y + toScreen(layer.top + canvas.height, offsetY, scale);
    if (layer.fill && bottom < viewBottom) {
      ctx.fillStyle = layer.fill;
      ctx.fillRect(view.x, bottom, view.width, viewBottom - bottom);
    }
  }
}

// Under more of itself, or solid under something solid or liquid (or a
// secret tile, which looks solid), a tile shows its fill; a disguised
// tile (secret asphalt) is chosen as the tile it looks like. A room's
// inside shows its top, the ceiling's shadow, only under something
// solid. Liquids play their frames; other tiles pick a variant by place.
export function tileImageFor(tiles, level, char, col, row, time) {
  const art = tiles[char];
  if (!art) return null;
  const above = tileAt(level, col, row - 1);
  const coveredBy = isSolid(above) || isLiquid(above) || isSecret(above);
  const looks = disguised(char);
  const covered = char === ROOM ? !isSolid(above) : art.fill && (disguised(above) === looks || (isSolid(looks) && coveredBy));
  const pictures = covered ? art.fill : art.top;
  if (art.fps) return frameAt(pictures, art.fps, time);
  return variantAt(pictures, col, row);
}

// Which variant a tile at col, row uses: fixed per place, so the ground
// doesn't change as the view scrolls.
function variantAt(variants, col, row) {
  return variants[Math.floor(noise(col, row, 5) * variants.length)];
}

// The tile a tile looks like: itself, or what it is disguised as.
function disguised(char) {
  return tileType(char)?.disguise ?? char;
}

// How far each jolting crate is lifted, by its place.
function bumpOffsets(world, lag) {
  const offsets = new Map();
  for (const bump of world.bumps) {
    const age = Math.max(0, bump.age - lag);
    offsets.set(`${bump.col},${bump.row}`, Math.sin((Math.min(age, BUMP_TIME) / BUMP_TIME) * Math.PI) * BUMP_HEIGHT);
  }
  return offsets;
}

// Whether a tile that doesn't fill its square (a plank, a gate) stands in
// a room, beside the room's own tiles, and needs the room drawn behind it.
function inRoom(level, char, col, row) {
  if (char === EMPTY || char === ROOM || isSecret(char)) return false;
  if (isSolid(char) && !tileType(char).seeThrough) return false;
  return tileAt(level, col - 1, row) === ROOM || tileAt(level, col + 1, row) === ROOM;
}

// The tiles in sight. The walls of secret rooms not yet found are drawn
// by themselves (front: true), in front of everything, so what is behind
// them stays hidden.
function drawTiles(ctx, renderer, level, time, bumps, camX, camY, view, front = false) {
  const { scale } = view;
  const firstCol = Math.max(0, Math.floor(camX / TILE));
  const lastCol = Math.min(level.width - 1, Math.floor((camX + VIEW_WIDTH) / TILE));
  const firstRow = Math.max(0, Math.floor(camY / TILE));
  const lastRow = Math.min(level.height - 1, Math.floor((camY + VIEW_HEIGHT) / TILE));
  for (let row = firstRow; row <= lastRow; row++) {
    const top = view.y + toScreen(row * TILE, camY, scale);
    const height = view.y + toScreen((row + 1) * TILE, camY, scale) - top;
    for (let col = firstCol; col <= lastCol; col++) {
      const char = tileAt(level, col, row);
      if (isSecret(char) !== front) continue;
      const image = tileImageFor(renderer.tiles, level, char, col, row, time);
      if (!image) continue;
      const left = view.x + toScreen(col * TILE, camX, scale);
      const width = view.x + toScreen((col + 1) * TILE, camX, scale) - left;
      if (inRoom(level, char, col, row)) {
        ctx.drawImage(tileImageFor(renderer.tiles, level, ROOM, col, row, time), left, top, width, height);
      }
      const lift = bumps.get(`${col},${row}`);
      if (lift) {
        drawInWorld(ctx, image, col * TILE, row * TILE - lift, camX, camY, view);
        continue;
      }
      ctx.drawImage(image, left, top, width, height);
    }
  }
}

// The lawn's fringe, raised above each tile's top edge, in front of what
// stands on it (fringe.js).
function drawFringes(ctx, renderer, level, time, camX, camY, view) {
  const { scale } = view;
  const firstCol = Math.max(0, Math.floor(camX / TILE));
  const lastCol = Math.min(level.width - 1, Math.floor((camX + VIEW_WIDTH) / TILE));
  const firstRow = Math.max(0, Math.floor(camY / TILE));
  const lastRow = Math.min(level.height - 1, Math.floor((camY + VIEW_HEIGHT + FRINGE_RAISE) / TILE));
  for (let row = firstRow; row <= lastRow; row++) {
    for (let col = firstCol; col <= lastCol; col++) {
      if (!hasFringe(level, col, row)) continue;
      const fringe = renderer.fringes.get(tileImageFor(renderer.tiles, level, tileAt(level, col, row), col, row, time));
      const left = view.x + toScreen(col * TILE, camX, scale);
      const width = view.x + toScreen((col + 1) * TILE, camX, scale) - left;
      const top = view.y + toScreen(row * TILE - FRINGE_RAISE, camY, scale);
      const height = view.y + toScreen(row * TILE - FRINGE_RAISE + fringe.height, camY, scale) - top;
      ctx.drawImage(fringe, left, top, width, height);
    }
  }
}

// Draws a picture whose top left corner is at x, y in the world, unless it
// is out of sight.
function drawInWorld(ctx, image, x, y, camX, camY, view) {
  if (x + image.width < camX || x > camX + VIEW_WIDTH || y + image.height < camY || y > camY + VIEW_HEIGHT) return;
  const { scale } = view;
  const left = view.x + toScreen(x, camX, scale);
  const top = view.y + toScreen(y, camY, scale);
  const right = view.x + toScreen(x + image.width, camX, scale);
  const bottom = view.y + toScreen(y + image.height, camY, scale);
  ctx.drawImage(image, left, top, right - left, bottom - top);
}

// Blenke's frame hangs from its own origin, at the middle of his feet
// (the run's frames are cut further left, to make room for the lean).
// After a hit he blinks while nothing can hurt him.
function drawPlayer(ctx, renderer, world, alpha, camX, camY, view) {
  const { player, animation } = world;
  const blinking = player.invulnerable > 0 && player.hurt === 0 && world.down === 0;
  if (blinking && Math.floor(player.invulnerable * BLINK_RATE) % 2 === 1) return;
  const { frames, animations, playback } = renderer.player;
  const frame = frames[frameName(animation, animations, playback)];
  const left = player.facing < 0;
  const originX = left ? frame.width - frame.originX : frame.originX;
  const feetX = lerp(player.px, player.x, alpha) + player.w / 2;
  const feetY = lerp(player.py, player.y, alpha) + player.h;
  drawInWorld(ctx, left ? frame.left : frame.right, feetX - originX, feetY - frame.originY, camX, camY, view);
}

// The stream from each leaking pipe, a tile at a time down to where it lands.
function drawLeaks(ctx, renderer, world, time, camX, camY, view) {
  const { frames, fps } = renderer.leak;
  for (const leak of world.leaks) {
    if (!isLeaking(leak, time)) continue;
    const x = leak.col * TILE + (TILE - LEAK_WIDTH) / 2;
    const image = frameAt(frames, fps, time);
    for (let y = leak.top; y < leak.bottom; y += TILE) drawInWorld(ctx, image, x, y, camX, camY, view);
  }
}

function drawPlatforms(ctx, renderer, world, alpha, camX, camY, view) {
  for (const platform of world.platforms) {
    const x = lerp(platform.px, platform.x, alpha);
    const y = lerp(platform.py, platform.y, alpha);
    const { image, originX, originY } = renderer.platform;
    for (let i = 0; i < platform.tiles; i++) drawInWorld(ctx, image, x + i * TILE - originX, y - originY, camX, camY, view);
  }
}

function lookOf(renderer, enemy) {
  return renderer.enemies[enemy.type][enemy.variant];
}

function enemyFrame(renderer, world, enemy) {
  const look = lookOf(renderer, enemy);
  if (enemy.defeated) return look.defeated;
  if (enemy.acting > 0 && look.act) return look.act;
  const sway = ENEMIES[enemy.type].sway ?? SWAY_RATE;
  return look.move[Math.floor(enemy.walkTime / STRIDE + world.time * sway) % look.move.length];
}

// How far above an enemy's feet the top of its frame is, where what it
// says and a boss's pips go.
function enemyHeight(renderer, enemy) {
  return lookOf(renderer, enemy).move[0].originY;
}

// Enemies hang from their frame's origin at the middle of their feet,
// like Blenke. A stunned one blinks; an awake boss shows the hits he has
// left over his head.
function drawEnemies(ctx, renderer, world, alpha, camX, camY, view) {
  for (const enemy of world.enemies) {
    const feetX = lerp(enemy.px, enemy.x, alpha) + enemy.w / 2;
    const feetY = lerp(enemy.py, enemy.y, alpha) + enemy.h;
    const blinkedOut = enemy.hitTime > 0 && Math.floor(enemy.hitTime * STUN_BLINK_RATE) % 2 === 1;
    // A skater's board rolls on after he has lain flat and gone.
    if (enemy.defeated && enemy.deck) drawBoard(ctx, renderer, enemy.deck, alpha, camX, camY, view);
    const gone = enemy.defeated && enemy.defeatedTime >= DEFEATED_TIME;
    if (!blinkedOut && !gone) {
      const frame = enemyFrame(renderer, world, enemy);
      const left = enemy.facing < 0;
      const originX = left ? frame.width - frame.originX : frame.originX;
      // A fading enemy shows in a few steps of see-through, like old fades.
      ctx.globalAlpha = Math.ceil(enemy.shown * FADE_STEPS) / FADE_STEPS;
      drawInWorld(ctx, left ? frame.left : frame.right, feetX - originX, feetY - frame.originY, camX, camY, view);
      ctx.globalAlpha = 1;
    }
    if (ENEMIES[enemy.type].sitTime && enemy.acting > 0 && !enemy.defeated) drawNotes(ctx, renderer, enemy, feetX, feetY, camX, camY, view);
    if (!ENEMIES[enemy.type].boss || !enemy.awake || enemy.defeated) continue;
    const { full, spent } = renderer.pips;
    const total = ENEMIES[enemy.type].health;
    const width = total * (full.width + PIP_SPACING) - PIP_SPACING;
    const top = feetY - enemyHeight(renderer, enemy) - PIP_GAP - full.height;
    for (let i = 0; i < total; i++) {
      const x = Math.round(feetX - width / 2) + i * (full.width + PIP_SPACING);
      drawInWorld(ctx, i < enemy.health ? full : spent, x, top, camX, camY, view);
    }
  }
}

function drawBoard(ctx, renderer, board, alpha, camX, camY, view) {
  const { image, originX, originY } = renderer.skateboard;
  drawInWorld(ctx, image, lerp(board.px, board.x, alpha) - originX, lerp(board.py, board.y, alpha) - originY, camX, camY, view);
}

// Notes rise from the hippie's guitar and drift the way he faces, each
// starting as the last is half way up.
function drawNotes(ctx, renderer, enemy, feetX, feetY, camX, camY, view) {
  const played = ENEMIES[enemy.type].sitTime - enemy.acting;
  const note = renderer.musicNote;
  for (const offset of [0, NOTE_EVERY]) {
    const share = ((played + offset) % (2 * NOTE_EVERY)) / (2 * NOTE_EVERY);
    const x = feetX + enemy.facing * (4 + share * 8) - note.originX;
    const y = feetY - NOTE_START - share * NOTE_RISE - note.originY;
    drawInWorld(ctx, note.image, x, y, camX, camY, view);
  }
}

// What is thrown plays through its frames, placed by its frame's origin
// on its middle, and faces the way it flies: a shout's tail points back
// at the one who shouted.
function drawProjectiles(ctx, renderer, world, alpha, camX, camY, view) {
  for (const projectile of world.projectiles) {
    const { frames, fps } = renderer.projectiles[projectile.type];
    const frame = frames[Math.floor(projectile.age * fps) % frames.length];
    const left = projectile.vx < 0;
    const originX = left ? frame.width - frame.originX : frame.originX;
    const x = lerp(projectile.px, projectile.x, alpha) + projectile.w / 2 - originX;
    const y = lerp(projectile.py, projectile.y, alpha) + projectile.h / 2 - frame.originY;
    drawInWorld(ctx, left ? frame.left : frame.right, x, y, camX, camY, view);
  }
}

// A line said floats over the speaker's head (top) while the speaker is
// in sight, kept within the view.
function drawSpeech(ctx, renderer, text, colour, middle, top, camX, camY, view) {
  if (middle < camX || middle > camX + VIEW_WIDTH) return;
  const canvas = textCanvas(renderer, text, colour, 'ink');
  const x = Math.min(Math.max(middle - Math.floor(canvas.width / 2), camX + 2), camX + VIEW_WIDTH - canvas.width - 2);
  drawInWorld(ctx, canvas, x, top - canvas.height - SPEECH_GAP, camX, camY, view);
}

function drawSlogans(ctx, renderer, world, alpha, camX, camY, view) {
  for (const enemy of world.enemies) {
    if (!enemy.saying || enemy.defeated || enemy.shown === 0) continue;
    const middle = lerp(enemy.px, enemy.x, alpha) + enemy.w / 2;
    const boss = ENEMIES[enemy.type].boss;
    // A boss's pips are over his head, so his words go over them.
    const raise = boss ? PIP_GAP + renderer.pips.full.height : 0;
    const top = lerp(enemy.py, enemy.y, alpha) + enemy.h - enemyHeight(renderer, enemy) - raise;
    drawSpeech(ctx, renderer, enemy.saying, boss ? 'red_4' : 'hivis_3', middle, top, camX, camY, view);
  }
}

// Citizens stand still, so they need no interpolation; a pleading one
// waves.
function drawCitizens(ctx, renderer, world, time, camX, camY, view) {
  for (const citizen of world.citizens) {
    const look = renderer.citizens[citizen.type];
    const pleading = !citizen.helped && citizen.near;
    const { frames, fps } = pleading ? look.wave : look.stand;
    const frame = frameAt(frames, fps, time);
    const left = citizen.facing < 0;
    const originX = left ? frame.width - frame.originX : frame.originX;
    const middle = citizen.x + citizen.w / 2;
    const feet = citizen.y + citizen.h;
    drawInWorld(ctx, left ? frame.left : frame.right, middle - originX, feet - frame.originY, camX, camY, view);
  }
}

function drawCitizenLines(ctx, renderer, world, camX, camY, view) {
  for (const citizen of world.citizens) {
    const line = citizenLine(citizen);
    if (!line) continue;
    const top = citizen.y + citizen.h - CITIZEN_HEIGHT;
    drawSpeech(ctx, renderer, line, citizen.helped ? 'grass_4' : 'white', citizen.x + citizen.w / 2, top, camX, camY, view);
  }
}

function drawSigns(ctx, renderer, world, camX, camY, view) {
  const { image, originX, originY } = renderer.sign;
  for (const sign of world.signs) drawInWorld(ctx, image, sign.x - originX, sign.y - originY, camX, camY, view);
}

// The police station's house stands behind the scenery (its police car
// parks in front of it).
function drawStationHouse(ctx, renderer, world, camX, camY, view) {
  const { station } = world;
  if (!station) return;
  const { image, originX, originY } = renderer.station.house;
  drawInWorld(ctx, image, station.x - HOUSE_LEFT - originX, station.y + station.h - originY, camX, camY, view);
}

// A station's name board with its name written on it, made the first time
// it is drawn; the level editor draws its boards with it too.
export function stationSignLook(renderer, name) {
  if (!renderer.named.has(name)) {
    const { blank, originX, originY } = renderer.board;
    renderer.named.set(name, { image: toCanvas(stationSign(name, blank)), originX, originY });
  }
  return renderer.named.get(name);
}

// Scenery stands still (a flag waves), behind everything else in the
// world. Each piece stands with its origin on the bottom left corner of
// its place; one whose sheet is missing isn't drawn.
function drawScenery(ctx, renderer, world, time, camX, camY, view) {
  for (const piece of world.scenery) {
    const played = renderer.scenery[piece.type];
    const look = SCENERY[piece.type].named ? stationSignLook(renderer, piece.text ?? '') : played && frameAt(played.frames, played.fps, time);
    if (!look) continue;
    drawInWorld(ctx, look.image, piece.x - look.originX, piece.y + piece.h - look.originY, camX, camY, view);
  }
}

// A checkpoint is dark until Blenke has passed it, then lit, standing on
// the middle of its foot whatever its picture's size; the goal's flag
// waves.
function drawLandmarks(ctx, renderer, world, time, camX, camY, view) {
  const { checkpoint, goal } = renderer;
  for (const post of world.checkpoints) {
    const look = post.passed ? frameAt(checkpoint.lit, checkpoint.fps, time) : checkpoint.unlit;
    const jolt = post.passed && post.passedTime < JOLT_TIME ? Math.sin((post.passedTime / JOLT_TIME) * Math.PI) * JOLT_HEIGHT : 0;
    drawInWorld(ctx, look.image, post.x + post.w / 2 - look.originX, post.y + post.h - look.originY - jolt, camX, camY, view);
  }
  drawStation(ctx, renderer, world, camX, camY, view);
  if (!world.goal) return;
  const look = frameAt(goal.frames, goal.fps, time);
  drawInWorld(ctx, look.image, world.goal.x + world.goal.w / 2 - look.originX, world.goal.y + world.goal.h - look.originY, camX, camY, view);
}

// The pump with its needle where it stands, and the hose to Blenke once he
// has plugged in (it runs behind him to his belt).
function drawStation(ctx, renderer, world, camX, camY, view) {
  const { station } = world;
  if (!station) return;
  const { pump, hose, needles } = renderer.station;
  drawInWorld(ctx, pump.image, station.x - pump.originX, station.y + station.h - pump.originY, camX, camY, view);
  drawInWorld(ctx, needles[needleStep(station.needle)], station.x, station.y, camX, camY, view);
  if (station.phase === 'waiting' || station.phase === 'walking') return;
  drawInWorld(ctx, hose, station.x - hose.width + 1, station.y + HOSE_TOP, camX, camY, view);
}

// Props stand on the bottom of their body, facing the way they were
// thrown (or are carried), as worn as their throws have made them;
// carried, one is drawn after Blenke, in front of him. A shining torch's
// light is drawn first, see-through, and a blaring megaphone's slogan
// over it.
function drawProps(ctx, renderer, world, alpha, carried, camX, camY, view) {
  for (const prop of world.props) {
    if (prop.carried !== carried) continue;
    const look = renderer.props[prop.type];
    const left = prop.facing < 0;
    const originX = left ? look.width - look.originX : look.originX;
    const x = lerp(prop.px, prop.x, alpha) + prop.w / 2 - originX;
    const y = lerp(prop.py, prop.y, alpha) + prop.h - look.originY;
    if (isShining(prop)) drawBeam(ctx, renderer.beam, prop, alpha, camX, camY, view);
    const worn = look.worn[Math.min(prop.wear, look.worn.length - 1)];
    drawInWorld(ctx, left ? worn.left : worn.right, x, y, camX, camY, view);
    if (prop.saying) drawSpeech(ctx, renderer, prop.saying, 'white', x + originX, y, camX, camY, view);
  }
}

function drawBeam(ctx, beam, prop, alpha, camX, camY, view) {
  const lensX = lerp(prop.px, prop.x, alpha) + (prop.facing < 0 ? -beam.width : prop.w);
  const y = lerp(prop.py, prop.y, alpha) + prop.h / 2 - beam.middle;
  ctx.globalAlpha = BEAM_OPACITY;
  drawInWorld(ctx, prop.facing < 0 ? beam.left : beam.right, lensX, y, camX, camY, view);
  ctx.globalAlpha = 1;
}

// An effect's frame now, facing the way asked: its image and the point
// it is placed by.
function effectFrame(renderer, name, time, facing = 1) {
  const effect = renderer.effects[name];
  const frame = frameAt(effect.frames, effect.fps, time);
  const left = facing < 0;
  return { image: left ? frame.left : frame.right, originX: left ? frame.width - frame.originX : frame.originX, originY: frame.originY };
}

// The power-up at work, around Blenke: the rotor on his cap, steam over
// his shoulder, a form or a banknote circling him, the bag at his hip.
function drawPowerUp(ctx, renderer, world, alpha, time, camX, camY, view) {
  const { powerUp, player } = world;
  if (!powerUp || isBlinkedOut(powerUp, time)) return;
  const feetX = lerp(player.px, player.x, alpha) + player.w / 2;
  const feetY = lerp(player.py, player.y, alpha) + player.h;
  const capTop = feetY - (player.crouching ? CAP_TOP_CROUCHED : CAP_TOP);
  // Each effect is drawn with its own point at (x, y).
  const draw = ({ image, originX, originY }, x, y) => drawInWorld(ctx, image, x - originX, y - originY, camX, camY, view);
  if (powerUp.type === 'helicopter') {
    draw(effectFrame(renderer, 'rotor', time), feetX, capTop);
  } else if (powerUp.type === 'policeCoffee') {
    draw(effectFrame(renderer, 'steam', time, player.facing), feetX - player.facing * 8, capTop + 4);
  } else if (powerUp.type === 'paperworkShield' || powerUp.type === 'budgetIncrease') {
    const effect = effectFrame(renderer, powerUp.type === 'paperworkShield' ? 'shield' : 'note', time);
    const angle = time * ORBIT_RATE;
    draw(effect, feetX + Math.cos(angle) * ORBIT_X, feetY - player.h / 2 + Math.sin(angle) * ORBIT_Y);
  } else if (powerUp.type === 'superBladder') {
    draw(effectFrame(renderer, 'bag', time, player.facing), feetX - player.facing * 6, feetY - 14);
  }
}

// What the act key would do, over Blenke's head (and over a citizen's
// plea, which is said at the same height); throwing needs no prompt.
function drawPrompt(ctx, renderer, world, alpha, camX, camY, view, touch) {
  if (world.down > 0 || world.over || world.complete) return;
  const action = actionTarget(world);
  const prompts = touch ? TOUCH_PROMPTS : PROMPTS;
  if (!action || !prompts[action.kind]) return;
  const { player } = world;
  const feetX = lerp(player.px, player.x, alpha) + player.w / 2;
  const feetY = lerp(player.py, player.y, alpha) + player.h;
  const canvas = textCanvas(renderer, prompts[action.kind], 'white', 'ink');
  const plea = action.kind === 'help' ? LINE_HEIGHT + SPEECH_GAP : 0;
  const top = feetY - (player.crouching ? CAP_TOP_CROUCHED : CAP_TOP) - PROMPT_GAP - canvas.height - plea;
  drawInWorld(ctx, canvas, Math.round(feetX - canvas.width / 2), top, camX, camY, view);
}

// An item stands on the bottom of its tile, in the middle, lifted above
// the grass's fringe on a lawn (fringe.js), and bobs where it rests. `lag` is how far the drawn moment is behind the last step, as
// with positions. A power-up glows round its outline in shifting colours.
// Mandatory testing shows hidden ones, sparkling. A collected item is
// gone at once.

function drawItems(ctx, renderer, world, alpha, lag, camX, camY, view) {
  const time = world.time - lag;
  const testing = hasEffect(world.powerUp, 'reveal');
  for (const item of world.items) {
    if (item.collected || !(item.revealed || testing)) continue;
    const { image, originX, originY } = renderer.items[item.type];
    const phase = time * BOB_RATE + item.phase;
    const bob = item.falling ? 0 : (1 + Math.sin(phase * 2 * Math.PI)) * (BOB_HEIGHT / 2);
    const left = lerp(item.px, item.x, alpha) - INSET;
    const bottom = lerp(item.py, item.y, alpha) - INSET + TILE;
    const x = left + TILE / 2 - originX;
    const y = bottom - liftAboveGrass(world.level, left + TILE / 2, bottom) - originY - bob;
    const glow = renderer.glows.frames[item.type];
    if (glow) drawInWorld(ctx, frameAt(glow, renderer.glows.fps, time), x - 1, y - 1, camX, camY, view);
    drawInWorld(ctx, image, x, y, camX, camY, view);
    if (item.revealed) continue;
    const sparkle = effectFrame(renderer, 'sparkle', time + item.phase);
    drawInWorld(ctx, sparkle.image, x + image.width / 2 - sparkle.originX, y - 1 - sparkle.originY, camX, camY, view);
  }
}

function textCanvas(renderer, text, colourName, shadowName) {
  const key = `${colourName}|${shadowName}|${text}`;
  let canvas = renderer.texts.get(key);
  if (!canvas) {
    if (renderer.texts.size >= MAX_TEXTS) renderer.texts.clear();
    canvas = toCanvas(textImage(text, colourName, shadowName));
    renderer.texts.set(key, canvas);
  }
  return canvas;
}

// Each particle is a square of its colour, its edges placed by toScreen
// like everything else's; a big one shrinks to a single pixel as its life
// runs out.
function drawParticles(ctx, world, alpha, camX, camY, view) {
  const { scale } = view;
  for (const particle of world.particles.list) {
    const size = particle.size > 1 && particle.age > particle.life * PARTICLE_SHRINK ? 1 : particle.size;
    const x = lerp(particle.px, particle.x, alpha) - size / 2;
    const y = lerp(particle.py, particle.y, alpha) - size / 2;
    if (x + size < camX || x > camX + VIEW_WIDTH || y + size < camY || y > camY + VIEW_HEIGHT) continue;
    const left = view.x + toScreen(x, camX, scale);
    const top = view.y + toScreen(y, camY, scale);
    ctx.fillStyle = colour(particle.colour);
    ctx.fillRect(left, top, view.x + toScreen(x + size, camX, scale) - left, view.y + toScreen(y + size, camY, scale) - top);
  }
}

// A pickup's points rise from where it was, centred on it.
function drawPopups(ctx, renderer, world, lag, camX, camY, view) {
  for (const popup of world.popups) {
    const canvas = textCanvas(renderer, popup.text, popup.colour, 'ink');
    const rise = (Math.max(0, popup.age - lag) / POPUP_TIME) * POPUP_RISE;
    const x = popup.x - Math.floor(canvas.width / 2);
    drawInWorld(ctx, canvas, x, popup.y - canvas.height - POPUP_START - rise, camX, camY, view);
  }
}

// A picture that sits still on the view (text, the HUD's icons), at x, y in
// art pixels from the view's top left corner.
function drawOnView(ctx, image, view, x, y) {
  const left = view.x + Math.round(x * view.scale);
  const top = view.y + Math.round(y * view.scale);
  const right = view.x + Math.round((x + image.width) * view.scale);
  const bottom = view.y + Math.round((y + image.height) * view.scale);
  ctx.drawImage(image, left, top, right - left, bottom - top);
}

// Text sits still on the view, so a line is drawn as one picture.
function drawText(ctx, renderer, view, text, x, y, colourName, shadowName = null) {
  drawOnView(ctx, textCanvas(renderer, text, colourName, shadowName), view, x, y);
}

function drawHud(ctx, renderer, world, view) {
  for (const element of hudElements(world)) {
    if (element.kind === 'icon') drawOnView(ctx, renderer.icons[element.icon], view, element.x, element.y);
    else drawText(ctx, renderer, view, element.text, element.x, element.y, element.colour, 'ink');
  }
}

// The message line, centred under the HUD.
function drawMessage(ctx, renderer, world, view) {
  const message = world.messages.current;
  if (!message) return;
  const x = Math.floor((VIEW_WIDTH - textWidth(message.text)) / 2);
  drawText(ctx, renderer, view, message.text, x, HUD_BOTTOM + 4, message.colour, 'ink');
}

// view: where the game sits on the screen canvas and how much it is scaled,
// { x, y, width, height, scale } in screen pixels. hud false leaves out the
// HUD and the message line, for a screen that takes their place. A shake
// moves where the world is drawn from, not the camera, and the HUD stays.
// touch: played by touch, so the act key's prompt names no key.
export function renderWorld(ctx, renderer, world, alpha, view, { hud = true, touch = false } = {}) {
  const { camera, level } = world;
  const lag = (1 - alpha) * STEP;
  const shake = renderer.calm ? { x: 0, y: 0 } : shakeOffset(world.impact, lag);
  const camX = lerp(camera.px, camera.x, alpha) + shake.x;
  const camY = lerp(camera.py, camera.y, alpha) + shake.y;

  ctx.save();
  ctx.beginPath();
  ctx.rect(view.x, view.y, view.width, view.height);
  ctx.clip();
  ctx.imageSmoothingEnabled = false;

  const time = world.time - lag;

  drawBackground(ctx, renderer, level.backdrop, pixelHeight(level) - VIEW_HEIGHT, camX, camY, view);
  drawStationHouse(ctx, renderer, world, camX, camY, view);
  drawScenery(ctx, renderer, world, time, camX, camY, view);
  const bumps = bumpOffsets(world, lag);
  drawTiles(ctx, renderer, level, time, bumps, camX, camY, view);
  drawLeaks(ctx, renderer, world, time, camX, camY, view);
  drawPlatforms(ctx, renderer, world, alpha, camX, camY, view);
  drawSigns(ctx, renderer, world, camX, camY, view);
  drawLandmarks(ctx, renderer, world, time, camX, camY, view);
  drawItems(ctx, renderer, world, alpha, lag, camX, camY, view);
  drawCitizens(ctx, renderer, world, time, camX, camY, view);
  drawEnemies(ctx, renderer, world, alpha, camX, camY, view);
  drawProjectiles(ctx, renderer, world, alpha, camX, camY, view);
  drawProps(ctx, renderer, world, alpha, false, camX, camY, view);
  drawPlayer(ctx, renderer, world, alpha, camX, camY, view);
  drawProps(ctx, renderer, world, alpha, true, camX, camY, view);
  drawFringes(ctx, renderer, level, time, camX, camY, view);
  drawPowerUp(ctx, renderer, world, alpha, time, camX, camY, view);
  drawParticles(ctx, world, alpha, camX, camY, view);
  drawTiles(ctx, renderer, level, time, bumps, camX, camY, view, true);
  drawPopups(ctx, renderer, world, lag, camX, camY, view);
  drawSlogans(ctx, renderer, world, alpha, camX, camY, view);
  drawCitizenLines(ctx, renderer, world, camX, camY, view);
  drawPrompt(ctx, renderer, world, alpha, camX, camY, view, touch);
  if (hud) {
    drawHud(ctx, renderer, world, view);
    drawMessage(ctx, renderer, world, view);
  }
  ctx.restore();
}

function drawScreen(ctx, renderer, layout, view) {
  if (layout.shade) {
    ctx.save();
    ctx.globalAlpha = SHADE_OPACITY;
    ctx.fillStyle = colour('ink');
    ctx.fillRect(view.x, view.y, view.width, view.height);
    ctx.restore();
  }
  for (const element of layout.elements) {
    if (element.kind === 'image') drawOnView(ctx, renderer.images[element.image], view, element.x, element.y);
    else drawText(ctx, renderer, view, element.text, element.x, element.y, element.colour, 'ink');
  }
}

// Behind the title, the suburb's backdrop drifts past on its own.
function drawTitleBackdrop(ctx, renderer, game, alpha, view) {
  const camX = (game.time - (1 - alpha) * STEP) * TITLE_DRIFT;
  ctx.save();
  ctx.beginPath();
  ctx.rect(view.x, view.y, view.width, view.height);
  ctx.clip();
  ctx.imageSmoothingEnabled = false;
  drawBackground(ctx, renderer, DEFAULT_BACKDROP, 0, camX, 0, view);
  ctx.restore();
}

// A rectangle of ink on the view, in art pixels, its edges placed as
// drawOnView places a picture's.
function fillOnView(ctx, view, x, y, width, height) {
  const left = view.x + Math.round(x * view.scale);
  const top = view.y + Math.round(y * view.scale);
  ctx.fillRect(left, top, view.x + Math.round((x + width) * view.scale) - left, view.y + Math.round((y + height) * view.scale) - top);
}

// The iris: ink everywhere but a circle around its centre, row by row of
// art pixels so its edge is stepped like the rest of the art. It eases in
// and out of shut.
function drawIris(ctx, view, iris) {
  const reach = Math.hypot(Math.max(iris.x, VIEW_WIDTH - iris.x), Math.max(iris.y, VIEW_HEIGHT - iris.y));
  const eased = iris.closed * iris.closed * (3 - 2 * iris.closed);
  const radius = reach * (1 - eased);
  ctx.fillStyle = colour('ink');
  for (let row = 0; row < VIEW_HEIGHT; row++) {
    const dy = row + 0.5 - iris.y;
    if (Math.abs(dy) >= radius) {
      fillOnView(ctx, view, 0, row, VIEW_WIDTH, 1);
      continue;
    }
    const half = Math.sqrt(radius * radius - dy * dy);
    const left = Math.max(0, Math.round(iris.x - half));
    const right = Math.min(VIEW_WIDTH, Math.round(iris.x + half));
    if (left > 0) fillOnView(ctx, view, 0, row, left, 1);
    if (right < VIEW_WIDTH) fillOnView(ctx, view, right, row, VIEW_WIDTH - right, 1);
  }
}

function drawFade(ctx, renderer, view, fade) {
  const level = Math.ceil(fade.closed * FADE_LEVELS);
  if (level === 0) return;
  renderer.fades[level] ??= toCanvas(fadeImage(level));
  drawOnView(ctx, renderer.fades[level], view, 0, 0);
}

// The whole game: the world while a level is played (standing still under
// the pause menu or in a hit-stop, so drawn where it stopped) with its
// iris as it closes or opens, the screen over it, and the fade as a
// screen comes up (transitions.js). touch: played by touch (screens.js).
export function renderGame(ctx, renderer, game, alpha, view, { touch = false } = {}) {
  const layout = screenLayout(game, { touch });
  if (game.world) {
    const moving = game.screen === 'playing' && !isStill(game.world.impact);
    renderWorld(ctx, renderer, game.world, moving ? alpha : 1, view, { hud: layout.hud, touch });
  } else {
    drawTitleBackdrop(ctx, renderer, game, alpha, view);
  }
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  const iris = irisOver(game);
  if (iris) drawIris(ctx, view, iris);
  drawScreen(ctx, renderer, layout, view);
  const fade = fadeOver(game);
  if (fade) drawFade(ctx, renderer, view, fade);
  ctx.restore();
}

// The touch controls are seen through, more solid while held, so the play
// behind them shows.
const TOUCH_OPACITY = 0.5;
const TOUCH_HELD_OPACITY = 0.85;

// A touch control's picture centred on its circle, at the touch layout's
// own whole-number scale: it sits on the screen, not on the view.
function drawTouchImage(ctx, image, x, y, scale, held) {
  const width = image.width * scale;
  const height = image.height * scale;
  ctx.globalAlpha = held ? TOUCH_HELD_OPACITY : TOUCH_OPACITY;
  ctx.drawImage(image, Math.round(x - width / 2), Math.round(y - height / 2), width, height);
}

// The touch controls over the screen (touch.js): the pad with its knob
// under the thumb, and the buttons, lit while held. state: touchState().
export function drawTouch(ctx, renderer, layout, state) {
  const { touch } = renderer;
  const { scale } = layout;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  drawTouchImage(ctx, touch.pad, layout.pad.x, layout.pad.y, scale, state.knob !== null);
  const knob = state.knob ?? { x: layout.pad.x, y: layout.pad.y, running: false };
  drawTouchImage(ctx, touch.knob[knob.running ? 'pressed' : 'resting'], knob.x, knob.y, scale, state.knob !== null);
  for (const name of ['jump', 'act', 'pause']) {
    drawTouchImage(ctx, touch[name][state[name] ? 'pressed' : 'resting'], layout[name].x, layout[name].y, scale, state[name]);
  }
  ctx.restore();
}

// The screen asking for the phone to be turned (screens.js), on its own
// view: { x, y, scale } in screen pixels for its TURN_WIDTH × TURN_HEIGHT.
// canTurn: a tap turns it (turnLayout).
export function renderTurn(ctx, renderer, view, { canTurn = false } = {}) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  drawScreen(ctx, renderer, turnLayout({ canTurn }), view);
  ctx.restore();
}
