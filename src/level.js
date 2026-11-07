// Levels are written as text, one character per 16×16 tile, so a level can be
// read and edited in any editor. This module parses them and answers
// questions about tiles. Pure: no DOM.
import { TILE } from './config.js';
import { ENEMY_CHARS } from './enemies.js';
import { ITEM_CHARS } from './items.js';
import { PLATFORM_CHARS } from './platforms.js';

export const EMPTY = '.';

// What each tile character is. Solid tiles block from every side; one-way
// platforms only hold up something landing on them from above. The rest
// are hazards Lelle passes into (hazards.js says what they do): deep water
// and slime are liquids, a puddle is slippery to stand in. Police tape is
// a cordon he can't walk through; it and the sewer pipe are seen through
// at their sides.
export const TILE_TYPES = {
  '#': { name: 'ground', solid: true },
  B: { name: 'brick', solid: true },
  Z: { name: 'concrete', solid: true },
  A: { name: 'asphalt', solid: true },
  '=': { name: 'tape', solid: true, seeThrough: true },
  O: { name: 'pipe', solid: true, seeThrough: true },
  '-': { name: 'balcony', oneWay: true },
  _: { name: 'plank', oneWay: true },
  '~': { name: 'water', liquid: true },
  '%': { name: 'slime', liquid: true },
  '^': { name: 'syringes' },
  ',': { name: 'puddle' },
};

// Characters that place something rather than a tile; the tile under them is
// empty. Each item, enemy and moving platform has its own character too
// (ITEMS in items.js, ENEMIES in enemies.js, PLATFORM_CHARS in platforms.js).
export const MARKERS = {
  '@': 'start',
};

// Seconds on the clock when a level doesn't set its own.
export const DEFAULT_TIME = 300;

// The level's sides are walls, so the player can't walk out of it. Above and
// below are open: falling out of the bottom is a pit.
const OUTSIDE_WALL = '#';

// A long level is easier to write in sections side by side. Each section is
// an array of equally long rows; the result is one array of rows.
export function joinSections(...sections) {
  const height = sections[0].length;
  sections.forEach((section, index) => {
    if (section.length !== height) {
      throw new Error(`Section ${index} has ${section.length} rows, expected ${height}`);
    }
  });
  return sections[0].map((_, row) => sections.map((section) => section[row]).join(''));
}

export function parseLevel(definition) {
  const { id, name, rows, time = DEFAULT_TIME } = definition;
  if (!rows || rows.length === 0) throw new Error(`Level ${id} has no rows`);
  const width = rows[0].length;
  const height = rows.length;
  const tiles = [];
  const markers = [];

  rows.forEach((line, row) => {
    if (line.length !== width) {
      throw new Error(`Level ${id} row ${row} is ${line.length} wide, expected ${width}`);
    }
    for (let col = 0; col < width; col++) {
      const char = line[col];
      if (MARKERS[char]) {
        markers.push({ type: MARKERS[char], col, row });
        tiles.push(EMPTY);
      } else if (ITEM_CHARS[char]) {
        markers.push({ type: 'item', item: ITEM_CHARS[char], col, row });
        tiles.push(EMPTY);
      } else if (ENEMY_CHARS[char]) {
        markers.push({ type: 'enemy', enemy: ENEMY_CHARS[char], col, row });
        tiles.push(EMPTY);
      } else if (PLATFORM_CHARS[char]) {
        markers.push({ type: 'platform', axis: PLATFORM_CHARS[char], col, row });
        tiles.push(EMPTY);
      } else if (char === EMPTY || TILE_TYPES[char]) {
        tiles.push(char);
      } else {
        throw new Error(`Level ${id} has an unknown tile '${char}' at column ${col}, row ${row}`);
      }
    }
  });

  const starts = markers.filter((marker) => marker.type === 'start');
  if (starts.length !== 1) {
    throw new Error(`Level ${id} needs exactly one start (@), found ${starts.length}`);
  }

  if (!(time > 0)) throw new Error(`Level ${id} needs a positive time, got ${time}`);

  return { id, name, width, height, tiles, markers, start: starts[0], time };
}

export function tileAt(level, col, row) {
  if (col < 0 || col >= level.width) return OUTSIDE_WALL;
  if (row < 0 || row >= level.height) return EMPTY;
  return level.tiles[row * level.width + col];
}

export function tileType(char) {
  return TILE_TYPES[char] ?? null;
}

export function isSolid(char) {
  return TILE_TYPES[char]?.solid === true;
}

export function isOneWay(char) {
  return TILE_TYPES[char]?.oneWay === true;
}

export function isLiquid(char) {
  return TILE_TYPES[char]?.liquid === true;
}

export function tileName(char) {
  return TILE_TYPES[char]?.name ?? null;
}

export function pixelWidth(level) {
  return level.width * TILE;
}

export function pixelHeight(level) {
  return level.height * TILE;
}
