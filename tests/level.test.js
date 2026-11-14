import test from 'node:test';
import assert from 'node:assert/strict';
import { textWidth } from '../src/art/font.js';
import { BACKDROPS, DEFAULT_BACKDROP } from '../src/backdrop.js';
import { CITIZENS } from '../src/citizens.js';
import { VIEW_WIDTH } from '../src/config.js';
import { ENEMIES } from '../src/enemies.js';
import { ITEMS } from '../src/items.js';
import {
  clockFor,
  CRATE,
  CRATE_DEFAULT,
  DEFAULT_TIME,
  EMPTY,
  GATE,
  isSecret,
  isSolid,
  tileType,
  joinSections,
  MARKERS,
  OPEN_CRATE,
  openCrate,
  openGates,
  parseLevel,
  revealRoom,
  ROOM,
  SECRET_ASPHALT,
  SECRET_WALL,
  tileAt,
  TILE_TYPES,
} from '../src/level.js';
import { CAST } from '../src/levels/cast.js';
import { finish } from '../src/levels/finish.js';
import { findLevel, LEVELS, nextLevel, TEST_LEVEL, TRY_LEVELS } from '../src/levels/index.js';
import { SCENERY } from '../src/scenery.js';
import { PLATFORM_CHARS } from '../src/platforms.js';
import { PROPS } from '../src/props.js';
import { PROJECTILES } from '../src/projectiles.js';

test('sections join side by side, row by row', () => {
  assert.deepEqual(joinSections(['ab', 'cd'], ['e', 'f']), ['abe', 'cdf']);
});

test('sections of different heights are refused', () => {
  assert.throws(() => joinSections(['a', 'b'], ['c']), /Section 1 has 1 rows/);
});

test('a level is parsed into tiles, and the start leaves an empty tile', () => {
  const level = parseLevel({ id: 'x', name: 'X', rows: ['.@.', '###'] });
  assert.equal(level.width, 3);
  assert.equal(level.height, 2);
  assert.deepEqual(level.start, { type: 'start', col: 1, row: 0 });
  assert.equal(tileAt(level, 1, 0), EMPTY);
  assert.equal(tileAt(level, 1, 1), '#');
});

test('uneven rows, unknown tiles and a missing start are refused', () => {
  assert.throws(() => parseLevel({ id: 'x', rows: ['.@.', '##'] }), /row 1 is 2 wide/);
  assert.throws(() => parseLevel({ id: 'x', rows: ['.@¤', '###'] }), /unknown tile '¤'/);
  assert.throws(() => parseLevel({ id: 'x', rows: ['...', '###'] }), /exactly one start/);
});

test('the sides of a level are walls, above and below are open', () => {
  const level = parseLevel({ id: 'x', rows: ['.@.', '###'] });
  assert.equal(tileAt(level, -1, 0), '#');
  assert.equal(tileAt(level, 3, 0), '#');
  assert.equal(tileAt(level, 1, -1), EMPTY);
  assert.equal(tileAt(level, 1, 2), EMPTY);
});

test('every level in the game parses, and the try-out levels', () => {
  for (const definition of [...LEVELS, ...TRY_LEVELS]) {
    assert.doesNotThrow(() => parseLevel(definition), definition.id);
  }
});

test('item characters place items on empty tiles', () => {
  const level = parseLevel({ id: 'x', rows: ['.@uph', '#####'] });
  const items = level.markers.filter((marker) => marker.type === 'item');
  assert.deepEqual(items.map((marker) => [marker.item, marker.col]), [['sampleCup', 2], ['possession', 3], ['sampleCanister', 4]]);
  assert.equal(tileAt(level, 2, 0), EMPTY);
});

function everyLevelChar() {
  return [
    ...Object.keys(TILE_TYPES),
    ...Object.keys(MARKERS),
    ...Object.values(ITEMS).map((item) => item.char).filter((char) => char !== null),
    ...Object.values(ENEMIES).map((enemy) => enemy.char).filter((char) => char !== null),
    ...Object.keys(PLATFORM_CHARS),
    ...Object.values(CITIZENS).map((citizen) => citizen.char),
    ...Object.values(PROPS).map((prop) => prop.char),
    ...Object.values(SCENERY).map((piece) => piece.char),
    EMPTY,
  ];
}

test('no item, enemy, platform, marker or tile shares a character', () => {
  const chars = everyLevelChar();
  assert.equal(new Set(chars).size, chars.length);
});

