// The screens around the play laid out as data, like the HUD: text and
// pictures at view positions, in art pixels from its top left corner, and
// whether the world is shaded behind them. Pure: no DOM; render.js draws
// what this returns.
import { GAME_OVER_HEADING, LOGO } from './art/logo.js';
import { LINE_HEIGHT, textWidth } from './art/font.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { GAME_OVER_LOCK } from './game.js';
import { keyNamesFor } from './input.js';
import { padNumber } from './hud.js';
import { currentRank } from './score.js';

const LOGO_Y = 26;
const TAGLINE = 'EN POLIS. ETT UPPDRAG. TUSEN URINPROV.';
// The title's menu stands on the dark lawn below the backdrop's houses.
const TITLE_MENU_Y = 170;
const MENU_ROW = LINE_HEIGHT + 4;
// A prompt shows for half of each period and hides for the other.
export const BLINK_PERIOD = 1;
const PROMPT = 'TRYCK ENTER';
const MARK_GAP = 4;

export function centred(text) {
  return Math.floor((VIEW_WIDTH - textWidth(text)) / 2);
}

export function isBlinkOn(time) {
  return time % BLINK_PERIOD < BLINK_PERIOD / 2;
}

function text(text, x, y, colour) {
  return { kind: 'text', text, x, y, colour };
}

function line(content, y, colour) {
  return text(content, centred(content), y, colour);
}

// A menu's choices centred one under the other from y, the marked one
// between arrows, the ones that can't be taken now greyed out.
export function menuElements(menu, y) {
  return menu.items.flatMap((item, i) => {
    const top = y + i * MENU_ROW;
    const x = centred(item.label);
    if (i !== menu.index) return [text(item.label, x, top, item.enabled ? 'grey_5' : 'grey_3')];
    return [
      text('>', x - MARK_GAP - textWidth('>'), top, 'hivis_3'),
      text(item.label, x, top, 'hivis_3'),
      text('<', x + textWidth(item.label) + MARK_GAP, top, 'hivis_3'),
    ];
  });
}

function titleElements(game) {
  const elements = [
    { kind: 'image', image: 'logo', x: Math.floor((VIEW_WIDTH - LOGO.width) / 2), y: LOGO_Y },
    line(TAGLINE, LOGO_Y + LOGO.height + 8, 'white'),
  ];
  return [...elements, ...menuElements(game.titleMenu, TITLE_MENU_Y)];
}

// The controls screen, read from the key map so it can't go stale: what
// each thing is done with, and the menus' keys at the bottom.
export const CONTROL_ROWS = [
  { label: 'GÅ', actions: ['left', 'right'] },
  { label: 'SPRINGA', actions: ['run'] },
  { label: 'HOPPA', actions: ['jump'] },
  { label: 'HUKA OCH KRYPA', actions: ['down'] },
  { label: 'HJÄLPA, LÄSA, LYFTA, KASTA', actions: ['act'] },
  { label: 'PAUS', actions: ['pause'] },
];
const CONTROLS_TOP = 16;
const CONTROLS_ROW = LINE_HEIGHT + 3;
const CONTROLS_LABEL_X = 40;
const CONTROLS_KEYS_X = 200;

function controlsElements() {
  const elements = [
    line('KONTROLLER', CONTROLS_TOP, 'hivis_3'),
    line('ENLIGT TJÄNSTEFÖRESKRIFT 1992:4', CONTROLS_TOP + LINE_HEIGHT + 2, 'grey_4'),
  ];
  const top = CONTROLS_TOP + 2 * LINE_HEIGHT + 14;
  CONTROL_ROWS.forEach((row, i) => {
    const y = top + i * CONTROLS_ROW;
    elements.push(text(row.label, CONTROLS_LABEL_X, y, 'white'));
    elements.push(text(keyNamesFor(row.actions).join('  '), CONTROLS_KEYS_X, y, 'urine_4'));
  });
  const notes = top + CONTROL_ROWS.length * CONTROLS_ROW + 8;
  elements.push(line(`${keyNamesFor(['down'])[0]} OCH HOPPA: NER GENOM TUNNA PLATTFORMAR`, notes, 'grey_5'));
  elements.push(line(`TILLBAKA: ${keyNamesFor(['back']).join(' ')}`, VIEW_HEIGHT - LINE_HEIGHT - 8, 'grey_4'));
  return elements;
}

function pauseElements(game) {
  const top = Math.floor(VIEW_HEIGHT / 2) - 24;
  return [line('PAUS', top, 'white'), ...menuElements(game.menu, top + 20)];
}

// The case file as it is closed: the rank and score reached and what was
// collected along the way, in the order the police counts what matters.
export function caseFileRows(world) {
  const { score } = world;
  return [
    ['GRAD', currentRank(score).title.toUpperCase()],
    ['POÄNG', padNumber(score.points, 7)],
    ['URINPROV', String(score.samples)],
    ['RINGA INNEHAV', String(score.possessions)],
    ['BEVIS', String(score.evidence)],
    ['OSKADLIGGJORDA MEDBORGARE', String(score.defeated)],
    ['HJÄLPTA MEDBORGARE (EJ STATISTIKFÖRT)', String(score.helped)],
    ['SISTA KÄNDA POSITION', world.level.name.toUpperCase()],
  ];
}

const CASE_LEFT = 40;
const CASE_RIGHT = VIEW_WIDTH - 40;
const CASE_ROW = LINE_HEIGHT + 1;

// The prompt comes up once a key is taken, and blinks from then on.
function gameOverElements(game) {
  const unlocked = game.screenTime - GAME_OVER_LOCK;
  const headingY = 14;
  const elements = [
    { kind: 'image', image: 'gameOver', x: Math.floor((VIEW_WIDTH - GAME_OVER_HEADING.width) / 2), y: headingY },
    line('UTREDNINGEN LÄGGS NER.', headingY + GAME_OVER_HEADING.height + 4, 'white'),
  ];
  const top = headingY + GAME_OVER_HEADING.height + LINE_HEIGHT + 14;
  caseFileRows(game.world).forEach(([label, value], i) => {
    const y = top + i * CASE_ROW;
    elements.push(text(label, CASE_LEFT, y, 'grey_5'));
    elements.push(text(value, CASE_RIGHT - textWidth(value), y, i < 2 ? 'hivis_3' : 'urine_4'));
  });
  if (unlocked >= 0 && isBlinkOn(unlocked)) elements.push(line(PROMPT, VIEW_HEIGHT - LINE_HEIGHT - 6, 'hivis_3'));
  return elements;
}

// What the screen shows over (or instead of) the world: { shade, hud,
// elements }, shade true when the world is dimmed behind them, hud false
// when the screen takes the HUD's and the message line's place.
export function screenLayout(game) {
  switch (game.screen) {
    case 'title':
      return { shade: false, hud: true, elements: titleElements(game) };
    case 'controls':
      return { shade: true, hud: true, elements: controlsElements() };
    case 'paused':
      return { shade: true, hud: true, elements: pauseElements(game) };
    case 'gameOver':
      return { shade: true, hud: false, elements: gameOverElements(game) };
    default:
      return { shade: false, hud: true, elements: [] };
  }
}
