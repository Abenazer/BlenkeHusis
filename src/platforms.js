// Moving platforms: a row of H (sideways) or V (up and down) in a level
// makes one platform that glides back and forth; rows of V stacked in a
// column make a lift, from the lowest row up to the highest (a shaft as
// tall as it needs, Katarinahissen's). Like a one-way platform it
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
// row join into one platform; its top is the top of their tile. Vertical
// ones stacked the same width in a column join into one lift, at home in
// the lowest row and travelling up to the highest, at the same speed as a
// platform of the usual travel.
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
      travel: PLATFORM_TRAVEL[marker.axis],
      period: PLATFORM_PERIOD,
    });
  }
  return joinShafts(platforms);
}

// Stacked vertical platforms of one width and column: one lift, the
// lowest's, travelling the stack's height.
function joinShafts(platforms) {
  const above = (platform) => platforms.find((other) => other.axis === 'vertical' && other.col === platform.col && other.tiles === platform.tiles && other.row === platform.row - 1);
  const below = (platform) => platforms.find((other) => other.axis === 'vertical' && other.col === platform.col && other.tiles === platform.tiles && other.row === platform.row + 1);
  const joined = [];
  for (const platform of platforms) {
    if (platform.axis !== 'vertical') {
      joined.push(platform);
      continue;
    }
    if (below(platform)) continue;
    let rows = 1;
    for (let top = above(platform); top; top = above(top)) rows += 1;
    if (rows > 1) {
      platform.travel = (rows - 1) * TILE;
      platform.period = (PLATFORM_PERIOD * platform.travel) / PLATFORM_TRAVEL.vertical;
    }
    joined.push(platform);
  }
  return joined;
}

// How far from home a platform is at a time: it eases out, turns and eases
// back, so riders aren't jerked at the ends. A lift goes further, slower.
export function platformOffset(axis, time, travel = PLATFORM_TRAVEL[axis], period = PLATFORM_PERIOD) {
  const phase = (time / period) * 2 * Math.PI;
  return (travel * (1 - Math.cos(phase))) / 2;
}

// Moves every platform to where it is at `time`, remembering how far it
// moved (dx, dy) so it can carry its riders the same distance.
export function updatePlatforms(platforms, time) {
  for (const platform of platforms) {
    platform.px = platform.x;
    platform.py = platform.y;
    const offset = platformOffset(platform.axis, time, platform.travel, platform.period);
    if (platform.axis === 'horizontal') platform.x = platform.homeX + offset;
    else platform.y = platform.homeY - offset;
    platform.dx = platform.x - platform.px;
    platform.dy = platform.y - platform.py;
  }
}
