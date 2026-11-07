// One level being played: the level, Lelle, his animation, the camera, the
// items, the enemies and what they throw, the moving platforms, the score
// and the lives, advanced one fixed step at a time. Pure: no DOM, and the
// step length is passed in.
import { isGone, updateEnemy } from './ai.js';
import { createAnimation, updateAnimation } from './animation.js';
import { PLAYER, START_LIVES, TILE } from './config.js';
import { createCamera, snapCamera, updateCamera } from './camera.js';
import { createEnemy, ENEMIES } from './enemies.js';
import { findLeaks, hazardFor } from './hazards.js';
import { isHeld } from './input.js';
import { createDroppedItem, createItem, INSET, overlaps } from './items.js';
import { parseLevel, pixelHeight } from './level.js';
import { createMessages, showMessage, updateMessages } from './messages.js';
import { moveBody, pushBody } from './physics.js';
import { createPlatforms, updatePlatforms } from './platforms.js';
import { bounce, createPlayer, knockBack, updatePlayer } from './player.js';
import { updateProjectile } from './projectiles.js';
import { collect, createScore, defeat, updateScore } from './score.js';

// How far below the level something falls before it counts as lost in a pit.
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
// After a life is lost everything stands still this long, then Lelle is
// back at the start.
export const DOWN_TIME = 1.2;
// After the last life, this long before the game starts over.
export const GAME_OVER_TIME = 4;
// Landing on an enemy defeats it when Lelle's feet were no further than
// this into it the step before; otherwise touching it hurts.
const STOMP_REACH = 6;
// Something an enemy carries pops up this fast when it is defeated.
const DROP_POP = 220;
const DROP_GRAVITY = 900;
const DROP_MAX_FALL = 400;

export const DEFEAT_LINE = 'ÄNNU EN FARLIG MEDBORGARE OSKADLIGGJORD!';
export const LOSS_LINES = {
  pit: 'INGA PROV DÄR NERE. BARA ETT HÅL.',
  water: 'POLISEN SIMMAR INTE I TJÄNSTEN.',
  hurt: 'LELLE SJUKSKRIVEN. ÄRENDET LÄGGS PÅ HÖG.',
  time: 'TIDEN ÄR UTE. ÖVERTID BEVILJAS EJ.',
};
export const GAME_OVER_LINE = 'SPELET ÄR SLUT. UTREDNINGEN LÄGGS NER.';

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
  const counts = {};
  const enemies = level.markers
    .filter((marker) => marker.type === 'enemy')
    .map((marker) => {
      counts[marker.enemy] = (counts[marker.enemy] ?? 0) + 1;
      return createEnemy(marker.enemy, marker.col, marker.row, TILE, counts[marker.enemy] - 1);
    });
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
    enemies,
    projectiles: [],
    platforms: createPlatforms(level.markers),
    leaks: findLeaks(level),
    score: createScore(),
    messages,
    popups: [],
    quiet: 0,
    // Counts down after a life is lost; Lelle is back when it runs out.
    down: 0,
    lossCause: null,
    over: false,
    overTime: 0,
  };
}

// Whether the game over has shown long enough for the game to start over.
export function isGameOverDone(world) {
  return world.over && world.overTime >= GAME_OVER_TIME;
}

function respawn(world) {
  const start = startPosition(world.level);
  world.player = createPlayer(start.x, start.y);
  // Something may be standing at the start; he gets a moment to move.
  world.player.invulnerable = PLAYER.invulnerableTime;
  world.animation = createAnimation();
  world.timeLeft = world.level.time;
  world.projectiles = [];
  world.down = 0;
  world.lossCause = null;
  snapCamera(world.camera, world.player, world.level);
}

// The newest line pushes aside whatever was showing or waiting.
function announce(world, text, time) {
  world.messages = createMessages();
  showMessage(world.messages, text, 'red_4', time);
}

