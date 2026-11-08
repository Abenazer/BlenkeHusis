// The screens around the play laid out as data, like the HUD: text and
// pictures at view positions, in art pixels from its top left corner, and
// whether the world is shaded behind them. Pure: no DOM; render.js draws
// what this returns.
import { LOGO } from './art/logo.js';
import { LINE_HEIGHT, textWidth } from './art/font.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { keyNamesFor } from './input.js';

const LOGO_Y = 26;
const TAGLINE = 'EN POLIS. ETT UPPDRAG. TUSEN URINPROV.';
// The title's menu stands on the dark lawn below the backdrop's houses.
const TITLE_MENU_Y = 170;
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

// What the screen shows over (or instead of) the world: { shade, elements },
// shade true when the world is dimmed behind them.
export function screenLayout(game) {
  switch (game.screen) {
    case 'title':
      return { shade: false, elements: titleElements(game) };
    case 'controls':
      return { shade: true, elements: controlsElements() };
    case 'paused':
      return { shade: true, elements: pauseElements(game) };
    default:
      return { shade: false, elements: [] };
  }
}
