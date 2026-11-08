// The hazards in the tiles: deep water drowns, toxic slime and giant
// syringes hurt, a urine puddle is slippery, and a leaking sewer pipe
// sprays a stream of sewage down to the ground every few seconds. Each
// hazard tile hurts only within its own box, so a syringe's empty corners
// and the air over a liquid are safe. Pure: no DOM, and time is passed in.
import { TILE } from './config.js';
import { isLiquid, isOneWay, isSolid, tileAt, tileName } from './level.js';
import { overlaps } from './items.js';

// The part of its tile each hazard covers, in pixels from the tile's top
// left corner; liquids from their surface down.
export const HAZARD_BOXES = {
  water: { x: 0, y: 4, w: TILE, h: TILE - 4 },
  slime: { x: 0, y: 5, w: TILE, h: TILE - 5 },
  syringes: { x: 2, y: 4, w: TILE - 4, h: TILE - 4 },
};

// A pipe leaks for LEAK_ON seconds out of every LEAK_PERIOD; neighbouring
// pipes take turns, offset by LEAK_STAGGER each.
export const LEAK_PERIOD = 3.2;
export const LEAK_ON = 1.4;
const LEAK_STAGGER = 0.8;
// How wide the stream is, in the middle of its pipe.
export const LEAK_WIDTH = 6;

function tileBox(col, row, box) {
  return { x: col * TILE + box.x, y: row * TILE + box.y, w: box.w, h: box.h };
}

// Every pipe tile with open air below it leaks, in a stream down to the
// first tile that stops it.
export function findLeaks(level) {
  const leaks = [];
  for (let row = 0; row < level.height; row++) {
    for (let col = 0; col < level.width; col++) {
      if (tileName(tileAt(level, col, row)) !== 'pipe') continue;
      const below = tileAt(level, col, row + 1);
      if (isSolid(below)) continue;
      let end = row + 1;
      while (end < level.height && !isSolid(tileAt(level, col, end)) && !isOneWay(tileAt(level, col, end))) end++;
      leaks.push({ col, row, top: (row + 1) * TILE, bottom: end * TILE, phase: leaks.length * LEAK_STAGGER });
    }
  }
  return leaks;
}

export function isLeaking(leak, time) {
  const t = (((time + leak.phase) % LEAK_PERIOD) + LEAK_PERIOD) % LEAK_PERIOD;
  return t < LEAK_ON;
}

export function leakBox(leak) {
  return {
    x: leak.col * TILE + (TILE - LEAK_WIDTH) / 2,
    y: leak.top,
    w: LEAK_WIDTH,
    h: leak.bottom - leak.top,
  };
}

function tilesUnder(body) {
  return {
    left: Math.floor(body.x / TILE),
    right: Math.floor((body.x + body.w - 0.001) / TILE),
    top: Math.floor(body.y / TILE),
    bottom: Math.floor((body.y + body.h - 0.001) / TILE),
  };
}

// What the body runs into: 'drown' when its middle is under water, 'hurt'
// when it touches slime, syringes or a leaking stream, otherwise null.
export function hazardFor(level, body, leaks, time) {
  const middleX = body.x + body.w / 2;
  const middleY = body.y + body.h / 2;
  const col = Math.floor(middleX / TILE);
  const row = Math.floor(middleY / TILE);
  if (tileName(tileAt(level, col, row)) === 'water') {
    const water = tileBox(col, row, HAZARD_BOXES.water);
    if (middleY >= water.y) return 'drown';
  }
  const area = tilesUnder(body);
  for (let r = area.top; r <= area.bottom; r++) {
    for (let c = area.left; c <= area.right; c++) {
      const name = tileName(tileAt(level, c, r));
      if ((name === 'slime' || name === 'syringes') && overlaps(body, tileBox(c, r, HAZARD_BOXES[name]))) {
        return 'hurt';
      }
    }
  }
  for (const leak of leaks) {
    if (isLeaking(leak, time) && overlaps(body, leakBox(leak))) return 'hurt';
  }
  return null;
}

// Where something whose bottom went from before to after, at x, went
// down through the surface of water or slime: { liquid, y }, or null.
export function surfaceCrossed(level, x, before, after) {
  if (after <= before) return null;
  const col = Math.floor(x / TILE);
  const row = Math.floor(after / TILE);
  const name = tileName(tileAt(level, col, row));
  if (name !== 'water' && name !== 'slime') return null;
  if (isLiquid(tileAt(level, col, row - 1))) return null;
  const y = row * TILE + HAZARD_BOXES[name].y;
  return before < y && after >= y ? { liquid: name, y } : null;
}

// Whether the body stands in a urine puddle: the tile its feet are in.
export function isSlippery(level, body) {
  const row = Math.floor((body.y + body.h - 0.001) / TILE);
  const { left, right } = tilesUnder(body);
  for (let col = left; col <= right; col++) {
    if (tileName(tileAt(level, col, row)) === 'puddle') return true;
  }
  return false;
}