// The parser reads a row one UTF-16 code unit per tile, so a character
// beyond ASCII works as long as it is a single code unit (no emoji), a
// single precomposed letter (an ä made of a and a combining mark is two
// tiles), one column wide and not easily mistaken in a level's text. Latin-1
// is enough for now; widen ALLOWED deliberately if it runs out.
const ALLOWED = /^[\u0021-\u007e\u00a1-\u00ff]$/;
const LOOK_ALIKES = new Set(['¡', '¦', '·', '×', 'Ð', 'Ø']);

test('every level character is one code unit: printable, precomposed, Latin-1 and no look-alike', () => {
  for (const char of everyLevelChar()) {
    assert.equal(char.length, 1, `'${char}' is one code unit`);
    assert.match(char, ALLOWED, `'${char}' is ASCII or Latin-1`);
    assert.match(char, /^[\p{L}\p{N}\p{P}\p{S}]$/u, `'${char}' is printable, not a space or a combining mark`);
    assert.equal(char.normalize('NFKC'), char, `'${char}' is not a compatibility form (², º, µ…)`);
    assert.ok(!LOOK_ALIKES.has(char), `'${char}' is too like another character`);
  }
});

test('every level is written in NFC, so an å, ä or ö is one tile', () => {
  for (const definition of [...LEVELS, ...TRY_LEVELS]) {
    definition.rows.forEach((line, row) => {
      assert.equal(line, line.normalize('NFC'), `${definition.id} row ${row}`);
    });
  }
});

test('a level has a clock: its own time, or the default', () => {
  assert.equal(parseLevel({ id: 'x', rows: ['@', '#'], time: 90 }).time, 90);
  assert.equal(parseLevel({ id: 'x', rows: ['@', '#'] }).time, DEFAULT_TIME);
  assert.throws(() => parseLevel({ id: 'x', rows: ['@', '#'], time: 0 }), /positive time/);
});

test('a level has a backdrop: its own, or the suburb\'s; an unknown one fails', () => {
  assert.equal(parseLevel({ id: 'x', rows: ['@', '#'], backdrop: 'countryside' }).backdrop, 'countryside');
  assert.equal(parseLevel({ id: 'x', rows: ['@', '#'] }).backdrop, DEFAULT_BACKDROP);
  assert.throws(() => parseLevel({ id: 'x', rows: ['@', '#'], backdrop: 'toString' }), /unknown backdrop 'toString'/);
});

// A sign is read on the message line, one line across the view, centred.
test('every sign fits on the message line', () => {
  for (const level of [...LEVELS, ...TRY_LEVELS]) {
    for (const text of level.signs ?? []) assert.ok(textWidth(text) <= VIEW_WIDTH, `${level.id}: '${text}' is ${textWidth(text)} wide`);
  }
});

test('every level of the game names its backdrop, and none of them is set before the Globe was built shows it', () => {
  for (const level of LEVELS) {
    assert.ok(Object.hasOwn(BACKDROPS, level.backdrop ?? ''), `${level.id} names no backdrop of BACKDROPS`);
    assert.ok(!BACKDROPS[level.backdrop].includes('horizon'), `${level.id} shows the Globe`);
  }
});

test('enemy and platform characters place them on empty tiles', () => {
  const level = parseLevel({ id: 'x', rows: ['.@DH', '####'] });
  const [, enemy, platform] = level.markers;
  assert.deepEqual(enemy, { type: 'enemy', enemy: 'dealer', col: 2, row: 0 });
  assert.deepEqual(platform, { type: 'platform', axis: 'horizontal', col: 3, row: 0 });
  assert.equal(tileAt(level, 2, 0), EMPTY);
});

test('an item written right above a crate is inside it; an empty crate holds a sample', () => {
  const level = parseLevel({ id: 'x', rows: ['.K....', '.?.?..', '......', '@.....', '######'] });
  assert.deepEqual(level.crates, [
    { col: 1, row: 1, contents: 'policeCoffee' },
    { col: 3, row: 1, contents: CRATE_DEFAULT },
  ]);
  assert.ok(!level.markers.some((marker) => marker.type === 'item'), 'the coffee is not lying on top');
  assert.equal(tileAt(level, 1, 1), CRATE);
});

test('a crate opens once, into an empty one, giving up what it held', () => {
  const level = parseLevel({ id: 'x', rows: ['.X', '.?', '@.', '##'] });
  assert.equal(openCrate(level, 1, 1), 'helicopter');
  assert.equal(tileAt(level, 1, 1), OPEN_CRATE);
  assert.equal(openCrate(level, 1, 1), null);
  assert.equal(openCrate(level, 0, 0), null);
});

