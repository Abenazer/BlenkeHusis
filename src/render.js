// Draws the world on the internal canvas. Placeholder shapes for now; the
// pixel art replaces them. Page layer: the only module besides main.js that
// draws.
import { TILE, VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { isSolid, tileAt } from './level.js';

const TILE_COLOURS = {
  '#': { body: '#7a4e2d', top: '#4fae3a', edge: '#5e3a20' },
  B: { body: '#a4523a', top: '#b8664a', edge: '#6e3022' },
  Z: { body: '#9aa0a8', top: '#c4c9cf', edge: '#6c7178' },
  A: { body: '#4a4d55', top: '#8d9099', edge: '#33353b' },
};

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

function drawTiles(ctx, level, camX, camY) {
  const firstCol = Math.floor(camX / TILE);
  const lastCol = Math.floor((camX + VIEW_WIDTH) / TILE);
  const firstRow = Math.floor(camY / TILE);
  const lastRow = Math.floor((camY + VIEW_HEIGHT) / TILE);
  for (let row = firstRow; row <= lastRow; row++) {
    for (let col = firstCol; col <= lastCol; col++) {
      if (col < 0 || col >= level.width || row < 0 || row >= level.height) continue;
      const char = tileAt(level, col, row);
      const x = col * TILE - camX;
      const y = row * TILE - camY;
      if (TILE_COLOURS[char]) drawSolid(ctx, level, char, col, row, x, y);
      else if (char === '-' || char === '_') drawOneWay(ctx, char, x, y);
    }
  }
}

function drawPlayer(ctx, player, x, y) {
  const { w, h } = player;
  ctx.fillStyle = '#2b4b8c';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#1a1c2c';
  ctx.fillRect(x - 1, y, w + 2, 4);
  ctx.fillStyle = '#f2b48a';
  ctx.fillRect(x + 1, y + 4, w - 2, 5);
  ctx.fillStyle = '#1a1c2c';
  ctx.fillRect(player.facing > 0 ? x + w - 3 : x + 2, y + 5, 1, 2);
  ctx.fillStyle = '#e8e04a';
  ctx.fillRect(x, y + 10, w, Math.max(2, h - 16));
  ctx.fillStyle = '#dfe8f0';
  ctx.fillRect(x, y + 12, w, 1);
}

export function renderWorld(ctx, world, alpha) {
  const { camera, player, level } = world;
  const camX = Math.round(lerp(camera.px, camera.x, alpha));
  const camY = Math.round(lerp(camera.py, camera.y, alpha));

  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
  sky.addColorStop(0, '#5fa8e8');
  sky.addColorStop(1, '#cfe8f7');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  drawTiles(ctx, level, camX, camY);
  const playerX = Math.round(lerp(player.px, player.x, alpha)) - camX;
  const playerY = Math.round(lerp(player.py, player.y, alpha)) - camY;
  drawPlayer(ctx, player, playerX, playerY);
}
