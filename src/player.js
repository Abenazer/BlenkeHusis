// Lelle's movement: acceleration and friction, a jump whose height follows
// how long the button is held, coyote time, jump buffering, running,
// crouching and dropping through one-way platforms. Pure: no DOM.
import { PLAYER } from './config.js';
import { isHeld, wasPressed } from './input.js';
import { isAreaFree, moveBody } from './physics.js';

// x is the centre of Lelle's feet and y their height, as a level places him.
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

function updateHorizontal(player, dir, run, dt) {
  const topSpeed = player.crouching
    ? PLAYER.crouchSpeed
    : run ? PLAYER.runSpeed : PLAYER.walkSpeed;
  const friction = player.onGround ? PLAYER.groundFriction : PLAYER.airFriction;

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
  let accel = player.onGround ? PLAYER.groundAccel : PLAYER.airAccel;
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

// Advances Lelle by one step and returns what happened, for sound and effects.
export function updatePlayer(player, input, level, dt) {
  const events = [];
  const down = isHeld(input, 'down');
  const jumpHeld = isHeld(input, 'jump');
  const dir = (isHeld(input, 'right') ? 1 : 0) - (isHeld(input, 'left') ? 1 : 0);

  player.jumpBuffer = wasPressed(input, 'jump')
    ? PLAYER.jumpBuffer
    : Math.max(0, player.jumpBuffer - dt);
  player.coyote = player.onGround ? PLAYER.coyoteTime : Math.max(0, player.coyote - dt);
  player.dropThrough = Math.max(0, player.dropThrough - dt);

  updateCrouch(player, level, down);
  updateHorizontal(player, dir, isHeld(input, 'run'), dt);
  updateJump(player, level, down, events);
  applyGravity(player, jumpHeld, dt);

  const wasOnGround = player.onGround;
  const fallSpeed = player.vy;
  const hit = moveBody(player, level, dt, { dropThrough: player.dropThrough > 0 });
  player.onGround = hit.onGround;
  player.groundOneWay = hit.groundOneWay;

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
