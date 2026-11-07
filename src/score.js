// The score: points with a combo multiplier, what has been collected, and the
// police rank the samples have earned. Pure: no DOM, and time is passed in.
import { ENEMIES } from './enemies.js';
import { ITEMS } from './items.js';

// Picking something up within this long of the last pickup keeps the combo
// going, and each one in the chain raises the multiplier, up to the most.
export const COMBO_WINDOW = 1.5;
export const MAX_MULTIPLIER = 5;
// "You have collected N samples" is said each time the count passes a
// multiple of this.
export const SAMPLE_MILESTONE = 25;

// Ranks earned by the number of samples collected, lowest first.
export const RANKS = [
  { title: 'Polisaspirant', samples: 0 },
  { title: 'Polisassistent', samples: 10 },
  { title: 'Polisinspektör', samples: 25 },
  { title: 'Kriminalinspektör', samples: 50 },
  { title: 'Polisintendent', samples: 80 },
  { title: 'Polismästare', samples: 120 },
  { title: 'Rikspolischef', samples: 180 },
  { title: 'Justitieminister', samples: 250 },
];

export function createScore() {
  return {
    points: 0,
    samples: 0,
    possessions: 0,
    evidence: 0,
    bonus: 0,
    secrets: 0,
    // Enemies put out of action.
    defeated: 0,
    // How many of each item type have been collected.
    counts: {},
    chain: 0,
    comboTime: 0,
  };
}

export function multiplier(score) {
  return Math.min(Math.max(score.chain, 1), MAX_MULTIPLIER);
}

export function rankIndex(samples) {
  let index = 0;
  RANKS.forEach((rank, i) => {
    if (samples >= rank.samples) index = i;
  });
  return index;
}

export function currentRank(score) {
  return RANKS[rankIndex(score.samples)];
}

const CATEGORY_COUNTERS = { possession: 'possessions', evidence: 'evidence', bonus: 'bonus' };

// Each pickup or defeat within the window of the last raises the
// multiplier the points are worth.
function addToChain(score, base) {
  score.chain = score.comboTime > 0 ? score.chain + 1 : 1;
  score.comboTime = COMBO_WINDOW;
  const factor = multiplier(score);
  const points = base * factor;
  score.points += points;
  return { points, factor };
}

// Adds an item to the score. Returns what it was worth and what it
// unlocked: { points, multiplier, promotedTo, milestone, line }, where line
// is the item's message for this pickup (null when it has none).
export function collect(score, type) {
  const item = ITEMS[type];
  if (!item) throw new Error(`Unknown item type '${type}'`);

  const { points, factor } = addToChain(score, item.points);

  const before = score.counts[type] ?? 0;
  score.counts[type] = before + 1;
  const counter = CATEGORY_COUNTERS[item.category];
  if (counter) score[counter] += 1;
  if (item.hidden) score.secrets += 1;

  const samplesBefore = score.samples;
  score.samples += item.samples;
  const rankBefore = rankIndex(samplesBefore);
  const rankAfter = rankIndex(score.samples);
  const passed = Math.floor(score.samples / SAMPLE_MILESTONE) > Math.floor(samplesBefore / SAMPLE_MILESTONE);

  // Each pickup of a type says its next line, round and round.
  const line = item.messages.length > 0 ? item.messages[before % item.messages.length] : null;
  return {
    points,
    multiplier: factor,
    promotedTo: rankAfter > rankBefore ? RANKS[rankAfter] : null,
    milestone: passed ? score.samples : null,
    line,
  };
}

// Adds a defeated enemy to the score, in the same combo as pickups.
// Returns { points, multiplier }.
export function defeat(score, type) {
  const enemy = ENEMIES[type];
  if (!enemy) throw new Error(`Unknown enemy type '${type}'`);
  const { points, factor } = addToChain(score, enemy.points);
  score.defeated += 1;
  return { points, multiplier: factor };
}

export function updateScore(score, dt) {
  if (score.comboTime <= 0) return;
  score.comboTime = Math.max(0, score.comboTime - dt);
  if (score.comboTime === 0) score.chain = 0;
}
