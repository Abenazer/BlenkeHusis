// The subcultures, the enemies from the hippie on: how each behaves on its
// own (ai.js) and in a level (world.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import { isPresent, isSpiky, SAY_TIME, updateEnemy } from '../src/ai.js';
import { STEP, TILE } from '../src/config.js';
import { createEnemy, ENEMIES } from '../src/enemies.js';
import { beginStep, createInput } from '../src/input.js';
import { ITEMS } from '../src/items.js';
import { createPlayer } from '../src/player.js';
import { createProjectile, PROJECTILES, updateProjectile } from '../src/projectiles.js';
import { createProp } from '../src/props.js';
import { levelTotals } from '../src/report.js';
import { createWorld, signLine, stepWorld } from '../src/world.js';
import { createDriver, makeLevel } from './helpers.js';

// A long floor, Blenke's column given by `at`.
const floor = makeLevel([
  '..............................',
  '.@............................',
  '##############################',
]);

// Steps an enemy standing on `level` at `col`, Blenke at column `at` on the
// same floor; returns its events.
function run(enemy, level, seconds, at) {
  const player = createPlayer((at + 0.5) * TILE, 2 * TILE);
  const events = [];
  for (let i = 0; i < Math.round(seconds / STEP); i++) events.push(...updateEnemy(enemy, { level, player }, STEP));
  return events;
}

function enemyOn(type, col, row = 1) {
  return createEnemy(type, col, row, TILE);
}

// A level with Blenke at column 1 and the cast given.
function worldWith(cast, rows = ['..............................', '.@............................', '##############################']) {
  return createWorld({ id: 'subcultures', name: 'Subcultures', rows, cast });
}

function walk(world, steps, action = 'right') {
  const driver = createDriver();
  driver.press(action);
  const events = [];
  for (let i = 0; i < steps; i++) {
    beginStep(driver.input);
    events.push(...stepWorld(world, driver.input, STEP));
  }
  return events;
}

function stepFor(world, seconds, input = createInput()) {
  const events = [];
  for (let i = 0; i < Math.round(seconds / STEP); i++) events.push(...stepWorld(world, input, STEP));
  return events;
}

function said(world) {
  return [world.messages.current, ...world.messages.waiting].map((message) => message?.text);
}

// Blenke drops from above onto whatever stands at column 1.
function dropOnto(type) {
  return createWorld({
    id: 'drop',
    name: 'Drop',
    rows: ['.@......', '........', '........', '........', '########'],
    cast: [{ type, col: 1 }],
  });
}

function stepUntil(world, type, seconds = 3) {
  const input = createInput();
  for (let i = 0; i < Math.round(seconds / STEP); i++) {
    const event = stepWorld(world, input, STEP).find((candidate) => candidate.type === type);
    if (event) return event;
  }
  return null;
}

test('the hippie wanders, then sits down to strum, holding still while he plays', () => {
  const data = ENEMIES.hippie;
  const hippie = enemyOn('hippie', 10);
  const quiet = run(hippie, floor, data.sitEvery - 0.1, 25);
  assert.ok(!quiet.some((event) => event.type === 'strum'), 'he strums before he sits');
  assert.notEqual(hippie.x, enemyOn('hippie', 10).x, 'he wanders');
  const playing = run(hippie, floor, data.sitTime - 0.2, 25);
  const strums = playing.filter((event) => event.type === 'strum');
  assert.ok(strums.length >= Math.floor((data.sitTime - 0.3) / data.strumEvery), `${strums.length} strums`);
  const sitting = hippie.x;
  run(hippie, floor, 0.1, 25);
  assert.equal(hippie.x, sitting, 'he moved while playing');
  run(hippie, floor, 1, 25);
  assert.notEqual(hippie.x, sitting, 'he never got up');
});

