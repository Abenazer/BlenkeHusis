// The game as a whole: which screen shows (the title and its menu, the
// controls, the sound settings, the level being played, the pause menu, the game over, a
// level's report and the year's, the name entry, the question whether the
// high scores may be saved, and the high scores) and the run of levels from the first to the
// last, carrying the score and lives from one to the next. Stepped at the
// same fixed rate as the world. Pure: no DOM; main.js feeds it input and
// draws what it holds.
import { addScore, chooseSlot, createHighScores, createTag, placeFor, TAG_LENGTH, tagName, turnLetter, typeLetter } from './highscores.js';
import { isHeld, tapOf, wasPressed } from './input.js';
import { nextLevel } from './levels/index.js';
import { createMenu, updateMenu } from './menu.js';
import { adjustVolume, DEFAULT_SETTINGS, toggleMuted } from './settings.js';
import { loadSave, readConsent, writeConsent, writeSave } from './save.js';
import { bonusLeft, levelReport, yearReport } from './report.js';
import { createWorld, isGameOverDone, isLevelDone, stepWorld } from './world.js';

export const TITLE_MENU = [
  { id: 'start', label: 'STARTA' },
  { id: 'controls', label: 'KONTROLLER' },
  { id: 'sound', label: 'LJUD' },
  { id: 'scores', label: 'TOPPLISTA' },
];

// The game over screen takes no key this long, so a jump pressed in the
// last moment of play doesn't skip it unread.
export const GAME_OVER_LOCK = 1.5;
// A report takes no key this long, for the same reason.
export const REPORT_LOCK = 0.5;
// The bonuses count into the score over this long (a key finishes them).
export const BONUS_COUNT_TIME = 2;
// Up or down held on the name entry turns the letter on by itself after
// TURN_DELAY, then every TURN_REPEAT.
export const TURN_DELAY = 0.4;
export const TURN_REPEAT = 0.08;

// Asked the first time a score makes the list, and never again.
export const CONSENT_MENU = [
  { id: 'yes', label: 'JA, SPARA' },
  { id: 'no', label: 'NEJ TACK' },
];

export const PAUSE_MENU = [
  { id: 'resume', label: 'FORTSÄTT' },
  { id: 'sound', label: 'LJUD' },
  { id: 'quit', label: 'AVSLUTA' },
];

// The sound screen: a row for each volume, moved by left and right, and
// the way back.
export const SOUND_MENU = [
  { id: 'music', label: 'MUSIK' },
  { id: 'effects', label: 'EFFEKTER' },
  { id: 'back', label: 'TILLBAKA' },
];

