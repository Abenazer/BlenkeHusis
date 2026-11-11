import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { parseLevel } from '../src/level.js';
import { findLevel, LEVELS, TRY_LEVELS } from '../src/levels/index.js';
import { SONGS } from '../src/music/index.js';
import {
  charAt, checkDraft, constName, copyRect, definitionIn, deleteColumns, DRAFT_KEY, draftFromStored, draftOf, fillRect, GROUPS,
  insertColumns, kindOf, LABELS, leadingComment, levelChars, levelSource, moveRect, newDraft, pasteClip, rectBetween,
  rewriteImports, setSignText, signList, splitFinish, storedDraft, tileGrid, toDefinition, widthOf, writeCells,
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

test("a kept draft reads back as it was, and what isn't one reads as none", () => {
  const draft = draftOf(findLevel('krigslida'), '// Krigslida.');
  const kept = draftFromStored(storedDraft(draft, 'krigslida.js'));
  assert.deepEqual(kept, { draft, fileName: 'krigslida.js' });
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
