import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMIES } from '../src/enemies.js';
import { ITEMS } from '../src/items.js';
import { collect, COMBO_WINDOW, createScore, defeat, currentRank, help, MAX_MULTIPLIER, multiplier, RANKS, updateScore } from '../src/score.js';

test('a pickup adds its points and counts in its category', () => {
  const score = createScore();
  const result = collect(score, 'possession');
  assert.equal(result.points, ITEMS.possession.points);
  assert.equal(score.points, ITEMS.possession.points);
  assert.equal(score.possessions, 1);
  collect(score, 'bag');
  collect(score, 'coffee');
  assert.equal(score.evidence, 1);
  assert.equal(score.bonus, 1);
});

test('big samples count as several, a hidden one as a secret', () => {
  const score = createScore();
  collect(score, 'sampleCup');
  collect(score, 'sampleJar');
  collect(score, 'sampleCanister');
  assert.equal(score.samples, ITEMS.sampleCup.samples + ITEMS.sampleJar.samples + ITEMS.sampleCanister.samples);
  assert.equal(score.secrets, 1);
});

test('the satire holds: a crumb outscores any amount of evidence or bonus', () => {
  const others = Object.values(ITEMS).filter((item) => item.category !== 'possession');
  for (const item of others) assert.ok(ITEMS.possession.points > item.points);
});

test('pickups in quick succession raise the multiplier, up to the most', () => {
  const score = createScore();
  const factors = [];
  for (let i = 0; i < MAX_MULTIPLIER + 2; i++) {
    factors.push(collect(score, 'sampleCup').multiplier);
    updateScore(score, COMBO_WINDOW / 2);
  }
  assert.deepEqual(factors, [1, 2, 3, 4, 5, 5, 5]);
  assert.equal(score.points, ITEMS.sampleCup.points * (1 + 2 + 3 + 4 + 5 + 5 + 5));
});

test('the combo ends when the window passes without a pickup', () => {
  const score = createScore();
  collect(score, 'sampleCup');
  collect(score, 'sampleCup');
  assert.equal(multiplier(score), 2);
  updateScore(score, COMBO_WINDOW);
  assert.equal(score.chain, 0);
  assert.equal(collect(score, 'sampleCup').multiplier, 1);
});

test('samples earn ranks, and the pickup that crosses one says so', () => {
  const score = createScore();
  assert.equal(currentRank(score).title, RANKS[0].title);
  let promotions = [];
  for (let i = 0; i < RANKS[2].samples; i++) {
    const { promotedTo } = collect(score, 'sampleCup');
    if (promotedTo) promotions.push(promotedTo.title);
  }
  assert.deepEqual(promotions, [RANKS[1].title, RANKS[2].title]);
  assert.equal(currentRank(score).title, RANKS[2].title);
});

test('ranks rise in samples needed', () => {
  RANKS.slice(1).forEach((rank, i) => assert.ok(rank.samples > RANKS[i].samples, rank.title));
});

test('passing a multiple of 25 samples is a milestone with the count', () => {
  const score = createScore();
  score.samples = 23;
  assert.equal(collect(score, 'sampleCup').milestone, null);
  assert.equal(collect(score, 'sampleJar').milestone, 29);
});

test('each pickup of a type says its next line, round and round', () => {
  const score = createScore();
  const lines = ITEMS.possession.messages.map(() => collect(score, 'possession').line);
  assert.deepEqual(lines, ITEMS.possession.messages);
  assert.equal(collect(score, 'possession').line, ITEMS.possession.messages[0]);
  assert.equal(collect(score, 'sampleCup').line, null);
});

test('an unknown item fails loudly', () => {
  assert.throws(() => collect(createScore(), 'kebab'), /Unknown item type 'kebab'/);
});

test('a defeated enemy scores less than minor possession, in the same combo as pickups', () => {
  const score = createScore();
  collect(score, 'sampleCup');
  const result = defeat(score, 'dealer');
  assert.equal(result.multiplier, 2);
  assert.ok(ENEMIES.dealer.points * MAX_MULTIPLIER < ITEMS.possession.points);
  assert.equal(score.defeated, 1);
  for (const [type, enemy] of Object.entries(ENEMIES)) assert.ok(enemy.points < ITEMS.possession.points, type);
});

test('a budget increase doubles the multiplier, a super bladder the samples', () => {
  const score = createScore();
  const result = collect(score, 'sampleCup', { points: 2, samples: 1 });
  assert.equal(result.multiplier, 2);
  assert.equal(result.points, ITEMS.sampleCup.points * 2);
  assert.equal(multiplier(score, { points: 2, samples: 1 }), 2);
  collect(score, 'sampleJar', { points: 1, samples: 2 });
  assert.equal(score.samples, ITEMS.sampleCup.samples + 2 * ITEMS.sampleJar.samples);
});

test('the satire holds: helping a citizen is worth less than any evidence', () => {
  const score = createScore();
  const result = help(score);
  assert.equal(score.helped, 1);
  const evidence = Object.values(ITEMS).filter((item) => item.category === 'evidence');
  for (const item of evidence) assert.ok(result.points < item.points);
});

test('power-ups count as power-ups', () => {
  const score = createScore();
  collect(score, 'helicopter');
  assert.equal(score.powerUps, 1);
});
