// The level editor's page: the palette, the level drawn with the game's
// own art (the delivered sheets where there are any), the tools that
// change it, the level's fields and signs, what the game would say about
// it and its numbers, and writing it out as a level file. What a level is
// and how it changes is model.js; this is only the page around it.
import { stationSign } from '../../src/art/scenery.js';
import { TILE } from '../../src/config.js';
import { findLevel, LEVELS, TRY_LEVELS } from '../../src/levels/index.js';
import { SONGS } from '../../src/music/index.js';
import { colour } from '../../src/palette.js';
import { createRenderer, tileImageFor, toCanvas } from '../../src/render.js';
import { SCENERY } from '../../src/scenery.js';
import { loadSprites } from '../../src/sheets.js';
import { levelReport } from '../levelstats.js';
import {
  charAt, checkDraft, constName, copyRect, definitionIn, deleteColumns, DRAFT_KEY, draftFromStored, draftOf, fillRect, GROUPS,
  insertColumns, kindOf, LABELS, leadingComment, levelSource, moveRect, newDraft, pasteClip, rectBetween, rewriteImports, sectionsIn, sectionsOf, setMeta,
  setSignText, signList, storedDraft, tileGrid, toDefinition, widthOf, writeCells,
} from './model.js';

// The game, opened on the draft to play-test it, in a tab of its own that
// each play-test reuses.
const PLAY_URL = new URL('../index.html?bana=editor', window.location.href);
const PLAY_TAB = 'blenkehusis-provspel';
const UNDO_LIMIT = 200;
// How many columns to the left of the view are drawn too, for the things
// standing there that reach into it (the station's name board is 8 wide).
const REACH = 8;
const LEVELS_URL = new URL('../src/levels/', window.location.href);

const element = (id) => document.getElementById(id);
const scroller = element('scroller');
const spacer = element('spacer');
const view = element('view');
const context = view.getContext('2d');

const renderer = createRenderer(await loadSprites('../'));

const state = {
  draft: null,
  fileName: 'ny-bana.js',
  undo: [],
  redo: [],
  // The draft a stroke began from, while one is being drawn.
  strokeBase: null,
  tool: 'brush',
  char: '#',
  zoom: 2,
  hover: null,
  // The column the mouse was last over in the level.
  lastCol: 0,
  selection: null,
  drag: null,
  clip: null,
  pasting: false,
  check: { errors: [], warnings: [] },
  showGrid: true,
  showChars: false,
  flash: null,
  grid: null,
};

// --- What is drawn where ---------------------------------------------------

const named = new Map();

function nameBoard(text) {
  if (!named.has(text)) {
    const image = stationSign(text);
    named.set(text, { image: toCanvas(image), originX: 0, originY: image.height });
  }
  return named.get(text);
}

// A thing standing on the bottom of its tile, in the middle.
function standing(look, col, row) {
  return { image: look.image, x: (col + 0.5) * TILE - look.originX, y: (row + 1) * TILE - look.originY };
}

// A character's picture where it stands, as the game places it, or null
// for a tile or nothing.
function placed(char, col, row) {
  const known = kindOf(char);
  if (!known) return null;
  const { kind, type } = known;
  if (kind === 'item') return standing(renderer.items[type], col, row);
  if (kind === 'enemy') {
    const frame = renderer.enemies[type][0].move[0];
    // Enemies start facing left, towards Blenke.
    return standing({ image: frame.left, originX: frame.width - frame.originX, originY: frame.originY }, col, row);
  }
  if (kind === 'citizen') {
    const frame = renderer.citizens[type].stand.frames[0];
    return standing({ image: frame.right, originX: frame.originX, originY: frame.originY }, col, row);
  }
  if (kind === 'prop') return standing(renderer.props[type], col, row);
  if (kind === 'scenery') {
    const look = SCENERY[type].named ? nameBoard(state.draft?.meta.stationName || 'STATION') : renderer.scenery[type];
    return { image: look.image, x: col * TILE - look.originX, y: (row + 1) * TILE - look.originY };
  }
  if (kind === 'platform') return { image: renderer.platform.image, x: col * TILE, y: row * TILE, arrow: type };
  if (type === 'start') {
    const { frames, animations } = renderer.player;
    const frame = frames[animations.idle[0]];
    return standing({ image: frame.right, originX: frame.originX, originY: frame.originY }, col, row);
  }
  if (type === 'sign') return { image: renderer.sign.image, x: col * TILE - renderer.sign.originX, y: row * TILE - renderer.sign.originY };
  if (type === 'checkpoint') return standing(renderer.checkpoint.unlit, col, row);
  if (type === 'goal') return standing(renderer.goal.frames[0], col, row);
  if (type === 'station') {
    const { pump } = renderer.station;
    return { image: pump.image, x: (col + 0.5) * TILE - pump.image.width / 2, y: (row + 1) * TILE - pump.originY };
  }
  return null;
}

