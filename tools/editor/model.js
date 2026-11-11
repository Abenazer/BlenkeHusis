// The level editor's model, pure (no DOM), so tests check it: what can be
// placed and what it is called, a level being edited (its rows, its signs'
// texts by place, its other fields), the edits made to it, what the game
// would say about it, and the level file it is written out as, the same
// shape as the levels in src/levels/.
//
// A draft: { meta: { id, name, place, stationName, time, music }, rows,
// signs: Map 'col,row' -> text, cast, comment }. Edits return a new draft
// and leave the old one as it was, so an earlier one is an undo step.
import { CITIZEN_CHARS } from '../../src/citizens.js';
import { ENEMY_CHARS } from '../../src/enemies.js';
import { ITEM_CHARS } from '../../src/items.js';
import { EMPTY, MARKERS, OPEN_CRATE, parseLevel, TILE_TYPES, underMarker } from '../../src/level.js';
import { finish } from '../../src/levels/finish.js';
import { PLATFORM_CHARS } from '../../src/platforms.js';
import { PROP_CHARS } from '../../src/props.js';
import { SCENERY_CHARS } from '../../src/scenery.js';

export const SIGN = 'i';
// How tall a new level is, as the game's are: the ground's top on row 17.
export const NEW_HEIGHT = 20;
// How many columns go into each section of a written-out level, so a
// change shows as a change to a few short lines.
export const SECTION_WIDTH = 80;

// What a character places, by the tables the level parser reads:
// { kind, type }, or null for one it doesn't know.
export function kindOf(char) {
  if (char === EMPTY) return { kind: 'empty', type: null };
  if (MARKERS[char]) return { kind: 'marker', type: MARKERS[char] };
  if (ITEM_CHARS[char]) return { kind: 'item', type: ITEM_CHARS[char] };
  if (ENEMY_CHARS[char]) return { kind: 'enemy', type: ENEMY_CHARS[char] };
  if (PLATFORM_CHARS[char]) return { kind: 'platform', type: PLATFORM_CHARS[char] };
  if (CITIZEN_CHARS[char]) return { kind: 'citizen', type: CITIZEN_CHARS[char] };
  if (PROP_CHARS[char]) return { kind: 'prop', type: PROP_CHARS[char] };
  if (SCENERY_CHARS[char]) return { kind: 'scenery', type: SCENERY_CHARS[char] };
  if (TILE_TYPES[char]) return { kind: 'tile', type: TILE_TYPES[char].name };
  return null;
}

// Every character a level can be written with (an opened crate only
// comes about in play).
export function levelChars() {
  return [EMPTY, ...Object.keys(TILE_TYPES), ...Object.keys(MARKERS), ...Object.keys(ITEM_CHARS), ...Object.keys(ENEMY_CHARS),
    ...Object.keys(PLATFORM_CHARS), ...Object.keys(CITIZEN_CHARS), ...Object.keys(PROP_CHARS), ...Object.keys(SCENERY_CHARS)]
    .filter((char) => char !== OPEN_CRATE);
}

