// Particles: dust, stars, splinters, smoke, sparkles, splashes and flying
// paperwork, each a square of one palette colour, one or two art pixels
// wide. They are data in the world, stepped with it and spread by their
// own seeded random numbers, so a test sees exactly what the player sees;
// they never touch the simulation. Which of the world's events throws up
// which burst is BURSTS, as cues.js is for sound. Pure: no DOM.
import { TILE } from './config.js';
import { ENEMIES } from './enemies.js';
import { ITEMS } from './items.js';

// At most this many live at once; a new one past it pushes out the oldest.
export const MAX_PARTICLES = 200;
// The same spread every game: the world's particles start from this seed.
const SEED = 0x5eed1e;
// Landing from this fast (px/s) raises dust; at the hardest landing the most.
export const DUST_LANDING = 250;
const HARDEST_LANDING = 430;

const UP = -Math.PI / 2;
const ALL_ROUND = [0, 2 * Math.PI];

export function createParticles(seed = SEED) {
  return { seed, list: [] };
}

// xorshift32, as the enemies' own (ai.js), in [0, 1).
function nextRandom(particles) {
  let x = particles.seed | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  particles.seed = x;
  return (x >>> 0) / 4294967296;
}

function between(particles, [low, high]) {
  return low + (high - low) * nextRandom(particles);
}

// A burst: count particles from x, y (spread over a box of spreadX ×
// spreadY around it), each flying off at an angle within angle (radians,
// 0 is right, UP is up) at a speed within speed (px/s), pulled down by
// gravity (px/s²) and slowed by drag (a share of its speed lost a second),
// living a time within life (s), in one of colours, size art pixels wide.
function burst({
  x, y, count, colours, angle = ALL_ROUND, speed, gravity = 0, drag = 0, life, size = 1, spreadX = 0, spreadY = 0,
}) {
  return { x, y, count, colours, angle, speed, gravity, drag, life, size, spreadX, spreadY };
}

function spawn(particles, spec) {
  for (let i = 0; i < spec.count; i++) {
    const direction = between(particles, spec.angle);
    const speed = between(particles, spec.speed);
    const x = spec.x + (nextRandom(particles) - 0.5) * spec.spreadX;
    const y = spec.y + (nextRandom(particles) - 0.5) * spec.spreadY;
    particles.list.push({
      x,
      y,
      px: x,
      py: y,
      vx: Math.cos(direction) * speed,
      vy: Math.sin(direction) * speed,
      gravity: spec.gravity,
      drag: spec.drag,
      age: 0,
      life: between(particles, spec.life),
      colour: spec.colours[Math.floor(nextRandom(particles) * spec.colours.length)],
      size: spec.size,
    });
  }
  const over = particles.list.length - MAX_PARTICLES;
  if (over > 0) particles.list.splice(0, over);
}

// Kicked up along the ground both ways from someone's feet.
function dust(x, y, count, speed = [20, 55]) {
  return burst({
    x, y: y - 1, count, colours: ['grey_5', 'grey_6', 'brown_4'], angle: [UP - 1.4, UP + 1.4],
    speed, gravity: 120, drag: 4, life: [0.25, 0.45], spreadX: 6,
  });
}

function stars(x, y, count = 5) {
  return burst({
    x, y, count, colours: ['hivis_4', 'white', 'urine_4'], angle: [UP - 1.1, UP + 1.1],
    speed: [60, 110], gravity: 260, drag: 1, life: [0.3, 0.5],
  });
}

function smoke(x, y, count = 8) {
  return burst({
    x, y, count, colours: ['grey_4', 'grey_5', 'grey_6'], speed: [15, 45], gravity: -30, drag: 3,
    life: [0.35, 0.6], size: 2, spreadX: 8, spreadY: 8,
  });
}

function paperwork(x, y, count) {
  return burst({
    x, y, count, colours: ['white', 'grey_6', 'grey_5'], angle: [UP - 1.3, UP + 1.3],
    speed: [50, 120], gravity: 140, drag: 2.5, life: [0.6, 1], size: 2,
  });
}

// Forms in every colour of the paperwork, high into the air.
function confetti(x, y, count) {
  return burst({
    x, y, count, colours: ['white', 'hivis_3', 'red_4', 'blue_5', 'urine_4', 'slime_4'], angle: [UP - 0.9, UP + 0.9],
    speed: [90, 200], gravity: 220, drag: 1.5, life: [0.8, 1.4], spreadX: 8,
  });
}

// A pickup sparkles in its kind's colours.
const SPARKLE_COLOURS = {
  sample: ['urine_4', 'urine_3', 'white'],
  possession: ['slime_4', 'hivis_4', 'white'],
  evidence: ['blue_5', 'sky_4', 'white'],
  bonus: ['orange_3', 'urine_4', 'white'],
  powerUp: ['hivis_4', 'white', 'sky_4'],
};

