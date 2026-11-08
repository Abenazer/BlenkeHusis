// The game as a whole: which screen shows (the title and its menu, the
// controls, the level being played, the pause menu, the game over, a
// level's report and the year's, the name entry, the question whether the
// high scores may be saved, and the high scores) and the run of levels from the first to the
// last, carrying the score and lives from one to the next. Stepped at the
// same fixed rate as the world. Pure: no DOM; main.js feeds it input and
// draws what it holds.
import { addScore, createHighScores, placeFor, typeInto } from './highscores.js';
import { wasPressed } from './input.js';
import { nextLevel } from './levels/index.js';
import { createMenu, updateMenu } from './menu.js';
import { loadSave, readConsent, writeConsent, writeSave } from './save.js';
import { levelReport, yearReport } from './report.js';
import { createWorld, isGameOverDone, isLevelDone, stepWorld } from './world.js';

export const TITLE_MENU = [
  { id: 'start', label: 'STARTA' },
  { id: 'controls', label: 'KONTROLLER' },
  { id: 'scores', label: 'TOPPLISTA' },
];

// The game over screen takes no key this long, so a jump pressed in the
// last moment of play doesn't skip it unread.
export const GAME_OVER_LOCK = 1.5;
// A report takes no key this long, for the same reason.
export const REPORT_LOCK = 0.5;
// The time bonus counts into the score over this long (a key finishes it).
export const BONUS_COUNT_TIME = 1.5;

// Asked the first time a score makes the list, and never again.
export const CONSENT_MENU = [
  { id: 'yes', label: 'JA, SPARA' },
  { id: 'no', label: 'NEJ TACK' },
];

export const PAUSE_MENU = [
  { id: 'resume', label: 'FORTSÄTT' },
  { id: 'quit', label: 'AVSLUTA' },
];

// first: the level a game starts at (the first of the game, or the one
// asked for in the address). next: the level after a given one, or null
// after the last; a test can give its own run of levels. storage: where
// the high scores are saved if the player allows it (save.js), or null
// where the browser keeps nothing.
export function createGame(first, { next = nextLevel, storage = null } = {}) {
  const game = {
    screen: 'title',
    // Counts up on every screen, for what moves or blinks on it; screenTime
    // counts from when the current screen came up.
    time: 0,
    screenTime: 0,
    first,
    next,
    level: null,
    world: null,
    // The title's menu lives as long as the game, so coming back from the
    // controls finds the mark where it was.
    titleMenu: createMenu(TITLE_MENU),
    menu: null,
    // Each completed level's report this game; the one on show, and how
    // much of its time bonus has been counted into the score; the year's.
    reports: [],
    report: null,
    bonusGiven: 0,
    year: null,
    // The high scores, kept while the page is open; the name being typed
    // and the place it will take; the entry to pick out on the list.
    highScores: createHighScores(),
    entry: null,
    highlight: null,
    storage,
    // 'yes', 'no', or null until the player has been asked.
    consent: null,
  };
  game.consent = useStorage(game, 'read the consent', (store) => readConsent(store)) ?? null;
  if (game.consent === 'yes') loadHighScores(game);
  return game;
}

// Runs fn with the storage, if there is one. Storage can fail at any time
// (full, blocked, gone): the game then goes on without it, and says so.
function useStorage(game, what, fn) {
  if (!game.storage) return undefined;
  try {
    return fn(game.storage);
  } catch (error) {
    console.warn(`Could not ${what}; the high scores are kept only while the page is open`, { error });
    game.storage = null;
    return undefined;
  }
}

function loadHighScores(game) {
  const loaded = useStorage(game, 'read the save', (store) => loadSave(store));
  if (!loaded) return;
  if (loaded.problem) console.warn('The save could not be read; it is kept and a new one starts', loaded.problem);
  if (loaded.data) game.highScores = loaded.data.highScores;
}

function saveHighScores(game) {
  if (game.consent !== 'yes') return;
  useStorage(game, 'save the high scores', (store) => writeSave(store, { highScores: game.highScores }));
}

function enter(game, screen, menu = null) {
  game.screen = screen;
  game.screenTime = 0;
  game.menu = menu;
}

function startGame(game) {
  game.reports = [];
  game.level = game.first;
  game.world = createWorld(game.level);
  enter(game, 'playing');
}

function toTitle(game) {
  game.level = null;
  game.world = null;
  game.report = null;
  game.year = null;
  game.entry = null;
  game.highlight = null;
  game.titleMenu = createMenu(TITLE_MENU);
  enter(game, 'title');
}

function title(game, input, events) {
  const choice = updateMenu(game.titleMenu, input, events);
  if (choice === 'start') startGame(game);
  else if (choice === 'controls') enter(game, 'controls');
  else if (choice === 'scores') enter(game, 'highScores');
}

// A screen read and left with back or confirm: the controls, and the
// high scores from the title.
function readOnly(game, input, events) {
  if (!wasPressed(input, 'back') && !wasPressed(input, 'confirm')) return;
  events.push({ type: 'advanced' });
  if (game.world) toTitle(game);
  else enter(game, 'title');
}

