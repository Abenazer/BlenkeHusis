// The police performance report: what a level held to be found, what was
// found of it, the time and urine bonuses, and what the operation cost per
// gram seized;
// and the yearly report that adds up every level of a game. Pure: no DOM.
import { ENEMIES } from './enemies.js';
import { ITEMS } from './items.js';
import { SECRET_WALL, tileAt } from './level.js';

// Points for each whole second left on the clock at the goal.
export const TIME_BONUS_PER_SECOND = 10;
// Points for each sample poured into the filling station; a full tank
// (the gauge at MAX) doubles them once they are counted in.
export const URINE_BONUS_PER_SAMPLE = 20;
// What an operation costs for each second it runs: patrol cars, overtime,
// the helicopter on standby.
export const COST_PER_SECOND = 2500;
// What one find of minor possession weighs.
export const POSSESSION_GRAMS = 0.02;

// What the report counts, in its order: an item category, or what the
// world tallies besides (enemies, citizens, secret rooms).
export const REPORT_ROWS = [
  { key: 'sample', label: 'URINPROV' },
  { key: 'possession', label: 'RINGA INNEHAV' },
  { key: 'evidence', label: 'BEVIS' },
  { key: 'rooms', label: 'HEMLIGA RUM' },
  { key: 'enemies', label: 'OSKADLIGGJORDA MEDBORGARE' },
  { key: 'citizens', label: 'HJÄLPTA (EJ STATISTIKFÖRT)' },
];

export function createTally() {
  return { sample: 0, possession: 0, evidence: 0, bonus: 0, powerUp: 0, enemies: 0, citizens: 0, rooms: 0 };
}

// Secret rooms: each group of secret-wall tiles joined side by side or
// above and below is one room, as revealRoom opens them.
function countRooms(level) {
  const seen = new Set();
  let rooms = 0;
  for (let row = 0; row < level.height; row++) {
    for (let col = 0; col < level.width; col++) {
      if (tileAt(level, col, row) !== SECRET_WALL || seen.has(row * level.width + col)) continue;
      rooms += 1;
      const stack = [[col, row]];
      seen.add(row * level.width + col);
      while (stack.length > 0) {
        const [c, r] = stack.pop();
        for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const [nc, nr] = [c + dc, r + dr];
          const key = nr * level.width + nc;
          if (seen.has(key) || tileAt(level, nc, nr) !== SECRET_WALL) continue;
          seen.add(key);
          stack.push([nc, nr]);
        }
      }
    }
  }
  return rooms;
}

// Everything a freshly parsed level holds to be found: the items lying
// about, what the crates hold, what the enemies carry (the stoner hands
// out his several samples), the enemies and citizens, and the secret rooms.
export function levelTotals(level) {
  const totals = createTally();
  const add = (type, count = 1) => {
    totals[ITEMS[type].category] += count;
  };
  for (const marker of level.markers) {
    if (marker.type === 'item') add(marker.item);
    if (marker.type === 'citizen') totals.citizens += 1;
    if (marker.type === 'enemy') {
      const enemy = ENEMIES[marker.enemy];
      totals.enemies += 1;
      if (enemy.carries) add(enemy.carries, enemy.drops ?? 1);
    }
  }
  for (const crate of level.crates) add(crate.contents);
  totals.rooms = countRooms(level);
  return totals;
}

export function timeBonus(timeLeft) {
  return Math.floor(timeLeft) * TIME_BONUS_PER_SECOND;
}

export function urineBonus(poured) {
  return poured * URINE_BONUS_PER_SAMPLE;
}

// What is left to count of each bonus once `given` points of them have gone
// in: the time bonus first, then the urine bonus, and for a full tank the
// urine bonus once more, doubled. { time, urine, doubled }.
export function bonusLeft(report, given) {
  const time = Math.max(0, report.timeBonus - given);
  const urineGiven = Math.max(0, given - report.timeBonus);
  const doubled = report.full && urineGiven >= report.urineBonus;
  const urine = doubled ? 2 * report.urineBonus - urineGiven : report.urineBonus - urineGiven;
  return { time, urine, doubled };
}

// Cost per gram, or null when nothing was seized and it can't be worked out.
function perGram(cost, grams) {
  return grams > 0 ? Math.round(cost / grams) : null;
}

function verdict(found) {
  if (found.possession > 0) return 'SAMHÄLLET ÄR TRYGGARE. NÅGONSTANS.';
  if (found.sample > 0) return 'INGA BESLAG, MEN MÅNGA PROV. BUDGETEN HÖJS.';
  return 'INGET HITTAT. BUDGETEN HÖJS ÄNDÅ.';
}

// A completed level's report: { title, rows: [{ label, found, total }],
// timeLeft, timeBonus, poured, full, urineBonus, bonus (all the bonuses to
// count in), cost, grams, costPerGram, verdict, found, totals }.
export function levelReport(world) {
  const { level, tally: found, totals, timeLeft, station } = world;
  const cost = Math.round((level.time - timeLeft) * COST_PER_SECOND);
  const grams = found.possession * POSSESSION_GRAMS;
  const poured = station?.poured ?? 0;
  const full = poured > 0 && station.share >= 1;
  const time = timeBonus(timeLeft);
  const urine = urineBonus(poured);
  return {
    title: level.title,
    rows: REPORT_ROWS.map(({ key, label }) => ({ label, found: found[key], total: totals[key] })),
    timeLeft,
    timeBonus: time,
    poured,
    full,
    urineBonus: urine,
    bonus: time + (full ? 2 : 1) * urine,
    cost,
    grams,
    costPerGram: perGram(cost, grams),
    verdict: verdict(found),
    found,
    totals,
  };
}

function sum(tallies) {
  const total = createTally();
  for (const tally of tallies) for (const key of Object.keys(total)) total[key] += tally[key];
  return total;
}

// The year's report: every level's report added up.
export function yearReport(reports) {
  const found = sum(reports.map((report) => report.found));
  const totals = sum(reports.map((report) => report.totals));
  const cost = reports.reduce((total, report) => total + report.cost, 0);
  const grams = found.possession * POSSESSION_GRAMS;
  return {
    rows: REPORT_ROWS.map(({ key, label }) => ({ label, found: found[key], total: totals[key] })),
    cost,
    grams,
    costPerGram: perGram(cost, grams),
    levels: reports.length,
  };
}

// 1250000 → '1 250 000 KR', the Swedish way.
export function formatKronor(amount) {
  return `${String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} KR`;
}

// 0.04 → '0,04 G'.
export function formatGrams(grams) {
  return `${grams.toFixed(2).replace('.', ',')} G`;
}
