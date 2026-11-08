// The screens around the play laid out as data, like the HUD: text and
// pictures at view positions, in art pixels from its top left corner, and
// whether the world is shaded behind them. What can be tapped carries its
// target and the box that takes the tap (a menu's row, a volume's bar); a
// screen that waits for Enter takes a tap anywhere. Played by touch, the
// screens say so instead of naming keys. Pure: no DOM; render.js draws
// what this returns, main.js asks tapAt what a tap hit.
import { GAME_OVER_HEADING, LOGO, TAG_LETTER_ART } from './art/logo.js';
import { SPEAKER_OFF, VOLUME_BARS, VOLUME_STEP_INSET, VOLUME_STEP_PITCH } from './art/sound.js';
import { LINE_HEIGHT, textWidth } from './art/font.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { GAME_OVER_LOCK, isBonusCounted, REPORT_LOCK } from './game.js';
import { keyNamesFor } from './input.js';
import { TAG_LENGTH, TAG_LETTERS } from './highscores.js';
import { padNumber } from './hud.js';
import { VOLUME_STEPS } from './settings.js';
import { bonusLeft, formatGrams, formatKronor } from './report.js';
import { currentRank } from './score.js';

const LOGO_Y = 26;
const TAGLINE = 'EN POLIS. ETT UPPDRAG. TUSEN URINPROV.';
// The title's menu stands on the dark lawn below the backdrop's houses,
// its rows closer than other menus' so all four fit there.
const TITLE_MENU_Y = 166;
const TITLE_MENU_ROW = LINE_HEIGHT + 1;
const MENU_ROW = LINE_HEIGHT + 4;
// A prompt shows for half of each period and hides for the other.
export const BLINK_PERIOD = 1;
const PROMPT = 'TRYCK ENTER';
export const TOUCH_PROMPT = 'TRYCK PÅ SKÄRMEN';
const MARK_GAP = 4;
// A tappable row takes taps this far beyond its text on either side.
const TAP_SIDE = 40;
// A tap anywhere on a screen that waits for Enter.
const CONFIRM_TAP = { kind: 'press', action: 'confirm' };

function promptText(touch) {
  return touch ? TOUCH_PROMPT : PROMPT;
}

// The box round a row of text at y that takes its taps: the row's whole
// height, row apart from the next, and wider than the text.
function rowHit(x, width, y, row) {
  const top = y - Math.floor((row - LINE_HEIGHT) / 2);
  return { x: x - TAP_SIDE, y: top, width: width + 2 * TAP_SIDE, height: row };
}

// What a tap at x, y on the view hit in a layout: the target of the
// element whose box holds it, else the screen's own (a tap anywhere), or
// null. A volume's bar answers with the level of the step tapped.
export function tapAt(layout, x, y) {
  for (const element of layout.elements) {
    const { hit, tap } = element;
    if (!tap || x < hit.x || x >= hit.x + hit.width || y < hit.y || y >= hit.y + hit.height) continue;
    if (tap.kind !== 'volume') return tap;
    const level = Math.floor((x - tap.from) / VOLUME_STEP_PITCH) + 1;
    return { kind: 'volume', volume: tap.volume, level: Math.max(0, Math.min(VOLUME_STEPS, level)) };
  }
  return layout.tap ?? null;
}

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

// A menu's choices centred one under the other from y, row apart, the
// marked one between arrows, the ones that can't be taken now greyed out.
// A row's label takes the taps that choose it.
export function menuElements(menu, y, row = MENU_ROW) {
  return menu.items.flatMap((item, i) => {
    const top = y + i * row;
    const x = centred(item.label);
    const tappable = (colour) => ({
      ...text(item.label, x, top, colour),
      tap: { kind: 'menu', index: i },
      hit: rowHit(x, textWidth(item.label), top, row),
    });
    if (i !== menu.index) return [tappable(item.enabled ? 'grey_5' : 'grey_3')];
    return [
      text('>', x - MARK_GAP - textWidth('>'), top, 'hivis_3'),
      tappable('hivis_3'),
      text('<', x + textWidth(item.label) + MARK_GAP, top, 'hivis_3'),
    ];
  });
}

