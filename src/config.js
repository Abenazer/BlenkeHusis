// Fixed numbers the whole game shares: the internal resolution, the tile size,
// the simulation rate and the tuning of how Lelle moves.

export const VIEW_WIDTH = 384;
export const VIEW_HEIGHT = 216;
export const TILE = 16;

// The simulation always advances by this step, whatever the display's rate.
export const STEP = 1 / 60;
// After a background tab or a hitch, at most this much time is simulated, so
// the loop never tries to catch up on minutes of missed steps.
export const MAX_FRAME_TIME = 0.25;

// Lives Lelle starts a game with.
export const START_LIVES = 3;

export const PLAYER = {
  width: 10,
  height: 22,
  crouchHeight: 14,
  walkSpeed: 95,
  runSpeed: 155,
  crouchSpeed: 40,
  groundAccel: 1000,
  airAccel: 650,
  turnBoost: 1.8,
  groundFriction: 1100,
  airFriction: 220,
  gravity: 1500,
  fallGravity: 1750,
  apexGravityScale: 0.55,
  apexThreshold: 45,
  maxFall: 430,
  jumpSpeed: 470,
  runJumpBonus: 35,
  // Letting go of jump early caps the upward speed at this, so a tap gives a
  // short hop and a held button the full jump.
  jumpCutSpeed: 260,
  coyoteTime: 0.1,
  jumpBuffer: 0.12,
  dropThroughTime: 0.2,
};

