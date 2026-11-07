// Moving platforms: a row of H (sideways) or V (up and down) in a level
// makes one platform that glides back and forth. Like a one-way platform it
// only holds up what lands on it from above, and it carries what stands on
// it. Its position follows from the time alone, so it runs the same however
// the game is stepped. Pure: no DOM.
import { TILE } from './config.js';

export const PLATFORM_CHARS = { H: 'horizontal', V: 'vertical' };

// A sideways platform starts where it is written and goes this far right;
// one going up and down starts at the bottom and goes this far up.
export const PLATFORM_TRAVEL = { horizontal: 4 * TILE, vertical: 3 * TILE };
// Seconds for the way there and back.
export const PLATFORM_PERIOD = 4;
// How thick a platform is drawn under its top.
export const PLATFORM_THICKNESS = 6;

// markers: the level's platform markers. Neighbours of the same kind in a
// row join into one platform; its top is the top of their tile.
export function createPlatforms(markers) {
  const sorted = markers
    .filter((marker) => marker.type === 'platform')
    .sort((a, b) => a.row - b.row || a.col - b.col);
  const platforms = [];
  for (const marker of sorted) {
    const last = platforms[platforms.length - 1];
    if (last && last.axis === marker.axis && last.row === marker.row && last.col + last.tiles === marker.col) {
      last.tiles += 1;
      last.w += TILE;
      continue;
    }
    const x = marker.col * TILE;
    const y = marker.row * TILE;
    platforms.push({
      axis: marker.axis,
      col: marker.col,
      row: marker.row,
      tiles: 1,
      homeX: x,
      homeY: y,
      x,
      y,
      px: x,
      py: y,
      dx: 0,
      dy: 0,
      w: TILE,
      h: PLATFORM_THICKNESS,
    });
  }
  return platforms;
}

// How far from home a platform is at a time: it eases out, turns and eases
// back, so riders aren't jerked at the ends.
export function platformOffset(axis, time) {
  const phase = (time / PLATFORM_PERIOD) * 2 * Math.PI;
  return (PLATFORM_TRAVEL[axis] * (1 - Math.cos(phase))) / 2;
}

// Moves every platform to where it is at `time`, remembering how far it
// moved (dx, dy) so it can carry its riders the same distance.
export function updatePlatforms(platforms, time) {
  for (const platform of platforms) {
    platform.px = platform.x;
    platform.py = platform.y;
    const offset = platformOffset(platform.axis, time);
    if (platform.axis === 'horizontal') platform.x = platform.homeX + offset;
    else platform.y = platform.homeY - offset;
    platform.dx = platform.x - platform.px;
    platform.dy = platform.y - platform.py;
  }
}