function sparkle(x, y, colours, count = 6) {
  return burst({ x, y, count, colours, speed: [40, 70], drag: 6, life: [0.25, 0.4] });
}

function landed(event) {
  if (event.speed < DUST_LANDING) return [];
  const share = Math.min((event.speed - DUST_LANDING) / (HARDEST_LANDING - DUST_LANDING), 1);
  return [dust(event.x, event.y, 3 + Math.round(5 * share), [25, 50 + 40 * share])];
}

// Defeated: a puff of smoke where it was, stars too if it was stomped, and
// the prosecutor goes out in a storm of forms.
function defeated(event) {
  const bursts = [smoke(event.x, event.y)];
  if (event.type === 'stomp') bursts.push(stars(event.x, event.top));
  if (ENEMIES[event.enemy].boss) bursts.push(confetti(event.x, event.top, 40));
  return bursts;
}

function wounded(event) {
  if (ENEMIES[event.enemy].boss) return [paperwork(event.x, event.top, 10)];
  return [stars(event.x, event.top)];
}

function crateOpened(event) {
  return [burst({
    x: (event.col + 0.5) * TILE, y: (event.row + 0.5) * TILE, count: 10, colours: ['brown_3', 'brown_4', 'brown_2'],
    angle: [UP - 1.2, UP + 1.2], speed: [60, 140], gravity: 500, life: [0.4, 0.7], size: 2, spreadX: 10, spreadY: 6,
  })];
}

function collected(event) {
  const colours = SPARKLE_COLOURS[ITEMS[event.item].category];
  if (!colours) throw new Error(`No sparkle for the item '${event.item}'`);
  return [sparkle(event.x, event.y, colours)];
}

// Into the canal with a splash; the last heart in a shower of stars.
function lifeLost(event) {
  if (event.cause === 'water') {
    return [burst({
      x: event.x, y: event.y, count: 14, colours: ['water_4', 'water_3', 'white'], angle: [UP - 0.7, UP + 0.7],
      speed: [80, 170], gravity: 500, life: [0.4, 0.7], spreadX: 8,
    })];
  }
  if (event.cause === 'hurt') return [stars(event.x, event.y, 8)];
  return [];
}

const BURSTS = {
  jump: (event) => [dust(event.x, event.y, 3, [15, 35])],
  land: landed,
  skid: (event) => [dust(event.x, event.y, 4, [20, 45])],
  stomp: defeated,
  struck: defeated,
  wounded,
  crateOpened,
  collected,
  hurt: (event) => [stars(event.x, event.y, 4)],
  shielded: (event) => [paperwork(event.x, event.y, 8)],
  lifeLost,
  secretFound: (event) => [smoke((event.col + 0.5) * TILE, (event.row + 0.5) * TILE, 12)],
  promoted: (event) => [sparkle(event.x, event.y, ['hivis_3', 'hivis_4', 'white'], 14)],
  levelComplete: (event) => [confetti(event.x, event.y, 30)],
};

// The world's events that throw up nothing, and why: every event the
// world sends is either in BURSTS or here (a test holds each to that).
export const NO_BURST = {
  bump: 'a crate it opens splinters; a wall or ceiling just stops him',
  throw: 'what is thrown is seen flying',
  drop: 'what is dropped is seen falling',
  shout: 'the slogan is seen',
  bossAwake: 'the prosecutor rises and his pips show',
  gatesOpened: 'the prosecutor has just gone out in confetti',
  hurry: 'the clock turns red',
  tick: 'the clock is the HUD',
  powerUp: 'its pickup has just sparkled, and the power-up is seen at work',
  powerUpEnded: 'the power-up is seen to stop',
  helped: 'helping a citizen makes no splash, which is the point',
  read: 'the sign is read on the message line',
  lifted: 'the cone is seen in his hands',
  tossed: 'the cone is seen flying',
  checkpoint: 'the phone booth lights up',
  gameOver: 'the life lost has just burst',
};

export function hasBurst(type) {
  return type in BURSTS;
}

// Throws up what the step's events call for.
export function spawnBursts(particles, events) {
  for (const event of events) {
    for (const spec of BURSTS[event.type]?.(event) ?? []) spawn(particles, spec);
  }
}

// Moves every particle on by dt and lets the old ones go.
export function stepParticles(particles, dt) {
  for (const particle of particles.list) {
    particle.px = particle.x;
    particle.py = particle.y;
    const slowing = Math.max(0, 1 - particle.drag * dt);
    particle.vx *= slowing;
    particle.vy = particle.vy * slowing + particle.gravity * dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.age += dt;
  }
  particles.list = particles.list.filter((particle) => particle.age < particle.life);
}
