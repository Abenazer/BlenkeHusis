// Draws the world straight onto the screen canvas, scaled up: the backdrop's
// layers, the tiles, leaking sewage, moving platforms, the items, the
// enemies and what they throw, Blenke, the points floating up from pickups,
// the slogans shouted, the HUD and the message line. The art itself is pixel data from
// src/art/; this module turns each picture into a small canvas once. Page
// layer: the only module besides main.js and diagnostics.js that draws.
//
// Everything that moves with the world is drawn piece by piece, never as one
// big picture scaled up: each tile, each tile-wide column of a backdrop layer
// and each frame of Blenke has its edges placed by toScreen, and its size runs
// to where its far edge lands. Pieces then meet without seams, keep their
// shape as the view scrolls (each only ever takes one of two sizes), and
// everything is placed by the same rule.
import { BACKGROUND_LAYERS } from './art/backgrounds.js';
import { ENEMY_ART, ENEMY_PIVOT, PROJECTILE_ART } from './art/enemies.js';
import { textImage, textWidth } from './art/font.js';
import { HUD_ICONS, ITEM_ART } from './art/items.js';
import { PLAYER_ANIMATIONS, PLAYER_FRAMES, PLAYER_PIVOT, PLAYER_PLAYBACK } from './art/player.js';
import { LEAK_ART, PLATFORM_ART, TILE_ART, variantAt } from './art/tiles.js';
import { frameName } from './animation.js';
import { STEP, TILE, VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { isLeaking, LEAK_WIDTH } from './hazards.js';
import { HUD_BOTTOM, hudElements } from './hud.js';
import { INSET } from './items.js';
import { isLiquid, isSolid, pixelHeight, tileAt } from './level.js';
import { mirrored } from './pixels.js';
import { toScreen } from './projection.js';
import { POPUP_TIME } from './world.js';

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
// A slogan floats this far above the shouter's head.
const SLOGAN_GAP = 2;
// Rendered lines of text are kept for reuse; past this many (the score and
// the clock make new ones all the time) the store starts over.
const MAX_TEXTS = 200;

function toCanvas(image) {
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

function lookCanvases(look, flip) {
  const convert = (image) => toCanvas(flip ? mirrored(image) : image);
  return { move: look.move.map(convert), act: look.act && convert(look.act), defeated: convert(look.defeated) };
}

export function createRenderer() {
  return {
    tiles: mapValues(TILE_ART, (art) => mapValues(art, (value) => (Array.isArray(value) ? value.map(toCanvas) : value))),
    leak: { fps: LEAK_ART.fps, frames: LEAK_ART.frames.map(toCanvas) },
    platform: toCanvas(PLATFORM_ART),
    enemies: mapValues(ENEMY_ART, (looks) => looks.map((look) => ({ right: lookCanvases(look, false), left: lookCanvases(look, true) }))),
    projectiles: mapValues(PROJECTILE_ART, (art) => ({ fps: art.fps, frames: art.frames.map(toCanvas) })),
    layers: BACKGROUND_LAYERS.map((layer) => ({ ...layer, canvas: toCanvas(layer.image) })),
    player: {
      right: mapValues(PLAYER_FRAMES, toCanvas),
      left: mapValues(PLAYER_FRAMES, (frame) => toCanvas(mirrored(frame))),
    },
    items: mapValues(ITEM_ART, toCanvas),
    icons: mapValues(HUD_ICONS, toCanvas),
    texts: new Map(),
  };
}

function lerp(from, to, alpha) {
  return from + (to - from) * alpha;
}

// Layers move by their share of the camera's movement, sideways from the
// level's left edge and up and down from the camera's lowest position, where
// each layer's top sits at its given height.
function drawBackground(ctx, renderer, level, camX, camY, view) {
  const { scale } = view;
  const lowestCamY = pixelHeight(level) - VIEW_HEIGHT;
  const viewBottom = view.y + view.height;
  for (const layer of renderer.layers) {
    const offsetX = camX * layer.factor;
    const offsetY = (camY - lowestCamY) * layer.factor;
    const { canvas } = layer;
    const top = view.y + toScreen(layer.top, offsetY, scale);
    const bottom = view.y + toScreen(layer.top + canvas.height, offsetY, scale);
    const columns = canvas.width / TILE;
    const first = Math.floor(offsetX / TILE);
    const last = Math.floor((offsetX + VIEW_WIDTH) / TILE);
    for (let column = first; column <= last; column++) {
      const left = view.x + toScreen(column * TILE, offsetX, scale);
      const right = view.x + toScreen((column + 1) * TILE, offsetX, scale);
      const source = (((column % columns) + columns) % columns) * TILE;
      ctx.drawImage(canvas, source, 0, TILE, canvas.height, left, top, right - left, bottom - top);
    }
    if (layer.fill && bottom < viewBottom) {
      ctx.fillStyle = layer.fill;
      ctx.fillRect(view.x, bottom, view.width, viewBottom - bottom);
    }
  }
}

// Under more of itself, or solid under something solid or liquid, a tile
// shows its fill. Liquids play their frames; other tiles pick a variant
// by place.
function tileImageFor(tiles, level, char, col, row, time) {
  const art = tiles[char];
  if (!art) return null;
  const above = tileAt(level, col, row - 1);
  const covered = art.fill && (above === char || (isSolid(char) && (isSolid(above) || isLiquid(above))));
  const pictures = covered ? art.fill : art.top;
  if (art.fps) return pictures[Math.floor(time * art.fps) % pictures.length];
  return variantAt(pictures, col, row);
}

function drawTiles(ctx, renderer, level, time, camX, camY, view) {
  const { scale } = view;
  const firstCol = Math.max(0, Math.floor(camX / TILE));
  const lastCol = Math.min(level.width - 1, Math.floor((camX + VIEW_WIDTH) / TILE));
  const firstRow = Math.max(0, Math.floor(camY / TILE));
  const lastRow = Math.min(level.height - 1, Math.floor((camY + VIEW_HEIGHT) / TILE));
  for (let row = firstRow; row <= lastRow; row++) {
    const top = view.y + toScreen(row * TILE, camY, scale);
    const height = view.y + toScreen((row + 1) * TILE, camY, scale) - top;
    for (let col = firstCol; col <= lastCol; col++) {
      const image = tileImageFor(renderer.tiles, level, tileAt(level, col, row), col, row, time);
      if (!image) continue;
      const left = view.x + toScreen(col * TILE, camX, scale);
      const width = view.x + toScreen((col + 1) * TILE, camX, scale) - left;
      ctx.drawImage(image, left, top, width, height);
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

// Blenke's frame hangs from its pivot, which sits at the middle of his feet.
// After a hit he blinks while nothing can hurt him.
function drawPlayer(ctx, renderer, world, alpha, camX, camY, view) {
  const { player, animation } = world;
  const blinking = player.invulnerable > 0 && player.hurt === 0 && world.down === 0;
  if (blinking && Math.floor(player.invulnerable * BLINK_RATE) % 2 === 1) return;
  const frames = player.facing < 0 ? renderer.player.left : renderer.player.right;
  const image = frames[frameName(animation, PLAYER_ANIMATIONS, PLAYER_PLAYBACK)];
  const feetX = lerp(player.px, player.x, alpha) + player.w / 2;
  const feetY = lerp(player.py, player.y, alpha) + player.h;
  drawInWorld(ctx, image, feetX - PLAYER_PIVOT.x, feetY - PLAYER_PIVOT.y, camX, camY, view);
}

// The stream from each leaking pipe, a tile at a time down to where it lands.
function drawLeaks(ctx, renderer, world, time, camX, camY, view) {
  const { frames, fps } = renderer.leak;
  for (const leak of world.leaks) {
    if (!isLeaking(leak, time)) continue;
    const x = leak.col * TILE + (TILE - LEAK_WIDTH) / 2;
    for (let y = leak.top, i = 0; y < leak.bottom; y += TILE, i++) {
      drawInWorld(ctx, frames[(Math.floor(time * fps) + frames.length - (i % frames.length)) % frames.length], x, y, camX, camY, view);
    }
  }
}

function drawPlatforms(ctx, renderer, world, alpha, camX, camY, view) {
  for (const platform of world.platforms) {
    const x = lerp(platform.px, platform.x, alpha);
    const y = lerp(platform.py, platform.y, alpha);
    for (let i = 0; i < platform.tiles; i++) drawInWorld(ctx, renderer.platform, x + i * TILE, y, camX, camY, view);
  }
}

function enemyImage(renderer, world, enemy) {
  const look = renderer.enemies[enemy.type][enemy.variant][enemy.facing < 0 ? 'left' : 'right'];
  if (enemy.defeated) return look.defeated;
  if (enemy.acting > 0 && look.act) return look.act;
  return look.move[Math.floor(enemy.walkTime / STRIDE + world.time * SWAY_RATE) % look.move.length];
}

// Enemies hang from the middle of their feet, like Blenke.
function drawEnemies(ctx, renderer, world, alpha, camX, camY, view) {
  for (const enemy of world.enemies) {
    const feetX = lerp(enemy.px, enemy.x, alpha) + enemy.w / 2;
    const feetY = lerp(enemy.py, enemy.y, alpha) + enemy.h;
    drawInWorld(ctx, enemyImage(renderer, world, enemy), feetX - ENEMY_PIVOT.x, feetY - ENEMY_PIVOT.y, camX, camY, view);
  }
}

// What is thrown spins through its frames, centred on where it is.
function drawProjectiles(ctx, renderer, world, alpha, camX, camY, view) {
  for (const projectile of world.projectiles) {
    const { frames, fps } = renderer.projectiles[projectile.type];
    const image = frames[Math.floor(projectile.age * fps) % frames.length];
    const x = lerp(projectile.px, projectile.x, alpha) + (projectile.w - image.width) / 2;
    const y = lerp(projectile.py, projectile.y, alpha) + (projectile.h - image.height) / 2;
    drawInWorld(ctx, image, x, y, camX, camY, view);
  }
}

// A shouted slogan floats over the shouter while he is in sight, kept
// within the view.
function drawSlogans(ctx, renderer, world, alpha, camX, camY, view) {
  for (const enemy of world.enemies) {
    if (!enemy.saying || enemy.defeated) continue;
    const middle = lerp(enemy.px, enemy.x, alpha) + enemy.w / 2;
    if (middle < camX || middle > camX + VIEW_WIDTH) continue;
    const canvas = textCanvas(renderer, enemy.saying, 'hivis_3', 'ink');
    const top = lerp(enemy.py, enemy.y, alpha) + enemy.h - ENEMY_PIVOT.y;
    const x = Math.min(Math.max(middle - Math.floor(canvas.width / 2), camX + 2), camX + VIEW_WIDTH - canvas.width - 2);
    drawInWorld(ctx, canvas, x, top - canvas.height - SLOGAN_GAP, camX, camY, view);
  }
}

// An item stands on the bottom of its tile, in the middle, and bobs where
// it rests. `lag` is how far the drawn moment is behind the last step, as
// with positions.
function drawItems(ctx, renderer, world, alpha, lag, camX, camY, view) {
  for (const item of world.items) {
    if (item.collected || !item.revealed) continue;
    const image = renderer.items[item.type];
    const phase = (world.time - lag) * BOB_RATE + item.phase;
    const bob = item.falling ? 0 : (1 + Math.sin(phase * 2 * Math.PI)) * (BOB_HEIGHT / 2);
    const x = lerp(item.px, item.x, alpha) - INSET + Math.floor((TILE - image.width) / 2);
    const y = lerp(item.py, item.y, alpha) - INSET + TILE - image.height - bob;
    drawInWorld(ctx, image, x, y, camX, camY, view);
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
// { x, y, width, height, scale } in screen pixels.
export function renderWorld(ctx, renderer, world, alpha, view) {
  const { camera, level } = world;
  const camX = lerp(camera.px, camera.x, alpha);
  const camY = lerp(camera.py, camera.y, alpha);
  const lag = (1 - alpha) * STEP;

  ctx.save();
  ctx.beginPath();
  ctx.rect(view.x, view.y, view.width, view.height);
  ctx.clip();
  ctx.imageSmoothingEnabled = false;

  const time = world.time - lag;

  drawBackground(ctx, renderer, level, camX, camY, view);
  drawTiles(ctx, renderer, level, time, camX, camY, view);
  drawLeaks(ctx, renderer, world, time, camX, camY, view);
  drawPlatforms(ctx, renderer, world, alpha, camX, camY, view);
  drawItems(ctx, renderer, world, alpha, lag, camX, camY, view);
  drawEnemies(ctx, renderer, world, alpha, camX, camY, view);
  drawProjectiles(ctx, renderer, world, alpha, camX, camY, view);
  drawPlayer(ctx, renderer, world, alpha, camX, camY, view);
  drawPopups(ctx, renderer, world, lag, camX, camY, view);
  drawSlogans(ctx, renderer, world, alpha, camX, camY, view);
  drawHud(ctx, renderer, world, view);
  drawMessage(ctx, renderer, world, view);
  ctx.restore();
}
