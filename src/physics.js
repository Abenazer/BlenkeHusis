// Moving an axis-aligned box through the tile grid. X and Y are resolved one
// after the other, so the box slides along walls and floors instead of
// snagging on the seams between tiles. Pure: no DOM.
import { TILE } from './config.js';
import { isOneWay, isSolid, tileAt } from './level.js';

// Keeps a box whose edge lies exactly on a tile boundary out of that tile.
const EPSILON = 0.001;
// No sub-move is longer than half a tile, so even a very fast box can't pass
// through a tile between two checks.
const MAX_SUBSTEP = TILE / 2;

function columnsOf(body) {
  return [Math.floor(body.x / TILE), Math.floor((body.x + body.w - EPSILON) / TILE)];
}

function rowsOf(body) {
  return [Math.floor(body.y / TILE), Math.floor((body.y + body.h - EPSILON) / TILE)];
}

function moveX(body, level, dx, result) {
  body.x += dx;
  const [top, bottom] = rowsOf(body);
  const col = dx > 0
    ? Math.floor((body.x + body.w - EPSILON) / TILE)
    : Math.floor(body.x / TILE);
  for (let row = top; row <= bottom; row++) {
    if (!isSolid(tileAt(level, col, row))) continue;
    body.x = dx > 0 ? col * TILE - body.w : (col + 1) * TILE;
    body.vx = 0;
    result.hitWall = Math.sign(dx);
    return true;
  }
  return false;
}

function moveY(body, level, dy, options, result) {
  const previousBottom = body.y + body.h;
  body.y += dy;
  const [left, right] = columnsOf(body);

  if (dy > 0) {
    const row = Math.floor((body.y + body.h - EPSILON) / TILE);
    const rowTop = row * TILE;
    let landedSolid = false;
    let landedOneWay = false;
    for (let col = left; col <= right; col++) {
      const char = tileAt(level, col, row);
      if (isSolid(char)) landedSolid = true;
      else if (isOneWay(char) && !options.dropThrough && previousBottom <= rowTop + EPSILON) {
        landedOneWay = true;
      }
    }
    let ground = landedSolid || landedOneWay ? rowTop : null;
    let platform = null;
    // A moving platform is one-way too; of everything crossed, the highest
    // top is the one landed on.
    if (!options.dropThrough) {
      for (const candidate of options.platforms ?? []) {
        const crossed = previousBottom <= candidate.y + EPSILON && body.y + body.h >= candidate.y;
        const under = body.x < candidate.x + candidate.w && candidate.x < body.x + body.w;
        if (crossed && under && (ground === null || candidate.y < ground)) {
          ground = candidate.y;
          platform = candidate;
        }
      }
    }
    if (ground === null) return false;
    body.y = ground - body.h;
    body.vy = 0;
    result.onGround = true;
    result.platform = platform;
    // Only a box held up by nothing but one-way platforms can drop through.
    result.groundOneWay = platform !== null || (landedOneWay && !landedSolid);
    return true;
  }

  const row = Math.floor(body.y / TILE);
  const hits = [];
  for (let col = left; col <= right; col++) {
    if (isSolid(tileAt(level, col, row))) hits.push({ col, row });
  }
  if (hits.length === 0) return false;
  body.y = (row + 1) * TILE;
  body.vy = 0;
  result.hitCeiling = true;
  result.ceilingTiles = hits;
  return true;
}

// Moves the body by its velocity over dt and resolves collisions. Returns what
// it touched: ground (and the moving platform, if that was it), a wall (its
// side as -1 or 1) and the ceiling tiles it hit. options: dropThrough to
// pass through one-way platforms, platforms to land on moving ones.
export function moveBody(body, level, dt, options = {}) {
  const result = {
    onGround: false,
    groundOneWay: false,
    platform: null,
    hitWall: 0,
    hitCeiling: false,
    ceilingTiles: [],
  };
  const dx = body.vx * dt;
  const dy = body.vy * dt;

  const stepsX = Math.max(1, Math.ceil(Math.abs(dx) / MAX_SUBSTEP));
  for (let i = 0; i < stepsX; i++) {
    if (moveX(body, level, dx / stepsX, result)) break;
  }
  const stepsY = Math.max(1, Math.ceil(Math.abs(dy) / MAX_SUBSTEP));
  for (let i = 0; i < stepsY; i++) {
    if (moveY(body, level, dy / stepsY, options, result)) break;
  }
  return result;
}

// Moves the body sideways by dx, stopping at walls, without touching its
// velocity: how a moving platform carries what stands on it.
export function pushBody(body, level, dx) {
  const vx = body.vx;
  const steps = Math.max(1, Math.ceil(Math.abs(dx) / MAX_SUBSTEP));
  const result = { hitWall: 0 };
  for (let i = 0; i < steps; i++) {
    if (moveX(body, level, dx / steps, result)) break;
  }
  body.vx = vx;
  return result;
}

// Whether a rectangle overlaps no solid tile, e.g. room to stand up.
export function isAreaFree(level, rect) {
  const left = Math.floor(rect.x / TILE);
  const right = Math.floor((rect.x + rect.w - EPSILON) / TILE);
  const top = Math.floor(rect.y / TILE);
  const bottom = Math.floor((rect.y + rect.h - EPSILON) / TILE);
  for (let row = top; row <= bottom; row++) {
    for (let col = left; col <= right; col++) {
      if (isSolid(tileAt(level, col, row))) return false;
    }
  }
  return true;
}