test('the headbanger bangs on the spot until Blenke comes near, then dives at him and rests before the next', () => {
  const data = ENEMIES.headbanger;
  const headbanger = enemyOn('headbanger', 10);
  const start = headbanger.x;
  assert.ok(!run(headbanger, floor, data.diveRest + 0.5, 25).some((event) => event.type === 'dive'), 'he dived at no one');
  assert.equal(headbanger.x, start, 'he walked');
  const dives = run(headbanger, floor, STEP, 6).filter((event) => event.type === 'dive');
  assert.equal(dives.length, 1);
  assert.ok(headbanger.vx < 0 && headbanger.vy < 0, 'he dives up and towards Blenke');
  assert.ok(headbanger.acting > 0, 'he shows no dive');
  run(headbanger, floor, 1, 6);
  assert.ok(headbanger.onGround && headbanger.acting === 0, 'he never lands');
  assert.ok(headbanger.x < start - TILE * 2, `he dived ${start - headbanger.x} px`);
  assert.ok(!run(headbanger, floor, data.diveRest - 1.2, 6).some((event) => event.type === 'dive'), 'he dived again at once');
  assert.ok(run(headbanger, floor, 1.5, 6).some((event) => event.type === 'dive'), 'he never dived again');
});

test('the punk pogos, mostly on the spot, and her mohawk is sharp only on the way up', () => {
  const punk = enemyOn('punk', 15);
  const start = punk.x;
  let rising = 0;
  let spikyFalling = 0;
  let highest = punk.y;
  for (let i = 0; i < Math.round(3 / STEP); i++) {
    run(punk, floor, STEP, 2);
    highest = Math.min(highest, punk.y);
    if (punk.vy < 0) rising += 1;
    if (isSpiky(punk) && (punk.vy >= 0 || punk.onGround)) spikyFalling += 1;
    if (isSpiky(punk) !== (punk.vy < 0 && !punk.onGround)) spikyFalling += 1;
  }
  assert.ok(rising > 0, 'she never bounced');
  assert.equal(spikyFalling, 0, 'sharp when not rising');
  assert.ok(highest < enemyOn('punk', 15).y - TILE, 'she bounces low');
  assert.ok(Math.abs(punk.x - start) < 8 * TILE, 'she wandered off');
});

test('landing on the rising punk hurts Blenke; on her way down she is stomped', () => {
  const meet = (vy) => {
    const world = worldWith([{ type: 'punk', col: 5 }]);
    const punk = world.enemies[0];
    const { player } = world;
    punk.y -= 10;
    punk.onGround = false;
    punk.vy = vy;
    player.x = punk.x;
    player.y = punk.y - player.h - 1;
    player.vy = 200;
    player.onGround = false;
    return stepFor(world, 0.1).map((event) => event.type);
  };
  const rising = meet(-200);
  assert.ok(rising.includes('hurt') && !rising.includes('stomp'), rising.join());
  const falling = meet(100);
  assert.ok(falling.includes('stomp') && !falling.includes('hurt'), falling.join());
});

test('the synth moves in jerks, a beat walking and a beat standing', () => {
  const data = ENEMIES.synth;
  const synth = enemyOn('synth', 10);
  run(synth, floor, data.jerk / 2, 25);
  const walked = synth.x;
  assert.notEqual(walked, enemyOn('synth', 10).x, 'he never walked');
  run(synth, floor, data.jerk * 0.6, 25);
  const standing = synth.x;
  run(synth, floor, data.jerk * 0.3, 25);
  assert.equal(synth.x, standing, 'he walked on the standing beat');
});

test('the synth plays square waves at Blenke, flying straight and stepping between two heights', () => {
  const synth = enemyOn('synth', 10);
  const quiet = run(synth, floor, ENEMIES.synth.throwEvery + 0.1, 28);
  assert.ok(!quiet.some((event) => event.type === 'throw'), 'he played to no one');
  const played = run(synth, floor, ENEMIES.synth.throwEvery + 0.1, 6).find((event) => event.type === 'throw');
  assert.equal(played?.projectile.type, 'wave');
  const wave = played.projectile;
  assert.ok(wave.vx < 0, 'it flies away from Blenke, who is on his left');
  const heights = new Set();
  for (let i = 0; i < Math.round(0.6 / STEP); i++) {
    assert.ok(updateProjectile(wave, floor, STEP), 'it stopped');
    heights.add(Math.round(wave.y));
  }
  assert.equal(heights.size, 2, [...heights].join());
  assert.equal(Math.max(...heights) - Math.min(...heights), PROJECTILES.wave.square.height);
});

