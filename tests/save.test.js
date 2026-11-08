import test from 'node:test';
import assert from 'node:assert/strict';
import { createHighScores } from '../src/highscores.js';
import { DEFAULT_SETTINGS } from '../src/settings.js';
import { fakeStorage } from './helpers.js';
import {
  BROKEN_KEY,
  MAX_BROKEN,
  CONSENT_KEY,
  loadSave,
  migrate,
  MIGRATIONS,
  readConsent,
  SAVE_KEY,
  SAVE_VERSION,
  validate,
  writeConsent,
  writeSave,
} from '../src/save.js';

test('consent: unasked until answered, and only yes or no counts as an answer', () => {
  const storage = fakeStorage();
  assert.equal(readConsent(storage), null);
  writeConsent(storage, false);
  assert.equal(readConsent(storage), 'no');
  assert.deepEqual([...storage.map.keys()], [CONSENT_KEY], 'a no stores only itself');
  writeConsent(storage, true);
  assert.equal(readConsent(storage), 'yes');
  assert.equal(readConsent(fakeStorage({ [CONSENT_KEY]: 'maybe' })), null);
});

test('the high scores and the sound settings go into the save and come back out', () => {
  const storage = fakeStorage();
  const highScores = createHighScores();
  highScores[3] = { name: 'BLE', points: 23456, rank: 'Polisinspektör' };
  const settings = { music: 3, effects: 9, muted: true };
  writeSave(storage, { highScores, settings });
  assert.equal(JSON.parse(storage.getItem(SAVE_KEY)).version, SAVE_VERSION);
  assert.deepEqual(loadSave(storage), { data: { highScores, settings }, problem: null });
});

test('a version 1 save, from before the sound settings, loads with the default settings', () => {
  const highScores = createHighScores();
  const storage = fakeStorage({ [SAVE_KEY]: JSON.stringify({ version: 1, highScores }) });
  assert.deepEqual(loadSave(storage), { data: { highScores, settings: DEFAULT_SETTINGS }, problem: null });
});

test('a version 2 save, from before the tags, loads with each name cut to a tag', () => {
  const highScores = [
    { name: 'BLENKE H', points: 23456, rank: 'Polisinspektör' },
    { name: 'NOLLVISION', points: 5000, rank: 'Kriminalinspektör' },
    { name: 'JO', points: 1000, rank: 'Polisassistent' },
  ];
  const settings = { music: 4, effects: 6, muted: false };
  const storage = fakeStorage({ [SAVE_KEY]: JSON.stringify({ version: 2, highScores, settings }) });
  const { data, problem } = loadSave(storage);
  assert.equal(problem, null);
  assert.deepEqual(data.highScores.map((entry) => entry.name), ['BLE', 'NOL', 'JO']);
  assert.deepEqual(data.highScores.map((entry) => entry.points), [23456, 5000, 1000]);
  assert.deepEqual(data.settings, settings);
});

test('a version 1 save comes all the way up: tags and the default settings', () => {
  const storage = fakeStorage({ [SAVE_KEY]: JSON.stringify({ version: 1, highScores: [{ name: 'SVENSSON', points: 5000, rank: 'Kriminalinspektör' }] }) });
  assert.deepEqual(loadSave(storage).data, { highScores: [{ name: 'SVE', points: 5000, rank: 'Kriminalinspektör' }], settings: DEFAULT_SETTINGS });
});

test('no save is no problem', () => {
  assert.deepEqual(loadSave(fakeStorage()), { data: null, problem: null });
});

test('a save that fails to load is kept under its own key, and a second one beside it', () => {
  const storage = fakeStorage({ [SAVE_KEY]: '{not json' });
  const first = loadSave(storage);
  assert.equal(first.data, null);
  assert.equal(first.problem.kept, BROKEN_KEY);
  assert.equal(storage.getItem(BROKEN_KEY), '{not json');
  storage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, highScores: 'lots' }));
  const second = loadSave(storage);
  assert.equal(second.problem.kept, `${BROKEN_KEY}-2`);
  assert.match(second.problem.message, /not a list/);
  assert.equal(storage.getItem(BROKEN_KEY), '{not json', 'the first is still there');
});

test('a save is checked through: names, points, ranks, order, length and settings', () => {
  const good = { version: SAVE_VERSION, highScores: createHighScores(), settings: DEFAULT_SETTINGS };
  assert.doesNotThrow(() => validate(good));
  const broken = [
    null,
    { version: SAVE_VERSION },
    { ...good, highScores: [...good.highScores, good.highScores[9]] },
    { ...good, highScores: [{ name: '<b>', points: 10, rank: 'Polisaspirant' }] },
    { ...good, highScores: [{ name: 'A', points: -1, rank: 'Polisaspirant' }] },
    { ...good, highScores: [{ name: 'A', points: 1.5, rank: 'Polisaspirant' }] },
    { ...good, highScores: [{ name: 'A', points: 10, rank: 'Kung' }] },
    { ...good, highScores: [...good.highScores].reverse() },
    { ...good, settings: undefined },
    { ...good, settings: { ...DEFAULT_SETTINGS, music: 11 } },
    { ...good, settings: { ...DEFAULT_SETTINGS, effects: 2.5 } },
    { ...good, settings: { ...DEFAULT_SETTINGS, muted: 'yes' } },
  ];
  for (const save of broken) assert.throws(() => validate(save), /not valid/, JSON.stringify(save));
});

test('only what a save should hold is kept from it', () => {
  const save = {
    version: SAVE_VERSION,
    highScores: [{ name: 'A', points: 10, rank: 'Polisaspirant', extra: 'x' }],
    settings: { ...DEFAULT_SETTINGS, loud: true },
  };
  assert.deepEqual(validate(save), { highScores: [{ name: 'A', points: 10, rank: 'Polisaspirant' }], settings: DEFAULT_SETTINGS });
});

test('migration runs each step from an old version up to the current', () => {
  // The chain as it will be once the save has changed twice: version 1
  // named the list "scores", version 2 had no ranks.
  const migrations = {
    1: (save) => ({ version: 2, list: save.scores }),
    2: (save) => ({ version: 3, highScores: save.list.map((entry) => ({ ...entry, rank: 'Polisaspirant' })) }),
  };
  const old = { version: 1, scores: [{ name: 'A', points: 10 }] };
  assert.deepEqual(migrate(old, migrations, 3), {
    version: 3,
    highScores: [{ name: 'A', points: 10, rank: 'Polisaspirant' }],
  });
  assert.throws(() => migrate({ version: 4 }, migrations, 3), /No way from save version 4/);
  assert.throws(() => migrate({ version: 'x' }, migrations, 3), /No way/);
});

test('the game\'s own chain reaches the current version from every older one', () => {
  for (let version = 1; version < SAVE_VERSION; version++) {
    assert.equal(typeof MIGRATIONS[version], 'function', `a step from version ${version}`);
  }
  const current = { version: SAVE_VERSION, highScores: [], settings: DEFAULT_SETTINGS };
  assert.deepEqual(migrate(current), current);
});

test('the broken saves kept stop at a limit, even when the storage answers for every key', () => {
  const storage = { ...fakeStorage(), getItem: () => 'x', setItem: () => {} };
  assert.equal(loadSave(storage).problem.kept, `${BROKEN_KEY}-${MAX_BROKEN}`);
});
