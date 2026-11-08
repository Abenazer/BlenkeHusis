// The game as a whole: which screen shows (the title and its menu, the
// controls, the level being played, the pause menu) and the run of levels from the first to the
// last, carrying the score and lives from one to the next. Stepped at the
// same fixed rate as the world. Pure: no DOM; main.js feeds it input and
// draws what it holds.
import { wasPressed } from './input.js';
import { nextLevel } from './levels/index.js';
import { createMenu, updateMenu } from './menu.js';
import { createWorld, isGameOverDone, isLevelDone, stepWorld } from './world.js';

// Topplista opens with the high scores (TODO.md, 7.5).
export const TITLE_MENU = [
  { id: 'start', label: 'STARTA' },
  { id: 'controls', label: 'KONTROLLER' },
  { id: 'scores', label: 'TOPPLISTA', enabled: false },
];

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
    // Counts up on every screen, for what moves or blinks on it.
    time: 0,
    first,
    next,
    level: null,
    world: null,
    // The title's menu lives as long as the game, so coming back from the
    // controls finds the mark where it was.
    titleMenu: createMenu(TITLE_MENU),
    menu: null,
  };
}

function enter(game, screen, menu = null) {
  game.screen = screen;
  game.menu = menu;
}

function startGame(game) {
  game.level = game.first;
  game.world = createWorld(game.level);
  enter(game, 'playing');
}

function toTitle(game) {
  game.level = null;
  game.world = null;
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

// The goal reached: on to the next level with the run so far, or, after
// the last, the game is over.
function finishLevel(game) {
  const { score, lives } = game.world;
  const next = game.next(game.level);
  if (!next) {
    toTitle(game);
    return;
  }
  game.level = next;
  game.world = createWorld(next, { score, lives });
}

function play(game, input, dt) {
  if (wasPressed(input, 'pause')) {
    pauseGame(game);
    return [];
  }
  const events = stepWorld(game.world, input, dt);
  if (isGameOverDone(game.world)) toTitle(game);
  else if (isLevelDone(game.world)) finishLevel(game);
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

// Advances the game by dt. Returns the world's events for the step (none
// when no level is being played).
export function stepGame(game, input, dt) {
  game.time += dt;
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
    default:
      throw new Error(`Unknown screen '${game.screen}'`);
  }
}
