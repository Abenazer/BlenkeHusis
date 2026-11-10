// Levels are written as text, one character per 16×16 tile, so a level can be
// read and edited in any editor. This module parses them and answers
// questions about tiles. Pure: no DOM.
import { CITIZEN_CHARS } from './citizens.js';
import { TILE } from './config.js';
import { ENEMY_CHARS } from './enemies.js';
import { ITEM_CHARS } from './items.js';
import { PLATFORM_CHARS } from './platforms.js';
import { PROP_CHARS } from './props.js';
import { SCENERY, SCENERY_CHARS } from './scenery.js';

export const EMPTY = '.';

// What each tile character is. Solid tiles block from every side; one-way
// platforms only hold up something landing on them from above. The rest
// are hazards Blenke passes into (hazards.js says what they do): deep water
// and slime are liquids, a puddle is slippery to stand in. Police tape is
// a cordon he can't walk through; it and the sewer pipe are seen through
// at their sides. A crate is solid until it is opened from below (or by
// something thrown), and stays solid, empty, afterwards. A gate is a
// barrier that stands until the level's boss is beaten. A secret wall
// looks like brick but lets Blenke through, and once he is in, the whole
// room behind it shows (it turns into the room's inside). The ground is a
// lawn, whose fringe is drawn in front of what stands on it (fringe.js).
// Wood is a villa's painted panelling.
export const TILE_TYPES = {
  '#': { name: 'ground', solid: true, fringe: true },
  B: { name: 'brick', solid: true },
  Z: { name: 'concrete', solid: true },
  A: { name: 'asphalt', solid: true },
  W: { name: 'wood', solid: true },
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
  '|': { name: 'gate', solid: true, seeThrough: true },
  ':': { name: 'secretWall' },
  ';': { name: 'room' },
};

export const CRATE = '?';
export const OPEN_CRATE = '!';
export const GATE = '|';
export const SECRET_WALL = ':';
export const ROOM = ';';
// What a crate holds when nothing is written above it.
export const CRATE_DEFAULT = 'sampleCup';

// Characters that place something rather than a tile; the tile under them is
// empty. Each item, enemy, moving platform, citizen and prop has its own
// character too (ITEMS in items.js, ENEMIES in enemies.js, PLATFORM_CHARS
// in platforms.js, CITIZENS in citizens.js, PROPS in props.js, SCENERY in
// scenery.js). A sign's text is in the level's `signs`, in the order the
// signs come, left to right. A lost life starts Blenke at the last
// checkpoint he passed; reaching the goal completes the level, and then he
// walks on to the filling station's pump (M) to pour his samples into it.
export const MARKERS = {
  '@': 'start',
  i: 'sign',
  C: 'checkpoint',
  G: 'goal',
  M: 'station',
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

// A marker inside a room (a secret one, or the inside of a building)
// stands on the room's tile rather than an empty one, so the room has no
// holes: the tile to its left, or failing that to its right, if that is a
// room's. tiles holds the row so far.
const ROOM_TILES = new Set([SECRET_WALL, ROOM]);

function underMarker(line, col, tiles) {
  const left = col > 0 ? tiles[tiles.length - 1] : null;
  if (ROOM_TILES.has(left)) return left;
  if (ROOM_TILES.has(line[col + 1])) return line[col + 1];
  return EMPTY;
}

// A named piece of scenery (a station's name board) shows the level's
// stationName; one without it fails.
function nameScenery(id, markers, stationName) {
  for (const marker of markers) {
    if (marker.type !== 'scenery' || !SCENERY[marker.scenery].named) continue;
    if (!stationName) throw new Error(`Level ${id} has a ${marker.scenery} but no stationName`);
    marker.text = stationName;
  }
}

// title: what shows as the level starts; the HUD shows its name.
export function parseLevel(definition) {
  const { id, name, title = name, rows, time = DEFAULT_TIME, signs = [], stationName = null } = definition;
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
        tiles.push(underMarker(line, col, tiles));
      } else if (ITEM_CHARS[char]) {
        markers.push({ type: 'item', item: ITEM_CHARS[char], col, row });
        tiles.push(underMarker(line, col, tiles));
      } else if (ENEMY_CHARS[char]) {
        markers.push({ type: 'enemy', enemy: ENEMY_CHARS[char], col, row });
        tiles.push(underMarker(line, col, tiles));
      } else if (PLATFORM_CHARS[char]) {
        markers.push({ type: 'platform', axis: PLATFORM_CHARS[char], col, row });
        tiles.push(underMarker(line, col, tiles));
      } else if (CITIZEN_CHARS[char]) {
        markers.push({ type: 'citizen', citizen: CITIZEN_CHARS[char], col, row });
        tiles.push(underMarker(line, col, tiles));
      } else if (PROP_CHARS[char]) {
        markers.push({ type: 'prop', prop: PROP_CHARS[char], col, row });
        tiles.push(underMarker(line, col, tiles));
      } else if (SCENERY_CHARS[char]) {
        markers.push({ type: 'scenery', scenery: SCENERY_CHARS[char], col, row });
        tiles.push(underMarker(line, col, tiles));
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

  if (markers.filter((marker) => marker.type === 'goal').length > 1) {
    throw new Error(`Level ${id} has more than one goal (G)`);
  }

  if (markers.filter((marker) => marker.type === 'station').length > 1) {
    throw new Error(`Level ${id} has more than one filling station (M)`);
  }

  if (!(time > 0)) throw new Error(`Level ${id} needs a positive time, got ${time}`);

  const crates = fillCrates(width, tiles, markers);
  labelSigns(id, markers, signs);
  nameScenery(id, markers, stationName);
  return { id, name, title, width, height, tiles, markers, crates, start: starts[0], time };
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

// Opens every gate in the level. Returns how many tiles opened.
export function openGates(level) {
  let opened = 0;
  level.tiles.forEach((char, index) => {
    if (char !== GATE) return;
    level.tiles[index] = EMPTY;
    opened += 1;
  });
  return opened;
}

// Reveals the secret room whose wall is at col, row: every secret-wall tile
// joined to it, side by side or above and below, turns into the room's
// inside. Returns how many tiles it took, 0 if there was no secret wall.
export function revealRoom(level, col, row) {
  const queue = [[col, row]];
  let revealed = 0;
  while (queue.length > 0) {
    const [c, r] = queue.pop();
    if (tileAt(level, c, r) !== SECRET_WALL) continue;
    setTile(level, c, r, ROOM);
    revealed += 1;
    queue.push([c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]);
  }
  return revealed;
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
