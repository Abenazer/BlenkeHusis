// What the game keeps between visits: the high scores and the sound
// settings, and the player's answer to whether anything may be kept at
// all (asked when a score first makes the list, never for the settings
// alone). Pure: the storage is
// passed in (the page passes localStorage, a test a stand-in), with
// localStorage's getItem, setItem and removeItem.
//
// The rules (AGENTS.md): nothing is read or written until the player has
// said yes, and a "no" stores only itself, so it isn't asked again. A save
// that can't be read is copied to a key of its own before anything new is
// written. The save carries its version; each change to its shape bumps
// SAVE_VERSION and adds a step to MIGRATIONS from the version before.
import { MAX_ENTRIES, NAME_LENGTH } from './highscores.js';
import { RANKS } from './score.js';
import { DEFAULT_SETTINGS, isSettings } from './settings.js';

export const CONSENT_KEY = 'blenkehusis.consent';
export const SAVE_KEY = 'blenkehusis.save';
export const BROKEN_KEY = 'blenkehusis.save.broken';
export const SAVE_VERSION = 2;

// From each version to the next: MIGRATIONS[n] takes a save of version n
// and returns one of version n + 1.
export const MIGRATIONS = {
  // Version 2 keeps the sound settings too; a version 1 save had none,
  // so it gets the defaults.
  1: (save) => ({ ...save, version: 2, settings: { ...DEFAULT_SETTINGS } }),
};

// 'yes', 'no', or null when the player hasn't been asked (or the stored
// answer is something this game never wrote).
export function readConsent(storage) {
  const answer = storage.getItem(CONSENT_KEY);
  return answer === 'yes' || answer === 'no' ? answer : null;
}

export function writeConsent(storage, allowed) {
  storage.setItem(CONSENT_KEY, allowed ? 'yes' : 'no');
}

// Brings a save up to the current version one step at a time. Fails on a
// version it has no way from, a newer game's save included.
export function migrate(save, migrations = MIGRATIONS, target = SAVE_VERSION) {
  let current = save;
  while (current.version !== target) {
    const step = Number.isInteger(current.version) && current.version < target ? migrations[current.version] : null;
    if (!step) throw new Error(`No way from save version ${current.version} to ${target}`);
    current = step(current);
  }
  return current;
}

function fail(problem) {
  throw new Error(`The save is not valid: ${problem}`);
}

const NAME = new RegExp(`^[A-ZÅÄÖ0-9 ]{1,${NAME_LENGTH}}$`);

// A save of the current version, checked through: it is external input.
export function validate(save) {
  if (typeof save !== 'object' || save === null) fail('not an object');
  if (save.version !== SAVE_VERSION) fail(`version ${save.version}`);
  const { highScores, settings } = save;
  if (!Array.isArray(highScores) || highScores.length > MAX_ENTRIES) fail('the high scores are not a list of at most ten');
  highScores.forEach((entry, i) => {
    if (typeof entry !== 'object' || entry === null) fail(`entry ${i} is not an object`);
    if (typeof entry.name !== 'string' || !NAME.test(entry.name)) fail(`entry ${i} has no valid name`);
    if (!Number.isSafeInteger(entry.points) || entry.points <= 0) fail(`entry ${i} has no valid points`);
    if (!RANKS.some((rank) => rank.title === entry.rank)) fail(`entry ${i} has no known rank`);
    if (i > 0 && entry.points > highScores[i - 1].points) fail(`entry ${i} is out of order`);
  });
  if (!isSettings(settings)) fail('the sound settings are not valid');
  const { music, effects, muted } = settings;
  return { highScores: highScores.map(({ name, points, rank }) => ({ name, points, rank })), settings: { music, effects, muted } };
}

// Broken saves kept at most; past this the newest takes the last key.
export const MAX_BROKEN = 20;

// The first free key for a broken save: BROKEN_KEY, then -2, -3, … up to
// MAX_BROKEN, so a storage that answers for every key can't keep the
// search going for ever.
function brokenKey(storage) {
  if (storage.getItem(BROKEN_KEY) === null) return BROKEN_KEY;
  let n = 2;
  while (n < MAX_BROKEN && storage.getItem(`${BROKEN_KEY}-${n}`) !== null) n += 1;
  return `${BROKEN_KEY}-${n}`;
}

// Reads the save: { data, problem }. data is { highScores, settings }, or null when
// there is no save or it can't be read; then problem says why, and the
// unreadable save has been copied to a key of its own (kept: it names
// where).
export function loadSave(storage) {
  const raw = storage.getItem(SAVE_KEY);
  if (raw === null) return { data: null, problem: null };
  try {
    return { data: validate(migrate(JSON.parse(raw))), problem: null };
  } catch (error) {
    const kept = brokenKey(storage);
    storage.setItem(kept, raw);
    return { data: null, problem: { message: error.message, kept } };
  }
}

export function writeSave(storage, { highScores, settings }) {
  storage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, highScores, settings }));
}
