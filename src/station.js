// The filling station outside the police station, past the goal. Once the
// level is completed Blenke walks up to it by himself, plugs in his hose
// and pours every sample he carries into it, while the needle on its gauge
// swings from 0 towards MAX (all the samples the level holds) and stops
// where his haul puts it. Then the report comes up. Pure: no DOM.
import { ITEMS } from './items.js';
import { ENEMIES } from './enemies.js';

// The pump: its gauge on top, the nozzle on its left side.
export const PUMP_SIZE = { width: 24, height: 44 };
// Blenke stands this far left of the pump, facing it, the hose between.
export const HOSE_GAP = 10;
// Something in his way: after this long he plugs in where he stands.
export const WALK_LIMIT = 8;
// Plugging the hose in takes this long.
export const PLUG_TIME = 0.5;
// A full tank takes this long to pour; less takes its share of it, but
// never less than the shortest.
export const FULL_FILL_TIME = 2.5;
export const MIN_FILL_TIME = 0.6;
// The needle rests where it stopped this long before the report.
export const HOLD_TIME = 1.2;
// The pour gurgles this often.
export const POUR_INTERVAL = 0.15;

// The pump stands on the bottom of its tile, its middle on the tile's.
// capacity: the samples the level holds, the gauge's MAX.
export function createStation(col, row, tile, capacity) {
  return {
    col,
    row,
    x: (col + 0.5) * tile - PUMP_SIZE.width / 2,
    y: (row + 1) * tile - PUMP_SIZE.height,
    w: PUMP_SIZE.width,
    h: PUMP_SIZE.height,
    capacity,
    // waiting, walking (to it), plugging, filling, done; time counts from
    // the phase's start.
    phase: 'waiting',
    time: 0,
    // The samples poured, the gauge's share of MAX they make, and where
    // the needle stands now (0 to 1).
    poured: 0,
    share: 0,
    needle: 0,
    pourTime: 0,
  };
}

// Every sample a level holds: lying about, in its crates and carried by
// its enemies (the stoner hands out several).
export function samplesToFind(level) {
  let samples = 0;
  const add = (type, count = 1) => {
    samples += (ITEMS[type].samples ?? 0) * count;
  };
  for (const marker of level.markers) {
    if (marker.type === 'item') add(marker.item);
    if (marker.type === 'enemy') {
      const enemy = ENEMIES[marker.enemy];
      if (enemy.carries) add(enemy.carries, enemy.drops ?? 1);
    }
  }
  for (const crate of level.crates) add(crate.contents);
  return samples;
}

// Where Blenke's left edge stands while he fills up.
export function fillingPlace(station, player) {
  return station.x - HOSE_GAP - player.w;
}

export function gaugeShare(poured, capacity) {
  return capacity > 0 ? Math.min(1, poured / capacity) : 0;
}

export function fillTime(share) {
  return Math.max(MIN_FILL_TIME, FULL_FILL_TIME * share);
}

// The needle slows as it comes to its stop.
function easeOut(progress) {
  return 1 - (1 - progress) ** 2;
}

function enter(station, phase) {
  station.phase = phase;
  station.time = 0;
}

// The level is completed: Blenke sets off towards the pump.
export function startWalking(station) {
  enter(station, 'walking');
}

// Whether Blenke is still on his way, so the world walks him right.
export function isWalking(station) {
  return station.phase === 'walking';
}

// Blenke is at the pump: he plugs in.
export function arrive(station, events) {
  enter(station, 'plugging');
  events.push({ type: 'hoseIn', x: station.x });
}

// Advances plugging in, filling up and the rest after. The samples Blenke
// carries (score.carried) drain into the tank as the needle climbs.
export function stepStation(station, score, dt, events) {
  if (station.phase === 'waiting' || station.phase === 'walking') {
    station.time += dt;
    return;
  }
  station.time += dt;
  if (station.phase === 'plugging') {
    if (station.time < PLUG_TIME) return;
    station.poured = score.carried;
    station.share = gaugeShare(station.poured, station.capacity);
    enter(station, 'filling');
    station.pourTime = 0;
    return;
  }
  if (station.phase !== 'filling') return;
  const duration = fillTime(station.share);
  const progress = Math.min(1, station.time / duration);
  station.needle = station.share * easeOut(progress);
  score.carried = Math.round(station.poured * (1 - progress));
  station.pourTime -= dt;
  if (progress < 1 && station.poured > 0 && station.pourTime <= 0) {
    events.push({ type: 'pour', share: station.needle, x: station.x });
    station.pourTime += POUR_INTERVAL;
  }
  if (progress < 1) return;
  enter(station, 'done');
  events.push({ type: 'gaugeStopped', share: station.share, full: station.share >= 1, x: station.x });
}

// Seconds until the report, once that is known (after the filling).
export function stationLeft(station) {
  return station.phase === 'done' ? Math.max(0, HOLD_TIME - station.time) : Infinity;
}
