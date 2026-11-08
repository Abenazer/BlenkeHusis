// How each enemy behaves: the stoner shuffles and drops samples, the dealer
// runs from Blenke, the party people wander and hop at random, the
// bureaucrat throws paperwork, the technician lobs test tubes at him, the
// ideologue paces and shouts, and the prosecutor waits for him, then
// lobs binders and skims documents at him, faster with each hit he takes.
// All walk under gravity and turn at walls and ledges rather than fall. Pure: no DOM; their randomness comes from
// their own seed, so a test sees the same thing every time.
import { TILE } from './config.js';
import { ENEMIES, PROSECUTOR_LINES, SLOGANS } from './enemies.js';
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
// How long an enemy that takes more than one hit is stunned by each.
export const HIT_TIME = 1;
// Each hit the prosecutor has taken makes him pace this much faster and
// attack this much sooner (shares of his own speed and wait).
const ANGER_SPEED = 0.6;
const ANGER_HASTE = 0.2;
// Every this many attacks, he skims a document along the floor instead
// of lobbing a binder; it flies at this height over his feet.
const BRIEF_EVERY = 3;
const BRIEF_HEIGHT = 5;
const BINDER_FLIGHT = 0.9;
const BINDER_SPEED = 180;
const BRIEF_SPEED = 120;
// Pacing enemies turn round after this long, if nothing turned them sooner.
const PACE_TIME = 3.5;
// Blenke counts as at the same height within this much.
const SAME_LEVEL = 48;
// A thrower's arm is this far up its body.
const HAND_HEIGHT = 0.3;
// A thrown tube is in the air this long, so it comes down near Blenke.
const TUBE_FLIGHT = 0.8;
const TUBE_SPEED = 160;
const PAPER_SPEED = 90;
const SHOUT_SPEED = 120;
// Far enough below the level, a fallen enemy is gone.
const PIT_DEPTH = 48;
// The ideologue turns to Blenke to shout once he is about on screen.
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

function playerNear(enemy, player, range) {
  const dx = middle(player) - middle(enemy);
  return Math.abs(dx) <= range && Math.abs(feet(player) - feet(enemy)) < SAME_LEVEL * 2;
}

function facePlayer(enemy, player) {
  enemy.facing = middle(player) < middle(enemy) ? -1 : 1;
}

function handPosition(enemy) {
  return { x: middle(enemy) + enemy.facing * (enemy.w / 2), y: enemy.y + enemy.h * HAND_HEIGHT };
}

// A lob that comes down by Blenke after `flight` seconds, if it can fly
// that far.
function lobAt(kind, from, player, flight, speed) {
  return {
    vx: Math.max(-speed, Math.min(speed, (middle(player) - from.x) / flight)),
    vy: (-PROJECTILES[kind].gravity * flight) / 2,
  };
}

function throwAt(enemy, player, events, kind = ENEMIES[enemy.type].throws) {
  let hand = handPosition(enemy);
  let vx;
  let vy;
  if (kind === 'tube') {
    ({ vx, vy } = lobAt(kind, hand, player, TUBE_FLIGHT, TUBE_SPEED));
  } else if (kind === 'binder') {
    ({ vx, vy } = lobAt(kind, hand, player, BINDER_FLIGHT, BINDER_SPEED));
  } else if (kind === 'brief') {
    hand = { x: hand.x, y: feet(enemy) - BRIEF_HEIGHT };
    vx = enemy.facing * BRIEF_SPEED;
    vy = 0;
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
    if (!playerNear(enemy, player, data.fleeRange)) {
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
    facePlayer(enemy, player);
    enemy.attackTimer += dt;
    if (enemy.attackTimer >= data.throwEvery && playerNear(enemy, player, data.range)) {
      enemy.attackTimer = 0;
      throwAt(enemy, player, events);
    }
  },

  technician(enemy, { level, player }, dt, events) {
    const data = ENEMIES.technician;
    enemy.attackTimer += dt;
    pace(enemy, level, dt, data.speed);
    if (enemy.attackTimer >= data.throwEvery && playerNear(enemy, player, data.range)) {
      enemy.attackTimer = 0;
      facePlayer(enemy, player);
      throwAt(enemy, player, events);
    }
  },

  prosecutor(enemy, { level, player }, dt, events) {
    const data = ENEMIES.prosecutor;
    if (!enemy.awake) {
      enemy.vx = 0;
      fall(enemy, level, dt);
      if (!playerNear(enemy, player, data.wakeRange)) return;
      enemy.awake = true;
      facePlayer(enemy, player);
      say(enemy, PROSECUTOR_LINES.wake);
      events.push({ type: 'bossAwake', enemy: enemy.type });
      return;
    }
    if (enemy.hitTime > 0) {
      enemy.vx = 0;
      fall(enemy, level, dt);
      return;
    }
    const anger = data.health - enemy.health;
    enemy.attackTimer += dt;
    pace(enemy, level, dt, data.speed * (1 + anger * ANGER_SPEED));
    if (enemy.attackTimer < data.throwEvery * (1 - anger * ANGER_HASTE)) return;
    enemy.attackTimer = 0;
    enemy.attacks += 1;
    facePlayer(enemy, player);
    throwAt(enemy, player, events, enemy.attacks % BRIEF_EVERY === 0 ? 'brief' : 'binder');
    const { attack } = PROSECUTOR_LINES;
    say(enemy, attack[(enemy.attacks - 1) % attack.length]);
  },

  ideologue(enemy, { level, player }, dt, events) {
    const data = ENEMIES.ideologue;
    enemy.attackTimer += dt;
    pace(enemy, level, dt, data.speed);
    if (enemy.attackTimer < data.throwEvery) return;
    enemy.attackTimer = 0;
    if (playerNear(enemy, player, VIEW_REACH)) facePlayer(enemy, player);
    enemy.saying = SLOGANS[enemy.slogan % SLOGANS.length];
    enemy.slogan += 1;
    enemy.sayTime = SAY_TIME;
    throwAt(enemy, player, events);
    events.push({ type: 'shout', text: enemy.saying, x: middle(enemy) });
  },
};

function say(enemy, text) {
  enemy.saying = text;
  enemy.sayTime = SAY_TIME;
}

// A hit that doesn't defeat the enemy (it has health left): it is stunned
// a moment and says so if it has words for it. Returns false if it was
// already stunned, and the hit doesn't count.
export function woundEnemy(enemy) {
  if (enemy.hitTime > 0) return false;
  enemy.health -= 1;
  enemy.hitTime = HIT_TIME;
  enemy.acting = 0;
  enemy.vx = 0;
  if (enemy.type === 'prosecutor') {
    const { hit } = PROSECUTOR_LINES;
    say(enemy, hit[(ENEMIES.prosecutor.health - enemy.health - 1) % hit.length]);
  }
  return true;
}

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
  enemy.hitTime = Math.max(0, enemy.hitTime - dt);
  enemy.sayTime = Math.max(0, enemy.sayTime - dt);
  if (enemy.sayTime === 0) enemy.saying = null;
  BEHAVIOURS[enemy.type](enemy, context, dt, events);
  return events;
}

// Defeated enemies lie flat a moment; fallen ones are gone at once.
export function isGone(enemy, level) {
  return (enemy.defeated && enemy.defeatedTime >= DEFEATED_TIME) || enemy.y > pixelHeight(level) + PIT_DEPTH;
}
