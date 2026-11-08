// One level being played: the level, Blenke, his animation, the camera, the
// items, the crates, the enemies and what they throw, the moving platforms,
// the citizens, signs, props and scenery, the checkpoints and the goal,
// secret rooms and the boss's gates, the power-up, the score, the lives
// and the particles thrown up, advanced one fixed step at a time. Pure: no
// DOM, and the step length is passed in.
import { isGone, updateEnemy, woundEnemy } from './ai.js';
import { createAnimation, updateAnimation } from './animation.js';
import { createCitizen, THANKS_TIME, updateCitizen } from './citizens.js';
import { PLAYER, START_LIVES, TILE } from './config.js';
import { createCamera, snapCamera, updateCamera } from './camera.js';
import { createEnemy, ENEMIES } from './enemies.js';
import { findLeaks, hazardFor, surfaceCrossed } from './hazards.js';
import { applyImpacts, createImpact, holdStill, settleShake } from './impact.js';
import { createInput, isHeld, wasPressed } from './input.js';
import { createDroppedItem, createItem, INSET, ITEMS, overlaps } from './items.js';
import { checkpointStart, createCheckpoint, createGoal, goalPole, hasPassed } from './landmarks.js';
import { openCrate, openGates, parseLevel, pixelHeight, revealRoom, SECRET_WALL, tileAt } from './level.js';
import { createMessages, showMessage, updateMessages } from './messages.js';
import { isAreaFree, moveBody, pushBody } from './physics.js';
import { createParticles, spawnBursts, stepParticles, stirSurroundings } from './particles.js';
import { createPlatforms, updatePlatforms } from './platforms.js';
import { bounce, createPlayer, knockBack, updatePlayer } from './player.js';
import { boostsFor, hasEffect, movementFor, POWER_UPS, startPowerUp, updatePowerUp } from './powerups.js';
import { updateProjectile } from './projectiles.js';
import { createProp, PROP_FRICTION, PROP_GRAVITY, PROP_MAX_FALL, releaseProp, STRIKE_SPEED } from './props.js';
import { createScenery } from './scenery.js';
import { createTally, levelTotals } from './report.js';
import { collect, createScore, defeat, help, updateScore } from './score.js';

// How far below the level something falls before it counts as lost in a pit.
const PIT_DEPTH = 48;
// How long the level's name shows as it starts.
const TITLE_TIME = 3;
// A hidden item shows once Blenke's middle comes this close to its own.
export const REVEAL_DISTANCE = 40;
// How long the points from a pickup float above where it was.
export const POPUP_TIME = 0.8;
// The clock warns once when this little is left (the HUD turns it red),
// and ticks every second of the last TICK_TIME.
export const HURRY_TIME = 30;
export const TICK_TIME = 10;
// After this long without a pickup, the game nudges Blenke on.
export const QUIET_TIME = 30;
export const QUIET_LINE = 'INGEN GROV BROTTSLIGHET UPPTÄCKT. FORTSÄTT LETA!';
// A collected item leaps up and blinks out over this long.
export const LEAP_TIME = 0.35;

// How far through its leap a collected item is drawn, 0 to 1, lag seconds
// behind the world's last step; null once the leap is over. An ended leap
// stays ended however far behind the drawing is, or the item would hang
// in the air.
export function leapShare(item, lag = 0) {
  if (!item.collected || item.leap >= LEAP_TIME) return null;
  return Math.max(0, item.leap - lag) / LEAP_TIME;
}
// How long ago each of the HUD's numbers last changed, for its hop.
function createHops() {
  return { score: Infinity, samples: Infinity, possession: Infinity, lives: Infinity, health: Infinity };
}

// After a life is lost everything stands still this long, then Blenke is
// back at the start.
export const DOWN_TIME = 1.2;
// After the last life the world stands still this long, its line showing,
// before the game over screen takes over.
export const GAME_OVER_TIME = 2;
// After the goal, this long before the report.
export const COMPLETE_TIME = 3;
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
// A boss shrugs Blenke off its head this fast sideways, so he can't keep
// bouncing on it.
const BOSS_SHRUG = 180;
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
export const CHECKPOINT_LINE = 'KONTROLLPUNKT. LÄGESRAPPORTEN SPARAD.';
export const SECRET_LINE = 'HEMLIGT RUM! HÄR GÖMMER SIG STATISTIKEN.';
export const BOSS_LINE = 'ÅKLAGAREN NEDLAGD. SPÄRREN HÄVD.';
export const COMPLETE_LINE = 'UPPDRAGET SLUTFÖRT. SKATTEPENGAR VÄL ANVÄNDA.';

