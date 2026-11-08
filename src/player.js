// Blenke's movement: acceleration and friction, a jump whose height follows
// how long the button is held, coyote time, jump buffering, running,
// crouching, dropping through one-way platforms, riding moving ones,
// slipping in puddles, and the power-ups' speed and flight; and what a hit
// or a stomp does to him. Pure: no DOM.
import { PLAYER, START_HEALTH } from './config.js';
import { isSlippery } from './hazards.js';
import { isHeld, wasPressed } from './input.js';
import { isAreaFree, moveBody } from './physics.js';

// x is the centre of Blenke's feet and y their height, as a level places him.
export function createPlayer(x, y) {
  return {
    x: x - PLAYER.width / 2,
    y: y - PLAYER.height,
    px: x - PLAYER.width / 2,
    py: y - PLAYER.height,
    w: PLAYER.width,
    h: PLAYER.height,
    vx: 0,
    vy: 0,
    facing: 1,
    onGround: false,
    groundOneWay: false,
    crouching: false,
    jumping: false,
    coyote: 0,
    jumpBuffer: 0,
    dropThrough: 0,
    animTime: 0,
    health: START_HEALTH,
    // Counts down while a hit has taken the controls, and while nothing
    // can hurt him.
    hurt: 0,
    invulnerable: 0,
    // The moving platform he stands on, if any.
    platform: null,
    // Turning round at a run on the ground, digging his heels in.
    skidding: false,
  };
}

function approach(value, target, delta) {
  return value < target ? Math.min(value + delta, target) : Math.max(value - delta, target);
}

// Changing height keeps the feet where they are.
function setHeight(player, height) {
  player.y += player.h - height;
  player.h = height;
}

function canStand(player, level) {
  return isAreaFree(level, {
    x: player.x,
    y: player.y + player.h - PLAYER.height,
    w: player.w,
    h: PLAYER.height,
  });
}

function setCrouching(player, crouching) {
  player.crouching = crouching;
  setHeight(player, crouching ? PLAYER.crouchHeight : PLAYER.height);
}

function updateCrouch(player, level, down) {
  const wantsCrouch = down && player.onGround;
  if (wantsCrouch && !player.crouching) setCrouching(player, true);
  else if (!wantsCrouch && player.crouching && canStand(player, level)) setCrouching(player, false);
}

// Turning against a run on the ground skids, once until the turn is done.
function updateSkid(player, dir, events) {
  const skidding = player.onGround && dir !== 0 && Math.sign(player.vx) === -dir && Math.abs(player.vx) > PLAYER.walkSpeed;
  if (skidding && !player.skidding) events.push({ type: 'skid', x: player.x + player.w / 2, y: player.y + player.h });
  player.skidding = skidding;
}

// grip scales acceleration and friction: less of both in a puddle; speed
// scales the top speeds.
function updateHorizontal(player, dir, run, grip, speed, dt) {
  const topSpeed = speed * (player.crouching
    ? PLAYER.crouchSpeed
    : run ? PLAYER.runSpeed : PLAYER.walkSpeed);
  const friction = (player.onGround ? PLAYER.groundFriction : PLAYER.airFriction) * grip;

  if (dir === 0) {
    player.vx = approach(player.vx, 0, friction * dt);
    return;
  }
  player.facing = dir;
  // Above top speed in the direction held (run let go of, or crouched), the
  // extra speed bleeds off at the friction rate instead of stopping dead.
  if (Math.abs(player.vx) > topSpeed && Math.sign(player.vx) === dir) {
    player.vx = approach(player.vx, dir * topSpeed, friction * dt);
    return;
  }
  let accel = (player.onGround ? PLAYER.groundAccel : PLAYER.airAccel) * grip;
  if (player.vx !== 0 && Math.sign(player.vx) !== dir) accel *= PLAYER.turnBoost;
  player.vx = approach(player.vx, dir * topSpeed, accel * dt);
}

function updateJump(player, level, down, events) {
  if (player.jumpBuffer <= 0 || player.coyote <= 0) return;

  if (down && player.onGround && player.groundOneWay) {
    player.dropThrough = PLAYER.dropThroughTime;
    player.jumpBuffer = 0;
    player.coyote = 0;
    return;
  }
  if (player.crouching) {
    if (!canStand(player, level)) return;
    setCrouching(player, false);
  }
  const running = Math.abs(player.vx) > PLAYER.walkSpeed;
  player.vy = -(PLAYER.jumpSpeed + (running ? PLAYER.runJumpBonus : 0));
  player.jumping = true;
  player.onGround = false;
  player.jumpBuffer = 0;
  player.coyote = 0;
  events.push({ type: 'jump', x: player.x + player.w / 2, y: player.y + player.h });
}

