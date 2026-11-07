// One level being played: the level, Blenke, his animation, the camera, the
// items, the crates, the enemies and what they throw, the moving platforms,
// the citizens, signs and props, the power-up, the score and the lives,
// advanced one fixed step at a time. Pure: no DOM, and the step length is
// passed in.
import { isGone, updateEnemy } from './ai.js';
import { createAnimation, updateAnimation } from './animation.js';
import { createCitizen, THANKS_TIME, updateCitizen } from './citizens.js';
import { PLAYER, START_LIVES, TILE } from './config.js';
import { createCamera, snapCamera, updateCamera } from './camera.js';
import { createEnemy, ENEMIES } from './enemies.js';
import { findLeaks, hazardFor } from './hazards.js';
import { isHeld, wasPressed } from './input.js';
import { createDroppedItem, createItem, INSET, ITEMS, overlaps } from './items.js';
import { openCrate, parseLevel, pixelHeight } from './level.js';
import { createMessages, showMessage, updateMessages } from './messages.js';
import { isAreaFree, moveBody, pushBody } from './physics.js';
import { createPlatforms, updatePlatforms } from './platforms.js';
import { bounce, createPlayer, knockBack, updatePlayer } from './player.js';
import { boostsFor, hasEffect, movementFor, POWER_UPS, startPowerUp, updatePowerUp } from './powerups.js';
import { updateProjectile } from './projectiles.js';
import { createProp, PROP_FRICTION, PROP_GRAVITY, PROP_MAX_FALL, releaseProp, STRIKE_SPEED } from './props.js';
import { collect, createScore, defeat, help, updateScore } from './score.js';

// How far below the level something falls before it counts as lost in a pit.
const PIT_DEPTH = 48;
// How long the level's name shows as it starts.
const TITLE_TIME = 3;
// A hidden item shows once Blenke's middle comes this close to its own.
export const REVEAL_DISTANCE = 40;
// How long the points from a pickup float above where it was.
export const POPUP_TIME = 0.8;
// After this long without a pickup, the game nudges Blenke on.
export const QUIET_TIME = 30;
export const QUIET_LINE = 'INGEN GROV BROTTSLIGHET UPPTÄCKT. FORTSÄTT LETA!';
// After a life is lost everything stands still this long, then Blenke is
// back at the start.
export const DOWN_TIME = 1.2;
// After the last life, this long before the game starts over.
export const GAME_OVER_TIME = 4;
// Landing on an enemy defeats it when Blenke's feet were no further than
// this into it the step before; otherwise touching it hurts.
const STOMP_REACH = 6;
// Something an enemy carries pops up this fast when it is defeated.
const DROP_POP = 220;
const DROP_GRAVITY = 900;
const DROP_MAX_FALL = 400;
// What a crate held pops up out of it this fast; the crate jolts up for
// BUMP_TIME.
const CRATE_POP = 160;
export const BUMP_TIME = 0.15;
// Blenke reaches this far either side of himself to pick something up,
// help someone or read a sign.
export const REACH = 4;
// A carried prop is held in front of him, its middle this far ahead of
// his and its bottom this far above his feet (less when he crouches).
const CARRY_AHEAD = 7;
const CARRY_HEIGHT = 6;
const CARRY_HEIGHT_CROUCHED = 1;
// A thrown prop that hits an enemy bounces off it like this.
const PROP_REBOUND = 0.3;
const PROP_REBOUND_LIFT = 120;
// A sign's text stays this long.
export const SIGN_TIME = 4;

