import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseLevel } from '../src/level.js';
import { findLevel, LEVELS, TRY_LEVELS } from '../src/levels/index.js';
import { SONGS } from '../src/music/index.js';
import {
  charAt, checkDraft, constName, copyRect, definitionIn, deleteColumns, DRAFT_KEY, draftFromStored, draftOf, fillRect, GROUPS,
  insertColumns, kindOf, LABELS, leadingComment, levelChars, levelSource, moveRect, newDraft, pasteClip, rectBetween,
  rewriteImports, sectionsIn, sectionsOf, setSignText, signList, splitFinish, storedDraft, tileGrid, toDefinition, widthOf, writeCells,
} from '../tools/editor/model.js';
import { editorLevel } from '../tools/editor/play.js';
import { createWorld } from '../src/world.js';
import { levelReport } from '../tools/levelstats.js';

const LEVELS_DIR = pathToFileURL(`${process.cwd()}/src/levels/`);

// A level file's source imported as the game would import it.
async function importSource(source) {
  const absolute = rewriteImports(source, LEVELS_DIR);
  return definitionIn(await import(`data:text/javascript,${encodeURIComponent(absolute)}`));
}

test('every character a level can be written with has a name and a place in the palette, and is known', () => {
  const inPalette = GROUPS.flatMap((group) => [...group.chars]);
  assert.equal(new Set(inPalette).size, inPalette.length, 'no character twice');
  for (const char of levelChars()) {
    assert.ok(LABELS[char], `'${char}' has a name`);
    assert.ok(inPalette.includes(char), `'${char}' is in the palette`);
    assert.ok(kindOf(char), `'${char}' is known`);
  }
  assert.deepEqual([...inPalette].sort(), [...levelChars()].sort());
  assert.equal(kindOf('£'), null);
});

test('every level written out by the editor reads back as the same level', async () => {
  for (const level of [...LEVELS, ...TRY_LEVELS]) {
    const draft = draftOf(level);
    const read = await importSource(levelSource(draft));
    const original = toDefinition(draftOf(level));
    assert.deepEqual(read, original, level.id);
    assert.deepEqual(parseLevel({ ...read, cast: level.cast }).markers, parseLevel(level).markers, level.id);
  }
});