// The helicopter lifts him while jump is held, and lets him down gently
// otherwise; the sky over the level is its ceiling.
function fly(player, jumpHeld, dt) {
  player.jumping = false;
  if (jumpHeld) {
    player.vy = approach(player.vy, -PLAYER.flyRise, PLAYER.flyLift * dt);
  } else {
    player.vy = Math.min(player.vy + PLAYER.fallGravity * dt, PLAYER.flyMaxFall);
  }
  if (player.y <= 0 && player.vy < 0) {
    player.y = 0;
    player.vy = 0;
  }
}

function applyGravity(player, jumpHeld, dt) {
  // Let go early: the jump is cut short, once.
  if (player.jumping && !jumpHeld && player.vy < 0) {
    player.vy = Math.max(player.vy, -PLAYER.jumpCutSpeed);
    player.jumping = false;
  }
  if (player.vy >= 0) player.jumping = false;

  let gravity = player.vy > 0 ? PLAYER.fallGravity : PLAYER.gravity;
  // A held jump hangs a moment at the top, which makes it easier to aim.
  if (jumpHeld && Math.abs(player.vy) < PLAYER.apexThreshold) gravity *= PLAYER.apexGravityScale;
  player.vy = Math.min(player.vy + gravity * dt, PLAYER.maxFall);
}

// Advances Blenke by one step and returns what happened, for sound and
// effects. options: platforms, the moving platforms he can land on; speed,
// what his top speeds are scaled by; flying, whether the helicopter has
// him.
export function updatePlayer(player, input, level, dt, { platforms = [], speed = 1, flying = false } = {}) {
  const events = [];
  player.hurt = Math.max(0, player.hurt - dt);
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  // A hit takes the controls for a moment.
  const control = player.hurt === 0;
  const down = control && isHeld(input, 'down');
  const jumpHeld = control && isHeld(input, 'jump');
  const dir = control ? (isHeld(input, 'right') ? 1 : 0) - (isHeld(input, 'left') ? 1 : 0) : 0;

  player.jumpBuffer = control && wasPressed(input, 'jump')
    ? PLAYER.jumpBuffer
    : Math.max(0, player.jumpBuffer - dt);
  player.coyote = player.onGround ? PLAYER.coyoteTime : Math.max(0, player.coyote - dt);
  player.dropThrough = Math.max(0, player.dropThrough - dt);

  const grip = player.onGround && isSlippery(level, player) ? PLAYER.slipperyGrip : 1;
  updateCrouch(player, level, down);
  updateSkid(player, dir, events);
  updateHorizontal(player, dir, control && isHeld(input, 'run'), grip, speed, dt);
  updateJump(player, level, down, events);
  // In the air the helicopter takes over from the jump.
  if (flying && !player.onGround && !player.jumping) fly(player, jumpHeld, dt);
  else applyGravity(player, jumpHeld, dt);

  const wasOnGround = player.onGround;
  const fallSpeed = player.vy;
  const hit = moveBody(player, level, dt, { dropThrough: player.dropThrough > 0, platforms });
  player.onGround = hit.onGround;
  player.groundOneWay = hit.groundOneWay;
  player.platform = hit.platform;

  if (hit.onGround && !wasOnGround) {
    events.push({ type: 'land', x: player.x + player.w / 2, y: player.y + player.h, speed: fallSpeed });
  }
  if (hit.hitCeiling) {
    player.jumping = false;
    events.push({ type: 'bump', tiles: hit.ceilingTiles });
  }
  player.animTime += dt;
  return events;
}

// A hit: the controls go for a moment as he is knocked back and up, away
// from awayFromX, and then he blinks a while and nothing hurts him.
export function knockBack(player, awayFromX) {
  const middle = player.x + player.w / 2;
  const side = middle < awayFromX ? -1 : middle > awayFromX ? 1 : -player.facing;
  player.vx = side * PLAYER.knockbackX;
  player.vy = -PLAYER.knockbackY;
  player.onGround = false;
  player.jumping = false;
  player.platform = null;
  player.hurt = PLAYER.hurtTime;
  player.invulnerable = PLAYER.invulnerableTime;
}

// Bounced off an enemy he landed on: higher with jump held, and then the
// jump can be cut short as usual.
export function bounce(player, jumpHeld) {
  player.vy = -(jumpHeld ? PLAYER.stompJumpBounce : PLAYER.stompBounce);
  player.jumping = jumpHeld;
  player.onGround = false;
  player.platform = null;
}