function titleElements(game) {
  const elements = [
    { kind: 'image', image: 'logo', x: Math.floor((VIEW_WIDTH - LOGO.width) / 2), y: LOGO_Y },
    line(TAGLINE, LOGO_Y + LOGO.height + 8, 'white'),
  ];
  return [...elements, ...menuElements(game.titleMenu, TITLE_MENU_Y, TITLE_MENU_ROW)];
}

// The controls screen, read from the key map so it can't go stale: what
// each thing is done with, and the menus' keys at the bottom. Played by
// touch, it tells the touch controls instead.
export const CONTROL_ROWS = [
  { label: 'GÅ', actions: ['left', 'right'], touch: 'PLATTAN ← →' },
  { label: 'SPRINGA', actions: ['run'], touch: 'PLATTAN LÅNGT UT' },
  { label: 'HOPPA', actions: ['jump'], touch: 'HÖGER SIDA' },
  { label: 'HUKA OCH KRYPA', actions: ['down'], touch: 'PLATTAN ↓' },
  { label: 'HJÄLPA, LÄSA, LYFTA, KASTA', actions: ['act'], touch: 'HANDEN' },
  { label: 'PAUS', actions: ['pause'], touch: 'KNAPPEN UPPE TILL HÖGER' },
  { label: 'LJUD AV/PÅ', actions: ['mute'], touch: 'MENYN LJUD' },
];
const CONTROLS_TOP = 16;
const CONTROLS_ROW = LINE_HEIGHT + 3;
const CONTROLS_LABEL_X = 40;
const CONTROLS_KEYS_X = 200;

function controlsElements(touch) {
  const elements = [
    line('KONTROLLER', CONTROLS_TOP, 'hivis_3'),
    line('ENLIGT TJÄNSTEFÖRESKRIFT 1992:4', CONTROLS_TOP + LINE_HEIGHT + 2, 'grey_4'),
  ];
  const top = CONTROLS_TOP + 2 * LINE_HEIGHT + 14;
  CONTROL_ROWS.forEach((row, i) => {
    const y = top + i * CONTROLS_ROW;
    elements.push(text(row.label, CONTROLS_LABEL_X, y, 'white'));
    elements.push(text(touch ? row.touch : keyNamesFor(row.actions).join('  '), CONTROLS_KEYS_X, y, 'urine_4'));
  });
  const notes = top + CONTROL_ROWS.length * CONTROLS_ROW + 8;
  const down = touch ? 'PLATTAN ↓' : keyNamesFor(['down'])[0];
  elements.push(line(`${down} OCH HOPPA: NER GENOM TUNNA PLATTFORMAR`, notes, 'grey_5'));
  const back = touch ? TOUCH_PROMPT : keyNamesFor(['back']).join(' ');
  elements.push(line(`TILLBAKA: ${back}`, VIEW_HEIGHT - LINE_HEIGHT - 8, 'grey_4'));
  return elements;
}

// The sound settings: each volume's row with its bar and step, the marked
// row picked out, and the way back.
const SOUND_TOP = 50;
const SOUND_ROW = 20;
const SOUND_LABEL_X = 112;
const SOUND_BAR_X = 196;
const SOUND_LABELS = { music: 'MUSIK', effects: 'EFFEKTER' };