// Things are drawn behind one another as the game draws them.
const LAYER = { scenery: 0, marker: 1, platform: 2, prop: 3, item: 4, citizen: 5, enemy: 6 };

function drawArrow(ctx, x, y, axis) {
  ctx.fillStyle = colour('hivis_3');
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(axis === 'horizontal' ? '↔' : '↕', x + 8, y - 2);
}

// --- Drawing the level -----------------------------------------------------

let drawPending = false;

function requestDraw() {
  if (drawPending) return;
  drawPending = true;
  requestAnimationFrame(() => {
    drawPending = false;
    draw();
  });
}

function tileSize() {
  return TILE * state.zoom;
}

function draw() {
  const { draft, grid } = state;
  if (!grid) return;
  const ratio = window.devicePixelRatio || 1;
  const width = scroller.clientWidth;
  const height = scroller.clientHeight;
  if (view.width !== Math.round(width * ratio) || view.height !== Math.round(height * ratio)) {
    view.width = Math.round(width * ratio);
    view.height = Math.round(height * ratio);
    view.style.width = `${width}px`;
    view.style.height = `${height}px`;
  }
  const ctx = context;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = colour('ink');
  ctx.fillRect(0, 0, view.width, view.height);
  const { scrollLeft, scrollTop } = scroller;
  const scale = ratio * state.zoom;
  ctx.setTransform(scale, 0, 0, scale, -scrollLeft * ratio, -scrollTop * ratio);
  ctx.imageSmoothingEnabled = false;

  const columns = grid.width;
  const rows = grid.height;
  ctx.fillStyle = colour('sky_3');
  ctx.fillRect(0, 0, columns * TILE, rows * TILE);
  const first = Math.max(0, Math.floor(scrollLeft / tileSize()) - REACH);
  const last = Math.min(columns - 1, Math.ceil((scrollLeft + width) / tileSize()) + 1);

  for (let row = 0; row < rows; row++) {
    for (let col = first; col <= last; col++) {
      const image = tileImageFor(renderer.tiles, grid, grid.tiles[row * columns + col], col, row, 0);
      if (image) ctx.drawImage(image, col * TILE, row * TILE);
    }
  }
  // A secret room's wall shows as one here, so it can be told from brick.
  ctx.fillStyle = 'rgb(156 66 197 / 0.4)';
  for (let row = 0; row < rows; row++) {
    for (let col = first; col <= last; col++) if (draft.rows[row][col] === ':') ctx.fillRect(col * TILE, row * TILE, TILE, TILE);
  }

  const things = [];
  for (let row = 0; row < rows; row++) {
    for (let col = first; col <= last; col++) {
      const char = draft.rows[row][col];
      const known = kindOf(char);
      if (!known || known.kind === 'tile' || known.kind === 'empty') continue;
      things.push({ char, col, row, layer: LAYER[known.kind] });
    }
  }
  things.sort((a, b) => a.layer - b.layer);
  for (const { char, col, row } of things) {
    const look = placed(char, col, row);
    if (!look) continue;
    ctx.drawImage(look.image, Math.round(look.x), Math.round(look.y));
    if (look.arrow) drawArrow(ctx, look.x, look.y, look.arrow);
  }
  drawCast(ctx);
  if (state.showGrid) drawGrid(ctx, first, last, rows);
  drawSectionLines(ctx, rows);
  drawMarks(ctx);

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  drawColumnNumbers(ctx, first, last, scrollLeft);
  drawSectionNames(ctx, scrollLeft, width);
  if (state.showChars) drawChars(ctx, first, last, rows, scrollLeft, scrollTop);
}

// The characters placed from cast.js, faint: they stand by column outside
// the rows, and the editor leaves them where they are.
function drawCast(ctx) {
  const { draft } = state;
  if (!draft.cast.length || !state.check.level) return;
  ctx.globalAlpha = 0.5;
  for (const { type, col } of draft.cast) {
    const marker = state.check.level.markers.find((candidate) => candidate.col === col && (candidate.enemy === type || candidate.citizen === type));
    if (!marker) continue;
    const char = Object.keys(LABELS).find((candidate) => kindOf(candidate)?.type === type);
    const look = char && placed(char, marker.col, marker.row);
    if (look) ctx.drawImage(look.image, Math.round(look.x), Math.round(look.y));
  }
  ctx.globalAlpha = 1;
}

