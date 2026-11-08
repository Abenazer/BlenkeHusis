import test from 'node:test';
import assert from 'node:assert/strict';
import { STEP } from '../src/config.js';
import { createInput } from '../src/input.js';
import { parseLevel } from '../src/level.js';
import { LEVELS } from '../src/levels/index.js';
import {
  COST_PER_SECOND,
  formatGrams,
  formatKronor,
  levelReport,
  levelTotals,
  POSSESSION_GRAMS,
  REPORT_ROWS,
  yearReport,
} from '../src/report.js';
import { createWorld, stepWorld } from '../src/world.js';

test('a level\'s totals count what lies about, what crates hold and what enemies carry', () => {
  // A sample cup and a bag lying about; a crate holding possession; a
  // plain crate (a sample cup); a stoner handing out three cups and a
  // dealer with possession; a citizen; two secret rooms.
  const level = parseLevel({
    id: 'totals',
    rows: [
      '...p.......:;.:',
      '...?..?....;;.;',
      '.@u.b..SD.m;;.;',
      '###############',
    ],
  });
  const totals = levelTotals(level);
  assert.equal(totals.sample, 1 + 1 + 3);
  assert.equal(totals.possession, 1 + 1);
  assert.equal(totals.evidence, 1);
  assert.equal(totals.enemies, 2);
  assert.equal(totals.citizens, 1);
  assert.equal(totals.rooms, 2);
});

test('world 1-1 holds samples, possession, evidence, a secret room and enemies to count', () => {
  const totals = levelTotals(parseLevel(LEVELS[0]));
  for (const key of ['sample', 'possession', 'evidence', 'rooms', 'enemies', 'citizens']) assert.ok(totals[key] > 0, key);
});

test('the world tallies what is found on its level', () => {
  const world = createWorld({ id: 'found', rows: ['......', '.@u...', '######'] });
  const input = createInput();
  for (let i = 0; i < 30 && world.tally.sample === 0; i++) {
    world.player.x += 4;
    stepWorld(world, input, STEP);
  }
  assert.equal(world.tally.sample, 1);
  assert.equal(world.totals.sample, 1);
});

test('the report: found of total, the time bonus, and the cost per gram seized', () => {
  const world = createWorld({ id: 'r', title: 'Rapportbanan', time: 100, rows: ['......', '.@u.p.', '######'] });
  world.tally.sample = 1;
  world.tally.possession = 1;
  world.timeLeft = 60.5;
  const report = levelReport(world);
  assert.equal(report.title, 'Rapportbanan');
  assert.deepEqual(report.rows.map((row) => row.label), REPORT_ROWS.map((row) => row.label));
  assert.deepEqual(report.rows[0], { label: 'URINPROV', found: 1, total: 1 });
  assert.equal(report.bonus, 600);
  assert.equal(report.cost, Math.round(39.5 * COST_PER_SECOND));
  assert.equal(report.grams, POSSESSION_GRAMS);
  assert.equal(report.costPerGram, Math.round(report.cost / POSSESSION_GRAMS));
  assert.match(report.verdict, /TRYGGARE/);
});

test('with nothing seized the cost per gram cannot be worked out, and the budget goes up anyway', () => {
  const world = createWorld({ id: 'r', time: 100, rows: ['......', '.@....', '######'] });
  const report = levelReport(world);
  assert.equal(report.costPerGram, null);
  assert.match(report.verdict, /BUDGETEN HÖJS ÄNDÅ/);
});

test('the year\'s report adds up every level', () => {
  const one = createWorld({ id: 'a', time: 100, rows: ['......', '.@u.p.', '######'] });
  one.tally.possession = 1;
  one.timeLeft = 50;
  const two = createWorld({ id: 'b', time: 100, rows: ['......', '.@p...', '######'] });
  two.tally.possession = 1;
  two.timeLeft = 80;
  const year = yearReport([levelReport(one), levelReport(two)]);
  assert.equal(year.levels, 2);
  assert.equal(year.cost, 70 * COST_PER_SECOND);
  assert.deepEqual(year.rows.find((row) => row.label === 'RINGA INNEHAV'), { label: 'RINGA INNEHAV', found: 2, total: 2 });
  assert.equal(year.costPerGram, Math.round(year.cost / (2 * POSSESSION_GRAMS)));
});

test('kronor and grams are written the Swedish way', () => {
  assert.equal(formatKronor(1250000), '1 250 000 KR');
  assert.equal(formatKronor(999), '999 KR');
  assert.equal(formatGrams(0.04), '0,04 G');
});