// What Blenke does after the goal: nothing, while he lands.
const NO_INPUT = createInput();

function startPosition(level) {
  return { x: (level.start.col + 0.5) * TILE, y: (level.start.row + 1) * TILE };
}

// run: what a game carries from level to level, { score, lives }; without
// it the world starts a game afresh. The score is taken over, not copied,
// and its combo starts over.
export function createWorld(definition, run = null) {
  const level = parseLevel(definition);
  const score = run?.score ?? createScore();
  score.chain = 0;
  score.comboTime = 0;
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
  const scenery = level.markers
    .filter((marker) => marker.type === 'scenery')
    .map((marker) => createScenery(marker.scenery, marker.col, marker.row, TILE));
  const checkpoints = level.markers
    .filter((marker) => marker.type === 'checkpoint')
    .sort((a, b) => a.col - b.col)
    .map((marker) => createCheckpoint(marker.col, marker.row, TILE));
  const goalMarker = level.markers.find((marker) => marker.type === 'goal');
  const messages = createMessages();
  showMessage(messages, level.title, 'white', TITLE_TIME);
  return {
    level,
    player,
    animation: createAnimation(),
    camera: createCamera(player, level),
    time: 0,
    timeLeft: level.time,
    lives: run?.lives ?? START_LIVES,
    items,
    enemies,
    projectiles: [],
    platforms: createPlatforms(level.markers),
    leaks: findLeaks(level),
    citizens,
    signs,
    props,
    scenery,
    checkpoints,
    goal: goalMarker ? createGoal(goalMarker.col, goalMarker.row, TILE) : null,
    // Where a lost life starts Blenke again: the last checkpoint passed,
    // or the start.
    restart: start,
    // The prop Blenke is carrying, if any.
    carrying: null,
    // The active power-up, { type, timeLeft }, or null.
    powerUp: null,
    // Crates jolting after being opened.
    bumps: [],
    score,
    // What the level holds to be found, counted before anything is
    // opened, and what has been found of it here (the score counts the
    // whole game).
    totals: levelTotals(level),
    tally: createTally(),
    messages,
    popups: [],
    // How long ago each of the HUD's numbers changed (hud.js hops them).
    hops: createHops(),
    // How long Blenke has been in the level since he came in or came
    // back after a lost life (the iris opens on him).
    arrived: 0,
    // Dust, stars, splinters and the like (particles.js).
    particles: createParticles(),
    // The hit-stop and the view's shake (impact.js).
    impact: createImpact(),
    quiet: 0,
    // Counts down after a life is lost; Blenke is back when it runs out.
    down: 0,
    lossCause: null,
    over: false,
    overTime: 0,
    // Set when Blenke reaches the goal; counts up from then.
    complete: false,
    completeTime: 0,
  };
}

// Whether the game over has shown long enough for the game to start over.
export function isGameOverDone(world) {
  return world.over && world.overTime >= GAME_OVER_TIME;
}

// Whether the completed level has shown long enough to move on.
export function isLevelDone(world) {
  return world.complete && world.completeTime >= COMPLETE_TIME;
}

function respawn(world) {
  const start = world.restart;
  world.player = createPlayer(start.x, start.y);
  // Something may be standing at the start; he gets a moment to move.
  world.player.invulnerable = PLAYER.invulnerableTime;
  world.animation = createAnimation();
  world.timeLeft = world.level.time;
  world.projectiles = [];
  world.down = 0;
  world.lossCause = null;
  world.arrived = 0;
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
  world.hops.lives = 0;
  events.push({ type: 'lifeLost', cause, lives: world.lives, x: middle(player), y: cause === 'water' ? player.y + player.h / 2 : player.y });
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
    events.push({ type: 'shielded', x: middle(player), y: player.y });
    return;
  }
  player.health -= 1;
  world.hops.health = 0;
  events.push({ type: 'hurt', health: player.health, x: middle(player), y: player.y });
  if (player.health <= 0) loseLife(world, 'hurt', events);
  else knockBack(player, fromX);
}

function addPopup(world, points, multiplier, x, y) {
  world.hops.score = 0;
  world.popups.push({ text: `+${points}`, colour: multiplier > 1 ? 'orange_3' : 'white', x, y, age: 0 });
}

function middle(body) {
  return body.x + body.w / 2;
}

// Where something happened to an enemy, for what flies off it: its middle
// and the top of its head.
function whereOf(enemy) {
  return { x: middle(enemy), y: enemy.y + enemy.h / 2, top: enemy.y };
}

// Something falling into water or slime splashes where it goes in.
// before: where its bottom was a step ago.
function splashInto(world, body, before, after, events) {
  const surface = surfaceCrossed(world.level, middle(body), before, after);
  if (surface) events.push({ type: 'splash', liquid: surface.liquid, x: middle(body), y: surface.y });
}

