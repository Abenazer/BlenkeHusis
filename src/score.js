// The score: points with a combo multiplier, what has been collected, the
// citizens helped and the police rank the points have earned. Pure: no
// DOM, and time is passed in.
//
// boosts, where a function takes them, are the active power-up's factors
// ({ points, samples }, from boostsFor in powerups.js).
import { ENEMIES } from './enemies.js';
import { ITEMS } from './items.js';

// Picking something up within this long of the last pickup keeps the combo
// going, and each one in the chain raises the multiplier, up to the most.
export const COMBO_WINDOW = 1.5;
export const MAX_MULTIPLIER = 5;
// "You have collected N samples" is said each time the count passes a
// multiple of this.
export const SAMPLE_MILESTONE = 25;
// Helping a citizen is worth this: less than any piece of evidence.
export const HELP_POINTS = 5;

const NO_BOOSTS = { points: 1, samples: 1 };

// Ranks earned by points, lowest first: the statistics make the officer.
export const RANKS = [
  { title: 'Polisaspirant', points: 0 },
  { title: 'Polisassistent', points: 1000 },
  { title: 'Polisinspektör', points: 2500 },
  { title: 'Kriminalinspektör', points: 5000 },
  { title: 'Polisintendent', points: 8000 },
  { title: 'Polismästare', points: 12000 },
  { title: 'Rikspolischef', points: 18000 },
  { title: 'Justitieminister', points: 25000 },
];

export function createScore() {
  return {
    points: 0,
    // Every sample collected this game, and those Blenke carries still:
    // the filling station empties him.
    samples: 0,
    carried: 0,
    possessions: 0,
    evidence: 0,
    bonus: 0,
    powerUps: 0,
    secrets: 0,
    // Enemies put out of action, and citizens helped.
    defeated: 0,
    helped: 0,
    // How many of each item type have been collected.
    counts: {},
    chain: 0,
    comboTime: 0,
  };
}

// The combo's multiplier, times the points boost if one is given.
export function multiplier(score, boosts = NO_BOOSTS) {
  return Math.min(Math.max(score.chain, 1), MAX_MULTIPLIER) * boosts.points;
}

export function rankIndex(points) {
  let index = 0;
  RANKS.forEach((rank, i) => {
    if (points >= rank.points) index = i;
  });
  return index;
}

export function currentRank(score) {
  return RANKS[rankIndex(score.points)];
}

// The rank the points have earned since they were pointsBefore, or null.
export function promotion(score, pointsBefore) {
  const after = rankIndex(score.points);
  return after > rankIndex(pointsBefore) ? RANKS[after] : null;
}

const CATEGORY_COUNTERS = { possession: 'possessions', evidence: 'evidence', bonus: 'bonus', powerUp: 'powerUps' };

// Each pickup or defeat within the window of the last raises the
// multiplier the points are worth.
function addToChain(score, base, boosts) {
  score.chain = score.comboTime > 0 ? score.chain + 1 : 1;
  score.comboTime = COMBO_WINDOW;
  const factor = multiplier(score, boosts);
  const points = base * factor;
  score.points += points;
  return { points, factor };
}

// Adds an item to the score. Returns what it was worth and what it
// unlocked: { points, multiplier, milestone, line }, where line
// is the item's message for this pickup (null when it has none).
export function collect(score, type, boosts = NO_BOOSTS) {
  const item = ITEMS[type];
  if (!item) throw new Error(`Unknown item type '${type}'`);

  const { points, factor } = addToChain(score, item.points, boosts);

  const before = score.counts[type] ?? 0;
  score.counts[type] = before + 1;
  const counter = CATEGORY_COUNTERS[item.category];
  if (counter) score[counter] += 1;
  if (item.hidden) score.secrets += 1;

  const samplesBefore = score.samples;
  score.samples += item.samples * boosts.samples;
  score.carried += item.samples * boosts.samples;
  const passed = Math.floor(score.samples / SAMPLE_MILESTONE) > Math.floor(samplesBefore / SAMPLE_MILESTONE);

  // Each pickup of a type says its next line, round and round.
  const line = item.messages.length > 0 ? item.messages[before % item.messages.length] : null;
  return {
    points,
    multiplier: factor,
    milestone: passed ? score.samples : null,
    line,
  };
}

// Adds a defeated enemy to the score, in the same combo as pickups.
// Returns { points, multiplier }.
export function defeat(score, type, boosts = NO_BOOSTS) {
  const enemy = ENEMIES[type];
  if (!enemy) throw new Error(`Unknown enemy type '${type}'`);
  const { points, factor } = addToChain(score, enemy.points, boosts);
  score.defeated += 1;
  return { points, multiplier: factor };
}

// Adds a citizen helped, in the same combo. Returns { points, multiplier }.
export function help(score, boosts = NO_BOOSTS) {
  const { points, factor } = addToChain(score, HELP_POINTS, boosts);
  score.helped += 1;
  return { points, multiplier: factor };
}

export function updateScore(score, dt) {
  if (score.comboTime <= 0) return;
  score.comboTime = Math.max(0, score.comboTime - dt);
  if (score.comboTime === 0) score.chain = 0;
}