test('signs take their texts in order from the left, and every sign needs one', () => {
  const level = parseLevel({ id: 'x', rows: ['..i.', '@i..', '####'], signs: ['A', 'B'] });
  const signs = level.markers.filter((marker) => marker.type === 'sign');
  assert.deepEqual(signs.map((sign) => [sign.col, sign.text]), [[2, 'B'], [1, 'A']]);
  assert.throws(() => parseLevel({ id: 'x', rows: ['@i', '##'] }), /1 signs but 0 sign texts/);
});

test('citizen and prop characters place them on empty tiles', () => {
  const level = parseLevel({ id: 'x', rows: ['@mv', '###'] });
  const [, citizen, prop] = level.markers;
  assert.deepEqual(citizen, { type: 'citizen', citizen: 'pensioner', col: 1, row: 0 });
  assert.deepEqual(prop, { type: 'prop', prop: 'cone', col: 2, row: 0 });
  assert.equal(tileAt(level, 1, 0), EMPTY);
});

test('checkpoints, the goal and scenery are markers on empty tiles; a level has one goal at most', () => {
  const level = parseLevel({ id: 'x', rows: ['@C1G', '####'] });
  assert.deepEqual(level.markers.slice(1), [
    { type: 'checkpoint', col: 1, row: 0 },
    { type: 'scenery', scenery: 'busStop', col: 2, row: 0 },
    { type: 'goal', col: 3, row: 0 },
  ]);
  assert.equal(tileAt(level, 2, 0), EMPTY);
  assert.throws(() => parseLevel({ id: 'x', rows: ['@GG', '###'] }), /more than one goal/);
});

test('a level shows its title as it starts, or else its name', () => {
  assert.equal(parseLevel({ id: 'x', name: 'Förorten', title: 'VÄRLD 1-1', rows: ['@', '#'] }).title, 'VÄRLD 1-1');
  assert.equal(parseLevel({ id: 'x', name: 'Förorten', rows: ['@', '#'] }).title, 'Förorten');
});

test('gates are solid until opened, all at once', () => {
  const level = parseLevel({ id: 'x', rows: ['..|', '@.|', '###'] });
  assert.ok(isSolid(GATE));
  assert.equal(openGates(level), 2);
  assert.equal(tileAt(level, 2, 0), EMPTY);
  assert.equal(tileAt(level, 2, 1), EMPTY);
});

test('a secret wall lets Blenke through, and revealing it shows the whole room joined to it', () => {
  const level = parseLevel({ id: 'x', rows: ['B::B:', 'B::BB', '@...#', '#####'] });
  assert.ok(!isSolid(SECRET_WALL));
  assert.equal(revealRoom(level, 1, 1), 4);
  for (const [col, row] of [[1, 0], [2, 0], [1, 1], [2, 1]]) assert.equal(tileAt(level, col, row), ROOM);
  assert.equal(tileAt(level, 4, 0), SECRET_WALL, 'a room not joined to it stays hidden');
  assert.equal(revealRoom(level, 0, 2), 0);
});

test('secret asphalt looks like asphalt, lets Blenke through and hides a room like a secret wall, joined to one', () => {
  const level = parseLevel({ id: 'x', rows: ['AA[[:', 'A[[AA', '@...#', '#####'] });
  assert.ok(!isSolid(SECRET_ASPHALT));
  assert.ok(isSecret(SECRET_ASPHALT) && isSecret(SECRET_WALL));
  assert.equal(tileType(SECRET_ASPHALT).disguise, 'A');
  assert.equal(revealRoom(level, 1, 1), 5);
  for (const [col, row] of [[2, 0], [3, 0], [4, 0], [1, 1], [2, 1]]) assert.equal(tileAt(level, col, row), ROOM);
  assert.equal(tileAt(level, 0, 0), 'A');
});

test('something placed in a room stands on the room, so the room has no hole', () => {
  const level = parseLevel({ id: 'x', rows: ['B:hu:B', 'B;Y;;B', 'Bp;;;B', '@.....', '######'] });
  assert.deepEqual([0, 1, 2].map((row) => [1, 2, 3, 4].map((col) => tileAt(level, col, row)).join('')), [
    '::::',
    ';;;;',
    ';;;;',
  ]);
  assert.equal(level.markers.filter((marker) => marker.type === 'item').length, 3);
});