// What the editor calls each character, in Swedish like the one using it.
export const LABELS = {
  '.': 'Tomt (radera)',
  '#': 'Gräsmatta',
  B: 'Tegel',
  Z: 'Betong',
  A: 'Asfalt',
  W: 'Träpanel',
  g: 'Glas (växthus)',
  '-': 'Balkong (envägs)',
  _: 'Planka (envägs)',
  H: 'Plattform i sidled',
  V: 'Plattform i höjdled',
  '~': 'Vatten',
  '%': 'Slem',
  '^': 'Sprutor',
  ',': 'Urinpöl (halt)',
  '=': 'Polistejp',
  O: 'Avloppsrör (läcker)',
  '?': 'Låda (det som står ovanför ligger i den)',
  '|': 'Grind (står tills bossen är slagen)',
  ':': 'Hemlig vägg',
  ';': 'Rum (insida)',
  '@': 'Start',
  i: 'Skylt',
  C: 'Checkpoint',
  G: 'Mål',
  M: 'Tankstation',
  u: 'Provmugg',
  U: 'Provburk',
  h: 'Provdunk (dold)',
  p: 'Ringa innehav',
  b: 'Påse',
  c: 'Tom burk',
  s: 'Sked',
  t: 'Provrör',
  k: 'Kaffe',
  r: 'Pappersarbete',
  d: 'Direktiv',
  $: 'Pengar',
  K: 'Poliskaffe',
  F: 'Pappersskölden',
  T: 'Obligatorisk provtagning',
  E: 'Budgetökning',
  Q: 'Superblåsa',
  X: 'Polishelikopter',
  S: 'Stenad',
  D: 'Langare',
  P: 'Festfolk',
  Y: 'Byråkrat',
  L: 'Tekniker',
  I: 'Ideolog',
  R: 'Åklagare (boss)',
  f: 'Hippie',
  x: 'Hårdrockare',
  N: 'Punkare',
  y: 'Syntare',
  e: 'Breakdansare',
  o: 'Ravare',
  n: 'Goth',
  a: 'Raggare',
  q: 'Proggaktivist',
  w: 'Skejtare',
  m: 'Pensionär',
  v: 'Kon',
  1: 'Busskur',
  2: 'Polisbil',
  3: 'Gungor',
  4: 'Rutschkana',
  5: 'Bänk',
  6: 'Gatlykta',
  7: 'Miljöhus',
  8: 'Parkeringsskylt',
  9: 'Stationsskylt (stationsnamnet)',
  0: 'Runsten',
};

// The palette's groups, in the order they are shown.
export const GROUPS = [
  { name: 'Mark och väggar', chars: '.#BZAWg' },
  { name: 'Plattformar', chars: '-_HV' },
  { name: 'Faror', chars: '~%^,=O' },
  { name: 'Lådor och hemligheter', chars: '?|:;' },
  { name: 'Markörer', chars: '@iCGM' },
  { name: 'Prov', chars: 'uUh' },
  { name: 'Innehav och bevis', chars: 'pbcst' },
  { name: 'Bonus', chars: 'krd$' },
  { name: 'Power-ups', chars: 'KFTEQX' },
  { name: 'Fiender', chars: 'SDPYLIR' },
  { name: 'Subkulturer', chars: 'fxNyeonaqw' },
  { name: 'Folk och saker', chars: 'mv' },
  { name: 'Kulisser', chars: '1234567890' },
];

const key = (col, row) => `${col},${row}`;
const place = (text) => text.split(',').map(Number);

// A draft of a level definition (as in src/levels/, or as the game lists
// it with its cast and title), its signs' texts put on their places.
export function draftOf(definition, comment = '') {
  const { id, name, place: where = '', stationName = '', time = 300, music = '', rows, signs = [], cast = [] } = definition;
  const draft = { meta: { id, name, place: where, stationName, time, music }, rows: [...rows], signs: new Map(), cast, comment };
  signPlaces(draft.rows).forEach(([col, row], index) => draft.signs.set(key(col, row), signs[index] ?? ''));
  return draft;
}

// A new level: a start on a lawn, then the finish every level ends with.
export function newDraft(width = 40) {
  const sky = '.'.repeat(width);
  const ground = '#'.repeat(width);
  const body = [...Array(NEW_HEIGHT - 4).fill(sky), `..@${'.'.repeat(width - 3)}`, ground, ground, ground];
  const ending = finish(NEW_HEIGHT);
  return draftOf({ id: 'ny-bana', name: 'Ny bana', time: 300, music: 'suburbs', rows: body.map((row, index) => row + ending[index]) });
}

export function widthOf(draft) {
  return draft.rows[0].length;
}

export function charAt(draft, col, row) {
  return draft.rows[row]?.[col] ?? null;
}