function loseLife(world, cause, events) {
  const { player } = world;
  world.lives -= 1;
  world.down = DOWN_TIME;
  world.lossCause = cause;
  world.animation.name = 'hurt';
  world.animation.time = 0;
  player.vx = 0;
  player.vy = 0;
  events.push({ type: 'lifeLost', cause, lives: world.lives });
  if (world.lives > 0) {
    announce(world, LOSS_LINES[cause]);
    return;
  }
  world.over = true;
  world.overTime = 0;
  announce(world, GAME_OVER_LINE, GAME_OVER_TIME);
  events.push({ type: 'gameOver' });
}

// A hit costs one health; the last one costs a life. fromX is where the
// hit came from, which he is knocked away from.
function hurtLelle(world, fromX, events) {
  const { player } = world;
  if (player.invulnerable > 0 || world.down > 0 || world.over) return;
  player.health -= 1;
  events.push({ type: 'hurt', health: player.health });
  if (player.health <= 0) loseLife(world, 'hurt', events);
  else knockBack(player, fromX);
}

function addPopup(world, points, multiplier, x, y) {
  world.popups.push({ text: `+${points}`, colour: multiplier > 1 ? 'orange_3' : 'white', x, y, age: 0 });
}

function middle(body) {
  return body.x + body.w / 2;
}

function distance(a, b) {
  return Math.hypot(middle(a) - middle(b), a.y + a.h / 2 - (b.y + b.h / 2));
}

function drop(world, type, x, y, vx, vy) {
  world.items.push(createDroppedItem(type, x, y, vx, vy, TILE));
}

function stomp(world, enemy, input, events) {
  const data = ENEMIES[enemy.type];
  enemy.defeated = true;
  enemy.vx = 0;
  bounce(world.player, isHeld(input, 'jump'));
  const result = defeat(world.score, enemy.type);
  addPopup(world, result.points, result.multiplier, middle(enemy), enemy.y);
  showMessage(world.messages, DEFEAT_LINE);
  // What it carries falls out, unless the stoner has handed it all out.
  if (data.carries && (data.drops === undefined || enemy.dropsLeft > 0)) {
    drop(world, data.carries, middle(enemy), enemy.y + enemy.h / 2, 0, -DROP_POP);
  }
  world.quiet = 0;
  events.push({ type: 'stomp', enemy: enemy.type, points: result.points });
}

function updateEnemies(world, input, feetBefore, dt, events) {
  const { player } = world;
  const context = { level: world.level, player };
  for (const enemy of world.enemies) {
    for (const event of updateEnemy(enemy, context, dt)) {
      if (event.type === 'throw') world.projectiles.push(event.projectile);
      else if (event.type === 'drop') drop(world, event.item, event.x, event.y, event.vx, event.vy);
      events.push(event);
    }
    if (enemy.defeated || !overlaps(player, enemy)) continue;
    if (feetBefore <= enemy.py + STOMP_REACH && player.vy >= 0) {
      stomp(world, enemy, input, events);
    } else if (!ENEMIES[enemy.type].harmless) {
      hurtLelle(world, middle(enemy), events);
    }
  }
  world.enemies = world.enemies.filter((enemy) => !isGone(enemy, world.level));
}

function updateProjectiles(world, dt, events) {
  const { player } = world;
  world.projectiles = world.projectiles.filter((projectile) => {
    if (!updateProjectile(projectile, world.level, dt)) return false;
    if (player.invulnerable > 0 || !overlaps(player, projectile)) return true;
    hurtLelle(world, middle(projectile) - Math.sign(projectile.vx), events);
    return false;
  });
}

// A dropped item falls until it lands; its body reaches down to the bottom
// of its tile, where the item stands.
function updateDroppedItem(item, level, dt) {
  item.vy = Math.min(item.vy + DROP_GRAVITY * dt, DROP_MAX_FALL);
  const body = { x: item.x, y: item.y, w: item.w, h: item.h + INSET, vx: item.vx, vy: item.vy };
  const hit = moveBody(body, level, dt);
  Object.assign(item, { x: body.x, y: body.y, vx: body.vx, vy: body.vy });
  if (!hit.onGround) return;
  item.falling = false;
  item.vx = 0;
  item.vy = 0;
}