test('levels follow each other in order and end with the last; the try-out levels are found by their id', () => {
  LEVELS.slice(0, -1).forEach((level, i) => assert.equal(nextLevel(level), LEVELS[i + 1]));
  assert.equal(nextLevel(LEVELS[LEVELS.length - 1]), null);
  assert.equal(nextLevel(TEST_LEVEL), null);
  for (const level of TRY_LEVELS) {
    assert.equal(findLevel(level.id), level);
    assert.equal(nextLevel(level), null);
  }
  assert.equal(findLevel('figurer'), TRY_LEVELS.find((level) => level.id === 'figurer'));
  assert.equal(findLevel('nowhere'), null);
});

test('a cast places characters by column, standing on the highest floor there or on their own row', () => {
  const level = parseLevel({
    id: 'x',
    rows: [
      '@.......',
      '...__...',
      '........',
      '########',
    ],
    cast: [
      { type: 'stoner', col: 1 },
      { type: 'dealer', col: 3 },
      { type: 'pensioner', col: 4, row: 2 },
    ],
  });
  const placed = level.markers.filter((marker) => marker.type === 'enemy' || marker.type === 'citizen');
  assert.deepEqual(placed, [
    { type: 'enemy', enemy: 'stoner', col: 1, row: 2 },
    { type: 'enemy', enemy: 'dealer', col: 3, row: 0 },
    { type: 'citizen', citizen: 'pensioner', col: 4, row: 2 },
  ]);
});

test('a cast fails loudly: an unknown character, a column outside, nowhere to stand, inside a wall', () => {
  const rows = ['@..', '#.#'];
  const cast = (entry) => () => parseLevel({ id: 'x', rows, cast: [entry] });
  assert.throws(cast({ type: 'nobody', col: 0 }), /unknown character 'nobody'/);
  assert.throws(cast({ type: 'stoner', col: 3 }), /outside the level/);
  assert.throws(cast({ type: 'stoner', col: 1 }), /nothing to stand on/);
  assert.throws(cast({ type: 'stoner', col: 0, row: 1 }), /inside a wall/);
});

test('each level takes its own cast', () => {
  for (const level of [...LEVELS, ...TRY_LEVELS]) assert.deepEqual(level.cast, CAST[level.id] ?? [], level.id);
});

test('a station\'s name board shows the level\'s station name, and fails without one', () => {
  const board = SCENERY.stationSign.char;
  const level = parseLevel({ id: 'x', stationName: 'KRIGSLIDA', rows: [`@${board}`, '##'] });
  assert.equal(level.markers.find((marker) => marker.type === 'scenery').text, 'KRIGSLIDA');
  assert.throws(() => parseLevel({ id: 'x', rows: [`@${board}`, '##'] }), /no stationName/);
});

test('a level is numbered by its place in the playing order, not by its own file', () => {
  LEVELS.forEach((level, index) => {
    assert.equal(level.title, `BANA ${index + 1}: ${(level.place ?? level.name).toUpperCase()}`);
  });
  assert.deepEqual(LEVELS.map((level) => level.id), ['tungelsta', 'krigslida', 'vasterhaninge', 'jordbro', 'handen', 'skogas', 'trangsund', 'villastad']);
  assert.equal(LEVELS[0].title, 'BANA 1: TUNGELSTA');
  assert.equal(findLevel('trangsund').title, 'BANA 7: TRÅNGSUND');
  assert.equal(findLevel('villastad').title, 'BANA 8: SÖDERTÖRNS VILLASTAD');
});

test('Förorten rests out of the game, but can still be played by its id', () => {
  assert.ok(!LEVELS.some((level) => level.id === 'forort-1'));
  assert.equal(findLevel('forort-1'), TRY_LEVELS.find((level) => level.id === 'forort-1'));
});

test('every level of the game has a crate with an extra life about its middle and one with a heart in its last third', () => {
  for (const level of LEVELS) {
    const parsed = parseLevel(level);
    const gate = Math.max(...parsed.tiles.flatMap((char, index) => (char === GATE ? [index % parsed.width] : [])));
    const lying = parsed.markers.filter((marker) => marker.type === 'item' && ITEMS[marker.item].restores);
    assert.deepEqual(lying, [], `${level.id} has an extra life or a heart out of a crate`);
    const cratesOf = (type) => parsed.crates.filter((crate) => crate.contents === type).map((crate) => crate.col / gate);
    const [life, ...moreLives] = cratesOf('extraLife');
    const [heart, ...moreHearts] = cratesOf('heart');
    assert.ok(life !== undefined && moreLives.length === 0, `${level.id} has one extra life`);
    assert.ok(heart !== undefined && moreHearts.length === 0, `${level.id} has one heart`);
    assert.ok(life >= 0.35 && life <= 0.65, `${level.id}'s extra life is ${Math.round(life * 100)} % of the way to the gate`);
    assert.ok(heart >= 2 / 3 && heart < 1, `${level.id}'s heart is ${Math.round(heart * 100)} % of the way to the gate`);
  }
});

