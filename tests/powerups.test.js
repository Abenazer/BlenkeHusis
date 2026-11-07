import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS } from '../src/items.js';
import { boostsFor, hasEffect, isBlinkedOut, movementFor, POWER_UPS, startPowerUp, updatePowerUp, WARN_TIME } from '../src/powerups.js';

test('every power-up is an item, and every power-up item a power-up', () => {
  const items = Object.entries(ITEMS).filter(([, item]) => item.category === 'powerUp').map(([type]) => type);
  assert.deepEqual(items.sort(), Object.keys(POWER_UPS).sort());
});

test('a power-up counts down and says when it has run out', () => {
  const powerUp = startPowerUp('policeCoffee');
  assert.equal(updatePowerUp(powerUp, POWER_UPS.policeCoffee.time - 1), false);
  assert.equal(updatePowerUp(powerUp, 1), true);
  assert.equal(powerUp.timeLeft, 0);
});

test('the paperwork shield lasts until it is used', () => {
  const powerUp = startPowerUp('paperworkShield');
  assert.equal(updatePowerUp(powerUp, 1000), false);
  assert.equal(hasEffect(powerUp, 'shield'), true);
});

test('each power-up does its own thing, and nothing without one', () => {
  assert.deepEqual(boostsFor(null), { points: 1, samples: 1 });
  assert.deepEqual(movementFor(null), { speed: 1, flying: false });
  assert.equal(boostsFor(startPowerUp('budgetIncrease')).points, 2);
  assert.equal(boostsFor(startPowerUp('superBladder')).samples, 2);
  assert.ok(movementFor(startPowerUp('policeCoffee')).speed > 1);
  assert.equal(movementFor(startPowerUp('helicopter')).flying, true);
  assert.equal(hasEffect(startPowerUp('mandatoryTesting'), 'reveal'), true);
  assert.equal(hasEffect(null, 'reveal'), false);
});

test('a power-up blinks only in its last seconds', () => {
  const powerUp = startPowerUp('helicopter');
  const blinks = (time) => Array.from({ length: 20 }, (_, i) => isBlinkedOut(powerUp, time + i / 20));
  assert.ok(!blinks(0).some(Boolean));
  powerUp.timeLeft = WARN_TIME;
  assert.ok(blinks(0).some(Boolean));
});

test('an unknown power-up is refused', () => {
  assert.throws(() => startPowerUp('jetpack'), /Unknown power-up 'jetpack'/);
});
