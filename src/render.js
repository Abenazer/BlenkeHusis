// Draws the world straight onto the screen canvas, scaled up: the backdrop's
// layers, the tiles, the items, Lelle, the points floating up from pickups,
// the HUD and the message line. The art itself is pixel data from
// src/art/; this module turns each picture into a small canvas once. Page
// layer: the only module besides main.js and diagnostics.js that draws.
//
// Everything that moves with the world is drawn piece by piece, never as one
// big picture scaled up: each tile, each tile-wide column of a backdrop layer
// and each frame of Lelle has its edges placed by toScreen, and its size runs
// to where its far edge lands. Pieces then meet without seams, keep their
// shape as the view scrolls (each only ever takes one of two sizes), and
// everything is placed by the same rule.
import { BACKGROUND_LAYERS } from './art/backgrounds.js';
import { textImage, textWidth } from './art/font.js';
import { HUD_ICONS, ITEM_ART } from './art/items.js';
import { LELLE_ANIMATIONS, LELLE_FRAMES, LELLE_PIVOT, LELLE_PLAYBACK, LELLE_SIZE } from './art/lelle.js';
import { TILE_ART, variantAt } from './art/tiles.js';
import { frameName } from './animation.js';
import { STEP, TILE, VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { HUD_BOTTOM, hudElements } from './hud.js';
import { isSolid, pixelHeight, tileAt } from './level.js';
import { mirrored } from './pixels.js';
import { toScreen } from './projection.js';
import { POPUP_TIME } from './world.js';

// Items bob gently where they float, never below their resting place: this
// high, this often a second.
const BOB_HEIGHT = 1.5;
const BOB_RATE = 1.2;
// A pickup's points start this far above the item, clear of Lelle's face,
// and float this far up before they fade.
const POPUP_START = 8;
const POPUP_RISE = 14;
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

export function createRenderer() {
  return {
    tiles: mapValues(TILE_ART, (art) => mapValues(art, (variants) => variants.map(toCanvas))),
    layers: BACKGROUND_LAYERS.map((layer) => ({ ...layer, canvas: toCanvas(layer.image) })),
    lelle: {
      right: mapValues(LELLE_FRAMES, toCanvas),
      left: mapValues(LELLE_FRAMES, (frame) => toCanvas(mirrored(frame))),
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

function tileImageFor(tiles, level, char, col, row) {
  const art = tiles[char];
  if (!art) return null;
  const variants = isSolid(char) && isSolid(tileAt(level, col, row - 1)) ? art.fill : art.top;
  return variantAt(variants, col, row);
}

function drawTiles(ctx, renderer, level, camX, camY, view) {
  const { scale } = view;
  const firstCol = Math.max(0, Math.floor(camX / TILE));
  const lastCol = Math.min(level.width - 1, Math.floor((camX + VIEW_WIDTH) / TILE));
  const firstRow = Math.max(0, Math.floor(camY / TILE));
  const lastRow = Math.min(level.height - 1, Math.floor((camY + VIEW_HEIGHT) / TILE));
  for (let row = firstRow; row <= lastRow; row++) {
    const top = view.y + toScreen(row * TILE, camY, scale);
    const height = view.y + toScreen((row + 1) * TILE, camY, scale) - top;
    for (let col = firstCol; col <= lastCol; col++) {
      const image = tileImageFor(renderer.tiles, level, tileAt(level, col, row), col, row);
      if (!image) continue;
      const left = view.x + toScreen(col * TILE, camX, scale);
      const width = view.x + toScreen((col + 1) * TILE, camX, scale) - left;
      ctx.drawImage(image, left, top, width, height);
    }
  }
}

// Lelle's frame hangs from its pivot, which sits at the middle of his feet.
function drawLelle(ctx, renderer, world, alpha, camX, camY, view) {
  const { player, animation } = world;
  const { scale } = view;
  const frames = player.facing < 0 ? renderer.lelle.left : renderer.lelle.right;
  const image = frames[frameName(animation, LELLE_ANIMATIONS, LELLE_PLAYBACK)];
  const feetX = lerp(player.px, player.x, alpha) + player.w / 2;
  const feetY = lerp(player.py, player.y, alpha) + player.h;
  const frameLeft = feetX - LELLE_PIVOT.x;
  const frameTop = feetY - LELLE_PIVOT.y;
  const left = view.x + toScreen(frameLeft, camX, scale);
  const top = view.y + toScreen(frameTop, camY, scale);
  const right = view.x + toScreen(frameLeft + LELLE_SIZE.width, camX, scale);
  const bottom = view.y + toScreen(frameTop + LELLE_SIZE.height, camY, scale);
  ctx.drawImage(image, left, top, right - left, bottom - top);
}

// Draws a picture whose top left corner is at x, y in the world.
function drawInWorld(ctx, image, x, y, camX, camY, view) {
  const { scale } = view;
  const left = view.x + toScreen(x, camX, scale);
  const top = view.y + toScreen(y, camY, scale);
  const right = view.x + toScreen(x + image.width, camX, scale);
  const bottom = view.y + toScreen(y + image.height, camY, scale);
  ctx.drawImage(image, left, top, right - left, bottom - top);
}

// An item stands on the bottom of its tile, in the middle, and bobs. `lag`
// is how far the drawn moment is behind the last step, as with positions.
function drawItems(ctx, renderer, world, lag, camX, camY, view) {
  for (const item of world.items) {
    if (item.collected || !item.revealed) continue;
    const image = renderer.items[item.type];
    const phase = (world.time - lag) * BOB_RATE + item.col * 0.15;
    const bob = (1 + Math.sin(phase * 2 * Math.PI)) * (BOB_HEIGHT / 2);
    const x = item.col * TILE + Math.floor((TILE - image.width) / 2);
    const y = (item.row + 1) * TILE - image.height - bob;
    if (x + image.width < camX || x > camX + VIEW_WIDTH || y + image.height < camY || y > camY + VIEW_HEIGHT) continue;
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

  drawBackground(ctx, renderer, level, camX, camY, view);
  drawTiles(ctx, renderer, level, camX, camY, view);
  drawItems(ctx, renderer, world, lag, camX, camY, view);
  drawLelle(ctx, renderer, world, alpha, camX, camY, view);
  drawPopups(ctx, renderer, world, lag, camX, camY, view);
  drawHud(ctx, renderer, world, view);
  drawMessage(ctx, renderer, world, view);
  ctx.restore();
}