// Whatever else went into a liquid this step: props, dropped items and
// enemies (Blenke splashes as he moves, before he can drown).
function splashes(world, events) {
  for (const prop of world.props) splashInto(world, prop, prop.py + prop.h, prop.y + prop.h, events);
  for (const item of world.items) {
    if (!item.collected && item.falling) splashInto(world, item, item.py + item.h + INSET, item.y + item.h + INSET, events);
  }
  for (const enemy of world.enemies) splashInto(world, enemy, enemy.py + enemy.h, enemy.y + enemy.h, events);
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
  if (data.boss) {
    openGates(world.level);
    announce(world, BOSS_LINE);
    events.push({ type: 'gatesOpened' });
  }
  enemy.defeated = true;
  enemy.vx = 0;
  world.tally.enemies += 1;
  const result = defeat(world.score, enemy.type, boostsFor(world.powerUp));
  addPopup(world, result.points, result.multiplier, middle(enemy), enemy.y);
  showMessage(world.messages, DEFEAT_LINE);
  // What it carries falls out, unless the stoner has handed it all out.
  if (data.carries && (data.drops === undefined || enemy.dropsLeft > 0)) {
    drop(world, data.carries, middle(enemy), enemy.y + enemy.h / 2, 0, -DROP_POP);
  }
  world.quiet = 0;
  events.push({ type: how, enemy: enemy.type, points: result.points, ...whereOf(enemy) });
}

// An enemy with more than one hit in it is wounded until the last; one
// still stunned from the last hit takes no more.
function hitEnemy(world, enemy, how, events) {
  if (enemy.health <= 1) {
    defeatEnemy(world, enemy, how, events);
    return;
  }
  if (woundEnemy(enemy)) events.push({ type: 'wounded', how, enemy: enemy.type, health: enemy.health, ...whereOf(enemy) });
}

