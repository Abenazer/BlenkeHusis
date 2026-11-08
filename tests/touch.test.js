import test from 'node:test';
import assert from 'node:assert/strict';
import { actionsForKey, beginStep, createInput, isHeld, keyNamesFor, TOUCH_ACTIONS, wasPressed } from '../src/input.js';
import {
  codesAt,
  createTouch,
  DEAD_ZONE,
  liftTouch,
  moveTouch,
  PAD_AREA,
  pressTouch,
  releaseTouches,
  RUN_REACH,
  touchLayout,
  touchState,
} from '../src/touch.js';

// A phone held sideways: 844 × 390 CSS pixels at three device pixels each.
const PHONE = touchLayout(2532, 1170, 3);

function setup() {
  return { touch: createTouch(), input: createInput() };
}

// A point on the pad, share of its radius from the middle, at an angle in
// degrees (0 right, 90 down).
function onPad(share, degrees, layout = PHONE) {
  const angle = (degrees * Math.PI) / 180;
  const reach = layout.pad.radius * share;
  return { x: layout.pad.x + Math.cos(angle) * reach, y: layout.pad.y + Math.sin(angle) * reach };
}

function codesOnPad(share, degrees) {
  const { x, y } = onPad(share, degrees);
  return codesAt(PHONE, 'pad', x, y).sort();
}

function overlaps(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y) < a.radius + b.radius;
}

test('the controls fit on the screen without covering each other', () => {
  for (const layout of [PHONE, touchLayout(1920, 1080, 1), touchLayout(640, 360, 1), touchLayout(2048, 1536, 2)]) {
    const circles = ['pad', 'jump', 'act', 'pause'].map((name) => layout[name]);
    for (const circle of circles) {
      assert.ok(circle.x - circle.radius >= 0 && circle.x + circle.radius <= layout.width, 'inside across');
      assert.ok(circle.y - circle.radius >= 0 && circle.y + circle.radius <= layout.height, 'inside down');
    }
    for (let i = 0; i < circles.length; i++) {
      for (let j = i + 1; j < circles.length; j++) assert.ok(!overlaps(circles[i], circles[j]), `${i} and ${j} overlap`);
    }
    assert.ok(layout.pad.x < layout.width * PAD_AREA, 'the pad stands in its own area');
  }
});

test('the controls are a thumb\'s size on a dense phone and never too big for a small screen', () => {
  // About 120 CSS pixels across.
  const cssWidth = (PHONE.pad.radius * 2) / 3;
  assert.ok(cssWidth > 100 && cssWidth < 140, `the pad is ${cssWidth} CSS pixels wide`);
  const small = touchLayout(640, 300, 3);
  assert.ok(small.pad.radius * 2 <= 300 * 0.45);
});

test('the pad walks left and right, crouches down, and gives both on a diagonal', () => {
  assert.deepEqual(codesOnPad(0.5, 0), ['TouchRight']);
  assert.deepEqual(codesOnPad(0.5, 180), ['TouchLeft']);
  assert.deepEqual(codesOnPad(0.5, 90), ['TouchDown']);
  assert.deepEqual(codesOnPad(0.5, 45), ['TouchDown', 'TouchRight']);
  assert.deepEqual(codesOnPad(0.5, 135), ['TouchDown', 'TouchLeft']);
  // Up is nothing: jumping is the other thumb's.
  assert.deepEqual(codesOnPad(0.5, -90), []);
});

test('the middle of the pad does nothing, and pushed far it runs', () => {
  assert.deepEqual(codesOnPad(DEAD_ZONE / 2, 0), []);
  assert.deepEqual(codesOnPad((RUN_REACH + 1) / 2, 0), ['TouchRight', 'TouchRun']);
  assert.deepEqual(codesOnPad(1.5, 180), ['TouchLeft', 'TouchRun']);
  // Crouching straight down never runs.
  assert.deepEqual(codesOnPad(1.5, 90), ['TouchDown']);
});

test('a finger on the pad moves Blenke through the input, and lifting it stops him', () => {
  const { touch, input } = setup();
  const right = onPad(0.5, 0);
  pressTouch(touch, input, PHONE, 1, right.x, right.y);
  beginStep(input);
  assert.equal(isHeld(input, 'right'), true);
  const left = onPad(0.9, 180);
  moveTouch(touch, input, PHONE, 1, left.x, left.y);
  beginStep(input);
  assert.equal(isHeld(input, 'right'), false);
  assert.equal(isHeld(input, 'left'), true);
  assert.equal(isHeld(input, 'run'), true);
  liftTouch(touch, input, 1);
  beginStep(input);
  assert.equal(isHeld(input, 'left'), false);
  assert.equal(isHeld(input, 'run'), false);
});

