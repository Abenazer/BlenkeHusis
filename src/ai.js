// How each enemy behaves: the stoner shuffles and drops samples, the dealer
// runs from Lelle, the party people wander and hop at random, the
// bureaucrat throws paperwork, the technician lobs test tubes at him and
// the ideologue paces and shouts. All walk under gravity and turn at walls
// and ledges rather than fall. Pure: no DOM; their randomness comes from
// their own seed, so a test sees the same thing every time.
import { TILE } from './config.js';
import { ENEMIES, SLOGANS } from './enemies.js';
import { isOneWay, isSolid, pixelHeight, tileAt } from './level.js';
import { moveBody } from './physics.js';
import { createProjectile, PROJECTILES } from './projectiles.js';

const GRAVITY = 1500;
const MAX_FALL = 430;
// How long a throw or a shout holds the enemy still and shows its pose.
export const ACT_TIME = 0.4;
export const SAY_TIME = 1.8;
// How long a defeated enemy lies flat before it goes.
export const DEFEATED_TIME = 0.6;
// Pacing enemies turn round after this long, if nothing turned them sooner.
const PACE_TIME = 3.5;
// Lelle counts as at the same height within this much.
const SAME_LEVEL = 48;
// A thrower's arm is this far up its body.
const HAND_HEIGHT = 0.3;
// A thrown tube is in the air this long, so it comes down near Lelle.
const TUBE_FLIGHT = 0.8;
const TUBE_SPEED = 160;
const PAPER_SPEED = 90;
const SHOUT_SPEED = 120;
// Far enough below the level, a fallen enemy is gone.
const PIT_DEPTH = 48;
// The ideologue turns to Lelle to shout once he is about on screen.
const VIEW_REACH = 200;
// The next of the enemy's random numbers, in [0, 1): xorshift32.
export function nextRandom(enemy) {
  let x = enemy.seed | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  enemy.seed = x;
  return (x >>> 0) / 4294967296;
}

function middle(body) {
  return body.x + body.w / 2;
}

function feet(body) {
  return body.y + body.h;
}

// Whether there is something to stand on just past the enemy's front foot.
export function groundAhead(enemy, level, dir) {
  const x = dir > 0 ? enemy.x + enemy.w + 1 : enemy.x - 1;
  const char = tileAt(level, Math.floor(x / TILE), Math.floor((feet(enemy) + 1) / TILE));
  return isSolid(char) || isOneWay(char);
}

function fall(enemy, level, dt) {
  enemy.vy = Math.min(enemy.vy + GRAVITY * dt, MAX_FALL);
  const hit = moveBody(enemy, level, dt);
  enemy.onGround = hit.onGround;
  enemy.walkTime += Math.abs(enemy.x - enemy.px);
  return hit;
}

// Walks in its facing direction, turning at ledges, walls and after a while.
function pace(enemy, level, dt, speed) {
  enemy.timer += dt;
  if (enemy.timer >= PACE_TIME) {
    enemy.facing = -enemy.facing;
    enemy.timer = 0;
  }
  if (enemy.onGround && !groundAhead(enemy, level, enemy.facing)) enemy.facing = -enemy.facing;
  enemy.vx = enemy.acting > 0 ? 0 : enemy.facing * speed;
  if (fall(enemy, level, dt).hitWall) enemy.facing = -enemy.facing;
}

function lelleNear(enemy, player, range) {
  const dx = middle(player) - middle(enemy);
  return Math.abs(dx) <= range && Math.abs(feet(player) - feet(enemy)) < SAME_LEVEL * 2;
}

function faceLelle(enemy, player) {
  enemy.facing = middle(player) < middle(enemy) ? -1 : 1;
}

function handPosition(enemy) {
  return { x: middle(enemy) + enemy.facing * (enemy.w / 2), y: enemy.y + enemy.h * HAND_HEIGHT };
}

function throwAt(enemy, player, events) {
  const kind = ENEMIES[enemy.type].throws;
  const hand = handPosition(enemy);
  let vx;
  let vy;
  if (kind === 'tube') {
    vx = Math.max(-TUBE_SPEED, Math.min(TUBE_SPEED, (middle(player) - hand.x) / TUBE_FLIGHT));
    vy = (-PROJECTILES.tube.gravity * TUBE_FLIGHT) / 2;
  } else if (kind === 'paper') {
    vx = enemy.facing * PAPER_SPEED;
    vy = -40;
  } else {
    vx = enemy.facing * SHOUT_SPEED;
    vy = 0;
  }
  enemy.acting = ACT_TIME;
  events.push({ type: 'throw', projectile: createProjectile(kind, hand.x, hand.y, vx, vy) });
}

