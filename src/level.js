// Levels are written as text, one character per 16×16 tile, so a level can be
// read and edited in any editor. This module parses them and answers
// questions about tiles. Pure: no DOM.
import { CITIZEN_CHARS } from './citizens.js';
import { TILE } from './config.js';
import { ENEMY_CHARS } from './enemies.js';
import { ITEM_CHARS } from './items.js';
import { PLATFORM_CHARS } from './platforms.js';
import { PROP_CHARS } from './props.js';

export const EMPTY = '.';

// What each tile character is. Solid tiles block from every side; one-way
// platforms only hold up something landing on them from above. The rest
// are hazards Blenke passes into (hazards.js says what they do): deep water
// and slime are liquids, a puddle is slippery to stand in. Police tape is
// a cordon he can't walk through; it and the sewer pipe are seen through
// at their sides. A crate is solid until it is opened from below (or by
// something thrown), and stays solid, empty, afterwards.
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
  '?': { name: 'crate', solid: true },
  '!': { name: 'openCrate', solid: true },
};

export const CRATE = '?';
export const OPEN_CRATE = '!';
// What a crate holds when nothing is written above it.
export const CRATE_DEFAULT = 'sampleCup';

// Characters that place something rather than a tile; the tile under them is
// empty. Each item, enemy, moving platform, citizen and prop has its own
// character too (ITEMS in items.js, ENEMIES in enemies.js, PLATFORM_CHARS
// in platforms.js, CITIZENS in citizens.js, PROPS in props.js). A sign's
// text is in the level's `signs`, in the order the signs come, left to
// right.
export const MARKERS = {
  '@': 'start',
  i: 'sign',
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

// An item written right above a crate is what the crate holds: it leaves
// the markers for the crate's contents.
function fillCrates(width, tiles, markers) {
  const crates = [];
  tiles.forEach((char, index) => {
    if (char !== CRATE) return;
    const col = index % width;
    const row = Math.floor(index / width);
    const above = markers.findIndex((marker) => marker.type === 'item' && marker.col === col && marker.row === row - 1);
    crates.push({ col, row, contents: above < 0 ? CRATE_DEFAULT : markers[above].item });
    if (above >= 0) markers.splice(above, 1);
  });
  return crates;
}

// Gives each sign its text, in the order they come from the left.
function labelSigns(id, markers, texts) {
  const signs = markers.filter((marker) => marker.type === 'sign').sort((a, b) => a.col - b.col || a.row - b.row);
  if (signs.length !== texts.length) {
    throw new Error(`Level ${id} has ${signs.length} signs but ${texts.length} sign texts`);
  }
  signs.forEach((sign, index) => {
    sign.text = texts[index];
  });
}

export function parseLevel(definition) {
  const { id, name, rows, time = DEFAULT_TIME, signs = [] } = definition;
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
      } else if (CITIZEN_CHARS[char]) {
        markers.push({ type: 'citizen', citizen: CITIZEN_CHARS[char], col, row });
        tiles.push(EMPTY);
      } else if (PROP_CHARS[char]) {
        markers.push({ type: 'prop', prop: PROP_CHARS[char], col, row });
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

  const crates = fillCrates(width, tiles, markers);
  labelSigns(id, markers, signs);
  return { id, name, width, height, tiles, markers, crates, start: starts[0], time };
}

export function tileAt(level, col, row) {
  if (col < 0 || col >= level.width) return OUTSIDE_WALL;
  if (row < 0 || row >= level.height) return EMPTY;
  return level.tiles[row * level.width + col];
}

export function setTile(level, col, row, char) {
  level.tiles[row * level.width + col] = char;
}

// Opens the crate at col, row: it turns into an empty one. Returns what it
// held, or null if there was no closed crate there.
export function openCrate(level, col, row) {
  if (tileAt(level, col, row) !== CRATE) return null;
  setTile(level, col, row, OPEN_CRATE);
  return level.crates.find((crate) => crate.col === col && crate.row === row).contents;
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
