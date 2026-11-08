// The game as a whole: which screen shows (the title and its menu, the
// controls, the level being played, the pause menu, the game over, a
// level's report and the year's) and the run of levels from the first to the
// last, carrying the score and lives from one to the next. Stepped at the
// same fixed rate as the world. Pure: no DOM; main.js feeds it input and
// draws what it holds.
import { wasPressed } from './input.js';
import { nextLevel } from './levels/index.js';
import { createMenu, updateMenu } from './menu.js';
import { levelReport, yearReport } from './report.js';
import { createWorld, isGameOverDone, isLevelDone, stepWorld } from './world.js';

// Topplista opens with the high scores (TODO.md, 7.5).
export const TITLE_MENU = [
  { id: 'start', label: 'STARTA' },
  { id: 'controls', label: 'KONTROLLER' },
  { id: 'scores', label: 'TOPPLISTA', enabled: false },
];

// The game over screen takes no key this long, so a jump pressed in the
// last moment of play doesn't skip it unread.
export const GAME_OVER_LOCK = 1.5;
// A report takes no key this long, for the same reason.
export const REPORT_LOCK = 0.5;
// The time bonus counts into the score over this long (a key finishes it).
export const BONUS_COUNT_TIME = 1.5;

export const PAUSE_MENU = [
  { id: 'resume', label: 'FORTSÄTT' },
  { id: 'quit', label: 'AVSLUTA' },
];

// first: the level a game starts at (the first of the game, or the one
// asked for in the address). next: the level after a given one, or null
// after the last; a test can give its own run of levels.
export function createGame(first, next = nextLevel) {
  return {
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
  };
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
  game.titleMenu = createMenu(TITLE_MENU);
  enter(game, 'title');
}

function title(game, input) {
  const choice = updateMenu(game.titleMenu, input);
  if (choice === 'start') startGame(game);
  else if (choice === 'controls') enter(game, 'controls');
}

function controls(game, input) {
  if (wasPressed(input, 'back') || wasPressed(input, 'confirm')) enter(game, 'title');
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
function countBonus(game, all) {
  const { bonus } = game.report;
  const due = all ? bonus : Math.min(bonus, Math.floor((game.screenTime / BONUS_COUNT_TIME) * bonus));
  game.world.score.points += due - game.bonusGiven;
  game.bonusGiven = due;
}

export function isBonusCounted(game) {
  return game.bonusGiven === game.report.bonus;
}

// After the report: on to the next level with the run so far, or, after
// the last, the year's report.
function leaveLevel(game) {
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
function levelComplete(game, input) {
  const confirmed = game.screenTime >= REPORT_LOCK && wasPressed(input, 'confirm');
  if (confirmed && isBonusCounted(game)) {
    leaveLevel(game);
    return;
  }
  countBonus(game, confirmed);
}

function yearEnd(game, input) {
  if (game.screenTime >= REPORT_LOCK && wasPressed(input, 'confirm')) toTitle(game);
}

function play(game, input, dt) {
  if (wasPressed(input, 'pause')) {
    pauseGame(game);
    return [];
  }
  const events = stepWorld(game.world, input, dt);
  if (isGameOverDone(game.world)) enter(game, 'gameOver');
  else if (isLevelDone(game.world)) completeLevel(game);
  return events;
}

function pause(game, input) {
  if (wasPressed(input, 'pause') || wasPressed(input, 'back')) {
    enter(game, 'playing');
    return;
  }
  const choice = updateMenu(game.menu, input);
  if (choice === 'resume') enter(game, 'playing');
  else if (choice === 'quit') toTitle(game);
}

// The world stays as it stopped, behind the screen, until a key goes on.
function gameOver(game, input) {
  if (game.screenTime >= GAME_OVER_LOCK && wasPressed(input, 'confirm')) toTitle(game);
}

// Advances the game by dt. Returns the world's events for the step (none
// when no level is being played).
export function stepGame(game, input, dt) {
  game.time += dt;
  game.screenTime += dt;
  switch (game.screen) {
    case 'title':
      title(game, input);
      return [];
    case 'controls':
      controls(game, input);
      return [];
    case 'playing':
      return play(game, input, dt);
    case 'paused':
      pause(game, input);
      return [];
    case 'gameOver':
      gameOver(game, input);
      return [];
    case 'levelComplete':
      levelComplete(game, input);
      return [];
    case 'yearReport':
      yearEnd(game, input);
      return [];
    default:
      throw new Error(`Unknown screen '${game.screen}'`);
  }
}