function soundElements(game, touch) {
  const menu = game.soundMenu;
  const elements = [line('LJUD', SOUND_TOP, 'hivis_3')];
  const top = SOUND_TOP + 30;
  ['music', 'effects'].forEach((volume, i) => {
    const y = top + i * SOUND_ROW;
    const marked = menu.items[menu.index].id === volume;
    const colour = marked ? 'hivis_3' : 'grey_5';
    if (marked) elements.push(text('>', SOUND_LABEL_X - MARK_GAP - textWidth('>'), y, colour));
    const label = SOUND_LABELS[volume];
    elements.push({
      ...text(label, SOUND_LABEL_X, y, colour),
      tap: { kind: 'menu', index: i },
      hit: { ...rowHit(SOUND_LABEL_X, textWidth(label), y, SOUND_ROW), width: SOUND_BAR_X - MARK_GAP - SOUND_LABEL_X + TAP_SIDE },
    });
    const bar = VOLUME_BARS[game.settings[volume]];
    // A tapped step sets the volume to it; left of the bar is silence.
    const barHit = rowHit(SOUND_BAR_X, bar.width, y, SOUND_ROW);
    elements.push({
      kind: 'image',
      image: `volume${game.settings[volume]}`,
      x: SOUND_BAR_X,
      y: y - 1,
      tap: { kind: 'volume', volume, from: SOUND_BAR_X + VOLUME_STEP_INSET },
      hit: { ...barHit, x: SOUND_BAR_X - MARK_GAP, width: bar.width + MARK_GAP + TAP_SIDE },
    });
    elements.push(text(String(game.settings[volume]), SOUND_BAR_X + bar.width + 6, y, colour));
  });
  const back = menu.items.findIndex((item) => item.id === 'back');
  const backMenu = { items: [menu.items[back]], index: menu.index === back ? 0 : -1 };
  const backElements = menuElements(backMenu, top + 2 * SOUND_ROW + 8);
  elements.push(...backElements.map((element) => (element.tap ? { ...element, tap: { kind: 'menu', index: back } } : element)));
  const muteY = top + 3 * SOUND_ROW + 16;
  if (touch) {
    // No M to press: the line itself turns the sound off and on.
    const content = game.settings.muted ? 'LJUDET ÄR AVSTÄNGT. TRYCK HÄR FÖR ATT SÄTTA PÅ.' : 'STÄNG AV ALLT LJUD: TRYCK HÄR';
    const mute = line(content, muteY, game.settings.muted ? 'red_4' : 'grey_5');
    elements.push({ ...mute, tap: { kind: 'press', action: 'mute' }, hit: rowHit(mute.x, textWidth(content), muteY, SOUND_ROW) });
    elements.push(line('ÄNDRA: TRYCK PÅ STAPLARNA', PROMPT_Y, 'grey_4'));
    return elements;
  }
  const key = (action) => keyNamesFor([action])[0];
  if (game.settings.muted) elements.push(line(`LJUDET ÄR AVSTÄNGT. SÄTT PÅ MED ${key('mute')}.`, muteY, 'red_4'));
  elements.push(line(`ÄNDRA: ${key('left')} ${key('right')}     AV/PÅ: ${key('mute')}     TILLBAKA: ${key('back')}`, PROMPT_Y, 'grey_4'));
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
function gameOverElements(game, touch) {
  const unlocked = game.screenTime - GAME_OVER_LOCK;
  const headingY = 14;
  const elements = [
    { kind: 'image', image: 'gameOver', x: Math.floor((VIEW_WIDTH - GAME_OVER_HEADING.width) / 2), y: headingY },
    line('UTREDNINGEN LÄGGS NER.', headingY + GAME_OVER_HEADING.height + 4, 'white'),
  ];
  const top = headingY + GAME_OVER_HEADING.height + LINE_HEIGHT + 14;
  caseFileRows(game.world).forEach(([label, value], i) => {
    elements.push(...caseRow(label, value, top + i * CASE_ROW, i < 2 ? 'hivis_3' : 'urine_4'));
  });
  if (unlocked >= 0 && isBlinkOn(unlocked)) elements.push(line(promptText(touch), PROMPT_Y, 'hivis_3'));
  return elements;
}

// A label on the left and its value lined up on the right.
function caseRow(label, value, y, colour = 'urine_4') {
  return [text(label, CASE_LEFT, y, 'grey_5'), text(value, CASE_RIGHT - textWidth(value), y, colour)];
}

const REPORT_TOP = 8;
const REPORT_ROW = LINE_HEIGHT;
const PROMPT_Y = VIEW_HEIGHT - LINE_HEIGHT - 6;

function headed(heading, subheading) {
  return [line(heading, REPORT_TOP, 'hivis_3'), line(subheading, REPORT_TOP + LINE_HEIGHT, 'grey_4')];
}

// The rows of found against total, from y; returns the elements and the
// y after them.
function foundRows(rows, y) {
  return rows.flatMap((row, i) => caseRow(row.label, `${row.found} AV ${row.total}`, y + i * REPORT_ROW));
}

function costRows(report, y, costLabel) {
  return [
    ...caseRow(costLabel, formatKronor(report.cost), y),
    ...caseRow('BESLAGTAGET', formatGrams(report.grams), y + REPORT_ROW),
    ...caseRow('KOSTNAD PER GRAM', report.costPerGram === null ? 'EJ MÄTBAR' : formatKronor(report.costPerGram), y + 2 * REPORT_ROW),
  ];
}

function prompt(game, ready, touch) {
  const since = game.screenTime - REPORT_LOCK;
  return ready && since >= 0 && isBlinkOn(since) ? [line(promptText(touch), PROMPT_Y, 'hivis_3')] : [];
}

// A full tank's urine bonus, counting in a second time.
export const DOUBLED_LABEL = 'FULL TANK! URINBONUS ×2';

// A level's report: found of total, the time and urine bonuses counting
// down into the score, what it all cost, and the verdict.
function levelCompleteElements(game, touch) {
  const { report, world } = game;
  const rowsTop = REPORT_TOP + 2 * LINE_HEIGHT + 4;
  const bonusY = rowsTop + report.rows.length * REPORT_ROW + 4;
  const costY = bonusY + 3 * REPORT_ROW + 5;
  const left = bonusLeft(report, game.bonusGiven);
  return [
    ...headed('POLISENS PRESTATIONSRAPPORT', report.title.toUpperCase()),
    ...foundRows(report.rows, rowsTop),
    ...caseRow('TIDSBONUS', String(left.time), bonusY),
    ...(left.doubled
      ? caseRow(DOUBLED_LABEL, String(left.urine), bonusY + REPORT_ROW, 'hivis_3')
      : caseRow(`URINBONUS (${report.poured} PROV)`, String(left.urine), bonusY + REPORT_ROW)),
    ...caseRow('POÄNG', padNumber(world.score.points, 7), bonusY + 2 * REPORT_ROW, 'hivis_3'),
    ...costRows(report, costY, 'INSATSENS KOSTNAD'),
    line(`BEDÖMNING: ${report.verdict}`, costY + 3 * REPORT_ROW + 5, 'white'),
    ...prompt(game, isBonusCounted(game), touch),
  ];
}

// The year's report: every level added up, and the verdict on the year.
function yearReportElements(game, touch) {
  const { year, world } = game;
  const rowsTop = REPORT_TOP + 2 * LINE_HEIGHT + 4;
  const scoreY = rowsTop + year.rows.length * REPORT_ROW + 4;
  const costY = scoreY + REPORT_ROW + 5;
  const closing = costY + 3 * REPORT_ROW + 5;
  return [
    ...headed('POLISENS ÅRSRAPPORT', `BLENKE HUSIS, ${currentRank(world.score).title.toUpperCase()}`),
    ...foundRows(year.rows, rowsTop),
    ...caseRow('POÄNG', padNumber(world.score.points, 7), scoreY, 'hivis_3'),
    ...costRows(year, costY, 'ÅRETS KOSTNAD'),
    line('ÅRETS POLIS: BLENKE HUSIS. ANSLAGEN FÖRDUBBLAS.', closing, 'white'),
    ...prompt(game, true, touch),
  ];
}

// Signing the report: the score and the place it takes, and the tag's
// three letters side by side in big lettering, the one being set lit,
// with arrows over and under it to turn it (over and under every letter
// when played by touch, where each arrow and letter takes taps, and KLAR
// signs).
// Where the capitals' tops stand; Å, Ä and Ö reach above.
const TAG_TOP = 88;
const TAG_SPACING = 32;
const ARROW_GAP = 3;
const TAG_HIT_REACH = 8;

// The picture of a tag letter, lit or unlit, by name (render.js makes them).
export function tagImageName(look, letter) {
  return `tag-${look}-${letter}`;
}

function tagElements(tag, touch) {
  const elements = [];
  const height = TAG_LETTER_ART.lit.A.height;
  const tallest = Math.max(...Object.values(TAG_LETTER_ART.lit).map((image) => image.height));
  const upY = TAG_TOP + height - tallest - ARROW_GAP - LINE_HEIGHT;
  const downY = TAG_TOP + height + ARROW_GAP;
  for (let slot = 0; slot < TAG_LENGTH; slot++) {
    const middle = Math.floor(VIEW_WIDTH / 2 + (slot - (TAG_LENGTH - 1) / 2) * TAG_SPACING);
    const left = middle - TAG_SPACING / 2;
    const lit = slot === tag.slot;
    const letter = TAG_LETTERS[tag.letters[slot]];
    const look = lit ? 'lit' : 'unlit';
    const image = TAG_LETTER_ART[look][letter];
    // The letter takes the taps on its own height; the arrows the rest of
    // the column above and below it, and a little beyond.
    const column = (top, bottom) => ({ x: left, y: top, width: TAG_SPACING, height: bottom - top });
    elements.push({
      kind: 'image',
      image: tagImageName(look, letter),
      x: middle - Math.floor(image.width / 2),
      // On one line with the rest: Å, Ä and Ö reach higher.
      y: TAG_TOP + height - image.height,
      tap: { kind: 'tag', slot, step: 0 },
      hit: column(TAG_TOP, TAG_TOP + height),
    });
    if (!lit && !touch) continue;
    const colour = lit ? 'hivis_3' : 'grey_4';
    const arrow = (content, y, step, hit) => ({ ...text(content, middle - Math.floor(textWidth(content) / 2), y, colour), tap: { kind: 'tag', slot, step }, hit });
    elements.push(arrow('↑', upY, 1, column(upY - TAG_HIT_REACH, TAG_TOP)));
    elements.push(arrow('↓', downY, -1, column(TAG_TOP + height, downY + LINE_HEIGHT + TAG_HIT_REACH)));
  }
  return elements;
}

const SIGN_LABEL = 'KLAR';
const SIGN_Y = 150;

function nameEntryElements(game, touch) {
  const { entry, world } = game;
  const elements = [
    line('NYTT REKORD!', 24, 'hivis_3'),
    line(`${padNumber(world.score.points, 7)} POÄNG GER PLATS ${entry.place + 1} PÅ TOPPLISTAN.`, 38, 'white'),
    line('SIGNERA RAPPORTEN MED TRE BOKSTÄVER:', 50, 'grey_5'),
    ...tagElements(entry.tag, touch),
  ];
  if (touch) {
    const sign = line(SIGN_LABEL, SIGN_Y, 'hivis_3');
    elements.push({ ...sign, tap: { kind: 'sign' }, hit: rowHit(sign.x, textWidth(SIGN_LABEL), SIGN_Y, 20) });
    elements.push(line('TRYCK PÅ PILARNA FÖR ATT BYTA BOKSTAV', PROMPT_Y, 'grey_4'));
    return elements;
  }
  elements.push(line('BOKSTAV: ↑ ↓ ELLER SKRIV     PLATS: ← →', SIGN_Y - 6, 'grey_4'));
  elements.push(line('NÄSTA OCH KLAR: ENTER', SIGN_Y + 6, 'grey_4'));
  return elements;
}

// Whether the high scores may be kept: asked once, plainly, with a nod to
// the urine test, which nobody asks first.
function consentElements(game) {
  return [
    line('FÅR TOPPLISTAN SPARAS?', 44, 'hivis_3'),
    line('DEN SPARAS, MED LJUDINSTÄLLNINGARNA, BARA I DEN HÄR WEBBLÄSAREN.', 64, 'white'),
    line('SVARAR DU NEJ SPARAS BARA SVARET, OCH VI FRÅGAR INTE IGEN.', 76, 'white'),
    line('SAMTYCKE KRÄVS. TILL SKILLNAD FRÅN URINPROVET.', 96, 'grey_4'),
    ...menuElements(game.menu, 124),
  ];
}

const SCORES_TOP = 44;
const SCORES_ROW = LINE_HEIGHT + 2;
const PLACE_RIGHT = 60;
const NAME_X = 68;
const RANK_X = 142;
const POINTS_RIGHT = VIEW_WIDTH - 40;

// The ten best, a new entry picked out.
function highScoresElements(game, touch) {
  const elements = headed('TOPPLISTA', 'ÅRETS MEST PRODUKTIVA POLISER').map((element) => ({ ...element, y: element.y + 8 }));
  game.highScores.forEach((entry, i) => {
    const y = SCORES_TOP + i * SCORES_ROW;
    const picked = i === game.highlight;
    const place = `${i + 1}.`;
    const points = padNumber(entry.points, 7);
    elements.push(
      text(place, PLACE_RIGHT - textWidth(place), y, picked ? 'hivis_3' : 'grey_4'),
      text(entry.name, NAME_X, y, picked ? 'hivis_3' : 'white'),
      text(entry.rank.toUpperCase(), RANK_X, y, picked ? 'hivis_3' : 'grey_5'),
      text(points, POINTS_RIGHT - textWidth(points), y, picked ? 'hivis_3' : 'urine_4'),
    );
  });
  elements.push(line(`TILLBAKA: ${touch ? TOUCH_PROMPT : 'ENTER'}`, PROMPT_Y, 'grey_4'));
  return elements;
}

// While all sound is off, a loudspeaker struck through stands in the
// corner of every screen, the play included.
const SPEAKER_X = VIEW_WIDTH - SPEAKER_OFF.width - 4;
const SPEAKER_Y = VIEW_HEIGHT - SPEAKER_OFF.height - 4;

// What the screen shows over (or instead of) the world: { shade, hud,
// elements, tap }, shade true when the world is dimmed behind them, hud
// false when the screen takes the HUD's and the message line's place, tap
// what a tap anywhere does (if anything). touch: the game is played by
// touch, so the screens speak of tapping rather than keys.
export function screenLayout(game, { touch = false } = {}) {
  const layout = layoutFor(game, touch);
  if (!game.settings.muted) return layout;
  return { ...layout, elements: [...layout.elements, { kind: 'image', image: 'speakerOff', x: SPEAKER_X, y: SPEAKER_Y }] };
}

function layoutFor(game, touch) {
  switch (game.screen) {
    case 'title':
      return { shade: false, hud: true, elements: titleElements(game) };
    case 'controls':
      return { shade: true, hud: true, elements: controlsElements(touch), tap: CONFIRM_TAP };
    case 'paused':
      return { shade: true, hud: true, elements: pauseElements(game) };
    case 'sound':
      return { shade: true, hud: true, elements: soundElements(game, touch) };
    case 'gameOver':
      return { shade: true, hud: false, elements: gameOverElements(game, touch), tap: CONFIRM_TAP };
    case 'levelComplete':
      return { shade: true, hud: false, elements: levelCompleteElements(game, touch), tap: CONFIRM_TAP };
    case 'yearReport':
      return { shade: true, hud: false, elements: yearReportElements(game, touch), tap: CONFIRM_TAP };
    case 'nameEntry':
      return { shade: true, hud: false, elements: nameEntryElements(game, touch) };
    case 'consent':
      return { shade: true, hud: false, elements: consentElements(game) };
    case 'highScores':
      return { shade: true, hud: false, elements: highScoresElements(game, touch), tap: CONFIRM_TAP };
    default:
      return { shade: false, hud: true, elements: [] };
  }
}