// Where the signs stand, in the order their texts are given: from the
// left, then from the top (as the parser labels them).
function signPlaces(rows) {
  const places = [];
  rows.forEach((line, row) => {
    for (let col = 0; col < line.length; col++) if (line[col] === SIGN) places.push([col, row]);
  });
  return places.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

// The signs in order, each with its text (an empty one where none is
// written yet).
export function signList(draft) {
  return signPlaces(draft.rows).map(([col, row]) => ({ col, row, text: draft.signs.get(key(col, row)) ?? '' }));
}

export function setSignText(draft, col, row, text) {
  const signs = new Map(draft.signs);
  signs.set(key(col, row), text);
  return { ...draft, signs };
}

export function setMeta(draft, field, value) {
  return { ...draft, meta: { ...draft.meta, [field]: value } };
}

// The texts kept are those of the signs still standing.
function pruneSigns(rows, signs) {
  const kept = new Map();
  for (const [where, text] of signs) {
    const [col, row] = place(where);
    if (rows[row]?.[col] === SIGN) kept.set(where, text);
  }
  return kept;
}

// Writes each cell's character: [{ col, row, char }], those outside the
// level left out. A sign written over loses its text.
export function writeCells(draft, cells) {
  const grid = draft.rows.map((line) => [...line]);
  const signs = new Map(draft.signs);
  for (const { col, row, char, text } of cells) {
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[row].length) continue;
    grid[row][col] = char;
    if (char === SIGN && text !== undefined) signs.set(key(col, row), text);
  }
  const rows = grid.map((line) => line.join(''));
  return { ...draft, rows, signs: pruneSigns(rows, signs) };
}

// The cells of a rectangle { col, row, width, height }, clipped to the level.
function cellsOf(draft, { col, row, width, height }) {
  const cells = [];
  for (let r = Math.max(0, row); r < Math.min(draft.rows.length, row + height); r++) {
    for (let c = Math.max(0, col); c < Math.min(widthOf(draft), col + width); c++) cells.push({ col: c, row: r });
  }
  return cells;
}

export function fillRect(draft, rect, char) {
  return writeCells(draft, cellsOf(draft, rect).map((cell) => ({ ...cell, char })));
}

// A rectangle from two corners, in either order.
export function rectBetween(a, b) {
  const col = Math.min(a.col, b.col);
  const row = Math.min(a.row, b.row);
  return { col, row, width: Math.abs(a.col - b.col) + 1, height: Math.abs(a.row - b.row) + 1 };
}

// What a rectangle holds, to paste elsewhere: its rows and its signs' texts.
export function copyRect(draft, rect) {
  const cells = cellsOf(draft, rect);
  const clip = { width: rect.width, height: rect.height, cells: [] };
  for (const { col, row } of cells) {
    const char = charAt(draft, col, row);
    const cell = { col: col - rect.col, row: row - rect.row, char };
    if (char === SIGN) cell.text = draft.signs.get(key(col, row)) ?? '';
    clip.cells.push(cell);
  }
  return clip;
}

export function pasteClip(draft, clip, col, row) {
  return writeCells(draft, clip.cells.map((cell) => ({ ...cell, col: cell.col + col, row: cell.row + row })));
}

// Moves what a rectangle holds by (dCol, dRow), leaving it empty behind.
export function moveRect(draft, rect, dCol, dRow) {
  const clip = copyRect(draft, rect);
  return pasteClip(fillRect(draft, rect, EMPTY), clip, rect.col + dCol, rect.row + dRow);
}

// What a column is with the things in it taken away: its tiles, so a
// column copied from it carries the ground and the walls on.
function tilesOfColumn(draft, col) {
  const grid = tileGrid(draft.rows);
  return draft.rows.map((_, row) => grid.tiles[row * grid.width + col]);
}

function shiftSigns(signs, from, by) {
  const shifted = new Map();
  for (const [where, text] of signs) {
    const [col, row] = place(where);
    if (col >= from) shifted.set(key(col + by, row), text);
    else shifted.set(where, text);
  }
  return shifted;
}

// Puts count columns in before column at, each the tiles of the column
// to its left (so the ground runs on), or empty at the level's start.
export function insertColumns(draft, at, count) {
  const tiles = at > 0 ? tilesOfColumn(draft, at - 1) : draft.rows.map(() => EMPTY);
  const rows = draft.rows.map((line, row) => line.slice(0, at) + tiles[row].repeat(count) + line.slice(at));
  return { ...draft, rows, signs: shiftSigns(draft.signs, at, count) };
}