const BEHAVIOURS = {
  stoner(enemy, { level }, dt, events) {
    const data = ENEMIES.stoner;
    pace(enemy, level, dt, data.speed);
    if (enemy.dropsLeft <= 0) return;
    enemy.dropTimer += dt;
    if (enemy.dropTimer < data.dropEvery) return;
    enemy.dropTimer = 0;
    enemy.dropsLeft -= 1;
    events.push({ type: 'drop', item: data.carries, x: middle(enemy), y: enemy.y + enemy.h / 2, vx: enemy.facing * 40, vy: -160 });
  },

  dealer(enemy, { level, player }, dt) {
    const data = ENEMIES.dealer;
    if (!lelleNear(enemy, player, data.fleeRange)) {
      pace(enemy, level, dt, data.speed);
      return;
    }
    enemy.facing = middle(player) < middle(enemy) ? 1 : -1;
    // Cornered at a ledge or a wall, he stops and can be caught.
    const cornered = enemy.onGround && !groundAhead(enemy, level, enemy.facing);
    enemy.vx = cornered ? 0 : enemy.facing * data.fleeSpeed;
    fall(enemy, level, dt);
  },

  partyPerson(enemy, { level }, dt) {
    const data = ENEMIES.partyPerson;
    enemy.timer -= dt;
    if (enemy.timer <= 0) {
      const mood = nextRandom(enemy);
      enemy.dir = mood < 0.4 ? -1 : mood < 0.8 ? 1 : 0;
      enemy.speedShare = 0.5 + nextRandom(enemy) * 0.5;
      enemy.timer = 0.5 + nextRandom(enemy) * 1.1;
      if (enemy.onGround && nextRandom(enemy) < 0.45) enemy.vy = -data.hop;
    }
    if (enemy.dir !== 0) enemy.facing = enemy.dir;
    if (enemy.onGround && enemy.dir !== 0 && !groundAhead(enemy, level, enemy.dir)) enemy.dir = -enemy.dir;
    enemy.vx = enemy.dir * data.speed * enemy.speedShare;
    if (fall(enemy, level, dt).hitWall) enemy.dir = -enemy.dir;
  },

  bureaucrat(enemy, { level, player }, dt, events) {
    const data = ENEMIES.bureaucrat;
    enemy.vx = 0;
    fall(enemy, level, dt);
    faceLelle(enemy, player);
    enemy.attackTimer += dt;
    if (enemy.attackTimer >= data.throwEvery && lelleNear(enemy, player, data.range)) {
      enemy.attackTimer = 0;
      throwAt(enemy, player, events);
    }
  },

  technician(enemy, { level, player }, dt, events) {
    const data = ENEMIES.technician;
    enemy.attackTimer += dt;
    pace(enemy, level, dt, data.speed);
    if (enemy.attackTimer >= data.throwEvery && lelleNear(enemy, player, data.range)) {
      enemy.attackTimer = 0;
      faceLelle(enemy, player);
      throwAt(enemy, player, events);
    }
  },

  ideologue(enemy, { level, player }, dt, events) {
    const data = ENEMIES.ideologue;
    enemy.attackTimer += dt;
    pace(enemy, level, dt, data.speed);
    if (enemy.attackTimer < data.throwEvery) return;
    enemy.attackTimer = 0;
    if (lelleNear(enemy, player, VIEW_REACH)) faceLelle(enemy, player);
    enemy.saying = SLOGANS[enemy.slogan % SLOGANS.length];
    enemy.slogan += 1;
    enemy.sayTime = SAY_TIME;
    throwAt(enemy, player, events);
    events.push({ type: 'shout', text: enemy.saying });
  },
};

// Advances an enemy by dt. Returns its events: a thrown projectile, a
// dropped item, a shouted slogan.
export function updateEnemy(enemy, context, dt) {
  const events = [];
  enemy.px = enemy.x;
  enemy.py = enemy.y;
  if (enemy.defeated) {
    enemy.defeatedTime += dt;
    return events;
  }
  enemy.acting = Math.max(0, enemy.acting - dt);
  enemy.sayTime = Math.max(0, enemy.sayTime - dt);
  if (enemy.sayTime === 0) enemy.saying = null;
  BEHAVIOURS[enemy.type](enemy, context, dt, events);
  return events;
}

// Defeated enemies lie flat a moment; fallen ones are gone at once.
export function isGone(enemy, level) {
  return (enemy.defeated && enemy.defeatedTime >= DEFEATED_TIME) || enemy.y > pixelHeight(level) + PIT_DEPTH;
}
