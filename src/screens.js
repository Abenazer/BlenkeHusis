// The screens around the play laid out as data, like the HUD: text and
// pictures at view positions, in art pixels from its top left corner, and
// whether the world is shaded behind them. Pure: no DOM; render.js draws
// what this returns.
import { GAME_OVER_HEADING, LOGO } from './art/logo.js';
import { SPEAKER_OFF, VOLUME_BARS } from './art/sound.js';
import { LINE_HEIGHT, textWidth } from './art/font.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { GAME_OVER_LOCK, isBonusCounted, REPORT_LOCK } from './game.js';
import { keyNamesFor } from './input.js';
import { NAME_LENGTH } from './highscores.js';
import { padNumber } from './hud.js';
import { formatGrams, formatKronor } from './report.js';
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

// A menu's choices centred one under the other from y, row apart, the
// marked one between arrows, the ones that can't be taken now greyed out.
export function menuElements(menu, y, row = MENU_ROW) {
  return menu.items.flatMap((item, i) => {
    const top = y + i * row;
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
  return [...elements, ...menuElements(game.titleMenu, TITLE_MENU_Y, TITLE_MENU_ROW)];
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
  { label: 'LJUD AV/PÅ', actions: ['mute'] },
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

// The sound settings: each volume's row with its bar and step, the marked
// row picked out, and the way back.
const SOUND_TOP = 50;
const SOUND_ROW = 20;
const SOUND_LABEL_X = 112;
const SOUND_BAR_X = 196;
const SOUND_LABELS = { music: 'MUSIK', effects: 'EFFEKTER' };

function soundElements(game) {
  const menu = game.soundMenu;
  const elements = [line('LJUD', SOUND_TOP, 'hivis_3')];
  const top = SOUND_TOP + 30;
  ['music', 'effects'].forEach((volume, i) => {
    const y = top + i * SOUND_ROW;
    const marked = menu.items[menu.index].id === volume;
    const colour = marked ? 'hivis_3' : 'grey_5';
    if (marked) elements.push(text('>', SOUND_LABEL_X - MARK_GAP - textWidth('>'), y, colour));
    elements.push(text(SOUND_LABELS[volume], SOUND_LABEL_X, y, colour));
    const bar = VOLUME_BARS[game.settings[volume]];
    elements.push({ kind: 'image', image: `volume${game.settings[volume]}`, x: SOUND_BAR_X, y: y - 1 });
    elements.push(text(String(game.settings[volume]), SOUND_BAR_X + bar.width + 6, y, colour));
  });
  const back = menu.items.findIndex((item) => item.id === 'back');
  const backMenu = { items: [menu.items[back]], index: menu.index === back ? 0 : -1 };
  elements.push(...menuElements(backMenu, top + 2 * SOUND_ROW + 8));
  const key = (action) => keyNamesFor([action])[0];
  if (game.settings.muted) elements.push(line(`LJUDET ÄR AVSTÄNGT. SÄTT PÅ MED ${key('mute')}.`, top + 3 * SOUND_ROW + 16, 'red_4'));
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
function gameOverElements(game) {
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
  if (unlocked >= 0 && isBlinkOn(unlocked)) elements.push(line(PROMPT, PROMPT_Y, 'hivis_3'));
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

function prompt(game, ready) {
  const since = game.screenTime - REPORT_LOCK;
  return ready && since >= 0 && isBlinkOn(since) ? [line(PROMPT, PROMPT_Y, 'hivis_3')] : [];
}

// A level's report: found of total, the time bonus counting down into the
// score, what it all cost, and the verdict.
function levelCompleteElements(game) {
  const { report, world } = game;
  const rowsTop = REPORT_TOP + 2 * LINE_HEIGHT + 4;
  const bonusY = rowsTop + report.rows.length * REPORT_ROW + 4;
  const costY = bonusY + 2 * REPORT_ROW + 5;
  return [
    ...headed('POLISENS PRESTATIONSRAPPORT', report.title.toUpperCase()),
    ...foundRows(report.rows, rowsTop),
    ...caseRow('TIDSBONUS', String(report.bonus - game.bonusGiven), bonusY),
    ...caseRow('POÄNG', padNumber(world.score.points, 7), bonusY + REPORT_ROW, 'hivis_3'),
    ...costRows(report, costY, 'INSATSENS KOSTNAD'),
    line(`BEDÖMNING: ${report.verdict}`, costY + 3 * REPORT_ROW + 5, 'white'),
    ...prompt(game, isBonusCounted(game)),
  ];
}

// The year's report: every level added up, and the verdict on the year.
function yearReportElements(game) {
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
    ...prompt(game, true),
  ];
}

// Signing the report: the score and the place it takes, and the name as
// it is typed, with a blinking cursor while there is room for more. The
// name stands where name and cursor together are centred, so it doesn't
// shift as the cursor blinks.
function nameEntryElements(game) {
  const { entry, world } = game;
  const room = [...entry.name].length < NAME_LENGTH;
  const x = centred(`${entry.name}_`);
  const elements = [
    line('NYTT REKORD!', 40, 'hivis_3'),
    line(`${padNumber(world.score.points, 7)} POÄNG GER PLATS ${entry.place + 1} PÅ TOPPLISTAN.`, 56, 'white'),
    line(`UNDERTECKNA RAPPORTEN (HÖGST ${NAME_LENGTH} TECKEN):`, 84, 'grey_5'),
    line('KLAR: ENTER     SUDDA: BACKSTEG', 140, 'grey_4'),
  ];
  if (entry.name !== '') elements.push(text(entry.name, x, 104, 'urine_4'));
  if (room && isBlinkOn(game.screenTime * 2)) {
    elements.push(text('_', x + (entry.name === '' ? 0 : textWidth(entry.name) + 1), 104, 'hivis_3'));
  }
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
function highScoresElements(game) {
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
  elements.push(line('TILLBAKA: ENTER', PROMPT_Y, 'grey_4'));
  return elements;
}

// While all sound is off, a loudspeaker struck through stands in the
// corner of every screen, the play included.
const SPEAKER_X = VIEW_WIDTH - SPEAKER_OFF.width - 4;
const SPEAKER_Y = VIEW_HEIGHT - SPEAKER_OFF.height - 4;

// What the screen shows over (or instead of) the world: { shade, hud,
// elements }, shade true when the world is dimmed behind them, hud false
// when the screen takes the HUD's and the message line's place.
export function screenLayout(game) {
  const layout = layoutFor(game);
  if (!game.settings.muted) return layout;
  return { ...layout, elements: [...layout.elements, { kind: 'image', image: 'speakerOff', x: SPEAKER_X, y: SPEAKER_Y }] };
}

function layoutFor(game) {
  switch (game.screen) {
    case 'title':
      return { shade: false, hud: true, elements: titleElements(game) };
    case 'controls':
      return { shade: true, hud: true, elements: controlsElements() };
    case 'paused':
      return { shade: true, hud: true, elements: pauseElements(game) };
    case 'sound':
      return { shade: true, hud: true, elements: soundElements(game) };
    case 'gameOver':
      return { shade: true, hud: false, elements: gameOverElements(game) };
    case 'levelComplete':
      return { shade: true, hud: false, elements: levelCompleteElements(game) };
    case 'yearReport':
      return { shade: true, hud: false, elements: yearReportElements(game) };
    case 'nameEntry':
      return { shade: true, hud: false, elements: nameEntryElements(game) };
    case 'consent':
      return { shade: true, hud: false, elements: consentElements(game) };
    case 'highScores':
      return { shade: true, hud: false, elements: highScoresElements(game) };
    default:
      return { shade: false, hud: true, elements: [] };
  }
}