// Takes count columns away from column at on; at least one is left.
export function deleteColumns(draft, at, count) {
  const taken = Math.min(count, widthOf(draft) - at, widthOf(draft) - 1);
  if (taken <= 0) return draft;
  const rows = draft.rows.map((line) => line.slice(0, at) + line.slice(at + taken));
  const kept = new Map([...draft.signs].filter(([where]) => {
    const [col] = place(where);
    return col < at || col >= at + taken;
  }));
  return { ...draft, rows, signs: pruneSigns(rows, shiftSigns(kept, at + taken, -taken)) };
}

// The level's tiles as the renderer reads them ({ width, height, tiles }),
// a thing standing on the tile the parser would put under it and a
// character it doesn't know drawn as nothing.
export function tileGrid(rows) {
  const tiles = [];
  for (const line of rows) {
    const row = [];
    for (let col = 0; col < line.length; col++) {
      const char = line[col];
      const kind = kindOf(char)?.kind;
      row.push(kind === 'tile' || kind === 'empty' ? char : kind ? underMarker(line, col, row) : EMPTY);
    }
    tiles.push(...row);
  }
  return { width: rows[0]?.length ?? 0, height: rows.length, tiles };
}

// The rows without the finish every level ends with, and whether they had it.
export function splitFinish(rows) {
  // The finish needs its goal's row and three of ground.
  if (rows.length < 4) return { body: rows, finished: false };
  const ending = finish(rows.length);
  const finished = rows.every((line, index) => line.endsWith(ending[index]));
  return finished ? { body: rows.map((line) => line.slice(0, line.length - ending[0].length)), finished } : { body: rows, finished };
}

// The level as the game reads it: its fields, rows and signs' texts in
// order. Empty fields are left out.
export function toDefinition(draft) {
  const { id, name, place: where, stationName, time, music } = draft.meta;
  const definition = { id, name };
  if (where) definition.place = where;
  if (stationName) definition.stationName = stationName;
  Object.assign(definition, { time: Number(time), music, rows: [...draft.rows], signs: signList(draft).map((sign) => sign.text) });
  return definition;
}

// Where the editor keeps its draft between visits, in this browser only;
// the game reads it from there to play-test it (play.js).
export const DRAFT_KEY = 'blenkehusis.editor.draft';

// The draft and its file's name in the shape they are kept in, as JSON.
export function storedDraft(draft, fileName) {
  return JSON.stringify({ ...draft, signs: [...draft.signs], fileName });
}

// A kept draft read back, or null if there is none or it isn't one (it is
// external input: a browser's storage can hold anything).
export function draftFromStored(text) {
  const saved = JSON.parse(text);
  const rows = saved?.rows;
  if (!Array.isArray(rows) || !rows.length || !rows.every((row) => typeof row === 'string' && row.length === rows[0].length)) return null;
  if (typeof saved.meta !== 'object' || saved.meta === null || !Array.isArray(saved.signs)) return null;
  return {
    draft: { meta: saved.meta, rows, signs: new Map(saved.signs), cast: Array.isArray(saved.cast) ? saved.cast : [], comment: String(saved.comment ?? '') },
    fileName: String(saved.fileName ?? 'ny-bana.js'),
  };
}

// Where an error from the parser points, if it names a place.
function cellIn(message) {
  const match = /column (\d+), row (\d+)/.exec(message);
  return match ? { col: Number(match[1]), row: Number(match[2]) } : null;
}