test('a finger that starts on the pad keeps working it wherever it slides', () => {
  const { touch, input } = setup();
  const start = onPad(0.5, 0);
  pressTouch(touch, input, PHONE, 1, start.x, start.y);
  moveTouch(touch, input, PHONE, 1, PHONE.jump.x, PHONE.jump.y);
  beginStep(input);
  assert.equal(isHeld(input, 'jump'), false);
  assert.equal(isHeld(input, 'right'), true);
});

test('the right side jumps, near the act button it acts, and a sliding finger changes button', () => {
  const { touch, input } = setup();
  pressTouch(touch, input, PHONE, 2, PHONE.width * 0.6, PHONE.height * 0.3);
  beginStep(input);
  assert.equal(wasPressed(input, 'jump'), true, 'anywhere on the right that is not a button jumps');
  moveTouch(touch, input, PHONE, 2, PHONE.act.x, PHONE.act.y);
  beginStep(input);
  assert.equal(isHeld(input, 'jump'), false);
  assert.equal(wasPressed(input, 'act'), true);
});

test('pad and button together: walking while jumping', () => {
  const { touch, input } = setup();
  const right = onPad(0.5, 0);
  pressTouch(touch, input, PHONE, 1, right.x, right.y);
  pressTouch(touch, input, PHONE, 2, PHONE.jump.x, PHONE.jump.y);
  beginStep(input);
  assert.equal(isHeld(input, 'right'), true);
  assert.equal(isHeld(input, 'jump'), true);
  liftTouch(touch, input, 2);
  beginStep(input);
  assert.equal(isHeld(input, 'right'), true);
  assert.equal(isHeld(input, 'jump'), false);
});

test('two fingers on one button hold it until both lift', () => {
  const { touch, input } = setup();
  pressTouch(touch, input, PHONE, 1, PHONE.jump.x, PHONE.jump.y);
  pressTouch(touch, input, PHONE, 2, PHONE.jump.x - 10, PHONE.jump.y);
  liftTouch(touch, input, 1);
  beginStep(input);
  assert.equal(isHeld(input, 'jump'), true);
  liftTouch(touch, input, 2);
  beginStep(input);
  assert.equal(isHeld(input, 'jump'), false);
});

test('pause is pressed where it stands, and sliding onto it does nothing', () => {
  const { touch, input } = setup();
  pressTouch(touch, input, PHONE, 1, PHONE.pause.x, PHONE.pause.y);
  beginStep(input);
  assert.equal(wasPressed(input, 'pause'), true);
  liftTouch(touch, input, 1);
  pressTouch(touch, input, PHONE, 2, PHONE.width * 0.6, PHONE.height * 0.6);
  moveTouch(touch, input, PHONE, 2, PHONE.pause.x, PHONE.pause.y);
  beginStep(input);
  assert.equal(isHeld(input, 'pause'), false);
});

test('releasing the touches lets go of everything held', () => {
  const { touch, input } = setup();
  const left = onPad(0.5, 180);
  pressTouch(touch, input, PHONE, 1, left.x, left.y);
  pressTouch(touch, input, PHONE, 2, PHONE.jump.x, PHONE.jump.y);
  beginStep(input);
  releaseTouches(touch, input);
  beginStep(input);
  assert.equal(isHeld(input, 'left'), false);
  assert.equal(isHeld(input, 'jump'), false);
  // A finger lifted after that changes nothing.
  liftTouch(touch, input, 1);
  assert.equal(input.queue.length, 0);
});

test('the drawn state: held buttons lit, the knob under the thumb inside the ring', () => {
  const { touch, input } = setup();
  assert.deepEqual(touchState(touch, PHONE), { jump: false, act: false, pause: false, knob: null });
  const far = onPad(3, 180);
  pressTouch(touch, input, PHONE, 1, far.x, far.y);
  pressTouch(touch, input, PHONE, 2, PHONE.jump.x, PHONE.jump.y);
  const state = touchState(touch, PHONE);
  assert.equal(state.jump, true);
  assert.equal(state.knob.running, true);
  assert.ok(state.knob.x < PHONE.pad.x);
  assert.ok(Math.hypot(state.knob.x - PHONE.pad.x, state.knob.y - PHONE.pad.y) < PHONE.pad.radius);
});

test('every touch key means something to the game, and none shows on the controls screen', () => {
  for (const code of Object.keys(TOUCH_ACTIONS)) assert.ok(actionsForKey(code).length > 0, code);
  const everything = Object.values(TOUCH_ACTIONS).flat();
  assert.ok(keyNamesFor(everything).every((name) => !name.startsWith('Touch')));
});