export const DEFEAT_LINE = 'ÄNNU EN FARLIG MEDBORGARE OSKADLIGGJORD!';
export const LOSS_LINES = {
  pit: 'INGA PROV DÄR NERE. BARA ETT HÅL.',
  water: 'POLISEN SIMMAR INTE I TJÄNSTEN.',
  hurt: 'BLENKE SJUKSKRIVEN. ÄRENDET LÄGGS PÅ HÖG.',
  time: 'TIDEN ÄR UTE. ÖVERTID BEVILJAS EJ.',
};
export const GAME_OVER_LINE = 'SPELET ÄR SLUT. UTREDNINGEN LÄGGS NER.';
export const HELP_LINE = 'MEDBORGARE HJÄLPT. SYNS INTE I STATISTIKEN.';

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
  const citizens = level.markers
    .filter((marker) => marker.type === 'citizen')
    .sort((a, b) => a.col - b.col)
    .map((marker, index) => createCitizen(marker.citizen, marker.col, marker.row, TILE, index));
  const signs = level.markers
    .filter((marker) => marker.type === 'sign')
    .map((marker) => ({ x: marker.col * TILE, y: marker.row * TILE, w: TILE, h: TILE, text: marker.text }));
  const props = level.markers
    .filter((marker) => marker.type === 'prop')
    .map((marker) => createProp(marker.prop, marker.col, marker.row, TILE));
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
    citizens,
    signs,
    props,
    // The prop Blenke is carrying, if any.
    carrying: null,
    // The active power-up, { type, timeLeft }, or null.
    powerUp: null,
    // Crates jolting after being opened.
    bumps: [],
    score: createScore(),
    messages,
    popups: [],
    quiet: 0,
    // Counts down after a life is lost; Blenke is back when it runs out.
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
  dropCarried(world);
  world.powerUp = null;
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

// A hit costs one health, unless the paperwork shield takes it; the last
// one costs a life. fromX is where the hit came from, which he is knocked
// away from. Whatever he carries, he drops.
function hurtPlayer(world, fromX, events) {
  const { player } = world;
  if (player.invulnerable > 0 || world.down > 0 || world.over) return;
  dropCarried(world);
  if (hasEffect(world.powerUp, 'shield')) {
    showMessage(world.messages, POWER_UPS[world.powerUp.type].ends);
    world.powerUp = null;
    knockBack(player, fromX);
    events.push({ type: 'shielded' });
    return;
  }
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

// how: 'stomp' when Blenke landed on it, 'struck' when a prop hit it.
function defeatEnemy(world, enemy, how, events) {
  const data = ENEMIES[enemy.type];
  enemy.defeated = true;
  enemy.vx = 0;
  const result = defeat(world.score, enemy.type, boostsFor(world.powerUp));
  addPopup(world, result.points, result.multiplier, middle(enemy), enemy.y);
  showMessage(world.messages, DEFEAT_LINE);
  // What it carries falls out, unless the stoner has handed it all out.
  if (data.carries && (data.drops === undefined || enemy.dropsLeft > 0)) {
    drop(world, data.carries, middle(enemy), enemy.y + enemy.h / 2, 0, -DROP_POP);
  }
  world.quiet = 0;
  events.push({ type: how, enemy: enemy.type, points: result.points });
}

function stomp(world, enemy, input, events) {
  bounce(world.player, isHeld(input, 'jump'));
  defeatEnemy(world, enemy, 'stomp', events);
}

// Something bumped or struck crates: each opens, jolts, and what it held
// pops out on top.
function strikeCrates(world, tiles, events) {
  for (const { col, row } of tiles) {
    const contents = openCrate(world.level, col, row);
    if (!contents) continue;
    world.bumps.push({ col, row, age: 0 });
    drop(world, contents, (col + 0.5) * TILE, row * TILE - TILE / 2, 0, -CRATE_POP);
    events.push({ type: 'crateOpened', contents, col, row });
  }
}

// Blenke's head opens the crate most nearly over his middle.
function headButt(world, tiles, events) {
  const x = middle(world.player);
  const nearest = tiles.reduce((best, tile) => (Math.abs((tile.col + 0.5) * TILE - x) < Math.abs((best.col + 0.5) * TILE - x) ? tile : best));
  strikeCrates(world, [nearest], events);
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
      hurtPlayer(world, middle(enemy), events);
    }
  }
  world.enemies = world.enemies.filter((enemy) => !isGone(enemy, world.level));
}