// The game is over (the last life, or the last level): a score that makes
// the list is signed for first, then the list shows.
function afterGame(game, events) {
  const place = placeFor(game.highScores, game.world.score.points);
  if (place === -1) {
    enter(game, 'highScores');
    return;
  }
  events.push({ type: 'highScore', place });
  game.entry = { name: '', place };
  enter(game, 'nameEntry');
}

// What a key typed did: a letter in, one rubbed out, or nothing (the name
// won't take it).
function typing(before, after) {
  if (after.length > before.length) return 'added';
  return after.length < before.length ? 'erased' : 'refused';
}

function nameEntry(game, input, events) {
  for (const key of input.typed) {
    const before = game.entry.name;
    game.entry.name = typeInto(before, key);
    events.push({ type: 'typed', change: typing(before, game.entry.name) });
  }
  if (!wasPressed(input, 'submit')) return;
  events.push({ type: 'nameSigned' });
  const { list, index } = addScore(game.highScores, game.entry.name, game.world.score);
  game.highScores = list;
  game.highlight = index;
  game.entry = null;
  if (game.storage && game.consent === null) {
    enter(game, 'consent', createMenu(CONSENT_MENU));
    return;
  }
  saveHighScores(game);
  enter(game, 'highScores');
}

// The one question: yes saves the list (and every list after), no is
// stored alone so it isn't asked again.
function consent(game, input, events) {
  const choice = updateMenu(game.menu, input, events);
  if (!choice) return;
  const allowed = choice === 'yes';
  useStorage(game, 'store the answer', (store) => writeConsent(store, allowed));
  game.consent = allowed ? 'yes' : 'no';
  saveHighScores(game);
  enter(game, 'highScores');
}

// Pauses a game being played; anything else is left as it is. main.js
// calls it too when the window loses focus.
export function pauseGame(game) {
  if (game.screen === 'playing') enter(game, 'paused', createMenu(PAUSE_MENU));
}

// The goal reached: the level's report comes up.
function completeLevel(game) {
  game.report = levelReport(game.world);
  game.bonusGiven = 0;
  enter(game, 'levelComplete');
}

// Counts the time bonus into the score, all of it at once when asked.
function countBonus(game, all, events) {
  const { bonus } = game.report;
  const due = all ? bonus : Math.min(bonus, Math.floor((game.screenTime / BONUS_COUNT_TIME) * bonus));
  if (due === game.bonusGiven) return;
  game.world.score.points += due - game.bonusGiven;
  game.bonusGiven = due;
  // done: the last of it has gone in.
  events.push({ type: 'bonusCounted', done: due === bonus });
}

export function isBonusCounted(game) {
  return game.bonusGiven === game.report.bonus;
}

// After the report: on to the next level with the run so far, or, after
// the last, the year's report.
function leaveLevel(game, events) {
  events.push({ type: 'advanced' });
  game.reports.push(game.report);
  game.report = null;
  const { score, lives } = game.world;
  const next = game.next(game.level);
  if (!next) {
    game.year = yearReport(game.reports);
    enter(game, 'yearReport');
    return;
  }
  game.level = next;
  game.world = createWorld(next, { score, lives });
  enter(game, 'playing');
}

// A key while the bonus counts finishes counting it; the next goes on.
function levelComplete(game, input, events) {
  const confirmed = game.screenTime >= REPORT_LOCK && wasPressed(input, 'confirm');
  if (confirmed && isBonusCounted(game)) {
    leaveLevel(game, events);
    return;
  }
  countBonus(game, confirmed, events);
}

function yearEnd(game, input, events) {
  if (game.screenTime < REPORT_LOCK || !wasPressed(input, 'confirm')) return;
  events.push({ type: 'advanced' });
  afterGame(game, events);
}

function play(game, input, dt, events) {
  if (wasPressed(input, 'pause')) {
    pauseGame(game);
    events.push({ type: 'paused' });
    return;
  }
  events.push(...stepWorld(game.world, input, dt));
  if (isGameOverDone(game.world)) enter(game, 'gameOver');
  else if (isLevelDone(game.world)) completeLevel(game);
}

function pause(game, input, events) {
  if (wasPressed(input, 'pause') || wasPressed(input, 'back')) {
    enter(game, 'playing');
    events.push({ type: 'resumed' });
    return;
  }
  const choice = updateMenu(game.menu, input, events);
  if (choice === 'resume') enter(game, 'playing');
  else if (choice === 'quit') toTitle(game);
}

// The world stays as it stopped, behind the screen, until a key goes on.
function gameOver(game, input, events) {
  if (game.screenTime < GAME_OVER_LOCK || !wasPressed(input, 'confirm')) return;
  events.push({ type: 'advanced' });
  afterGame(game, events);
}

const SCREENS = {
  title,
  controls: readOnly,
  highScores: readOnly,
  nameEntry,
  consent,
  paused: pause,
  gameOver,
  levelComplete,
  yearReport: yearEnd,
};

// Advances the game by dt. Returns the step's events: the world's while a
// level is played, and the screens' own (a menu's mark moved or a choice
// taken, a letter typed, the time bonus counted in, and so on).
export function stepGame(game, input, dt) {
  game.time += dt;
  game.screenTime += dt;
  const events = [];
  if (game.screen === 'playing') play(game, input, dt, events);
  else if (SCREENS[game.screen]) SCREENS[game.screen](game, input, events);
  else throw new Error(`Unknown screen '${game.screen}'`);
  return events;
}
