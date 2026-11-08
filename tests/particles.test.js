import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { STEP, TILE } from '../src/config.js';
import { findLeaks, LEAK_ON, LEAK_PERIOD } from '../src/hazards.js';
import { ITEMS } from '../src/items.js';
import { beginStep, createInput } from '../src/input.js';
import { parseLevel } from '../src/level.js';
import { PALETTE } from '../src/palette.js';
import {
  createParticles,
  DUST_LANDING,
  hasBurst,
  MAX_PARTICLES,
  NO_BURST,
  spawnBursts,
  stepParticles,
  stirSurroundings,
} from '../src/particles.js';
import { createWorld, stepWorld } from '../src/world.js';
import { createDriver } from './helpers.js';

// The modules that send the world's events (the screens' own come from
// game.js and menu.js and throw up nothing).
const WORLD_SOURCES = ['world.js', 'player.js', 'ai.js'];

function worldEventTypes() {
  const types = new Set();
  for (const file of WORLD_SOURCES) {
    const source = readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8');
    for (const [, type] of source.matchAll(/events\.push\(\{ type: '(\w+)'/g)) types.add(type);
    for (const [, how] of source.matchAll(/hitEnemy\(world, \w+, '(\w+)'/g)) types.add(how);
  }
  return [...types];
}

function burstOf(event) {
  const particles = createParticles();
  spawnBursts(particles, [event]);
  return particles.list;
}

test('every event the world sends has a burst or is listed without one', () => {
  const types = worldEventTypes();
  assert.ok(types.length > 20, `found only ${types.length} event types`);
  for (const type of types) assert.ok(hasBurst(type) || type in NO_BURST, `the event '${type}' has no burst`);
  for (const type of Object.keys(NO_BURST)) assert.ok(!hasBurst(type), `'${type}' has a burst and is listed without one`);
});

test('the same events throw up the same particles', () => {
  const events = [{ type: 'crateOpened', col: 3, row: 2 }, { type: 'jump', x: 10, y: 20 }];
  const first = createParticles();
  const second = createParticles();
  spawnBursts(first, events);
  spawnBursts(second, events);
  assert.deepEqual(first, second);
  assert.ok(first.list.length > 0);
});

test('every particle is a palette colour, one or two pixels, and starts where its event was', () => {
  const events = [
    { type: 'land', x: 50, y: 60, speed: 430 },
    { type: 'stomp', enemy: 'prosecutor', x: 100, y: 40, top: 30 },
    { type: 'wounded', enemy: 'prosecutor', x: 100, y: 40, top: 30 },
    { type: 'struck', enemy: 'stoner', x: 100, y: 40, top: 30 },
    { type: 'splash', liquid: 'water', x: 70, y: 80 },
    { type: 'splash', liquid: 'slime', x: 70, y: 80 },
    { type: 'secretFound', col: 4, row: 4 },
    ...Object.keys(ITEMS).map((item) => ({ type: 'collected', item, x: 20, y: 20 })),
  ];
  const particles = createParticles();
  for (const event of events) {
    particles.list = [];
    spawnBursts(particles, [event]);
    assert.ok(particles.list.length > 0, `${event.type} threw up nothing`);
    for (const particle of particles.list) {
      assert.ok(particle.colour in PALETTE, `${event.type}: '${particle.colour}' is not in the palette`);
      assert.ok([1, 2].includes(particle.size));
      const { x, y } = event.x === undefined ? { x: (event.col + 0.5) * TILE, y: (event.row + 0.5) * TILE } : event;
      assert.ok(Math.abs(particle.x - x) <= 8 && Math.abs(particle.y - y) <= 16, `${event.type} starts far off`);
    }
  }
});

test('a soft landing raises no dust, and a harder one more', () => {
  assert.equal(burstOf({ type: 'land', x: 0, y: 0, speed: DUST_LANDING - 1 }).length, 0);
  const firm = burstOf({ type: 'land', x: 0, y: 0, speed: DUST_LANDING }).length;
  const hard = burstOf({ type: 'land', x: 0, y: 0, speed: 430 }).length;
  assert.ok(firm > 0 && hard > firm, `${firm} then ${hard}`);
});

test('the prosecutor goes out in far more than an ordinary enemy', () => {
  const ordinary = burstOf({ type: 'stomp', enemy: 'stoner', x: 0, y: 0, top: 0 }).length;
  const boss = burstOf({ type: 'stomp', enemy: 'prosecutor', x: 0, y: 0, top: 0 }).length;
  assert.ok(boss >= ordinary + 20, `${ordinary} and ${boss}`);
});

test('only the last heart bursts when a life is lost (the canal splashed as he went in)', () => {
  assert.equal(burstOf({ type: 'lifeLost', cause: 'water', x: 0, y: 0 }).length, 0);
  assert.ok(burstOf({ type: 'lifeLost', cause: 'hurt', x: 0, y: 0 }).length > 0);
  assert.equal(burstOf({ type: 'lifeLost', cause: 'pit', x: 0, y: 0 }).length, 0);
  assert.equal(burstOf({ type: 'lifeLost', cause: 'time', x: 0, y: 0 }).length, 0);
});

test('particles move, remember where they were for drawing, and go when their life is up', () => {
  const particles = createParticles();
  spawnBursts(particles, [{ type: 'crateOpened', col: 0, row: 0 }]);
  const [first] = particles.list;
  const { x, y } = first;
  stepParticles(particles, STEP);
  assert.equal(first.px, x);
  assert.equal(first.py, y);
  assert.ok(first.x !== x || first.y !== y);
  const longest = Math.max(...particles.list.map((particle) => particle.life));
  for (let t = 0; t < longest + STEP; t += STEP) stepParticles(particles, STEP);
  assert.equal(particles.list.length, 0);
});

test('past the cap the oldest particles make way', () => {
  const particles = createParticles();
  const events = Array.from({ length: 30 }, () => ({ type: 'levelComplete', x: 0, y: 0 }));
  spawnBursts(particles, events);
  assert.equal(particles.list.length, MAX_PARTICLES);
});

test('the world throws up dust when Blenke jumps, and steps it on', () => {
  const world = createWorld({ id: 'flat', name: 'Flat', rows: ['......', '.@....', '######'] });
  const driver = createDriver();
  for (let i = 0; i < 20; i++) {
    beginStep(driver.input);
    stepWorld(world, driver.input, STEP);
  }
  assert.equal(world.particles.list.length, 0, 'standing still throws up nothing');
  driver.press('jump');
  beginStep(driver.input);
  const events = stepWorld(world, driver.input, STEP);
  assert.ok(events.some((event) => event.type === 'jump'));
  assert.ok(world.particles.list.length > 0);
  const feet = world.player.y + world.player.h;
  assert.ok(world.particles.list.every((particle) => Math.abs(particle.y - feet) < 8), 'the dust is at his feet');
});

test('turning round at a run skids once, with dust', () => {
  const world = createWorld({ id: 'flat', name: 'Flat', rows: ['..........................', '.@........................', '##########################'] });
  const driver = createDriver();
  const run = (steps) => {
    const events = [];
    for (let i = 0; i < steps; i++) {
      beginStep(driver.input);
      events.push(...stepWorld(world, driver.input, STEP));
    }
    return events;
  };
  driver.press('run');
  driver.press('right');
  run(10);
  assert.ok(!run(50).some((event) => event.type === 'skid'), 'running on is no skid');
  driver.release('right');
  driver.press('left');
  let skids = 0;
  let dust = 0;
  for (let i = 0; i < 40; i++) {
    const skidded = run(1).some((event) => event.type === 'skid');
    if (skidded) dust = world.particles.list.length;
    skids += skidded ? 1 : 0;
  }
  assert.equal(skids, 1);
  assert.ok(dust > 0);
});

function stepAll(world, input, steps) {
  const events = [];
  for (let i = 0; i < steps; i++) {
    beginStep(input);
    events.push(...stepWorld(world, input, STEP));
  }
  return events;
}

test('Blenke walking into the canal splashes as he goes in, before he drowns', () => {
  const world = createWorld({ id: 'canal', name: 'Canal', rows: ['......', '.@....', '##~~##', '##~~##'] });
  const driver = createDriver();
  driver.press('right');
  const events = stepAll(world, driver.input, 120).filter((event) => event.type === 'splash' || event.type === 'lifeLost');
  assert.deepEqual(events.slice(0, 2).map((event) => event.type), ['splash', 'lifeLost']);
  assert.equal(events[0].liquid, 'water');
  assert.equal(events[0].y, 2 * TILE + 4);
});

test('a cone falling into slime splashes green, once', () => {
  const world = createWorld({ id: 'slime', name: 'Slime', rows: ['....v.', '.@....', '###%%#', '######'] });
  const splashes = stepAll(world, createInput(), 60).filter((event) => event.type === 'splash');
  assert.equal(splashes.length, 1);
  assert.equal(splashes[0].liquid, 'slime');
});

function stirFor(level, seconds, start = 0) {
  const particles = createParticles();
  const leaks = findLeaks(level);
  const camera = { x: 0, y: 0 };
  const spawned = [];
  for (let time = start + STEP; time <= start + seconds + 1e-9; time += STEP) {
    const before = particles.list.length;
    stirSurroundings(particles, { level, leaks, camera, time, dt: STEP });
    spawned.push(...particles.list.slice(before).map((particle) => ({ ...particle, time })));
  }
  return spawned;
}

test('slime bubbles and water glints on their surface, each tile at its own place', () => {
  const level = parseLevel({ id: 'pools', name: 'Pools', rows: ['@.......', '.%%..~~.', '.%%..~~.', '########'] });
  const spawned = stirFor(level, 3);
  const bubbles = spawned.filter((particle) => particle.colour.startsWith('slime'));
  const glints = spawned.filter((particle) => !particle.colour.startsWith('slime'));
  assert.ok(bubbles.length >= 4, `${bubbles.length} bubbles`);
  assert.ok(glints.length >= 2, `${glints.length} glints`);
  for (const bubble of bubbles) assert.ok(bubble.y < 2 * TILE && bubble.vy < 0, 'bubbles rise from the surface, not the depths');
  const firstAt = (col) => bubbles.filter((bubble) => Math.floor(bubble.x / TILE) === col).map((bubble) => bubble.x);
  assert.equal(new Set(firstAt(1)).size, 1, 'a tile bubbles at the same place every beat');
});

test('the surroundings stir only near the view', () => {
  const rows = ['@' + '.'.repeat(79), '%'.repeat(80), '#'.repeat(80)];
  const level = parseLevel({ id: 'long', name: 'Long', rows });
  const particles = createParticles();
  for (let time = STEP; time < 3; time += STEP) {
    stirSurroundings(particles, { level, leaks: [], camera: { x: 0, y: 0 }, time, dt: STEP });
  }
  assert.ok(particles.list.length > 0);
  assert.ok(particles.list.every((particle) => particle.x < 384 + 2 * TILE));
});

test('a leaking pipe sprays where its stream lands, and drips between leaks', () => {
  const level = parseLevel({ id: 'pipe', name: 'Pipe', rows: ['@.O..', '.....', '.....', '#####'] });
  const [leak] = findLeaks(level);
  const spawned = stirFor(level, LEAK_PERIOD);
  const leaking = spawned.filter((particle) => (particle.time + leak.phase) % LEAK_PERIOD < LEAK_ON);
  const between = spawned.filter((particle) => (particle.time + leak.phase) % LEAK_PERIOD >= LEAK_ON);
  assert.ok(leaking.length > 10 && leaking.every((particle) => Math.abs(particle.y - (leak.bottom - 1)) < 1), 'spray at the ground');
  assert.ok(between.length >= 1 && between.every((particle) => particle.y === leak.top), 'drips from the pipe');
});

test('the world stirs its surroundings as it steps', () => {
  const world = createWorld({ id: 'pools', name: 'Pools', rows: ['......', '.@....', '##%%##', '######'] });
  stepAll(world, createInput(), 120);
  assert.ok(world.particles.list.some((particle) => particle.colour.startsWith('slime')));
});