// What the game would say: errors it would fail on, and warnings for what
// every level of the game needs (a goal, a checkpoint, the filling
// station, the finish). level is the parsed level when there are no errors.
export function checkDraft(draft, songs) {
  const errors = [];
  const warnings = [];
  const { id, name, music, time } = draft.meta;
  if (!/^[a-z][a-z0-9-]*$/.test(id ?? '')) errors.push({ text: 'Id:t ska vara små bokstäver a–z, siffror och bindestreck, och börja med en bokstav.' });
  if (!name) errors.push({ text: 'Banan behöver ett namn.' });
  if (!songs[music]) errors.push({ text: `Låten '${music}' finns inte.` });
  if (!(Number(time) > 0)) errors.push({ text: 'Tiden ska vara ett positivt antal sekunder.' });
  let level = null;
  try {
    level = parseLevel({ ...toDefinition(draft), cast: draft.cast });
  } catch (error) {
    errors.push({ text: `Spelet: ${error.message}`, cell: cellIn(error.message) });
  }
  if (level) {
    const has = (type) => level.markers.some((marker) => marker.type === type);
    if (!has('goal')) warnings.push({ text: 'Inget mål (G): banan kan inte klaras.' });
    if (!has('checkpoint')) warnings.push({ text: 'Ingen checkpoint (C): varje bana i spelet behöver minst en.' });
    if (!has('station')) warnings.push({ text: 'Ingen tankstation (M).' });
  }
  if (!splitFinish(draft.rows).finished) warnings.push({ text: `Banan slutar inte med finish(${draft.rows.length}), som varje bana i spelet gör.` });
  for (const sign of signList(draft)) {
    if (!sign.text.trim()) warnings.push({ text: `Skylten i kolumn ${sign.col}, rad ${sign.row} har ingen text.`, cell: sign });
  }
  return { errors, warnings, level: errors.length ? null : level };
}

// The name a level is exported under and its file is named after, as
// the ones in src/levels/: its id in lowercase letters and digits only
// ('forort-1' is forort1).
export function constName(id) {
  const name = String(id).toLowerCase().replace(/[^a-z0-9]/g, '');
  return /^[a-z]/.test(name) ? name : `bana${name}`;
}

function quote(text) {
  return `'${String(text).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

// The comment a level file starts with, its lines up to the first that isn't one.
export function leadingComment(source) {
  const lines = [];
  for (const line of source.split('\n')) {
    if (!line.startsWith('//')) break;
    lines.push(line);
  }
  return lines.join('\n');
}

// The draft written out as a level file for src/levels/, in the shape of
// the ones there: the rows in sections SECTION_WIDTH columns wide joined
// side by side, ending with the finish when they do, and the signs.
export function levelSource(draft) {
  const definition = toDefinition(draft);
  const { body, finished } = splitFinish(definition.rows);
  const sections = [];
  for (let from = 0; from < body[0].length; from += SECTION_WIDTH) sections.push(body.map((line) => line.slice(from, from + SECTION_WIDTH)));
  const lines = [];
  lines.push(draft.comment || `// ${definition.name}, built in the level editor (tools/editor.html).`);
  lines.push("import { joinSections } from '../level.js';");
  if (finished) lines.push("import { finish } from './finish.js';");
  sections.forEach((section, index) => {
    const from = index * SECTION_WIDTH;
    lines.push('', `// Columns ${from}–${from + section[0].length - 1}.`, `const section${index + 1} = [`);
    for (const line of section) lines.push(`  ${quote(line)},`);
    lines.push('];');
  });
  const parts = sections.map((_, index) => `section${index + 1}`);
  if (finished) parts.push(`finish(${definition.rows.length})`);
  lines.push('', `export const ${constName(definition.id)} = {`);
  for (const field of ['id', 'name', 'place', 'stationName']) {
    if (definition[field] !== undefined) lines.push(`  ${field}: ${quote(definition[field])},`);
  }
  lines.push(`  time: ${definition.time},`, `  music: ${quote(definition.music)},`, `  rows: joinSections(${parts.join(', ')}),`);
  if (definition.signs.length === 0) lines.push('  signs: [],');
  else {
    lines.push('  signs: [');
    for (const text of definition.signs) lines.push(`    ${quote(text)},`);
    lines.push('  ],');
  }
  lines.push('};', '');
  return lines.join('\n');
}

// A level file's relative imports made absolute from base (the URL of
// src/levels/), so it can be imported from wherever it was read.
export function rewriteImports(source, base) {
  return source.replace(/(\bfrom\s*)(['"])(\.{1,2}\/[^'"]+)\2/g, (_, from, mark, specifier) => `${from}${mark}${new URL(specifier, base).href}${mark}`);
}

// The level an imported level file exports: the first export with rows.
export function definitionIn(module) {
  const found = Object.values(module).find((value) => value && Array.isArray(value.rows));
  if (!found) throw new Error('Filen exporterar ingen bana (inget objekt med rows).');
  return found;
}
