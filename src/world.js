// One level being played: the level, Lelle, his animation, the camera, the
// items and the score, advanced one fixed step at a time. Pure: no DOM, and
// the step length is passed in.
import { createAnimation, updateAnimation } from './animation.js';
import { START_LIVES, TILE } from './config.js';
import { createCamera, snapCamera, updateCamera } from './camera.js';
import { createItem, overlaps } from './items.js';
import { parseLevel, pixelHeight } from './level.js';
import { createMessages, showMessage, updateMessages } from './messages.js';
import { createPlayer, updatePlayer } from './player.js';
import { collect, createScore, updateScore } from './score.js';

// How far below the level Lelle falls before he counts as lost in a pit.
const PIT_DEPTH = 48;
// How long the level's name shows as it starts.
const TITLE_TIME = 3;
// A hidden item shows once Lelle's middle comes this close to its own.
export const REVEAL_DISTANCE = 40;
// How long the points from a pickup float above where it was.
export const POPUP_TIME = 0.8;
// After this long without a pickup, the game nudges Lelle on.
export const QUIET_TIME = 30;
export const QUIET_LINE = 'INGEN GROV BROTTSLIGHET UPPTÄCKT. FORTSÄTT LETA!';

function startPosition(level) {
  return { x: (level.start.col + 0.5) * TILE, y: (level.start.row + 1) * TILE };
}

export function createWorld(definition) {
  const level = parseLevel(definition);
  const start = startPosition(level);
  const player = createPlayer(start.x, start.y);
  const items = level.markers
    .filter((marker) => marker.type === 'item')
    .map((marker) => createItem(marker.item, marker.col, marker.row, TILE));
  const messages = createMessages();
  showMessage(messages, level.name, 'white', TITLE_TIME);
  return {
    level,
    player,
    animation: createAnimation(),
    camera: createCamera(player, level),
    time: 0,
    timeLeft: level.time,
    lives: START_LIVES,
    items,
    score: createScore(),
    messages,
    popups: [],
    quiet: 0,
  };
}

function respawn(world) {
  const start = startPosition(world.level);
  world.player = createPlayer(start.x, start.y);
  world.animation = createAnimation();
  snapCamera(world.camera, world.player, world.level);
}

function distance(a, b) {
  return Math.hypot(a.x + a.w / 2 - (b.x + b.w / 2), a.y + a.h / 2 - (b.y + b.h / 2));
}

function pickUp(world, item, events) {
  const { messages } = world;
  item.collected = true;
  const result = collect(world.score, item.type);
  world.popups.push({
    text: `+${result.points}`,
    colour: result.multiplier > 1 ? 'orange_3' : 'white',
    x: item.x + item.w / 2,
    y: item.y,
    age: 0,
  });
  if (result.line) showMessage(messages, result.line);
  if (result.milestone) showMessage(messages, `DU HAR SAMLAT ${result.milestone} PROV. UTMÄRKT ARBETE, LELLE!`);
  if (result.promotedTo) {
    showMessage(messages, `BEFORDRAD TILL ${result.promotedTo.title.toUpperCase()}!`, 'hivis_3');
    events.push({ type: 'promoted', rank: result.promotedTo.title });
  }
  world.quiet = 0;
  events.push({ type: 'collected', item: item.type, points: result.points });
}

function collectItems(world, events) {
  const { player } = world;
  for (const item of world.items) {
    if (item.collected) continue;
    if (!item.revealed && distance(item, player) <= REVEAL_DISTANCE) item.revealed = true;
    if (overlaps(player, item)) pickUp(world, item, events);
  }
}

function updatePopups(world, dt) {
  for (const popup of world.popups) popup.age += dt;
  world.popups = world.popups.filter((popup) => popup.age < POPUP_TIME);
}

// Advances the world by dt and returns the step's events.
export function stepWorld(world, input, dt) {
  const { player, camera } = world;
  player.px = player.x;
  player.py = player.y;
  camera.px = camera.x;
  camera.py = camera.y;

  const events = updatePlayer(player, input, world.level, dt);
  if (player.y > pixelHeight(world.level) + PIT_DEPTH) {
    respawn(world);
    events.push({ type: 'fell' });
  } else {
    collectItems(world, events);
    updateAnimation(world.animation, player, dt);
    updateCamera(camera, player, world.level, dt);
  }

  updateScore(world.score, dt);
  updatePopups(world, dt);
  world.quiet += dt;
  if (world.quiet >= QUIET_TIME) {
    showMessage(world.messages, QUIET_LINE);
    world.quiet = 0;
  }
  updateMessages(world.messages, dt);
  world.timeLeft = Math.max(0, world.timeLeft - dt);
  world.time += dt;
  return events;
}
