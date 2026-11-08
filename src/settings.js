// The player's sound settings: the music's and the effects' volume in
// steps, and whether all sound is off. Pure: game.js changes them, save.js
// keeps them (with the high scores, when the player has allowed saving),
// audio.js turns them into gains.

export const VOLUME_STEPS = 10;
// The game starts at the levels its sounds are made for.
export const DEFAULT_SETTINGS = { music: VOLUME_STEPS, effects: VOLUME_STEPS, muted: false };
export const VOLUMES = ['music', 'effects'];

// A step's gain: squared, so each step sounds about as big as the last.
export function volumeFactor(step) {
  return (step / VOLUME_STEPS) ** 2;
}

// The settings with one volume moved by delta steps, kept within 0 to
// VOLUME_STEPS.
export function adjustVolume(settings, which, delta) {
  if (!VOLUMES.includes(which)) throw new Error(`No volume '${which}'`);
  return { ...settings, [which]: Math.min(VOLUME_STEPS, Math.max(0, settings[which] + delta)) };
}

export function toggleMuted(settings) {
  return { ...settings, muted: !settings.muted };
}

// Whether a value read back from storage is settings this game wrote.
export function isSettings(value) {
  if (typeof value !== 'object' || value === null) return false;
  const stepOk = (step) => Number.isInteger(step) && step >= 0 && step <= VOLUME_STEPS;
  return stepOk(value.music) && stepOk(value.effects) && typeof value.muted === 'boolean';
}
