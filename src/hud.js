// The HUD, laid out as data: which text and icons go where on the view, in
// art pixels from its top left corner. Two rows, like the arcade games it
// copies: a label over each value. Blenke's rank labels his score, and the
// power-up at work shows its picture and the seconds it has left. Pure: no
// DOM; the page draws what this returns.
import { HUD_ICONS } from './art/items.js';
import { ABOVE, CAP_HEIGHT, textWidth } from './art/font.js';
import { START_HEALTH } from './config.js';
import { boostsFor, isBlinkedOut } from './powerups.js';
import { currentRank, multiplier } from './score.js';

export const LABEL_Y = 3;
export const VALUE_Y = 13;
// Below this the HUD leaves the view to the game (and the message line).
export const HUD_BOTTOM = VALUE_Y + ABOVE + CAP_HEIGHT + 2;
const ICON_GAP = 2;
const COMBO_GAP = 4;
const HEART_GAP = 1;
const SCORE_DIGITS = 7;
const TIME_DIGITS = 3;
// The clock turns red when this little is left.
export const HURRY_TIME = 30;

// Where each column starts; the test checks the widest content each can
// hold ends before the next begins.
export const COLUMNS = {
  score: 8,
  lives: 116,
  samples: 152,
  possession: 196,
  level: 248,
  time: 306,
  powerUp: 336,
};

const LABEL_COLOUR = 'grey_6';
const VALUE_COLOUR = 'white';

function text(text, x, y, colour) {
  return { kind: 'text', text, x, y, colour };
}

// Blenke's health, a heart for each hit he can take, labels his lives:
// full hearts for what is left, grey for what is lost.
function hearts(health) {
  const image = HUD_ICONS.health;
  const y = LABEL_Y + ABOVE + CAP_HEIGHT - image.height;
  return Array.from({ length: START_HEALTH }, (_, i) => ({
    kind: 'icon',
    icon: i < health ? 'health' : 'healthLost',
    x: COLUMNS.lives + i * (image.width + HEART_GAP),
    y,
  }));
}

// An icon stands on the value row's baseline, its count beside it.
function counter(icon, count, x) {
  const image = HUD_ICONS[icon];
  return [
    { kind: 'icon', icon, x, y: VALUE_Y + ABOVE + CAP_HEIGHT - image.height },
    text(`×${count}`, x + image.width + ICON_GAP, VALUE_Y, VALUE_COLOUR),
  ];
}

// The power-up at work, if any: its picture, and the seconds it has left
// unless it lasts until used. In its last seconds it blinks.
function powerUpSlot(powerUp, time) {
  if (!powerUp) return [text('–', COLUMNS.powerUp, VALUE_Y, VALUE_COLOUR)];
  const { timeLeft, type } = powerUp;
  if (isBlinkedOut(powerUp, time)) return [];
  const image = HUD_ICONS[type];
  const elements = [{ kind: 'icon', icon: type, x: COLUMNS.powerUp, y: VALUE_Y + ABOVE + CAP_HEIGHT - image.height }];
  if (timeLeft !== Infinity) {
    elements.push(text(String(Math.ceil(timeLeft)), COLUMNS.powerUp + image.width + ICON_GAP, VALUE_Y, VALUE_COLOUR));
  }
  return elements;
}

export function padNumber(value, digits) {
  return String(Math.max(0, Math.floor(value))).padStart(digits, '0');
}

export function hudElements(world) {
  const { score, level } = world;
  const points = padNumber(score.points, SCORE_DIGITS);
  const elements = [
    text(currentRank(score).title.toUpperCase(), COLUMNS.score, LABEL_Y, 'hivis_3'),
    text(points, COLUMNS.score, VALUE_Y, VALUE_COLOUR),
    ...hearts(Math.max(0, world.player.health)),
    ...counter('lives', world.lives, COLUMNS.lives),
    text('PROV', COLUMNS.samples, LABEL_Y, LABEL_COLOUR),
    ...counter('samples', score.samples, COLUMNS.samples),
    text('INNEHAV', COLUMNS.possession, LABEL_Y, LABEL_COLOUR),
    ...counter('possession', score.possessions, COLUMNS.possession),
    text('BANA', COLUMNS.level, LABEL_Y, LABEL_COLOUR),
    text(level.name.toUpperCase(), COLUMNS.level, VALUE_Y, VALUE_COLOUR),
    text('TID', COLUMNS.time, LABEL_Y, LABEL_COLOUR),
    text(
      padNumber(Math.ceil(world.timeLeft), TIME_DIGITS),
      COLUMNS.time,
      VALUE_Y,
      world.timeLeft <= HURRY_TIME ? 'red_4' : VALUE_COLOUR,
    ),
    text('KRAFT', COLUMNS.powerUp, LABEL_Y, LABEL_COLOUR),
    ...powerUpSlot(world.powerUp, world.time),
  ];
  // The multiplier follows the score while a chain is going or a budget
  // increase doubles it.
  const factor = multiplier(score, boostsFor(world.powerUp));
  if (factor > 1) {
    const x = COLUMNS.score + textWidth(points) + COMBO_GAP;
    elements.push(text(`×${factor}`, x, VALUE_Y, 'orange_3'));
  }
  return elements;
}