test('the breakdancer spins, sharp all over, then freezes in a pose and says so', () => {
  const data = ENEMIES.breakdancer;
  const dancer = enemyOn('breakdancer', 10);
  run(dancer, floor, data.spinTime / 2, 25);
  assert.ok(isSpiky(dancer), 'his spin is safe to land on');
  const frozen = run(dancer, floor, data.spinTime / 2 + 0.1, 25);
  assert.ok(frozen.some((event) => event.type === 'freeze'), 'he never froze');
  assert.equal(dancer.saying, data.freezeLine);
  assert.ok(!isSpiky(dancer), 'his freeze is sharp');
  const still = dancer.x;
  run(dancer, floor, data.freezeTime - 0.2, 25);
  assert.equal(dancer.x, still, 'he moved in his freeze');
  run(dancer, floor, 0.3, 25);
  assert.ok(isSpiky(dancer), 'he never spun again');
});

test('landing on the spinning breakdancer hurts Blenke; frozen, he is stomped', () => {
  const meet = (spinning) => {
    const world = worldWith([{ type: 'breakdancer', col: 5 }]);
    const dancer = world.enemies[0];
    stepFor(world, spinning ? 0.2 : ENEMIES.breakdancer.spinTime + 0.1);
    const { player } = world;
    player.x = dancer.x;
    player.y = dancer.y - player.h - 1;
    player.vy = 200;
    player.onGround = false;
    return stepFor(world, 0.1).map((event) => event.type);
  };
  const spinning = meet(true);
  assert.ok(spinning.includes('hurt') && !spinning.includes('stomp'), spinning.join());
  const frozen = meet(false);
  assert.ok(frozen.includes('stomp') && !frozen.includes('hurt'), frozen.join());
});

test('the raver dances, hopping, and lobs glow sticks that land and lie glowing', () => {
  const raver = enemyOn('raver', 10);
  const events = run(raver, floor, ENEMIES.raver.throwEvery + 0.1, 6);
  const thrown = events.find((event) => event.type === 'throw');
  assert.equal(thrown?.projectile.type, 'glowStick');
  const stick = thrown.projectile;
  for (let i = 0; i < Math.round(2 / STEP); i++) assert.ok(updateProjectile(stick, floor, STEP), 'it went out before its time');
  assert.ok(stick.landed, 'it never landed');
  assert.equal(stick.y + stick.h, 2 * TILE, 'it lies off the floor');
  const lying = stick.x;
  updateProjectile(stick, floor, 1);
  assert.equal(stick.x, lying, 'it moved after landing');
  assert.equal(updateProjectile(stick, floor, PROJECTILES.glowStick.life), false, 'it glows for ever');
});

test("a glow stick hurts nobody, and lying it shows what is hidden near it", () => {
  const rows = ['..............................', '.@..................h.........', '##############################'];
  const world = worldWith([], rows);
  const hidden = world.items.find((item) => item.type === 'sampleCanister');
  assert.equal(hidden.revealed, false);
  const { player } = world;
  world.projectiles.push(createProjectile('glowStick', player.x + player.w / 2, player.y + 4, 0, 50));
  const events = stepFor(world, 0.5);
  assert.ok(!events.some((event) => event.type === 'hurt'), 'the glow stick hurt Blenke');
  assert.equal(hidden.revealed, false, 'a glow stick far away showed it');
  world.projectiles.push(createProjectile('glowStick', hidden.x - 20, hidden.y, 0, 50));
  stepFor(world, 0.5);
  assert.equal(hidden.revealed, true, 'the glow stick by it never showed it');
});

