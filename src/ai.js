// How each enemy behaves: the stoner shuffles and drops samples, the dealer
// runs from Blenke, the party people wander and hop at random, the
// bureaucrat throws paperwork, the technician lobs test tubes at him, the
// ideologue paces and shouts, and the prosecutor waits for him, then
// lobs binders and skims documents at him, faster with each hit he takes.
// The hippie wanders and sits down to strum; the headbanger bangs his head
// and stage-dives at Blenke; the punk pogos; the synth jerks along and
// plays square waves at him; the breakdancer spins and freezes; the raver
// dances and lobs glow sticks; the goth fades in and drifts towards him;
// the raggare cruises in his car, its roof a platform; the progg activist
// marches under her banner; the skater rolls and ollies, and his board
// rolls on without him. Enemies with lines say them
// as Blenke comes near.
// All walk under gravity and turn at walls and ledges rather than fall. Pure: no DOM; their randomness comes from
// their own seed, so a test sees the same thing every time.
import { TILE } from './config.js';
import { ENEMIES, placeDeck, PROSECUTOR_LINES, SLOGANS } from './enemies.js';
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
// A glow stick comes down near Blenke after this long.
const GLOW_FLIGHT = 0.7;
const GLOW_SPEED = 140;
const PAPER_SPEED = 90;
const WAVE_SPEED = 100;
const SHOUT_SPEED = 120;
// Far enough below the level, a fallen enemy is gone.
const PIT_DEPTH = 48;
// The ideologue turns to Blenke to shout once he is about on screen.
const VIEW_REACH = 200;
// A fading enemy (the goth) is there to touch once this much of him shows.
const PRESENT_SHARE = 0.5;
// After a line, an enemy with lines waits this long before the next.
const TALK_GAP = 4;
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

function standable(level, col, row) {
  const char = tileAt(level, col, row);
  return isSolid(char) || isOneWay(char);
}

// Whether a gap ahead has ground again within `reach` tiles, on the row
// the enemy stands on.
function landingAhead(enemy, level, dir, reach) {
  const front = dir > 0 ? enemy.x + enemy.w : enemy.x;
  const row = Math.floor((feet(enemy) + 1) / TILE);
  for (let k = 1; k <= reach + 1; k++) {
    if (standable(level, Math.floor((front + dir * k * TILE) / TILE), row)) return true;
  }
  return false;
}

