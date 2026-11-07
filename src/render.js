// Draws the world straight onto the screen canvas, scaled up. Placeholder
// shapes for now; the pixel art replaces them. Page layer: the only module
// besides main.js that draws.
//
// Every tile is drawn at art resolution once, into its own small image, and
// each frame that image is drawn at the tile's place on screen. A tile's
// left and top edges come from toScreen, and its size runs to where the next
// tile starts, so tiles always meet without seams, every tile keeps its shape
// as the view scrolls (it only ever takes one of two sizes), and tiles and
// Lelle are placed by the same rule.
import { TILE, VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { isOneWay, isSolid, tileAt } from './level.js';
import { toScreen } from './projection.js';

const TILE_COLOURS = {
  '#': { body: '#7a4e2d', top: '#4fae3a', edge: '#5e3a20' },
  B: { body: '#a4523a', top: '#b8664a', edge: '#6e3022' },
  Z: { body: '#9aa0a8', top: '#c4c9cf', edge: '#6c7178' },
  A: { body: '#4a4d55', top: '#8d9099', edge: '#33353b' },
};

const ONE_WAY_COLOURS = {
  '-': { top: '#c0c8d0', edge: '#7d8790' },
  _: { top: '#b07a3c', edge: '#7a4f22' },
};

function makeTileImage(paint) {
  const canvas = document.createElement('canvas');
  canvas.width = TILE;
  canvas.height = TILE;
  paint(canvas.getContext('2d'));
  return canvas;
}

function paintSolid(ctx, colours, withTop) {
  ctx.fillStyle = colours.body;
  ctx.fillRect(0, 0, TILE, TILE);
  ctx.fillStyle = colours.edge;
  ctx.fillRect(0, TILE - 1, TILE, 1);
  ctx.fillRect(TILE - 1, 0, 1, TILE);
  if (withTop) {
    ctx.fillStyle = colours.top;
    ctx.fillRect(0, 0, TILE, 4);
  }
}

function paintOneWay(ctx, colours) {
  ctx.fillStyle = colours.top;
  ctx.fillRect(0, 0, TILE, 4);
  ctx.fillStyle = colours.edge;
  ctx.fillRect(0, 4, TILE, 1);
  ctx.fillRect(2, 5, 1, 3);
  ctx.fillRect(TILE - 3, 5, 1, 3);
}

// One image per tile look: solid tiles come with and without their top edge.
function createTileImages() {
  const images = {};
  for (const [char, colours] of Object.entries(TILE_COLOURS)) {
    images[char] = makeTileImage((ctx) => paintSolid(ctx, colours, false));
    images[`${char}^`] = makeTileImage((ctx) => paintSolid(ctx, colours, true));
  }
  for (const [char, colours] of Object.entries(ONE_WAY_COLOURS)) {
    images[char] = makeTileImage((ctx) => paintOneWay(ctx, colours));
  }
  return images;
}

export function createRenderer() {
  return { tileImages: createTileImages(), sky: null, skyFor: null };
}

function lerp(from, to, alpha) {
  return from + (to - from) * alpha;
}

function tileImageFor(images, level, char, col, row) {
  if (isSolid(char)) {
    return isSolid(tileAt(level, col, row - 1)) ? images[char] : images[`${char}^`];
  }
  return isOneWay(char) ? images[char] : null;
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
      const image = tileImageFor(renderer.tileImages, level, tileAt(level, col, row), col, row);
      if (!image) continue;
      const left = view.x + toScreen(col * TILE, camX, scale);
      const width = view.x + toScreen((col + 1) * TILE, camX, scale) - left;
      ctx.drawImage(image, left, top, width, height);
    }
  }
}

// Fills a rectangle given in art pixels relative to a screen point.
function block(ctx, screenX, screenY, scale, colour, x, y, w, h) {
  ctx.fillStyle = colour;
  const left = Math.round(screenX + x * scale);
  const top = Math.round(screenY + y * scale);
  ctx.fillRect(left, top, Math.round(screenX + (x + w) * scale) - left, Math.round(screenY + (y + h) * scale) - top);
}

function drawPlayer(ctx, player, screenX, screenY, scale) {
  const { w, h } = player;
  const at = (colour, x, y, bw, bh) => block(ctx, screenX, screenY, scale, colour, x, y, bw, bh);
  at('#2b4b8c', 0, 0, w, h);
  at('#1a1c2c', -1, 0, w + 2, 4);
  at('#f2b48a', 1, 4, w - 2, 5);
  at('#1a1c2c', player.facing > 0 ? w - 3 : 2, 5, 1, 2);
  at('#e8e04a', 0, 10, w, Math.max(2, h - 16));
  at('#dfe8f0', 0, 12, w, 1);
}

// The sky only changes when the view does, so its gradient is made once.
function skyFor(ctx, renderer, view) {
  if (renderer.skyFor !== view) {
    const sky = ctx.createLinearGradient(0, view.y, 0, view.y + view.height);
    sky.addColorStop(0, '#5fa8e8');
    sky.addColorStop(1, '#cfe8f7');
    renderer.sky = sky;
    renderer.skyFor = view;
  }
  return renderer.sky;
}

// view: where the game sits on the screen canvas and how much it is scaled,
// { x, y, width, height, scale } in screen pixels.
export function renderWorld(ctx, renderer, world, alpha, view) {
  const { camera, player, level } = world;
  const { scale } = view;
  const camX = lerp(camera.px, camera.x, alpha);
  const camY = lerp(camera.py, camera.y, alpha);

  ctx.save();
  ctx.beginPath();
  ctx.rect(view.x, view.y, view.width, view.height);
  ctx.clip();
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = skyFor(ctx, renderer, view);
  ctx.fillRect(view.x, view.y, view.width, view.height);
  drawTiles(ctx, renderer, level, camX, camY, view);

  const playerX = view.x + toScreen(lerp(player.px, player.x, alpha), camX, scale);
  const playerY = view.y + toScreen(lerp(player.py, player.y, alpha), camY, scale);
  drawPlayer(ctx, player, playerX, playerY, scale);
  ctx.restore();
}
