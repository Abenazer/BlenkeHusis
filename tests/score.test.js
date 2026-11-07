import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS } from '../src/items.js';
import { collect, COMBO_WINDOW, createScore, currentRank, MAX_MULTIPLIER, multiplier, RANKS, updateScore } from '../src/score.js';

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
