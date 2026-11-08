// The screens around the play laid out as data, like the HUD: text and
// pictures at view positions, in art pixels from its top left corner, and
// whether the world is shaded behind them. Pure: no DOM; render.js draws
// what this returns.
import { LOGO } from './art/logo.js';
import { LINE_HEIGHT, textWidth } from './art/font.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from './config.js';

const LOGO_Y = 26;
const TAGLINE = 'EN POLIS. ETT UPPDRAG. TUSEN URINPROV.';
const PROMPT = 'TRYCK ENTER';
// On the dark lawn below the backdrop's houses.
const PROMPT_Y = 182;
// The prompt shows for half of each period and hides for the other.
export const BLINK_PERIOD = 1;
const MENU_ROW = LINE_HEIGHT + 4;
const MARK_GAP = 4;

export function centred(text) {
  return Math.floor((VIEW_WIDTH - textWidth(text)) / 2);
}

function text(text, x, y, colour) {
  return { kind: 'text', text, x, y, colour };
}

function line(content, y, colour) {
  return text(content, centred(content), y, colour);
}

export function isBlinkOn(time) {
  return time % BLINK_PERIOD < BLINK_PERIOD / 2;
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
  if (isBlinkOn(game.time)) elements.push(line(PROMPT, PROMPT_Y, 'hivis_3'));
  return elements;
}

function pauseElements(game) {
  const top = Math.floor(VIEW_HEIGHT / 2) - 24;
  return [line('PAUS', top, 'white'), ...menuElements(game.menu, top + 20)];
}

// What the screen shows over (or instead of) the world: { shade, elements },
// shade true when the world is dimmed behind them.
export function screenLayout(game) {
  switch (game.screen) {
    case 'title':
      return { shade: false, elements: titleElements(game) };
    case 'paused':
      return { shade: true, elements: pauseElements(game) };
    default:
      return { shade: false, elements: [] };
  }
}