test('the goth is unseen until Blenke comes near, then fades in, drifts towards him and fades once he has gone', () => {
  const goth = enemyOn('goth', 15);
  const start = goth.x;
  run(goth, floor, 2, 2);
  assert.equal(goth.shown, 0, 'he shows to no one');
  assert.equal(goth.x, start, 'he moved unseen');
  assert.equal(isPresent(goth), false);
  const events = run(goth, floor, ENEMIES.goth.fadeTime + 0.1, 12);
  assert.equal(events.filter((event) => event.type === 'appear').length, 1);
  assert.equal(goth.shown, 1);
  assert.ok(isPresent(goth));
  assert.ok(goth.x < start, 'he never drifted towards Blenke');
  run(goth, floor, ENEMIES.goth.fadeTime + 0.1, 2);
  assert.equal(goth.shown, 0, 'he never faded');
});

test('an unseen goth can neither hurt Blenke nor be stomped', () => {
  const world = dropOnto('goth');
  const goth = world.enemies[0];
  const touch = () => {
    const { player } = world;
    player.x = goth.x;
    player.y = goth.y - player.h - 1;
    player.vy = 200;
    player.onGround = false;
    return stepFor(world, 0.05).map((event) => event.type);
  };
  assert.equal(goth.shown, 0);
  // Blenke lands near him, so he starts to fade in; while he is under
  // half shown, nothing touches.
  const early = touch();
  assert.ok(!early.includes('stomp') && !early.includes('hurt'), early.join());
  assert.ok(goth.shown > 0 && goth.shown < 0.5);
  stepFor(world, ENEMIES.goth.fadeTime);
  assert.ok(isPresent(goth));
});

test('the raggare cruises back and forth on his floor, slowly', () => {
  const car = enemyOn('raggare', 15);
  const xs = [];
  for (let i = 0; i < 30; i++) {
    run(car, floor, 0.5, 2);
    xs.push(car.x);
    assert.ok(car.onGround && car.x >= 0 && car.x + car.w <= 30 * TILE, `off the floor at ${car.x}`);
  }
  assert.ok(Math.max(...xs) - Math.min(...xs) > 4 * TILE, 'he never went anywhere');
  assert.ok(xs.some((x, i) => i > 0 && x > xs[i - 1]) && xs.some((x, i) => i > 0 && x < xs[i - 1]), 'he never turned');
});

// Blenke dropped onto the roof of the raggare's car.
function onTheRoof() {
  const world = worldWith([{ type: 'raggare', col: 12 }]);
  const car = world.enemies[0];
  const { player } = world;
  player.x = car.x + car.w / 2 - player.w / 2;
  player.y = car.y - player.h - 8;
  player.px = player.x;
  player.py = player.y;
  return { world, car, player };
}

test("Blenke rides on the raggare's roof, who cheers him and honks; nothing is stomped or hurt", () => {
  const { world, car, player } = onTheRoof();
  const events = stepFor(world, 0.2);
  assert.equal(player.platform, car.deck, 'he is not on the roof');
  assert.equal(car.saying, ENEMIES.raggare.rideLine);
  const offset = player.x - car.x;
  events.push(...stepFor(world, 2));
  assert.equal(player.platform, car.deck, 'he fell off');
  assert.equal(player.y + player.h, car.y);
  assert.ok(Math.abs(player.x - car.x - offset) < 1, 'the car left him behind');
  assert.equal(events.filter((event) => event.type === 'honk').length, 1);
  assert.ok(!events.some((event) => ['stomp', 'hurt', 'wounded'].includes(event.type)), events.map((event) => event.type).join());
  assert.equal(car.defeated, false);
});

test("the raggare's car hurts Blenke from the side", () => {
  const world = worldWith([{ type: 'raggare', col: 6 }]);
  const events = walk(world, 60);
  assert.ok(events.some((event) => event.type === 'hurt'), 'the car went through him');
});

test("the raggare can't be beaten, by a cone either, and is no part of a level's totals", () => {
  const world = worldWith([{ type: 'raggare', col: 12 }]);
  const car = world.enemies[0];
  world.props.push(createProp('cone', 5, 1, TILE));
  const thrown = world.props[0];
  thrown.thrown = true;
  thrown.vx = 300;
  const events = stepFor(world, 1);
  assert.ok(!events.some((event) => event.type === 'struck'), 'the cone beat him');
  assert.equal(car.defeated, false);
  assert.ok(thrown.vx <= 0 || !thrown.thrown, 'the cone went through');
  assert.equal(levelTotals(world.level).enemies, 0);
  assert.equal(ENEMIES.raggare.sign, undefined, 'the brochure has something on him');
});