function drawGrid(ctx, first, last, rows) {
  const hair = 1 / (state.zoom * (window.devicePixelRatio || 1));
  ctx.lineWidth = hair;
  for (let col = first; col <= last + 1; col++) {
    ctx.strokeStyle = col % 10 === 0 ? 'rgb(16 8 25 / 0.45)' : 'rgb(16 8 25 / 0.12)';
    ctx.beginPath();
    ctx.moveTo(col * TILE, 0);
    ctx.lineTo(col * TILE, rows * TILE);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgb(16 8 25 / 0.12)';
  for (let row = 0; row <= rows; row++) {
    ctx.beginPath();
    ctx.moveTo(first * TILE, row * TILE);
    ctx.lineTo((last + 1) * TILE, row * TILE);
    ctx.stroke();
  }
}

function outline(ctx, rect, style, dashed = false) {
  ctx.save();
  ctx.lineWidth = 2 / state.zoom;
  ctx.strokeStyle = style;
  if (dashed) ctx.setLineDash([4 / state.zoom, 3 / state.zoom]);
  ctx.strokeRect(rect.col * TILE, rect.row * TILE, rect.width * TILE, rect.height * TILE);
  ctx.restore();
}

function drawClip(ctx, clip, col, row) {
  ctx.globalAlpha = 0.6;
  for (const cell of clip.cells) {
    const at = { col: cell.col + col, row: cell.row + row };
    const known = kindOf(cell.char);
    if (known?.kind === 'tile') {
      const image = renderer.tiles[cell.char]?.top?.[0];
      if (image) ctx.drawImage(image, at.col * TILE, at.row * TILE);
    } else if (known && known.kind !== 'empty') {
      const look = placed(cell.char, at.col, at.row);
      if (look) ctx.drawImage(look.image, Math.round(look.x), Math.round(look.y));
    }
  }
  ctx.globalAlpha = 1;
  outline(ctx, { col, row, width: clip.width, height: clip.height }, colour('hivis_3'), true);
}

// The hover, the selection, what is being dragged or pasted, and the
// places the checks point at.
function drawMarks(ctx) {
  const { hover, drag, selection } = state;
  for (const { cell } of [...state.check.errors, ...state.check.warnings]) {
    if (cell) outline(ctx, { col: cell.col, row: cell.row, width: 1, height: 1 }, colour('red_4'));
  }
  if (state.flash) outline(ctx, { ...state.flash, width: 1, height: 1 }, colour('white'));
  if (drag?.kind === 'rect' && hover) {
    const rect = rectBetween(drag.start, hover);
    ctx.fillStyle = drag.char === '.' ? 'rgb(239 107 74 / 0.35)' : 'rgb(214 239 0 / 0.3)';
    ctx.fillRect(rect.col * TILE, rect.row * TILE, rect.width * TILE, rect.height * TILE);
  }
  if (drag?.kind === 'select' && hover) outline(ctx, rectBetween(drag.start, hover), colour('white'), true);
  if (selection && drag?.kind !== 'move') outline(ctx, selection, colour('white'), true);
  if (drag?.kind === 'move' && hover) drawClip(ctx, drag.clip, selection.col + hover.col - drag.start.col, selection.row + hover.row - drag.start.row);
  if (state.pasting && hover && state.clip) drawClip(ctx, state.clip, hover.col, hover.row);
  if (hover && !drag && !state.pasting && state.tool !== 'select') {
    if (state.tool === 'brush' && state.char !== '.') {
      const look = placed(state.char, hover.col, hover.row);
      ctx.globalAlpha = 0.5;
      if (look) ctx.drawImage(look.image, Math.round(look.x), Math.round(look.y));
      else {
        const image = renderer.tiles[state.char]?.top?.[0];
        if (image) ctx.drawImage(image, hover.col * TILE, hover.row * TILE);
      }
      ctx.globalAlpha = 1;
    }
    outline(ctx, { col: hover.col, row: hover.row, width: 1, height: 1 }, colour('hivis_3'));
  }
}

// Where the sections the level file is written in begin, and the finish.
function sectionStarts() {
  const { sections, finished } = sectionsOf(state.draft);
  const starts = sections.map(({ name, col }) => ({ name, col }));
  if (finished) starts.push({ name: 'finish', col: sections.reduce((end, section) => section.col + section.width, 0) });
  return starts;
}

function drawSectionLines(ctx, rows) {
  ctx.save();
  ctx.lineWidth = 1 / state.zoom;
  ctx.strokeStyle = 'rgb(255 255 255 / 0.6)';
  ctx.setLineDash([6 / state.zoom, 4 / state.zoom]);
  for (const { col } of sectionStarts()) {
    if (col === 0) continue;
    ctx.beginPath();
    ctx.moveTo(col * TILE, 0);
    ctx.lineTo(col * TILE, rows * TILE);
    ctx.stroke();
  }
  ctx.restore();
}

// Each section's name under the column numbers, kept in view while any
// of the section is.
function drawSectionNames(ctx, scrollLeft, width) {
  ctx.font = '11px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const starts = sectionStarts();
  starts.forEach(({ name, col }, index) => {
    const end = (index + 1 < starts.length ? starts[index + 1].col : widthOf(state.draft)) * tileSize() - scrollLeft;
    const textWidth = ctx.measureText(name).width;
    const x = Math.min(Math.max(col * tileSize() - scrollLeft, 0), end - textWidth - 8) + 4;
    if (x + textWidth < 0 || x > width) return;
    ctx.fillStyle = 'rgb(16 8 25 / 0.7)';
    ctx.fillRect(x - 3, 14, textWidth + 6, 14);
    ctx.fillStyle = colour('hivis_3');
    ctx.fillText(name, x, 15);
  });
}

function drawColumnNumbers(ctx, first, last, scrollLeft) {
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  for (let col = Math.ceil(first / 10) * 10; col <= last; col += 10) {
    const x = col * tileSize() - scrollLeft + 2;
    ctx.fillStyle = 'rgb(16 8 25 / 0.6)';
    ctx.fillRect(x - 2, 0, ctx.measureText(String(col)).width + 4, 12);
    ctx.fillStyle = colour('white');
    ctx.fillText(String(col), x, 1);
  }
}

function drawChars(ctx, first, last, rows, scrollLeft, scrollTop) {
  const size = tileSize();
  ctx.font = `bold ${Math.max(8, Math.round(size * 0.45))}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let row = 0; row < rows; row++) {
    for (let col = first; col <= last; col++) {
      const char = state.draft.rows[row][col];
      if (char === '.') continue;
      const x = col * size - scrollLeft + size / 2;
      const y = row * size - scrollTop + size / 2;
      ctx.lineWidth = 3;
      ctx.strokeStyle = colour('ink');
      ctx.strokeText(char, x, y);
      ctx.fillStyle = colour('white');
      ctx.fillText(char, x, y);
    }
  }
}

// --- The palette -----------------------------------------------------------

function swatchImage(char) {
  const canvas = document.createElement('canvas');
  canvas.width = 30;
  canvas.height = 30;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  let image = null;
  if (char === '.') {
    ctx.strokeStyle = colour('red_3');
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, 8);
    ctx.lineTo(22, 22);
    ctx.moveTo(22, 8);
    ctx.lineTo(8, 22);
    ctx.stroke();
    return canvas;
  }
  if (kindOf(char).kind === 'tile') image = renderer.tiles[char]?.top?.[0];
  else image = placed(char, 0, 0)?.image;
  if (!image) return canvas;
  const largest = Math.max(image.width, image.height);
  const scale = largest <= 15 ? 2 : Math.min(1, 30 / largest);
  const width = image.width * scale;
  const height = image.height * scale;
  ctx.drawImage(image, (30 - width) / 2, (30 - height) / 2, width, height);
  if (char === ':') {
    ctx.fillStyle = 'rgb(156 66 197 / 0.4)';
    ctx.fillRect((30 - width) / 2, (30 - height) / 2, width, height);
  }
  return canvas;
}

function buildPalette() {
  const palette = element('palette');
  for (const group of GROUPS) {
    const heading = document.createElement('h2');
    heading.textContent = group.name;
    const swatches = document.createElement('div');
    swatches.className = 'swatches';
    for (const char of group.chars) {
      const button = document.createElement('button');
      button.className = 'swatch';
      button.dataset.char = char;
      button.title = `${LABELS[char]}  ( ${char} )`;
      button.draggable = true;
      button.append(swatchImage(char));
      const letter = document.createElement('span');
      letter.textContent = char;
      button.append(letter);
      button.addEventListener('click', () => chooseChar(char));
      button.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', char);
        event.dataTransfer.effectAllowed = 'copy';
        chooseChar(char);
      });
      swatches.append(button);
    }
    palette.append(heading, swatches);
  }
}

function chooseChar(char) {
  state.char = char;
  if (state.tool === 'select' || state.tool === 'pick') chooseTool('brush');
  for (const button of document.querySelectorAll('.swatch')) button.classList.toggle('on', button.dataset.char === char);
  showWhere();
}

function chooseTool(tool) {
  state.tool = tool;
  state.pasting = false;
  for (const button of document.querySelectorAll('#tools button')) button.classList.toggle('on', button.dataset.tool === tool);
  requestDraw();
}

// --- Changing the draft ----------------------------------------------------

// A finished change: an undo step, unless it is part of a stroke still
// being drawn (the stroke is one step when it ends).
function commit(draft) {
  if (draft === state.draft) return;
  if (!state.strokeBase) {
    state.undo.push(state.draft);
    if (state.undo.length > UNDO_LIMIT) state.undo.shift();
    state.redo = [];
  }
  setDraft(draft);
}

function beginStroke() {
  state.strokeBase = state.draft;
}

function endStroke() {
  const base = state.strokeBase;
  state.strokeBase = null;
  if (base && base !== state.draft) {
    state.undo.push(base);
    if (state.undo.length > UNDO_LIMIT) state.undo.shift();
    state.redo = [];
    updateButtons();
  }
}

function undo() {
  if (!state.undo.length) return;
  state.redo.push(state.draft);
  setDraft(state.undo.pop(), { fields: true });
}

function redo() {
  if (!state.redo.length) return;
  state.undo.push(state.draft);
  setDraft(state.redo.pop(), { fields: true });
}

function setDraft(draft, { fields = false } = {}) {
  const resized = !state.draft || widthOf(draft) !== widthOf(state.draft) || draft.rows.length !== state.draft.rows.length;
  state.draft = draft;
  state.grid = tileGrid(draft.rows);
  if (resized) sizeSpacer();
  if (fields) {
    fillFields();
    signsShown = null;
  }
  buildSigns();
  updateButtons();
  showWhere();
  scheduleCheck();
  saveDraft();
  requestDraw();
}

function updateButtons() {
  element('undo').disabled = state.undo.length === 0;
  element('redo').disabled = state.redo.length === 0;
}

function sizeSpacer() {
  spacer.style.width = `${widthOf(state.draft) * tileSize()}px`;
  spacer.style.height = `${state.draft.rows.length * tileSize()}px`;
}

// Opens a level: a new draft, nothing to undo.
function openDraft(draft, fileName) {
  state.undo = [];
  state.redo = [];
  state.selection = null;
  state.pasting = false;
  state.fileName = fileName;
  state.draft = null;
  setDraft(draft, { fields: true });
  scroller.scrollLeft = 0;
  updateButtons();
}

// --- Fields, signs, checks -------------------------------------------------

const FIELDS = ['metaId', 'metaName', 'metaPlace', 'metaStationName', 'metaTime', 'metaMusic'];

function fillFields() {
  for (const id of FIELDS) {
    const input = element(id);
    input.value = state.draft.meta[input.dataset.field] ?? '';
  }
}

function buildFields() {
  const music = element('metaMusic');
  for (const id of Object.keys(SONGS)) music.append(new Option(id, id));
  for (const id of FIELDS) {
    const input = element(id);
    input.addEventListener('input', () => {
      const value = input.type === 'number' ? Number(input.value) : input.value;
      state.draft = setMeta(state.draft, input.dataset.field, value);
      if (input.dataset.field === 'stationName') requestDraw();
      scheduleCheck();
      saveDraft();
    });
  }
}

let signsShown = null;

// The signs' texts, one box each in the order the level gives them; built
// again only when the signs themselves change, not as a text is typed.
function buildSigns() {
  const signs = signList(state.draft);
  const shown = signs.map(({ col, row }) => `${col},${row}`).join(' ');
  if (shown === signsShown) return;
  signsShown = shown;
  const list = element('signs');
  list.replaceChildren();
  if (!signs.length) {
    const none = document.createElement('p');
    none.className = 'hint';
    none.textContent = 'Inga skyltar. Sätt ut en med i.';
    list.append(none);
  }
  signs.forEach(({ col, row, text }, index) => {
    const box = document.createElement('div');
    box.className = 'sign';
    const jump = document.createElement('button');
    jump.textContent = `${index + 1}. Kolumn ${col}, rad ${row}`;
    jump.addEventListener('click', () => showCell({ col, row }));
    const area = document.createElement('textarea');
    area.value = text;
    area.addEventListener('input', () => {
      area.value = area.value.toUpperCase();
      state.draft = setSignText(state.draft, col, row, area.value);
      scheduleCheck();
      saveDraft();
    });
    box.append(jump, area);
    list.append(box);
  });
}

let checkTimer = null;

function scheduleCheck() {
  clearTimeout(checkTimer);
  checkTimer = setTimeout(runCheck, 120);
}

function runCheck() {
  const { draft } = state;
  state.check = checkDraft(draft, SONGS);
  const list = element('checks');
  list.replaceChildren();
  const add = (className, { text, cell }) => {
    const item = document.createElement('li');
    item.className = className;
    item.textContent = text;
    if (cell) {
      item.dataset.col = cell.col;
      item.title = 'Visa var';
      item.addEventListener('click', () => showCell(cell));
    }
    list.append(item);
  };
  for (const error of state.check.errors) add('error', error);
  for (const warning of state.check.warnings) add('warning', warning);
  if (!state.check.errors.length && !state.check.warnings.length) add('ok', { text: 'Allt i ordning: spelet kan läsa banan.' });
  element('stats').textContent = state.check.level
    ? levelReport({ ...toDefinition(draft), cast: draft.cast })
    : 'Rätta felen ovan först.';
  requestDraw();
}

// Scrolls the cell into the middle of the view and flashes it.
function showCell(cell) {
  scroller.scrollLeft = (cell.col + 0.5) * tileSize() - scroller.clientWidth / 2;
  scroller.scrollTop = (cell.row + 0.5) * tileSize() - scroller.clientHeight / 2;
  state.flash = cell;
  requestDraw();
  setTimeout(() => {
    state.flash = null;
    requestDraw();
  }, 1200);
}

// --- Saving between visits -------------------------------------------------

function saveDraft() {
  const { draft } = state;
  try {
    localStorage.setItem(DRAFT_KEY, storedDraft(draft, state.fileName));
  } catch (error) {
    console.warn('The editor could not keep its draft', { error });
  }
}

function restoredDraft() {
  try {
    return draftFromStored(localStorage.getItem(DRAFT_KEY));
  } catch (error) {
    console.warn('The editor\'s kept draft could not be read', { error });
    return null;
  }
}

// --- Opening and writing out -----------------------------------------------

function status(text) {
  element('status').textContent = text;
}

function dirty() {
  return state.undo.length > 0;
}

function leaveDraft() {
  return !dirty() || window.confirm('Byta bana? Ändringar som inte är exporterade försvinner.');
}

async function openGameLevel(id) {
  const level = findLevel(id);
  const fileName = `${constName(id)}.js`;
  let source = '';
  try {
    const response = await fetch(new URL(fileName, LEVELS_URL));
    if (response.ok) source = await response.text();
  } catch (error) {
    console.info('The level file could not be read; it is written out without its comments and sections', { error });
  }
  openDraft(draftOf(level, leadingComment(source), sectionsIn(source)), fileName);
  status(`Öppnade ${level.title ?? level.name}.`);
}

async function openFile(file) {
  if (!leaveDraft()) return;
  const source = await file.text();
  const url = URL.createObjectURL(new Blob([rewriteImports(source, LEVELS_URL)], { type: 'text/javascript' }));
  try {
    const definition = definitionIn(await import(url));
    const cast = findLevel(definition.id)?.cast ?? [];
    openDraft(draftOf({ ...definition, cast }, leadingComment(source), sectionsIn(source)), file.name);
    element('levelPick').value = '';
    status(`Öppnade ${file.name}.`);
  } catch (error) {
    status(`Kunde inte öppna ${file.name}: ${error.message}`);
    console.error('A level file could not be opened', { error });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function buildLevelPick() {
  const pick = element('levelPick');
  pick.append(new Option('Öppna en bana…', ''));
  const group = (label, levels) => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = label;
    for (const level of levels) optgroup.append(new Option(level.title ?? `${level.name} (${level.id})`, level.id));
    pick.append(optgroup);
  };
  group('Spelets banor', LEVELS);
  group('Provbanor', TRY_LEVELS);
  pick.addEventListener('change', async () => {
    if (!pick.value) return;
    if (!leaveDraft()) {
      pick.value = '';
      return;
    }
    await openGameLevel(pick.value);
  });
}

// Opens the game on the draft as it is now (kept in this browser's storage,
// which the game reads on ?bana=editor), unless the game couldn't read it.
function playTest() {
  clearTimeout(checkTimer);
  runCheck();
  if (state.check.errors.length) {
    status('Banan har fel: rätta dem innan den kan provspelas.');
    return;
  }
  saveDraft();
  window.open(PLAY_URL, PLAY_TAB);
  status('Spelet öppnades på utkastet i en egen flik.');
}

function exportLevel() {
  element('exportSource').value = levelSource(state.draft);
  state.fileName = `${constName(state.draft.meta.id)}.js`;
  element('downloadSource').textContent = `Ladda ned ${state.fileName}`;
  element('exportDialog').showModal();
  if (state.check.errors.length) status('Banan har fel: spelet kan inte läsa den förrän de är rättade.');
}

function downloadSource() {
  const url = URL.createObjectURL(new Blob([element('exportSource').value], { type: 'text/javascript' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = state.fileName;
  link.click();
  URL.revokeObjectURL(url);
  status(`${state.fileName} nedladdad.`);
}

async function copySource() {
  try {
    await navigator.clipboard.writeText(element('exportSource').value);
    status('Källkoden är kopierad.');
  } catch (error) {
    element('exportSource').select();
    status('Kunde inte kopiera; markera texten och kopiera själv.');
    console.warn('Copying the level\'s source failed', { error });
  }
}

// --- The mouse and the keys on the level -----------------------------------

function cellAt(event) {
  const box = scroller.getBoundingClientRect();
  const x = event.clientX - box.left;
  const y = event.clientY - box.top;
  if (x < 0 || y < 0 || x >= scroller.clientWidth || y >= scroller.clientHeight) return null;
  const col = Math.floor((x + scroller.scrollLeft) / tileSize());
  const row = Math.floor((y + scroller.scrollTop) / tileSize());
  if (col < 0 || row < 0 || col >= widthOf(state.draft) || row >= state.draft.rows.length) return null;
  return { col, row };
}

function inside(rect, cell) {
  return rect && cell.col >= rect.col && cell.col < rect.col + rect.width && cell.row >= rect.row && cell.row < rect.row + rect.height;
}

// The cells on a line from one to another, so a fast stroke leaves no gaps.
function cellsBetween(from, to) {
  const cells = [];
  const steps = Math.max(Math.abs(to.col - from.col), Math.abs(to.row - from.row));
  for (let step = 0; step <= steps; step++) {
    const share = steps === 0 ? 0 : step / steps;
    cells.push({ col: Math.round(from.col + (to.col - from.col) * share), row: Math.round(from.row + (to.row - from.row) * share) });
  }
  return cells;
}

function pick(cell) {
  chooseChar(charAt(state.draft, cell.col, cell.row));
  chooseTool('brush');
}

function onMouseDown(event) {
  const cell = cellAt(event);
  if (!cell || (event.button !== 0 && event.button !== 2)) return;
  event.preventDefault();
  const erase = event.button === 2;
  if (event.altKey || state.tool === 'pick') {
    pick(cell);
    return;
  }
  if (state.pasting) {
    if (erase) {
      state.pasting = false;
    } else {
      commit(pasteClip(state.draft, state.clip, cell.col, cell.row));
      state.selection = { col: cell.col, row: cell.row, width: state.clip.width, height: state.clip.height };
      state.pasting = event.shiftKey;
    }
    requestDraw();
    return;
  }
  if (state.tool === 'brush') {
    const char = erase ? '.' : state.char;
    beginStroke();
    state.drag = { kind: 'paint', char, last: cell };
    commit(writeCells(state.draft, [{ ...cell, char }]));
  } else if (state.tool === 'rect') {
    state.drag = { kind: 'rect', char: erase ? '.' : state.char, start: cell };
  } else if (state.tool === 'select') {
    if (!erase && inside(state.selection, cell)) state.drag = { kind: 'move', start: cell, clip: copyRect(state.draft, state.selection) };
    else state.drag = { kind: 'select', start: cell };
  }
  requestDraw();
}

function onMouseMove(event) {
  const cell = cellAt(event);
  const before = state.hover;
  state.hover = cell;
  if (cell) state.lastCol = cell.col;
  const { drag } = state;
  if (drag?.kind === 'paint' && cell) {
    commit(writeCells(state.draft, cellsBetween(drag.last, cell).map((at) => ({ ...at, char: drag.char }))));
    drag.last = cell;
  }
  if (before?.col !== cell?.col || before?.row !== cell?.row) {
    showWhere();
    requestDraw();
  }
}

function onMouseUp() {
  const { drag, hover } = state;
  if (!drag) return;
  state.drag = null;
  if (drag.kind === 'paint') endStroke();
  else if (drag.kind === 'rect' && hover) commit(fillRect(state.draft, rectBetween(drag.start, hover), drag.char));
  else if (drag.kind === 'select') state.selection = hover ? rectBetween(drag.start, hover) : null;
  else if (drag.kind === 'move' && hover) {
    const dCol = hover.col - drag.start.col;
    const dRow = hover.row - drag.start.row;
    if (dCol || dRow) {
      commit(moveRect(state.draft, state.selection, dCol, dRow));
      state.selection = { ...state.selection, col: state.selection.col + dCol, row: state.selection.row + dRow };
    }
  }
  requestDraw();
}

function showWhere() {
  const { hover, draft } = state;
  if (!draft) return;
  const brush = `Pensel: ${LABELS[state.char]} (${state.char})`;
  const size = `Bredd ${widthOf(draft)} rutor`;
  if (!hover) {
    element('where').textContent = `${brush} · ${size}`;
    return;
  }
  const char = charAt(draft, hover.col, hover.row);
  const section = sectionStarts().findLast((start) => start.col <= hover.col);
  element('where').textContent = `Kolumn ${hover.col}, rad ${hover.row} (${section?.name ?? '–'}): ${LABELS[char] ?? 'okänt tecken'} (${char}) · ${brush} · ${size}`;
}

function typing(event) {
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);
}

function onKey(event) {
  if (typing(event) || element('exportDialog').open) return;
  const key = event.key.toLowerCase();
  const command = event.ctrlKey || event.metaKey;
  if (command && key === 'z' && !event.shiftKey) undo();
  else if (command && (key === 'y' || (key === 'z' && event.shiftKey))) redo();
  else if (command && (key === 'c' || key === 'x') && state.selection) {
    state.clip = copyRect(state.draft, state.selection);
    if (key === 'x') commit(fillRect(state.draft, state.selection, '.'));
    status(key === 'x' ? 'Urklippt.' : 'Kopierat.');
  } else if (command && key === 'v' && state.clip) {
    state.pasting = true;
    status('Klicka där det övre vänstra hörnet ska stå (Shift-klick för fler, Esc avbryter).');
  } else if (!command && (key === 'delete' || key === 'backspace') && state.selection) commit(fillRect(state.draft, state.selection, '.'));
  else if (key === 'escape') {
    state.pasting = false;
    state.selection = null;
  } else if (!command && !event.altKey && { b: 'brush', r: 'rect', m: 'select', i: 'pick' }[key]) chooseTool({ b: 'brush', r: 'rect', m: 'select', i: 'pick' }[key]);
  else return;
  event.preventDefault();
  requestDraw();
}

// The column columns are put in before or taken from: the selection's
// first, or the one the mouse was last over.
function columnsAt() {
  return state.selection ? state.selection.col : state.lastCol;
}

function changeColumns(insert) {
  const count = Math.max(1, Number(element('columnCount').value) || 1);
  const at = columnsAt();
  if (insert) commit(insertColumns(state.draft, at, count));
  else commit(deleteColumns(state.draft, at, state.selection ? state.selection.width : count));
  state.selection = null;
  status(`${insert ? 'Infogade' : 'Tog bort'} kolumner vid ${at}.${state.draft.cast.length ? ' Figurerna i cast.js står kvar i sina kolumner.' : ''}`);
}

function setZoom(zoom) {
  const middle = (scroller.scrollLeft + scroller.clientWidth / 2) / tileSize();
  state.zoom = zoom;
  sizeSpacer();
  scroller.scrollLeft = middle * tileSize() - scroller.clientWidth / 2;
  requestDraw();
}

// --- Wiring ----------------------------------------------------------------

function wire() {
  scroller.addEventListener('mousedown', onMouseDown);
  scroller.addEventListener('contextmenu', (event) => event.preventDefault());
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  scroller.addEventListener('mouseleave', () => {
    if (state.drag) return;
    state.hover = null;
    showWhere();
    requestDraw();
  });
  scroller.addEventListener('scroll', requestDraw);
  new ResizeObserver(requestDraw).observe(scroller);
  window.addEventListener('keydown', onKey);

  scroller.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    state.hover = cellAt(event);
    requestDraw();
  });
  scroller.addEventListener('drop', (event) => {
    event.preventDefault();
    const [file] = event.dataTransfer.files;
    if (file) {
      openFile(file);
      return;
    }
    const char = event.dataTransfer.getData('text/plain');
    const cell = cellAt(event);
    if (cell && LABELS[char]) {
      chooseChar(char);
      commit(writeCells(state.draft, [{ ...cell, char }]));
    }
  });

  for (const button of document.querySelectorAll('#tools button')) button.addEventListener('click', () => chooseTool(button.dataset.tool));
  element('undo').addEventListener('click', undo);
  element('redo').addEventListener('click', redo);
  element('insertColumns').addEventListener('click', () => changeColumns(true));
  element('deleteColumns').addEventListener('click', () => changeColumns(false));
  element('zoom').addEventListener('change', (event) => setZoom(Number(event.target.value)));
  element('showGrid').addEventListener('change', (event) => {
    state.showGrid = event.target.checked;
    requestDraw();
  });
  element('showChars').addEventListener('change', (event) => {
    state.showChars = event.target.checked;
    requestDraw();
  });
  element('newLevel').addEventListener('click', () => {
    if (!leaveDraft()) return;
    openDraft(newDraft(), 'ny-bana.js');
    element('levelPick').value = '';
    status('En ny bana: en start och finishen. Byt id och namn till höger.');
  });
  element('openFile').addEventListener('click', () => element('fileInput').click());
  element('fileInput').addEventListener('change', (event) => {
    const [file] = event.target.files;
    if (file) openFile(file);
    event.target.value = '';
  });
  element('playTest').addEventListener('click', playTest);
  element('export').addEventListener('click', exportLevel);
  element('copySource').addEventListener('click', copySource);
  element('downloadSource').addEventListener('click', downloadSource);
  element('closeExport').addEventListener('click', () => element('exportDialog').close());
}

buildPalette();
buildFields();
buildLevelPick();
wire();
chooseTool('brush');
chooseChar('#');
const kept = restoredDraft();
if (kept) {
  openDraft(kept.draft, kept.fileName);
  status('Fortsätter med utkastet från förra gången.');
} else {
  await openGameLevel(LEVELS[0].id);
}
document.body.dataset.ready = 'true';
