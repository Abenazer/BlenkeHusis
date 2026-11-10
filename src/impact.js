// Weight on the hits that matter: a hit-stop, a few steps in which the
// world stands still, and a shake of the view. Which of the world's events
// does which is IMPACTS, as cues.js is for sound. The stop is the one
// effect that touches the simulation, and it only holds it back; the
// shake is an offset to where the camera is drawn, never the camera
// itself, so its smooth movement is kept. Pure: no DOM.
import { ENEMIES } from './enemies.js';

// The shake never moves the view further than this, in art pixels.
export const MAX_SHAKE = 3;
// It swings this many times a second either way, on two frequencies apart
// so it never settles into a line.
const SHAKE_RATE_X = 27;
const SHAKE_RATE_Y = 19;
// The hardest landing gives the view a small jolt.
const JOLT_LANDING = 420;

// stop: steps the world stands still; shake: how far the view swings at
// first (art pixels) and how long it takes to settle (seconds).
function impact(stop, shake = 0, time = 0) {
  return { stop, shake, time };
}

function defeated(event) {
  return ENEMIES[event.enemy].boss ? impact(12, 3, 0.5) : impact(3);
}

function wounded(event) {
  return ENEMIES[event.enemy].boss ? impact(6, 2, 0.25) : impact(3);
}

const IMPACTS = {
  stomp: defeated,
  struck: defeated,
  wounded,
  hurt: () => impact(4, 1.5, 0.2),
  shielded: () => impact(3),
  // Only the last heart: the world stands still after a life anyway.
  lifeLost: (event) => (event.cause === 'hurt' ? impact(0, 2.5, 0.3) : impact(0)),
  crateOpened: () => impact(0, 1, 0.12),
  gatesOpened: () => impact(0, 2, 0.6),
  land: (event) => (event.speed >= JOLT_LANDING ? impact(0, 1, 0.12) : impact(0)),
};

// The world's events that stop and shake nothing, and why: every event the
// world sends is either in IMPACTS or here (a test holds each to that).
export const NO_IMPACT = {
  jump: 'a jump is his own, and must never wait',
  skid: 'a turn must answer at once',
  bump: 'a ceiling stops him; a crate it opens jolts',
  splash: 'a splash is light',
  collected: 'pickups come in runs, and a run must flow',
  promoted: 'it comes with the points that earn it',
  powerUp: 'it comes with a pickup',
  powerUpEnded: 'nothing hits',
  throw: 'what is thrown has yet to hit',
  drop: 'nothing hits',
  shout: 'a slogan is hot air',
  bossAwake: 'he rises; the fight has not begun',
  helped: 'helping is quiet work',
  read: 'reading is quiet work',
  lifted: 'a cone is light',
  tossed: 'what is tossed has yet to hit',
  secretFound: 'a secret is found quietly',
  checkpoint: 'a phone booth is no blow',
  levelComplete: 'the goal is a relief, not a blow',
  hurry: 'the clock is on the HUD',
  tick: 'the clock is on the HUD',
  gameOver: 'the life lost has just landed',
  hoseIn: 'plugging in is routine',
  pour: 'pouring is routine',
  gaugeStopped: 'a needle stopping is no blow',
  strum: 'a chord is no blow',
  dive: 'he has yet to land',
};

export function hasImpact(type) {
  return type in IMPACTS;
}

export function createImpact() {
  // stop: steps the world still stands still; the shake swings from
  // strength down to nothing over time, age counting up.
  return { stop: 0, shake: { strength: 0, time: 0, age: 0 } };
}

// Takes the step's events: the longest stop wins, and a harder shake
// replaces a softer one still running.
export function applyImpacts(state, events) {
  for (const event of events) {
    const effect = IMPACTS[event.type]?.(event);
    if (!effect) continue;
    state.stop = Math.max(state.stop, effect.stop);
    if (effect.shake > 0 && effect.shake >= shakeStrength(state.shake, 0)) {
      state.shake = { strength: Math.min(effect.shake, MAX_SHAKE), time: effect.time, age: 0 };
    }
  }
}

// Whether the world stands still this step; counts the stop down if so.
export function holdStill(state) {
  if (state.stop === 0) return false;
  state.stop -= 1;
  return true;
}

// Whether the world is standing still, for drawing it where it stopped.
export function isStill(state) {
  return state.stop > 0;
}

// The shake runs on through a stop.
export function settleShake(state, dt) {
  state.shake.age += dt;
}

function shakeStrength(shake, lag) {
  if (shake.time <= 0) return 0;
  const age = Math.max(0, shake.age - lag);
  return shake.strength * Math.max(0, 1 - age / shake.time);
}

// Where the view is pushed now, { x, y } in art pixels; lag: how far the
// drawn moment is behind the world's last step.
export function shakeOffset(state, lag = 0) {
  const strength = shakeStrength(state.shake, lag);
  if (strength === 0) return { x: 0, y: 0 };
  const age = Math.max(0, state.shake.age - lag);
  return {
    x: strength * Math.sin(age * SHAKE_RATE_X * 2 * Math.PI),
    y: strength * Math.sin(age * SHAKE_RATE_Y * 2 * Math.PI + 1),
  };
}