test("Blenke rides on the progg activist's banner; under it she can't be stomped", () => {
  const world = worldWith([{ type: 'proggActivist', col: 12 }]);
  const activist = world.enemies[0];
  const { player } = world;
  player.x = activist.x + activist.w / 2 - player.w / 2;
  player.y = activist.deck.y - player.h - 8;
  const events = stepFor(world, 0.3);
  assert.equal(player.platform, activist.deck, 'he is not on the banner');
  assert.equal(player.y + player.h, activist.y - ENEMIES.proggActivist.deck.above);
  const offset = player.x - activist.x;
  events.push(...stepFor(world, 1));
  assert.ok(Math.abs(player.x - activist.x - offset) < 1, 'the banner left him behind');
  assert.ok(!events.some((event) => ['stomp', 'hurt'].includes(event.type)), events.map((event) => event.type).join());
  assert.ok(isSpiky(activist), 'landing on her stomps her');
});

test('a thrown cone beats the progg activist, and her banner goes down with her', () => {
  const world = worldWith([{ type: 'proggActivist', col: 8 }]);
  const activist = world.enemies[0];
  world.props.push(createProp('cone', 4, 1, TILE));
  const cone = world.props[0];
  cone.thrown = true;
  cone.vx = 300;
  const events = stepFor(world, 1);
  assert.equal(events.find((event) => event.type === 'struck')?.enemy, 'proggActivist');
  assert.equal(activist.deck, null, 'her banner still stands');
  assert.ok(world.items.some((item) => item.type === 'leaflet'), 'no leaflet');
});

test('an enemy with lines says the next as Blenke comes near, then waits a while', () => {
  const hippie = enemyOn('hippie', 10);
  run(hippie, floor, 0.5, 25);
  assert.equal(hippie.saying, null, 'he talks to no one');
  run(hippie, floor, STEP, 12);
  assert.equal(hippie.saying, ENEMIES.hippie.lines[0]);
  run(hippie, floor, SAY_TIME + 0.5, 12);
  assert.equal(hippie.saying, null, 'he goes on at once');
  run(hippie, floor, 4, 12);
  assert.equal(hippie.saying, ENEMIES.hippie.lines[1]);
});

test('near the hippie Blenke walks slower, and the hippie harms no one', () => {
  const alone = worldWith([]);
  walk(alone, 40);
  const mellow = worldWith([{ type: 'hippie', col: 4 }]);
  const events = walk(mellow, 40);
  assert.ok(mellow.player.x < alone.player.x - 8, `${mellow.player.x} against ${alone.player.x}`);
  assert.ok(Math.abs(mellow.player.vx) <= Math.abs(alone.player.vx) * ENEMIES.hippie.mellow.speed + 1);
  assert.ok(!events.some((event) => event.type === 'hurt'), 'he hurt Blenke');
});

test('a subculture put out of action gives away its sign and drops what it carries', () => {
  const world = dropOnto('hippie');
  const stomp = stepUntil(world, 'stomp');
  assert.equal(stomp?.enemy, 'hippie');
  assert.ok(said(world).includes(signLine(ENEMIES.hippie.sign)));
  assert.ok(world.items.some((item) => item.type === 'herbalTea'), 'no herbal tea');
  assert.equal(ITEMS.herbalTea.category, 'evidence');
});

test('every subculture has a sign, lines to say and something to drop', () => {
  for (const type of ['hippie', 'headbanger', 'punk', 'synth', 'breakdancer', 'raver', 'goth', 'proggActivist']) {
    const enemy = ENEMIES[type];
    assert.ok(enemy.sign, `${type} has no sign`);
    assert.ok(enemy.lines?.length > 0 && enemy.talkRange > 0, `${type} has nothing to say`);
    assert.ok(ITEMS[enemy.carries], `${type} carries nothing`);
    assert.equal(ITEMS[enemy.carries].char, null, `${type}'s ${enemy.carries} can be found lying about`);
  }
});
