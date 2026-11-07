// The power-ups: what each does and for how long. Blenke picks one up as
// an item (items.js, category 'powerUp'), usually out of a crate. One works
// at a time, and a new one takes the place of the old. Pure: no DOM, and
// time is passed in.

// time: seconds it lasts (the shield lasts until it has taken a hit).
// speed scales his top speeds; points and samples multiply what pickups
// are worth; shield takes one hit for him; reveal shows hidden items;
// flying lets him rise while jump is held. ends: the line as it runs out.
export const POWER_UPS = {
  policeCoffee: { time: 12, speed: 1.3, ends: 'KAFFET TOG SLUT. NORMALTEMPO ÅTERSTÄLLT.' },
  paperworkShield: { time: Infinity, shield: true, ends: 'BLANKETTEN TOG SMÄLLEN. ÄRENDET ARKIVERAT.' },
  mandatoryTesting: { time: 10, reveal: true, ends: 'TESTNINGEN AVSLUTAD. ALLA VAR MISSTÄNKTA.' },
  budgetIncrease: { time: 15, points: 2, ends: 'BUDGETEN ÄR SLUT. SPARKRAV INFÖRS.' },
  superBladder: { time: 15, samples: 2, ends: 'SUPERBLÅSAN ÄR FULL.' },
  helicopter: { time: 8, flying: true, ends: 'HELIKOPTERNS TIMMAR ÄR SLUT.' },
};

// In its last seconds a power-up blinks, this often a second, so its end
// comes as no surprise.
export const WARN_TIME = 2;
export const WARN_BLINK_RATE = 4;

export function startPowerUp(type) {
  const powerUp = POWER_UPS[type];
  if (!powerUp) throw new Error(`Unknown power-up '${type}'`);
  return { type, timeLeft: powerUp.time };
}

// Counts the power-up down by dt. Returns whether it has just run out.
export function updatePowerUp(powerUp, dt) {
  if (!powerUp || powerUp.timeLeft === Infinity) return false;
  powerUp.timeLeft = Math.max(0, powerUp.timeLeft - dt);
  return powerUp.timeLeft === 0;
}

// Whether the active power-up (or null) has an effect, e.g. 'shield'.
export function hasEffect(powerUp, effect) {
  return Boolean(powerUp && POWER_UPS[powerUp.type][effect]);
}

// What pickups are worth under the active power-up: { points, samples }
// as factors, for score.js.
export function boostsFor(powerUp) {
  const data = powerUp ? POWER_UPS[powerUp.type] : {};
  return { points: data.points ?? 1, samples: data.samples ?? 1 };
}

// How Blenke moves under the active power-up: { speed, flying }, for
// player.js.
export function movementFor(powerUp) {
  const data = powerUp ? POWER_UPS[powerUp.type] : {};
  return { speed: data.speed ?? 1, flying: data.flying === true };
}

// Whether a power-up about to run out is in the dark half of its blink at
// this time.
export function isBlinkedOut(powerUp, time) {
  return powerUp.timeLeft <= WARN_TIME && Math.floor(time * WARN_BLINK_RATE * 2) % 2 === 1;
}