function stomp(world, enemy, input, events) {
  const { player } = world;
  bounce(player, isHeld(input, 'jump'));
  if (ENEMIES[enemy.type].boss) player.vx = (middle(player) < middle(enemy) ? -1 : 1) * BOSS_SHRUG;
  hitEnemy(world, enemy, 'stomp', events);
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
    } else if (!ENEMIES[enemy.type].harmless && enemy.hitTime === 0) {
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
  const { messages, score } = world;
  item.collected = true;
  item.leap = 0;
  world.tally[ITEMS[item.type].category] += 1;
  const before = { samples: score.samples, possessions: score.possessions };
  const result = collect(score, item.type, boostsFor(world.powerUp));
  if (score.samples !== before.samples) world.hops.samples = 0;
  if (score.possessions !== before.possessions) world.hops.possession = 0;
  addPopup(world, result.points, result.multiplier, middle(item), item.y);
  if (result.line) showMessage(messages, result.line);
  if (result.milestone) showMessage(messages, `DU HAR SAMLAT ${result.milestone} PROV. UTMÄRKT ARBETE, BLENKE!`);
  if (result.promotedTo) {
    showMessage(messages, `BEFORDRAD TILL ${result.promotedTo.title.toUpperCase()}!`, 'hivis_3');
    events.push({ type: 'promoted', rank: result.promotedTo.title, x: middle(world.player), y: world.player.y + world.player.h / 2 });
  }
  if (ITEMS[item.type].category === 'powerUp') {
    world.powerUp = startPowerUp(item.type);
    events.push({ type: 'powerUp', powerUp: item.type });
  }
  world.quiet = 0;
  // chain: how many pickups the combo has run to, for the sound's pitch.
  events.push({ type: 'collected', item: item.type, points: result.points, chain: world.score.chain, x: middle(item), y: item.y + item.h / 2 });
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

// Collected items leaping away, the HUD's numbers hopping and the lit
// phone booths: each counts how long ago.
function updateBounces(world, dt) {
  for (const item of world.items) if (item.collected && item.leap < LEAP_TIME) item.leap += dt;
  for (const key of Object.keys(world.hops)) world.hops[key] += dt;
  for (const checkpoint of world.checkpoints) if (checkpoint.passed) checkpoint.passedTime += dt;
  world.arrived += dt;
}

// What runs whatever else is going on: the combo clock, floating points,
// jolting crates, things bouncing and the message line.
function updateTimers(world, dt) {
  updateScore(world.score, dt);
  updatePopups(world, dt);
  updateBounces(world, dt);
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
  world.tally.citizens += 1;
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
    const enemy = world.enemies.find((candidate) => !candidate.defeated && candidate.hitTime === 0 && overlaps(prop, candidate));
    if (!enemy) continue;
    hitEnemy(world, enemy, 'struck', events);
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

// Stepping into a secret wall shows the room behind it.
function findSecrets(world, events) {
  const { player, level } = world;
  const left = Math.floor(player.x / TILE);
  const right = Math.floor((player.x + player.w - 0.001) / TILE);
  const top = Math.floor(player.y / TILE);
  const bottom = Math.floor((player.y + player.h - 0.001) / TILE);
  for (let row = top; row <= bottom; row++) {
    for (let col = left; col <= right; col++) {
      if (tileAt(level, col, row) !== SECRET_WALL) continue;
      revealRoom(level, col, row);
      world.tally.rooms += 1;
      showMessage(world.messages, SECRET_LINE, 'hivis_3');
      events.push({ type: 'secretFound', col, row });
    }
  }
}

// Each checkpoint Blenke passes becomes where he starts again.
function passCheckpoints(world, events) {
  for (const checkpoint of world.checkpoints) {
    if (checkpoint.passed || !hasPassed(checkpoint, world.player)) continue;
    checkpoint.passed = true;
    checkpoint.passedTime = 0;
    world.restart = checkpointStart(checkpoint);
    showMessage(world.messages, CHECKPOINT_LINE, 'blue_5');
    events.push({ type: 'checkpoint', col: checkpoint.col });
  }
}

function reachGoal(world, events) {
  if (!world.goal || !overlaps(world.player, goalPole(world.goal))) return;
  dropCarried(world);
  world.complete = true;
  world.completeTime = 0;
  announce(world, COMPLETE_LINE, COMPLETE_TIME);
  events.push({ type: 'levelComplete', timeLeft: world.timeLeft, x: middle(world.player), y: world.player.y });
}

// After the goal the world stands still, but Blenke comes down to stand
// and the camera settles on him.
function finish(world, dt) {
  const { player, level } = world;
  world.completeTime += dt;
  player.invulnerable = 0;
  updatePlayer(player, NO_INPUT, level, dt, { platforms: world.platforms });
  updateAnimation(world.animation, player, dt);
  updateCamera(world.camera, player, level, dt);
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
  splashInto(world, player, player.py + player.h, player.y + player.h, events);

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
  findSecrets(world, events);

  act(world, input, events);
  updateEnemies(world, input, feetBefore, dt, events);
  updateProjectiles(world, dt, events);
  updateProps(world, dt, events);
  updateItems(world, dt, events);
  splashes(world, events);
  for (const citizen of world.citizens) updateCitizen(citizen, player, dt);
  if (world.down > 0) return;
  passCheckpoints(world, events);
  reachGoal(world, events);
  updateAnimation(world.animation, player, dt);
  updateCamera(camera, player, level, dt);
  if (world.complete) return;
  updatePowerUps(world, dt, events);

  world.quiet += dt;
  if (world.quiet >= QUIET_TIME) {
    showMessage(world.messages, QUIET_LINE);
    world.quiet = 0;
  }
  const before = world.timeLeft;
  world.timeLeft = Math.max(0, world.timeLeft - dt);
  if (world.timeLeft === 0) loseLife(world, 'time', events);
  else clockEvents(before, world.timeLeft, events);
}

function clockEvents(before, after, events) {
  if (before > HURRY_TIME && after <= HURRY_TIME) events.push({ type: 'hurry' });
  if (after < TICK_TIME && Math.ceil(after) < Math.ceil(before)) events.push({ type: 'tick', left: Math.ceil(after) });
}

// Advances the world by dt and returns the step's events. After a lost life
// it stands still until Blenke is back; after the last, until the game over
// has shown; after the goal, for good. During a hit-stop it stands still
// altogether, but a jump pressed then is kept for when it moves again.
export function stepWorld(world, input, dt) {
  const events = [];
  const { player, camera } = world;
  settleShake(world.impact, dt);
  if (holdStill(world.impact)) {
    if (wasPressed(input, 'jump') && player.hurt === 0) player.jumpBuffer = PLAYER.jumpBuffer;
    return events;
  }
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
  } else if (world.complete) {
    finish(world, dt);
  } else if (world.down > 0) {
    world.down -= dt;
    if (world.down <= 0) respawn(world);
  } else {
    play(world, input, dt, events);
  }
  updateTimers(world, dt);
  stepParticles(world.particles, dt);
  spawnBursts(world.particles, events);
  stirSurroundings(world.particles, { level: world.level, leaks: world.leaks, camera, time: world.time, dt });
  applyImpacts(world.impact, events);
  return events;
}