// What stands just in front of the enemy's lower body: nothing (null), a
// low wall with room above it ('low'), or a high one ('high').
function wallAhead(enemy, level, dir) {
  const col = Math.floor((dir > 0 ? enemy.x + enemy.w + 2 : enemy.x - 2) / TILE);
  const row = Math.floor((feet(enemy) - 1) / TILE);
  if (!isSolid(tileAt(level, col, row))) return null;
  return isSolid(tileAt(level, col, row - 1)) || isSolid(tileAt(level, col, row - 2)) ? 'high' : 'low';
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
function pace(enemy, level, dt, speed, paceTime = PACE_TIME) {
  enemy.timer += dt;
  if (enemy.timer >= paceTime) {
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
  } else if (kind === 'glowStick') {
    ({ vx, vy } = lobAt(kind, hand, player, GLOW_FLIGHT, GLOW_SPEED));
  } else if (kind === 'binder') {
    ({ vx, vy } = lobAt(kind, hand, player, BINDER_FLIGHT, BINDER_SPEED));
  } else if (kind === 'brief') {
    hand = { x: hand.x, y: feet(enemy) - BRIEF_HEIGHT };
    vx = enemy.facing * BRIEF_SPEED;
    vy = 0;
  } else if (kind === 'wave') {
    vx = enemy.facing * WAVE_SPEED;
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

  // Walks a while, then sits down and strums, holding still (acting)
  // while he plays.
  hippie(enemy, { level }, dt, events) {
    const data = ENEMIES.hippie;
    if (enemy.acting > 0) {
      enemy.vx = 0;
      fall(enemy, level, dt);
      enemy.attackTimer += dt;
      if (enemy.attackTimer < data.strumEvery) return;
      enemy.attackTimer = 0;
      events.push({ type: 'strum', x: middle(enemy), y: enemy.y });
      return;
    }
    pace(enemy, level, dt, data.speed);
    enemy.stateTime += dt;
    if (enemy.stateTime < data.sitEvery || !enemy.onGround) return;
    enemy.stateTime = 0;
    enemy.acting = data.sitTime;
    enemy.attackTimer = 0;
  },

  // Bangs his head where he stands; rested, and with Blenke near on his
  // own floor, he dives at him, showing the dive (acting) until he lands.
  headbanger(enemy, { level, player }, dt, events) {
    const data = ENEMIES.headbanger;
    if (enemy.state === 'dive') {
      fall(enemy, level, dt);
      if (!enemy.onGround) return;
      enemy.state = null;
      enemy.acting = 0;
      enemy.vx = 0;
      enemy.stateTime = 0;
      return;
    }
    enemy.vx = 0;
    fall(enemy, level, dt);
    facePlayer(enemy, player);
    enemy.stateTime += dt;
    if (enemy.stateTime < data.diveRest || !enemy.onGround || !playerNear(enemy, player, data.diveRange)) return;
    enemy.state = 'dive';
    enemy.acting = Infinity;
    enemy.vx = Math.max(-data.diveSpeed, Math.min(data.diveSpeed, (middle(player) - middle(enemy)) / data.diveFlight));
    enemy.vy = -data.diveLift;
    events.push({ type: 'dive', enemy: enemy.type, x: middle(enemy), y: enemy.y });
  },

  // Lands, waits a moment, and bounces again: mostly straight up, now and
  // then sideways, turning at ledges and walls rather than fall.
  punk(enemy, { level }, dt) {
    const data = ENEMIES.punk;
    if (fall(enemy, level, dt).hitWall) enemy.dir = -enemy.dir;
    if (!enemy.onGround) return;
    enemy.vx = 0;
    enemy.stateTime += dt;
    if (enemy.stateTime < data.pogoWait) return;
    enemy.stateTime = 0;
    enemy.dir = nextRandom(enemy) < data.sideways ? (nextRandom(enemy) < 0.5 ? -1 : 1) : 0;
    if (enemy.dir !== 0 && !groundAhead(enemy, level, enemy.dir)) enemy.dir = -enemy.dir;
    if (enemy.dir !== 0) enemy.facing = enemy.dir;
    enemy.vx = enemy.dir * data.speed;
    enemy.vy = -data.pogoLift;
  },

  // A beat walking, a beat standing still, and arpeggios at Blenke when
  // he is near.
  synth(enemy, { level, player }, dt, events) {
    const data = ENEMIES.synth;
    enemy.stateTime = (enemy.stateTime + dt) % (2 * data.jerk);
    pace(enemy, level, dt, enemy.stateTime < data.jerk ? data.speed : 0);
    enemy.attackTimer += dt;
    if (enemy.attackTimer < data.throwEvery || !playerNear(enemy, player, data.range)) return;
    enemy.attackTimer = 0;
    facePlayer(enemy, player);
    throwAt(enemy, player, events);
  },

  // Spins, drifting a little, then freezes in a pose (acting) and says
  // so, then spins again.
  breakdancer(enemy, { level }, dt, events) {
    const data = ENEMIES.breakdancer;
    if (enemy.acting > 0) {
      enemy.vx = 0;
      fall(enemy, level, dt);
      return;
    }
    if (enemy.state !== 'spin') {
      enemy.state = 'spin';
      enemy.stateTime = 0;
    }
    pace(enemy, level, dt, data.speed);
    enemy.stateTime += dt;
    if (enemy.stateTime < data.spinTime) return;
    enemy.state = 'freeze';
    enemy.acting = data.freezeTime;
    say(enemy, data.freezeLine);
    events.push({ type: 'freeze', x: middle(enemy), y: enemy.y });
  },

  // Dances along, hopping to the beat, and lobs a glow stick at Blenke
  // when he is near.
  raver(enemy, { level, player }, dt, events) {
    const data = ENEMIES.raver;
    pace(enemy, level, dt, data.speed);
    enemy.stateTime += dt;
    if (enemy.stateTime >= data.hopEvery && enemy.onGround) {
      enemy.stateTime = 0;
      enemy.vy = -data.hop;
    }
    enemy.attackTimer += dt;
    if (enemy.attackTimer < data.throwEvery || !playerNear(enemy, player, data.range)) return;
    enemy.attackTimer = 0;
    facePlayer(enemy, player);
    throwAt(enemy, player, events);
  },

  // Unseen until Blenke comes near; then fades in and drifts towards him,
  // stopping at ledges, and fades out once he has gone.
  goth(enemy, { level, player }, dt, events) {
    const data = ENEMIES.goth;
    const before = enemy.shown;
    const fade = dt / data.fadeTime;
    if (playerNear(enemy, player, data.appearRange)) enemy.shown = Math.min(1, enemy.shown + fade);
    else if (!playerNear(enemy, player, data.vanishRange)) enemy.shown = Math.max(0, enemy.shown - fade);
    else if (enemy.shown > 0) enemy.shown = Math.min(1, enemy.shown + fade);
    if (before === 0 && enemy.shown > 0) events.push({ type: 'appear', x: middle(enemy), y: enemy.y });
    enemy.vx = 0;
    if (enemy.shown > 0) {
      facePlayer(enemy, player);
      if (Math.abs(middle(player) - middle(enemy)) > 2 && (!enemy.onGround || groundAhead(enemy, level, enemy.facing))) enemy.vx = enemy.facing * data.speed;
    }
    fall(enemy, level, dt);
  },

  // Cruises back and forth, turning at ledges and walls; a cheer and the
  // horn when Blenke lands on his roof.
  raggare(enemy, { level, player }, dt, events) {
    const data = ENEMIES.raggare;
    pace(enemy, level, dt, data.speed, data.paceTime);
    const riding = player.platform === enemy.deck;
    if (riding && !enemy.ridden) {
      say(enemy, data.rideLine);
      events.push({ type: 'honk', x: middle(enemy), y: enemy.y });
    }
    enemy.ridden = riding;
  },

  proggActivist(enemy, { level }, dt) {
    pace(enemy, level, dt, ENEMIES.proggActivist.speed);
  },

  // Rolls on, turning now and then; on the ground he ollies over a gap he
  // can clear, a low wall and Blenke ahead, and turns at anything else.
  skater(enemy, { level, player }, dt, events) {
    const data = ENEMIES.skater;
    enemy.timer += dt;
    if (enemy.timer >= data.turnEvery && enemy.onGround) {
      enemy.timer = 0;
      enemy.facing = -enemy.facing;
    }
    if (enemy.onGround) {
      const dir = enemy.facing;
      const ahead = (middle(player) - middle(enemy)) * dir;
      const wall = wallAhead(enemy, level, dir);
      let ollie = false;
      if (!groundAhead(enemy, level, dir)) {
        if (landingAhead(enemy, level, dir, data.gapReach)) ollie = true;
        else enemy.facing = -dir;
      } else if (wall === 'low') {
        ollie = true;
      } else if (wall === 'high') {
        enemy.facing = -dir;
      } else if (ahead > 0 && ahead < data.ollieAhead && Math.abs(feet(player) - feet(enemy)) < TILE) {
        ollie = true;
      }
      if (ollie) {
        enemy.vy = -data.ollieLift;
        events.push({ type: 'ollie', x: middle(enemy), y: feet(enemy) });
      }
    }
    enemy.vx = enemy.facing * data.speed;
    if (fall(enemy, level, dt).hitWall) enemy.facing = -enemy.facing;
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

// An enemy with lines says the next when Blenke comes near, if it isn't
// already saying something, and then waits a while.
function chatter(enemy, player, dt) {
  const { lines, talkRange } = ENEMIES[enemy.type];
  if (!lines) return;
  enemy.talkWait = Math.max(0, enemy.talkWait - dt);
  if (enemy.saying || enemy.talkWait > 0 || !playerNear(enemy, player, talkRange)) return;
  say(enemy, lines[enemy.talk % lines.length]);
  enemy.talk += 1;
  enemy.talkWait = SAY_TIME + TALK_GAP;
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
    if (enemy.deck) rollBoard(enemy, context.level, dt);
    return events;
  }
  enemy.acting = Math.max(0, enemy.acting - dt);
  enemy.hitTime = Math.max(0, enemy.hitTime - dt);
  enemy.sayTime = Math.max(0, enemy.sayTime - dt);
  if (enemy.sayTime === 0) enemy.saying = null;
  BEHAVIOURS[enemy.type](enemy, context, dt, events);
  if (enemy.deck) placeDeck(enemy);
  chatter(enemy, context.player, dt);
  return events;
}

// Whether landing on the enemy now hurts Blenke instead of stomping it:
// the punk's mohawk on her way up, the breakdancer's legs as he spins,
// the progg activist under her banner always.
export function isSpiky(enemy) {
  const data = ENEMIES[enemy.type];
  if (data.stompProof === true) return true;
  if (data.spikySpinning === true && enemy.state === 'spin') return true;
  return data.spikyRising === true && !enemy.onGround && enemy.vy < 0;
}

// Whether enough of the enemy shows for it to touch or be touched.
export function isPresent(enemy) {
  return enemy.shown >= PRESENT_SHARE;
}

// A skater put out of action loses his board: it rolls on from under him
// the way he was going, as his deck.
export function launchBoard(enemy) {
  const board = ENEMIES[enemy.type].board;
  const x = middle(enemy) - board.width / 2;
  const y = feet(enemy) - board.height;
  enemy.deck = { x, y, w: board.width, h: board.height, px: x, py: y, dx: 0, dy: 0, vx: enemy.facing * board.speed, vy: 0, time: board.time };
}

// The board rolls under gravity, slowing, stops at a wall, and is gone
// when its time is up or it has fallen out of the level.
function rollBoard(enemy, level, dt) {
  const board = enemy.deck;
  const data = ENEMIES[enemy.type].board;
  board.px = board.x;
  board.py = board.y;
  board.time -= dt;
  board.vy = Math.min(board.vy + GRAVITY * dt, MAX_FALL);
  const hit = moveBody(board, level, dt);
  if (hit.hitWall) board.vx = 0;
  else if (hit.onGround) board.vx = Math.sign(board.vx) * Math.max(0, Math.abs(board.vx) - data.friction * dt);
  board.dx = board.x - board.px;
  board.dy = board.y - board.py;
  if (board.time > 0 && board.y <= pixelHeight(level) + PIT_DEPTH) return;
  board.dx = 0;
  board.dy = 0;
  enemy.deck = null;
}

// Defeated enemies lie flat a moment, and stay while their board rolls;
// fallen ones are gone at once.
export function isGone(enemy, level) {
  return (enemy.defeated && enemy.defeatedTime >= DEFEATED_TIME && !enemy.deck) || enemy.y > pixelHeight(level) + PIT_DEPTH;
}