test('a written-out level ends with the finish and keeps its comment', async () => {
  const comment = '// Krigslida, in 1980.\n// Two lines.';
  const source = levelSource({ ...draftOf(findLevel('krigslida')), comment });
  assert.ok(source.startsWith(`${comment}\nimport { joinSections } from '../level.js';\nimport { finish } from './finish.js';`));
  assert.match(source, /rows: joinSections\(section1, .*finish\(20\)\),/);
  assert.match(source, /^export const krigslida = \{$/m);
  assert.equal(leadingComment(`${comment}\nimport x from 'y';\n// later`), comment);
  const unfinished = draftOf({ id: 'kort', name: 'Kort', music: 'suburbs', rows: ['@.', '##'] });
  assert.equal(splitFinish(unfinished.rows).finished, false);
  assert.doesNotMatch(levelSource(unfinished), /finish/);
});

// A level file of the game's, opened in the editor as the page opens it.
async function openedFile(name) {
  const source = readFileSync(new URL(`${name}.js`, LEVELS_DIR), 'utf8');
  const definition = definitionIn(await import(new URL(`${name}.js`, LEVELS_DIR)));
  return { source, draft: draftOf(definition, leadingComment(source), sectionsIn(source)) };
}

test('a level file opened and written out unchanged is the same file, its sections and their comments kept', async () => {
  for (const name of ['tungelsta', 'krigslida', 'vasterhaninge', 'jordbro', 'handen', 'skogas', 'trangsund', 'villastad', 'forort1', 'testbana']) {
    const { source, draft } = await openedFile(name);
    assert.ok(draft.sections.length > 1, name);
    assert.equal(levelSource(draft), source, name);
  }
  const { draft } = await openedFile('krigslida');
  assert.deepEqual(draft.sections.map((section) => section.name), ['halt', 'hill', 'church', 'fields', 'farm', 'front']);
  assert.match(draft.sections[0].comment, /^\/\/ Krigslida's new halt of 1980/);
});

test('a level whose rows aren\'t plain sections is written in sections of its own', async () => {
  const { draft } = await openedFile('figurer');
  assert.deepEqual(draft.sections, []);
  const { sections } = sectionsOf(draft);
  assert.deepEqual(sections.map((section) => section.name), ['section1', 'section2', 'section3', 'section4']);
  assert.equal(sections[0].comment, '// Columns 0–79.');
  assert.deepEqual(sectionsIn("export const x = { rows: joinSections(a, stretch(4)) };\nconst a = [\n  '..',\n];"), []);
  assert.deepEqual(draftOf(findLevel('krigslida'), '', [{ name: 'halt', comment: '', width: 3 }]).sections, [], 'sections that don\'t make up the rows');
});

test('columns put in or taken out widen or narrow their section, and the file still reads back', async () => {
  const { draft } = await openedFile('krigslida');
  const widths = (changed) => changed.sections.map((section) => section.width);
  // halt is columns 0–47, hill 48–103.
  assert.deepEqual(widths(insertColumns(draft, 50, 4)), [48, 60, 72, 56, 64, 40]);
  assert.deepEqual(widths(insertColumns(draft, 48, 1)), [48, 57, 72, 56, 64, 40], 'at a boundary, the section to the right');
  assert.deepEqual(widths(deleteColumns(draft, 40, 20)), [40, 44, 72, 56, 64, 40]);
  assert.deepEqual(widths(deleteColumns(draft, 40, 70)), [40, 66, 56, 64, 40], 'a section wholly gone goes');
  const atEnd = insertColumns(draft, 336, 5);
  assert.equal(sectionsOf(atEnd).sections.at(-1).width, 45, 'columns before the finish widen the last section');
  const changed = deleteColumns(insertColumns(draft, 50, 4), 120, 3);
  const read = await importSource(levelSource(changed));
  assert.deepEqual(read, toDefinition(changed));
  const own = draftOf(read, '', sectionsIn(levelSource(changed)));
  assert.deepEqual(own.sections, changed.sections);
});

test('a section of the editor\'s own is commented with the columns it holds, wherever it ends up', async () => {
  const draft = newDraft(100);
  const written = levelSource(draft);
  assert.match(written, /\/\/ Columns 0–79\.\nconst section1 = \[/);
  assert.match(written, /\/\/ Columns 80–99\.\nconst section2 = \[/);
  const reopened = draftOf(draft, '', sectionsIn(written));
  assert.match(levelSource(insertColumns(reopened, 0, 2)), /\/\/ Columns 0–81\.\nconst section1 = \[\n[^]*\/\/ Columns 82–101\.\nconst section2 = \[/);
});

test('a section named as the level is exported is renamed in the file', async () => {
  const draft = draftOf(findLevel('krigslida'), '', [{ name: 'krigslida', comment: '', width: 336 }]);
  const source = levelSource(draft);
  assert.match(source, /^const krigslida2 = \[$/m);
  assert.deepEqual(await importSource(source), toDefinition(draft));
});

test('a sign\'s text is written escaped and read back whole', async () => {
  let draft = newDraft(10);
  draft = writeCells(draft, [{ col: 5, row: 16, char: 'i' }]);
  draft = setSignText(draft, 5, 16, "DET ÄR 'PROVEN' \\ OCKSÅ.");
  const read = await importSource(levelSource(draft));
  assert.deepEqual(read.signs, ["DET ÄR 'PROVEN' \\ OCKSÅ."]);
});

test('a level\'s id becomes the name it is exported under', () => {
  assert.equal(constName('forort-1'), 'forort1');
  assert.equal(constName('vasterhaninge'), 'vasterhaninge');
  assert.equal(constName('min-nya-bana'), 'minnyabana');
  assert.equal(constName('1-a'), 'bana1a');
});

test('a new level parses: a start on a lawn, then the finish', () => {
  const draft = newDraft();
  const { errors, warnings, level } = checkDraft(draft, SONGS);
  assert.deepEqual(errors, []);
  assert.ok(level);
  assert.ok(warnings.some((warning) => warning.text.includes('checkpoint')), 'no checkpoint yet');
  assert.equal(splitFinish(draft.rows).finished, true);
});

test('painting, filling and moving change only their cells, and signs keep their texts', () => {
  let draft = newDraft(20);
  draft = writeCells(draft, [{ col: 6, row: 16, char: 'i' }]);
  draft = setSignText(draft, 6, 16, 'HEJ');
  draft = fillRect(draft, rectBetween({ col: 10, row: 12 }, { col: 8, row: 11 }), 'B');
  assert.equal(charAt(draft, 8, 11), 'B');
  assert.equal(charAt(draft, 10, 12), 'B');
  assert.equal(charAt(draft, 11, 12), '.');
  draft = moveRect(draft, { col: 6, row: 16, width: 1, height: 1 }, 2, -1);
  assert.equal(charAt(draft, 6, 16), '.');
  assert.deepEqual(signList(draft), [{ col: 8, row: 15, text: 'HEJ' }]);
  const clip = copyRect(draft, { col: 8, row: 15, width: 1, height: 1 });
  draft = pasteClip(draft, clip, 12, 15);
  assert.deepEqual(signList(draft).map((sign) => sign.text), ['HEJ', 'HEJ']);
  draft = writeCells(draft, [{ col: 8, row: 15, char: 'u' }]);
  assert.deepEqual(signList(draft), [{ col: 12, row: 15, text: 'HEJ' }], 'a sign painted over loses its text');
});

test('columns put in carry the ground on, and signs move along with what is right of them', () => {
  let draft = newDraft(20);
  draft = writeCells(draft, [{ col: 10, row: 16, char: 'i' }, { col: 4, row: 16, char: 'u' }]);
  draft = setSignText(draft, 10, 16, 'SKYLT');
  const width = widthOf(draft);
  draft = insertColumns(draft, 5, 3);
  assert.equal(widthOf(draft), width + 3);
  assert.equal(charAt(draft, 5, 17), '#', 'the lawn runs on');
  assert.equal(charAt(draft, 5, 16), '.', 'what stood in the column is not copied');
  assert.deepEqual(signList(draft), [{ col: 13, row: 16, text: 'SKYLT' }]);
  draft = deleteColumns(draft, 12, 2);
  assert.deepEqual(signList(draft), [], 'the sign went with its column');
  assert.equal(widthOf(draft), width + 1);
  assert.equal(widthOf(deleteColumns(draft, 0, 10_000)), 1, 'one column is always left');
});

test('the tiles drawn under things are the parser\'s', () => {
  const rows = ['B;u;B', '#####'];
  const grid = tileGrid(rows);
  assert.deepEqual(grid.tiles, parseLevel({ id: 'x', rows: ['B;@;B', '#####'] }).tiles);
  assert.equal(grid.width, 5);
});

test('what the game would say: errors that stop it, warnings for what the game\'s levels need', () => {
  const broken = draftOf({ id: 'Trasig Bana', name: '', music: 'ingen', time: 0, rows: ['....', '####'] });
  const { errors, level } = checkDraft(broken, SONGS);
  assert.equal(level, null);
  assert.equal(errors.length, 5, errors.map((error) => error.text).join('\n'));
  const unknown = checkDraft(writeCells(newDraft(), [{ col: 3, row: 5, char: '£' }]), SONGS);
  assert.deepEqual(unknown.errors[0].cell, { col: 3, row: 5 });
  for (const level of LEVELS) {
    const result = checkDraft(draftOf(level), SONGS);
    assert.deepEqual([...result.errors, ...result.warnings], [], level.id);
  }
});

test('the level\'s numbers are those the balance script prints', () => {
  const report = levelReport(toDefinition(draftOf(findLevel('krigslida'))));
  assert.match(report, /\(krigslida\): \d+×20 tiles/);
  assert.match(report, /Samples: \d+ in all\./);
});

// A browser's storage holding these keys and texts.
function storageWith(entries = {}) {
  const kept = new Map(Object.entries(entries));
  return { getItem: (key) => kept.get(key) ?? null };
}

test("a kept draft reads back as it was, and what isn't one reads as none", async () => {
  const { draft } = await openedFile('krigslida');
  const kept = draftFromStored(storedDraft(draft, 'krigslida.js'));
  assert.deepEqual(kept, { draft, fileName: 'krigslida.js' });
  for (const sections of [[{ name: 'halt', comment: 'x = 1;', width: 48 }], [{ name: '1a', comment: '', width: 48 }], [{ name: 'a', comment: '', width: 0 }], 'halt']) {
    const stored = JSON.parse(storedDraft(draft, 'krigslida.js'));
    assert.deepEqual(draftFromStored(JSON.stringify({ ...stored, sections })).draft.sections, [], JSON.stringify(sections));
  }
  assert.equal(draftFromStored(null), null);
  for (const text of ['{}', '[]', 'null', '{"rows":["..","..."],"meta":{},"signs":[]}', '{"rows":[".."],"meta":null,"signs":[]}']) {
    assert.equal(draftFromStored(text), null, text);
  }
  assert.throws(() => draftFromStored('{not json'), SyntaxError);
});

test("play-testing: the editor's draft is a level the game plays, with its cast", () => {
  const draft = draftOf(findLevel('figurer'));
  const level = editorLevel(storageWith({ [DRAFT_KEY]: storedDraft(draft, 'figurer.js') }));
  assert.deepEqual(level, { ...toDefinition(draft), cast: findLevel('figurer').cast });
  assert.ok(level.cast.length > 0, 'the characters\' level has a cast to carry');
  assert.doesNotThrow(() => createWorld(level));
});

test("play-testing fails, saying why, without a draft or with one the game can't read", () => {
  assert.throws(() => editorLevel(storageWith()), /no draft/);
  const broken = writeCells(newDraft(), [{ col: 3, row: 5, char: '£' }]);
  assert.throws(() => editorLevel(storageWith({ [DRAFT_KEY]: storedDraft(broken, 'ny-bana.js') })), /errors: Spelet: /);
});