// The arenas are written with their gate 28 tiles in.
const ARENA_REACH = 28;

test('every level of the game has a clock for its width', () => {
  for (const level of LEVELS) {
    const { width } = parseLevel(level);
    assert.equal(level.time, clockFor(width), `${level.id} is ${width} tiles wide: its time should be ${clockFor(width)} s, not ${level.time} s`);
  }
});

test('every level of the game has a boss of its own in its cast, behind a gate before the finish', () => {
  const bosses = LEVELS.map((level) => {
    const cast = level.cast.filter((member) => ENEMIES[member.type]?.boss);
    assert.equal(cast.length, 1, `${level.id} has one boss of its own`);
    const [{ type, col }] = cast;
    assert.equal(ENEMIES[type].health, 5, `${level.id}'s boss takes five hits`);
    const parsed = parseLevel(level);
    // In the arena, not left behind in the level when a section is put in
    // before it: past the last phone booth to start again from.
    const lastCheckpoint = Math.max(...parsed.markers.filter((marker) => marker.type === 'checkpoint').map((marker) => marker.col));
    assert.ok(col > lastCheckpoint, `${level.id}'s boss stands past the last checkpoint, in the arena`);
    const gate = parsed.tiles.findIndex((char, index) => char === GATE && index % parsed.width > col);
    assert.ok(gate >= 0, `${level.id}'s boss has a gate after it`);
    // Every arena has its gate 28 tiles in: further from it than that, the
    // boss was left in the section before.
    assert.ok(gate % parsed.width - col <= ARENA_REACH, `${level.id}'s boss stands at column ${col}, ${gate % parsed.width - col} tiles before the gate: move him into the arena`);
    assert.ok(gate % parsed.width < parsed.width - finish(parsed.height)[0].length, `${level.id}'s gate is before the finish`);
    return type;
  });
  assert.equal(new Set(bosses).size, bosses.length, 'no two levels share a boss');
});

test('every boss has a name, a projectile and its lines, each fitting the message line', () => {
  for (const [type, enemy] of Object.entries(ENEMIES)) {
    if (!enemy.boss) continue;
    assert.ok(PROJECTILES[enemy.throws], `${type} throws something known`);
    if (enemy.skims) assert.ok(PROJECTILES[enemy.skims], `${type} skims something known`);
    const { wake, attack, hit } = enemy.bossLines;
    assert.ok(wake && attack.length > 0 && hit.length > 0, `${type} has its lines`);
    for (const text of [`${enemy.title} NEDLAGD. SPÄRREN HÄVD.`, wake, ...attack, ...hit]) assert.ok(textWidth(text) <= VIEW_WIDTH, `${type}: '${text}'`);
  }
});

test('every level of the game ends with the same finish: the goal\'s pole and the filling station', () => {
  for (const definition of LEVELS) {
    const ending = finish(definition.rows.length);
    definition.rows.forEach((row, i) => assert.ok(row.endsWith(ending[i]), `${definition.id} row ${i} doesn't end with the finish`));
  }
});

test('a level has one filling station at most', () => {
  assert.equal(parseLevel({ id: 'x', rows: ['@G.M', '####'] }).markers.filter((marker) => marker.type === 'station').length, 1);
  assert.throws(() => parseLevel({ id: 'x', rows: ['@GMM', '####'] }), /more than one filling station/);
});

test('every level of the game can be finished: it has a goal, checkpoints, a filling station past the goal and a way to open its gates', () => {
  for (const definition of LEVELS) {
    const level = parseLevel(definition);
    const count = (type) => level.markers.filter((marker) => marker.type === type).length;
    assert.equal(count('goal'), 1, `${definition.id} has no goal`);
    assert.ok(count('checkpoint') > 0, `${definition.id} has no checkpoint`);
    assert.equal(count('station'), 1, `${definition.id} has no filling station`);
    const goal = level.markers.find((marker) => marker.type === 'goal');
    const station = level.markers.find((marker) => marker.type === 'station');
    assert.ok(station.col - goal.col >= 4 && station.row === goal.row, `${definition.id}'s filling station is not a walk on from the goal`);
    const bosses = level.markers.filter((marker) => marker.type === 'enemy' && ENEMIES[marker.enemy].boss);
    if (level.tiles.includes(GATE)) assert.ok(bosses.length > 0, `${definition.id} has gates but no boss to open them`);
  }
});