function pickUp(world, item, events) {
  const { messages } = world;
  item.collected = true;
  const result = collect(world.score, item.type);
  addPopup(world, result.points, result.multiplier, middle(item), item.y);
  if (result.line) showMessage(messages, result.line);
  if (result.milestone) showMessage(messages, `DU HAR SAMLAT ${result.milestone} PROV. UTMÄRKT ARBETE, LELLE!`);
  if (result.promotedTo) {
    showMessage(messages, `BEFORDRAD TILL ${result.promotedTo.title.toUpperCase()}!`, 'hivis_3');
    events.push({ type: 'promoted', rank: result.promotedTo.title });
  }
  world.quiet = 0;
  events.push({ type: 'collected', item: item.type, points: result.points });
}

function updateItems(world, dt, events) {
  const { player, level } = world;
  for (const item of world.items) {
    if (item.collected) continue;
    item.px = item.x;
    item.py = item.y;
    if (item.falling) updateDroppedItem(item, level, dt);
    if (!item.revealed && distance(item, player) <= REVEAL_DISTANCE) item.revealed = true;
    if (overlaps(player, item)) pickUp(world, item, events);
  }
  const bottom = pixelHeight(level) + PIT_DEPTH;
  world.items = world.items.filter((item) => item.y <= bottom);
}

function updatePopups(world, dt) {
  for (const popup of world.popups) popup.age += dt;
  world.popups = world.popups.filter((popup) => popup.age < POPUP_TIME);
}

// What runs whatever else is going on: the combo clock, floating points
// and the message line.
function updateTimers(world, dt) {
  updateScore(world.score, dt);
  updatePopups(world, dt);
  updateMessages(world.messages, dt);
}

// A moving platform takes what stands on it along.
function ride(world) {
  const { player } = world;
  const platform = player.platform;
  if (!platform) return;
  pushBody(player, world.level, platform.dx);
  player.y = platform.y - player.h;
}

function play(world, input, dt, events) {
  const { level, camera } = world;
  const player = world.player;
  world.time += dt;
  updatePlatforms(world.platforms, world.time);
  ride(world);
  const feetBefore = player.y + player.h;
  events.push(...updatePlayer(player, input, level, dt, world.platforms));

  if (player.y > pixelHeight(level) + PIT_DEPTH) {
    loseLife(world, 'pit', events);
    return;
  }
  const hazard = hazardFor(level, player, world.leaks, world.time);
  if (hazard === 'drown') {
    loseLife(world, 'water', events);
    return;
  }
  // Slime, syringes and sewage knock him back the way he came.
  if (hazard === 'hurt') hurtLelle(world, middle(player) + player.facing, events);

  updateEnemies(world, input, feetBefore, dt, events);
  updateProjectiles(world, dt, events);
  updateItems(world, dt, events);
  if (world.down > 0) return;
  updateAnimation(world.animation, player, dt);
  updateCamera(camera, player, level, dt);

  world.quiet += dt;
  if (world.quiet >= QUIET_TIME) {
    showMessage(world.messages, QUIET_LINE);
    world.quiet = 0;
  }
  world.timeLeft = Math.max(0, world.timeLeft - dt);
  if (world.timeLeft === 0) loseLife(world, 'time', events);
}

// Advances the world by dt and returns the step's events. After a lost life
// it stands still until Lelle is back; after the last, until the game over
// has shown.
export function stepWorld(world, input, dt) {
  const events = [];
  const { player, camera } = world;
  player.px = player.x;
  player.py = player.y;
  camera.px = camera.x;
  camera.py = camera.y;

  if (world.over) {
    world.overTime += dt;
  } else if (world.down > 0) {
    world.down -= dt;
    if (world.down <= 0) respawn(world);
  } else {
    play(world, input, dt, events);
  }
  updateTimers(world, dt);
  return events;
}
