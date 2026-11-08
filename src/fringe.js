// The grass's fringe: the top of a lawn tile drawn a second time, a few
// pixels higher, in front of everything that stands on it, so Blenke, the
// enemies, the items and the scenery stand in the grass rather than on the
// tips of its blades. Only the picture changes: what stands on the lawn
// still stands on the tile's top edge. Pickups are the exception: they are
// drawn lifted above the fringe, so the small ones show whole. Pure: no
// DOM; the page passes in the tile's pixels.
import { TILE } from './config.js';
import { EMPTY, ROOM, tileAt, tileType } from './level.js';

// How far above the tile's top edge the fringe reaches, in art pixels:
// how deep in the grass whatever stands on it is.
export const FRINGE_RAISE = 3;

// Whether the tile at col, row shows a fringe: a tile that grows one
// (TILE_TYPES' fringe), with open air or a room's inside above it. A
// hazard lying on it (syringes, a puddle) stays in plain sight.
export function hasFringe(level, col, row) {
  if (!tileType(tileAt(level, col, row))?.fringe) return false;
  const above = tileAt(level, col, row - 1);
  return above === EMPTY || above === ROOM;
}

// How many of the tile's top rows the fringe is, given its RGBA bytes (as
// getImageData gives them): every row down to the last one with a gap
// between the blades, and as many more as it is raised, so it covers the
// tile's own blades and the gaps between them, and nothing behind it
// shows through.
export function fringeRows(data, width, height, raise = FRINGE_RAISE) {
  let lastGap = -1;
  for (let row = 0; row < height; row++) {
    for (let x = 0; x < width; x++) {
      if (data[(row * width + x) * 4 + 3] === 0) lastGap = row;
    }
  }
  return Math.min(height, lastGap + 1 + raise);
}

// How far a pickup whose foot is at bottom, x across, is lifted above the
// grass so that a small one shows whole: resting on a lawn, by the whole
// fringe; dropping its last few pixels onto one, by as much as it has
// dropped, so it settles without a jump. Nowhere near a lawn, not at all.
export function liftAboveGrass(level, x, bottom) {
  const row = Math.ceil(bottom / TILE);
  if (!hasFringe(level, Math.floor(x / TILE), row)) return 0;
  return Math.max(0, FRINGE_RAISE - (row * TILE - bottom));
}
