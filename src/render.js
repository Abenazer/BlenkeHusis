// Draws the world straight onto the screen canvas, scaled up: the backdrop's
// layers, the tiles, Lelle and text. The art itself is pixel data from
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
import { LINE_HEIGHT, textImage, textWidth } from './art/font.js';
import { LELLE_ANIMATIONS, LELLE_FRAMES, LELLE_PIVOT, LELLE_PLAYBACK, LELLE_SIZE } from './art/lelle.js';
import { TILE_ART, variantAt } from './art/tiles.js';
import { frameName } from './animation.js';
import { TILE, VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { isSolid, pixelHeight, tileAt } from './level.js';
import { mirrored } from './pixels.js';
import { toScreen } from './projection.js';

// How long the level's name shows when it starts, in seconds.
const TITLE_TIME = 3;

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

function textCanvas(renderer, text, colourName, shadowName) {
  const key = `${colourName}|${shadowName}|${text}`;
  let canvas = renderer.texts.get(key);
  if (!canvas) {
    canvas = toCanvas(textImage(text, colourName, shadowName));
    renderer.texts.set(key, canvas);
  }
  return canvas;
}

// Text sits still on the view, so a line is drawn as one picture, at x, y
// in art pixels from the view's top left corner.
function drawText(ctx, renderer, view, text, x, y, colourName, shadowName = null) {
  const canvas = textCanvas(renderer, text, colourName, shadowName);
  const left = view.x + Math.round(x * view.scale);
  const top = view.y + Math.round(y * view.scale);
  const right = view.x + Math.round((x + canvas.width) * view.scale);
  const bottom = view.y + Math.round((y + canvas.height) * view.scale);
  ctx.drawImage(canvas, left, top, right - left, bottom - top);
}

function drawLevelTitle(ctx, renderer, world, view) {
  if (world.time >= TITLE_TIME) return;
  const { name } = world.level;
  const x = Math.floor((VIEW_WIDTH - textWidth(name)) / 2);
  drawText(ctx, renderer, view, name, x, Math.floor(VIEW_HEIGHT / 6 - LINE_HEIGHT / 2), 'white', 'ink');
}

// view: where the game sits on the screen canvas and how much it is scaled,
// { x, y, width, height, scale } in screen pixels.
export function renderWorld(ctx, renderer, world, alpha, view) {
  const { camera, level } = world;
  const camX = lerp(camera.px, camera.x, alpha);
  const camY = lerp(camera.py, camera.y, alpha);

  ctx.save();
  ctx.beginPath();
  ctx.rect(view.x, view.y, view.width, view.height);
  ctx.clip();
  ctx.imageSmoothingEnabled = false;

  drawBackground(ctx, renderer, level, camX, camY, view);
  drawTiles(ctx, renderer, level, camX, camY, view);
  drawLelle(ctx, renderer, world, alpha, camX, camY, view);
  drawLevelTitle(ctx, renderer, world, view);
  ctx.restore();
}