function updateProjectiles(world, dt, events) {
  const { player } = world;
  world.projectiles = world.projectiles.filter((projectile) => {
    if (!updateProjectile(projectile, world.level, dt)) return false;
    if (player.invulnerable > 0 || !overlaps(player, projectile)) return true;
    hurtPlayer(world, middle(projectile) - Math.sign(projectile.vx), events);
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
  const result = collect(world.score, item.type, boostsFor(world.powerUp));
  addPopup(world, result.points, result.multiplier, middle(item), item.y);
  if (result.line) showMessage(messages, result.line);
  if (result.milestone) showMessage(messages, `DU HAR SAMLAT ${result.milestone} PROV. UTMÄRKT ARBETE, BLENKE!`);
  if (result.promotedTo) {
    showMessage(messages, `BEFORDRAD TILL ${result.promotedTo.title.toUpperCase()}!`, 'hivis_3');
    events.push({ type: 'promoted', rank: result.promotedTo.title });
  }
  if (ITEMS[item.type].category === 'powerUp') {
    world.powerUp = startPowerUp(item.type);
    events.push({ type: 'powerUp', powerUp: item.type });
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
  for (const bump of world.bumps) bump.age += dt;
  world.bumps = world.bumps.filter((bump) => bump.age < BUMP_TIME);
}

// What runs whatever else is going on: the combo clock, floating points,
// jolting crates and the message line.
function updateTimers(world, dt) {
  updateScore(world.score, dt);
  updatePopups(world, dt);
  updateMessages(world.messages, dt);
}

function reachOf(player) {
  return { x: player.x - REACH, y: player.y, w: player.w + 2 * REACH, h: player.h };
}

// What the act key would do now, { kind, target }, or null: help a
// citizen in reach, read a sign, throw what he carries or pick up a prop,
// in that order.
export function actionTarget(world) {
  const reach = reachOf(world.player);
  const citizen = world.citizens.find((candidate) => !candidate.helped && overlaps(reach, candidate));
  if (citizen) return { kind: 'help', target: citizen };
  const sign = world.signs.find((candidate) => overlaps(reach, candidate));
  if (sign) return { kind: 'read', target: sign };
  if (world.carrying) return { kind: 'throw', target: world.carrying };
  const prop = world.props.find((candidate) => !candidate.thrown && overlaps(reach, candidate));
  if (prop) return { kind: 'lift', target: prop };
  return null;
}

function helpCitizen(world, citizen, events) {
  citizen.helped = true;
  citizen.thanksTime = THANKS_TIME;
  const result = help(world.score, boostsFor(world.powerUp));
  addPopup(world, result.points, result.multiplier, middle(citizen), citizen.y);
  showMessage(world.messages, HELP_LINE);
  world.quiet = 0;
  events.push({ type: 'helped', points: result.points });
}

// A sign's text pushes aside whatever the message line was saying.
function readSign(world, sign, events) {
  world.messages = createMessages();
  showMessage(world.messages, sign.text, 'white', SIGN_TIME);
  events.push({ type: 'read', text: sign.text });
}

// Where a carried prop is held: in front of Blenke.
function holdProp(player, prop) {
  prop.x = middle(player) + player.facing * CARRY_AHEAD - prop.w / 2;
  prop.y = player.y + player.h - (player.crouching ? CARRY_HEIGHT_CROUCHED : CARRY_HEIGHT) - prop.h;
}

// A prop let go of starts where it was held, unless that is inside a wall;
// then it starts at his feet, where there is always room.
function letGo(world, thrown) {
  const { player } = world;
  const prop = world.carrying;
  world.carrying = null;
  if (!isAreaFree(world.level, prop)) {
    prop.x = middle(player) - prop.w / 2;
    prop.y = player.y + player.h - prop.h;
  }
  releaseProp(prop, { thrown, facing: player.facing, carrierVx: player.vx });
  return prop;
}

function dropCarried(world) {
  if (world.carrying) letGo(world, false);
}

function act(world, input, events) {
  if (!wasPressed(input, 'act') || world.player.hurt > 0) return;
  const action = actionTarget(world);
  if (!action) return;
  const { kind, target } = action;
  if (kind === 'help') helpCitizen(world, target, events);
  else if (kind === 'read') readSign(world, target, events);
  else if (kind === 'throw') events.push({ type: 'tossed', prop: letGo(world, true).type });
  else {
    target.carried = true;
    target.vx = 0;
    target.vy = 0;
    world.carrying = target;
    events.push({ type: 'lifted', prop: target.type });
  }
}

function approachZero(value, delta) {
  return value > 0 ? Math.max(0, value - delta) : Math.min(0, value + delta);
}

// A prop falls and slides to a stop. Thrown, it strikes what it meets
// until it hits a wall or has slid down to a harmless speed. Returns what
// it hit.
function moveProp(prop, level, dt) {
  prop.vy = Math.min(prop.vy + PROP_GRAVITY * dt, PROP_MAX_FALL);
  if (prop.onGround) prop.vx = approachZero(prop.vx, PROP_FRICTION * dt);
  const hit = moveBody(prop, level, dt);
  prop.onGround = hit.onGround;
  if (hit.hitWall || (hit.onGround && Math.abs(prop.vx) < STRIKE_SPEED)) prop.thrown = false;
  return hit;
}

// A thrown prop opens the crates it hits and puts the first enemy it hits
// out of action, bouncing off it.
function updateProps(world, dt, events) {
  for (const prop of world.props) {
    if (prop.carried) {
      holdProp(world.player, prop);
      continue;
    }
    const wasThrown = prop.thrown;
    const hit = moveProp(prop, world.level, dt);
    if (!wasThrown) continue;
    strikeCrates(world, [...hit.wallTiles, ...hit.ceilingTiles], events);
    const enemy = world.enemies.find((candidate) => !candidate.defeated && overlaps(prop, candidate));
    if (!enemy) continue;
    defeatEnemy(world, enemy, 'struck', events);
    prop.thrown = false;
    prop.vx = -prop.vx * PROP_REBOUND;
    prop.vy = -PROP_REBOUND_LIFT;
  }
  const bottom = pixelHeight(world.level) + PIT_DEPTH;
  world.props = world.props.filter((prop) => prop.y <= bottom);
}

// A power-up running out says so.
function updatePowerUps(world, dt, events) {
  if (!updatePowerUp(world.powerUp, dt)) return;
  const { type } = world.powerUp;
  showMessage(world.messages, POWER_UPS[type].ends);
  world.powerUp = null;
  events.push({ type: 'powerUpEnded', powerUp: type });
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
  const moved = updatePlayer(player, input, level, dt, { platforms: world.platforms, ...movementFor(world.powerUp) });
  events.push(...moved);
  for (const event of moved) if (event.type === 'bump') headButt(world, event.tiles, events);

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
  if (hazard === 'hurt') hurtPlayer(world, middle(player) + player.facing, events);

  act(world, input, events);
  updateEnemies(world, input, feetBefore, dt, events);
  updateProjectiles(world, dt, events);
  updateProps(world, dt, events);
  updateItems(world, dt, events);
  for (const citizen of world.citizens) updateCitizen(citizen, player, dt);
  if (world.down > 0) return;
  updateAnimation(world.animation, player, dt);
  updateCamera(camera, player, level, dt);
  updatePowerUps(world, dt, events);

  world.quiet += dt;
  if (world.quiet >= QUIET_TIME) {
    showMessage(world.messages, QUIET_LINE);
    world.quiet = 0;
  }
  world.timeLeft = Math.max(0, world.timeLeft - dt);
  if (world.timeLeft === 0) loseLife(world, 'time', events);
}

// Advances the world by dt and returns the step's events. After a lost life
// it stands still until Blenke is back; after the last, until the game over
// has shown.
export function stepWorld(world, input, dt) {
  const events = [];
  const { player, camera } = world;
  player.px = player.x;
  player.py = player.y;
  camera.px = camera.x;
  camera.py = camera.y;
  for (const prop of world.props) {
    prop.px = prop.x;
    prop.py = prop.y;
  }

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
