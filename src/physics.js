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
// How far below a slope (an escalator) a body's feet can be and still step
// up onto it, and how far it can fall away under a body standing on the
// ground and still keep its feet: more than a step's walk at full speed,
// so walking up or down one never leaves it.
export const SLOPE_REACH = 5;

function columnsOf(body) {
  return [Math.floor(body.x / TILE), Math.floor((body.x + body.w - EPSILON) / TILE)];
}

function rowsOf(body) {
  return [Math.floor(body.y / TILE), Math.floor((body.y + body.h - EPSILON) / TILE)];
}

function moveX(body, level, dx, result, stepUp = 0) {
  body.x += dx;
  const [top, bottom] = rowsOf(body);
  const col = dx > 0
    ? Math.floor((body.x + body.w - EPSILON) / TILE)
    : Math.floor(body.x / TILE);
  const hits = [];
  for (let row = top; row <= bottom; row++) {
    if (isSolid(tileAt(level, col, row))) hits.push({ col, row });
  }
  if (hits.length === 0) return false;
  // A floor whose top is just above the feet is stepped up onto, if there
  // is room above it: where an escalator meets the floor at its end.
  const floorTop = hits[0].row * TILE;
  if (body.y + body.h - floorTop <= stepUp && isAreaFree(level, { x: body.x, y: floorTop - body.h, w: body.w, h: body.h })) {
    body.y = floorTop - body.h;
    return false;
  }
  body.x = dx > 0 ? col * TILE - body.w : (col + 1) * TILE;
  body.vx = 0;
  result.hitWall = Math.sign(dx);
  result.wallTiles = hits;
  return true;
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
    // top is the one landed on. A slope is crossed within its reach, so
    // walking along it keeps to it.
    if (!options.dropThrough) {
      for (const candidate of options.platforms ?? []) {
        const top = platformTop(candidate, body);
        const reach = candidate.slope ? SLOPE_REACH : 0;
        const crossed = previousBottom <= top + reach + EPSILON && body.y + body.h >= top - (options.grounded ? reach : 0);
        // A slope reaches a little past its ends too, so a body walking off
        // one onto the floor it meets never drops a step between them.
        const under = body.x < candidate.x + candidate.w + reach && candidate.x - reach < body.x + body.w;
        if (crossed && under && (ground === null || top < ground)) {
          ground = top;
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

// Where a platform holds a body up: its top, or for a slope (an
// escalator, see escalators.js) its height under the body's uphill edge,
// as a box standing on a slope touches it, kept within its ends. So a
// body walking up never has its feet below the floor at the top.
export function platformTop(platform, body) {
  if (!platform.slope) return platform.y;
  const uphill = platform.slope < 0 ? body.x + body.w : body.x;
  const at = Math.min(platform.x + platform.w, Math.max(platform.x, uphill));
  return platform.yLeft + platform.slope * (at - platform.x);
}

// Moves the body by its velocity over dt and resolves collisions. Returns what
// it touched: ground (and the moving platform, if that was it), a wall (its
// side as -1 or 1, and the tiles of it that were hit) and the ceiling
// tiles it hit. options: dropThrough to
// pass through one-way platforms, platforms to land on moving ones and
// slopes, grounded when it stood on something before the move, stepUp
// how far above its feet a floor it walks into can be stepped onto.
export function moveBody(body, level, dt, options = {}) {
  const result = {
    onGround: false,
    groundOneWay: false,
    platform: null,
    hitWall: 0,
    wallTiles: [],
    hitCeiling: false,
    ceilingTiles: [],
  };
  const dx = body.vx * dt;
  const dy = body.vy * dt;

  const stepsX = Math.max(1, Math.ceil(Math.abs(dx) / MAX_SUBSTEP));
  for (let i = 0; i < stepsX; i++) {
    if (moveX(body, level, dx / stepsX, result, options.stepUp)) break;
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
  const result = { hitWall: 0, wallTiles: [] };
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
