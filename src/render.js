// Draws the world straight onto the screen canvas, scaled up. Placeholder
// shapes for now; the pixel art replaces them. Page layer: the only module
// besides main.js that draws.
//
// The tiles are drawn at art resolution into a buffer one tile larger than
// the view, at the camera's whole-pixel position, and that buffer is scaled
// onto the screen shifted by the camera's fraction: smooth scrolling without
// seams between tiles, even at a fractional scale. Everything else is placed
// with toScreen, the same rule the buffer's shift follows.
import { TILE, VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { isSolid, tileAt } from './level.js';
import { toScreen } from './projection.js';

const TILE_COLOURS = {
  '#': { body: '#7a4e2d', top: '#4fae3a', edge: '#5e3a20' },
  B: { body: '#a4523a', top: '#b8664a', edge: '#6e3022' },
  Z: { body: '#9aa0a8', top: '#c4c9cf', edge: '#6c7178' },
  A: { body: '#4a4d55', top: '#8d9099', edge: '#33353b' },
};

export function createRenderer() {
  const tiles = document.createElement('canvas');
  tiles.width = VIEW_WIDTH + TILE;
  tiles.height = VIEW_HEIGHT + TILE;
  return { tiles, tilesContext: tiles.getContext('2d') };
}

function lerp(from, to, alpha) {
  return from + (to - from) * alpha;
}

function drawSolid(ctx, level, char, col, row, x, y) {
  const colours = TILE_COLOURS[char];
  ctx.fillStyle = colours.body;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = colours.edge;
  ctx.fillRect(x, y + TILE - 1, TILE, 1);
  ctx.fillRect(x + TILE - 1, y, 1, TILE);
  if (!isSolid(tileAt(level, col, row - 1))) {
    ctx.fillStyle = colours.top;
    ctx.fillRect(x, y, TILE, 4);
  }
}

function drawOneWay(ctx, char, x, y) {
  ctx.fillStyle = char === '-' ? '#c0c8d0' : '#b07a3c';
  ctx.fillRect(x, y, TILE, 4);
  ctx.fillStyle = char === '-' ? '#7d8790' : '#7a4f22';
  ctx.fillRect(x, y + 4, TILE, 1);
  ctx.fillRect(x + 2, y + 5, 1, 3);
  ctx.fillRect(x + TILE - 3, y + 5, 1, 3);
}

// Draws the tiles into the buffer with its top left at the given whole pixel.
function drawTiles(ctx, level, left, top) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const firstCol = Math.floor(left / TILE);
  const lastCol = Math.floor((left + ctx.canvas.width) / TILE);
  const firstRow = Math.floor(top / TILE);
  const lastRow = Math.floor((top + ctx.canvas.height) / TILE);
  for (let row = Math.max(0, firstRow); row <= Math.min(level.height - 1, lastRow); row++) {
    for (let col = Math.max(0, firstCol); col <= Math.min(level.width - 1, lastCol); col++) {
      const char = tileAt(level, col, row);
      const x = col * TILE - left;
      const y = row * TILE - top;
      if (TILE_COLOURS[char]) drawSolid(ctx, level, char, col, row, x, y);
      else if (char === '-' || char === '_') drawOneWay(ctx, char, x, y);
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

  const sky = ctx.createLinearGradient(0, view.y, 0, view.y + view.height);
  sky.addColorStop(0, '#5fa8e8');
  sky.addColorStop(1, '#cfe8f7');
  ctx.fillStyle = sky;
  ctx.fillRect(view.x, view.y, view.width, view.height);

  const left = Math.floor(camX);
  const top = Math.floor(camY);
  drawTiles(renderer.tilesContext, level, left, top);
  ctx.drawImage(
    renderer.tiles,
    view.x + toScreen(left, camX, scale),
    view.y + toScreen(top, camY, scale),
    renderer.tiles.width * scale,
    renderer.tiles.height * scale,
  );

  const playerX = view.x + toScreen(lerp(player.px, player.x, alpha), camX, scale);
  const playerY = view.y + toScreen(lerp(player.py, player.y, alpha), camY, scale);
  drawPlayer(ctx, player, playerX, playerY, scale);
  ctx.restore();
}