// first: the level a game starts at (the first of the game, or the one
// asked for in the address). next: the level after a given one, or null
// after the last; a test can give its own run of levels. storage: where
// the high scores and sound settings are saved if the player allows it
// (save.js), or null where the browser keeps nothing.
export function createGame(first, { next = nextLevel, storage = null } = {}) {
  const game = {
    screen: 'title',
    // Counts up on every screen, for what moves or blinks on it; screenTime
    // counts from when the current screen came up.
    time: 0,
    screenTime: 0,
    // Whether the screen fades in as it comes up (transitions.js); the
    // level has its iris instead, and pausing comes at once.
    fading: true,
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
    // The high scores, kept while the page is open; the tag being signed
    // and the place it will take; the entry to pick out on the list.
    highScores: createHighScores(),
    entry: null,
    highlight: null,
    storage,
    // 'yes', 'no', or null until the player has been asked.
    consent: null,
    // The music's and effects' volumes and whether sound is off
    // (settings.js); the sound screen's menu, and the screen (with its
    // menu) it goes back to.
    settings: { ...DEFAULT_SETTINGS },
    soundMenu: null,
    soundFrom: null,
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
  if (!loaded.data) return;
  game.highScores = loaded.data.highScores;
  game.settings = loaded.data.settings;
}

// Saves the high scores and the settings, if the player has allowed it.
function saveGame(game) {
  if (game.consent !== 'yes') return;
  useStorage(game, 'save', (store) => writeSave(store, { highScores: game.highScores, settings: game.settings }));
}

function enter(game, screen, menu = null, { fade = true } = {}) {
  game.screen = screen;
  game.screenTime = 0;
  game.menu = menu;
  game.fading = fade;
}

function startGame(game) {
  game.reports = [];
  game.level = game.first;
  game.world = createWorld(game.level);
  enter(game, 'playing', null, { fade: false });
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
  else if (choice === 'sound') openSound(game);
}

// The sound screen, from the title or the pause menu, which it goes back
// to as it was.
function openSound(game) {
  game.soundFrom = { screen: game.screen, menu: game.menu };
  game.soundMenu = createMenu(SOUND_MENU);
  enter(game, 'sound');
}

function closeSound(game) {
  const { screen, menu } = game.soundFrom;
  game.soundFrom = null;
  game.soundMenu = null;
  saveGame(game);
  enter(game, screen, menu);
}

function sound(game, input, events) {
  if (wasPressed(input, 'back') || wasPressed(input, 'pause')) {
    events.push({ type: 'advanced' });
    closeSound(game);
    return;
  }
  const choice = updateMenu(game.soundMenu, input, events);
  if (choice === 'back') {
    closeSound(game);
    return;
  }
  // A tapped bar marks its row and sets the volume to the step tapped.
  const tap = tapOf(input, 'volume');
  if (tap) game.soundMenu.index = game.soundMenu.items.findIndex((item) => item.id === tap.volume);
  const row = game.soundMenu.items[game.soundMenu.index].id;
  if (row === 'back') return;
  const before = game.settings[row];
  const delta = tap ? tap.level - before : (wasPressed(input, 'right') ? 1 : 0) - (wasPressed(input, 'left') ? 1 : 0);
  game.settings = adjustVolume(game.settings, row, delta);
  if (game.settings[row] !== before) events.push({ type: 'volumeChanged', volume: row, step: game.settings[row] });
}

// M turns all sound off and on from any screen but the name entry,
// where it is a letter.
function mute(game, input, events) {
  if (game.screen === 'nameEntry' || !wasPressed(input, 'mute')) return;
  game.settings = toggleMuted(game.settings);
  events.push({ type: 'muteToggled', muted: game.settings.muted });
  saveGame(game);
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
  // turnIn: the time to the held letter's next turn, or null when up and
  // down aren't held from a press of their own.
  game.entry = { tag: createTag(), place, turnIn: null };
  enter(game, 'nameEntry');
}

function turn(entry, step, events) {
  entry.tag = turnLetter(entry.tag, step);
  events.push({ type: 'tagTurned' });
}

function moveTo(entry, slot, events) {
  const before = entry.tag.slot;
  entry.tag = chooseSlot(entry.tag, slot);
  if (entry.tag.slot !== before) events.push({ type: 'tagMoved' });
}

// What a key typed did: a letter in, a step back, or nothing (the tag
// won't take it).
function typing(before, after, key) {
  if (tagName(before) === tagName(after) && before.slot === after.slot) return 'refused';
  return key === 'Backspace' ? 'erased' : 'added';
}

// Signing arcade style: up and down turn the letter, left and right move
// between the three, confirm moves on and signs from the last. A typed
// letter fills its slot and moves on; a step with something typed takes
// no actions, so the keys that type letters (W, A, S, D, space) don't
// also turn or move. A tapped arrow turns its slot's letter, a tapped
// letter takes its slot, and KLAR signs at once.
function nameEntry(game, input, events, dt) {
  const { entry } = game;
  if (input.typed.length > 0) {
    entry.turnIn = null;
    for (const key of input.typed) {
      const before = entry.tag;
      entry.tag = typeLetter(before, key);
      events.push({ type: 'typed', change: typing(before, entry.tag, key) });
    }
    return;
  }
  const tap = tapOf(input, 'tag');
  if (tap) {
    moveTo(entry, tap.slot, events);
    if (tap.step !== 0) turn(entry, tap.step, events);
  }
  const step = (wasPressed(input, 'up') ? 1 : 0) - (wasPressed(input, 'down') ? 1 : 0);
  const held = (isHeld(input, 'up') ? 1 : 0) - (isHeld(input, 'down') ? 1 : 0);
  if (step !== 0) {
    turn(entry, step, events);
    entry.turnIn = TURN_DELAY;
  } else if (held !== 0 && entry.turnIn !== null) {
    entry.turnIn -= dt;
    if (entry.turnIn <= 0) {
      turn(entry, held, events);
      entry.turnIn += TURN_REPEAT;
    }
  } else {
    entry.turnIn = null;
  }
  const move = (wasPressed(input, 'right') ? 1 : 0) - (wasPressed(input, 'left') ? 1 : 0);
  if (move !== 0) moveTo(entry, entry.tag.slot + move, events);
  const last = entry.tag.slot === TAG_LENGTH - 1;
  if (!tapOf(input, 'sign') && !(wasPressed(input, 'confirm') && last)) {
    if (wasPressed(input, 'confirm')) moveTo(entry, entry.tag.slot + 1, events);
    return;
  }
  events.push({ type: 'nameSigned' });
  const { list, index } = addScore(game.highScores, tagName(entry.tag), game.world.score);
  game.highScores = list;
  game.highlight = index;
  game.entry = null;
  if (game.storage && game.consent === null) {
    enter(game, 'consent', createMenu(CONSENT_MENU));
    return;
  }
  saveGame(game);
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
  saveGame(game);
  enter(game, 'highScores');
}

// Pauses a game being played; anything else is left as it is. main.js
// calls it too when the window loses focus.
export function pauseGame(game) {
  if (game.screen === 'playing') enter(game, 'paused', createMenu(PAUSE_MENU), { fade: false });
}

// The goal reached: the level's report comes up.
function completeLevel(game) {
  game.report = levelReport(game.world);
  game.bonusGiven = 0;
  enter(game, 'levelComplete');
}

// Counts the bonuses into the score, all of them at once when asked; a full
// tank's urine bonus doubles once it has gone in, and that is told.
function countBonus(game, all, events) {
  const { report } = game;
  const { bonus } = report;
  const due = all ? bonus : Math.min(bonus, Math.floor((game.screenTime / BONUS_COUNT_TIME) * bonus));
  if (due === game.bonusGiven) return;
  const wasDoubled = bonusLeft(report, game.bonusGiven).doubled;
  game.world.score.points += due - game.bonusGiven;
  game.bonusGiven = due;
  if (!wasDoubled && bonusLeft(report, due).doubled) events.push({ type: 'urineDoubled' });
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
  enter(game, 'playing', null, { fade: false });
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
    enter(game, 'playing', null, { fade: false });
    events.push({ type: 'resumed' });
    return;
  }
  const choice = updateMenu(game.menu, input, events);
  if (choice === 'resume') enter(game, 'playing', null, { fade: false });
  else if (choice === 'sound') openSound(game);
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
  sound,
};

// Advances the game by dt. Returns the step's events: the world's while a
// level is played, and the screens' own (a menu's mark moved or a choice
// taken, a letter typed, the time bonus counted in, and so on).
export function stepGame(game, input, dt) {
  game.time += dt;
  game.screenTime += dt;
  const events = [];
  mute(game, input, events);
  if (game.screen === 'playing') play(game, input, dt, events);
  else if (SCREENS[game.screen]) SCREENS[game.screen](game, input, events, dt);
  else throw new Error(`Unknown screen '${game.screen}'`);
  return events;
}
