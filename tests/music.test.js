import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STEP } from '../src/config.js';
import { musicFor, PAUSED_VOLUME } from '../src/cues.js';
import { ENEMIES } from '../src/enemies.js';
import { createGame, pauseGame, stepGame } from '../src/game.js';
import { beginStep, createInput, queueKey } from '../src/input.js';
import { LEVELS, TEST_LEVEL } from '../src/levels/index.js';
import { COMPLETE_TIME } from '../src/world.js';
import { barTime, continueRender, DRUMS, parseSong, renderSong, startRender } from '../src/music.js';
import { SONGS } from '../src/music/index.js';
import { noteFrequency } from '../src/synth.js';

const RATE = 8000;
const LEAD = { wave: 'pulse', gain: 0.2, release: 0.01 };

function song(bars, extra = {}) {
  return { id: 'test', bpm: 120, loopBar: 0, instruments: { lead: LEAD }, bars, ...extra };
}

test('a bar of 4 at 120 bpm is four half-second notes, a hold lengthens one, a rest ends it', () => {
  assert.equal(barTime(song({})), 2);
  const { voices, duration } = parseSong(song({ lead: ['C4 - . E4'] }));
  assert.equal(duration, 2);
  assert.deepEqual(voices.map(({ at, length, freq }) => ({ at, length, freq })), [
    { at: 0, length: 1, freq: noteFrequency('C4') },
    { at: 1.5, length: 0.5, freq: noteFrequency('E4') },
  ]);
  assert.equal(voices[0].wave, 'pulse', 'played with the channel\'s instrument');
});

test('bars can be split into 1, 2, 4, 8 or 16 steps, and a note holds across bars', () => {
  const { voices } = parseSong(song({ lead: ['C4 D4 E4 F4 G4 A4 B4 C5', '- - - - . . . .'] }));
  assert.equal(voices.length, 8);
  assert.equal(voices[0].length, 0.25);
  assert.equal(voices.at(-1).length, 0.25 + 1);
  assert.throws(() => parseSong(song({ lead: ['C4 D4 E4'] })), /3 steps/);
});

test('the drums play the kit, each hit at its step', () => {
  const { voices } = parseSong(song({ lead: ['.'], drums: ['k . s .'] }));
  assert.equal(voices.length, DRUMS.k.length + DRUMS.s.length);
  assert.deepEqual([...new Set(voices.map((voice) => voice.at))], [0, 1]);
  assert.throws(() => parseSong(song({ lead: ['.'], drums: ['k . x .'] })), /no drum 'x'/);
});

test('a song that does not add up fails loudly', () => {
  assert.throws(() => parseSong(song({ lead: ['C4', 'C4'], drums: ['k'] })), /different numbers of bars/);
  assert.throws(() => parseSong(song({ lead: ['- C4 . .'] })), /holds no note/);
  assert.throws(() => parseSong(song({ lead: ['H4'] })), /Not a note/);
  assert.throws(() => parseSong(song({ bass: ['C2'] })), /no instrument/);
  assert.throws(() => parseSong(song({ lead: ['C4'] }, { loopBar: 1 })), /no bar 1/);
});

test('what rings on past the end is laid over the loop\'s start', () => {
  // At 240 bpm a bar is a second; an open hi-hat on its last sixteenth
  // rings on past the song's end.
  const lastHit = `${'. '.repeat(15)}o`;
  const { samples, loopStart, duration } = renderSong(song({ lead: ['.', '.'], drums: ['.', lastHit] }, { bpm: 240, loopBar: 1 }), RATE);
  assert.equal(duration, 2);
  assert.equal(loopStart, 1);
  assert.equal(samples.length, 2 * RATE);
  const tail = (DRUMS.o[0].length - 1 / 16) * RATE;
  assert.ok(samples.subarray(RATE, RATE + tail).some((sample) => sample !== 0), 'its tail is heard at the loop start');
  assert.ok(samples.subarray(0, RATE).every((sample) => sample === 0), 'not before the loop');
});

test('rendering a few voices at a time gives the same song', () => {
  const whole = renderSong(SONGS.title, RATE);
  const job = startRender(SONGS.title, RATE);
  let result = null;
  while (!result) result = continueRender(job, 5);
  assert.deepEqual(result.samples, whole.samples);
});

for (const [id, tune] of Object.entries(SONGS)) {
  test(`the song '${id}' parses, fits under full scale and loops seamlessly (or ends, a jingle)`, () => {
    assert.equal(tune.id, id);
    const { samples, duration, loopStart } = renderSong(tune, RATE);
    assert.equal(samples.length, Math.round(duration * RATE));
    let peak = 0;
    for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
    assert.ok(peak <= 0.8 && peak >= 0.2, `peak ${peak.toFixed(3)}`);
    if (loopStart === null) {
      assert.ok(Math.abs(samples.at(-1)) <= 0.001, 'a jingle ends in silence');
      return;
    }
    // Where the loop wraps, the step from the last sample to the loop's
    // first is no bigger than the steps either side of it.
    const start = Math.round(loopStart * RATE);
    const near = Math.round(0.01 * RATE);
    let largest = 0;
    for (let i = 1; i < near; i++) {
      largest = Math.max(largest, Math.abs(samples[start + i] - samples[start + i - 1]));
      largest = Math.max(largest, Math.abs(samples.at(-i) - samples.at(-i - 1)));
    }
    const seam = Math.abs(samples[start] - samples.at(-1));
    assert.ok(seam <= largest * 1.5 + 1e-6, `a step of ${seam.toFixed(3)} at the seam, ${largest.toFixed(3)} near it`);
  });
}

test('every channel plays its notes within its range', () => {
  const RANGES = { lead: ['C4', 'C7'], harmony: ['C3', 'C6'], bass: ['C1', 'C4'] };
  for (const tune of Object.values(SONGS)) {
    for (const voice of parseSong(tune).voices) {
      if (voice.channel === 'drums') continue;
      const [low, high] = RANGES[voice.channel].map(noteFrequency);
      assert.ok(voice.freq >= low && voice.freq <= high, `${tune.id} ${voice.channel}: ${voice.freq.toFixed(1)} Hz`);
    }
  }
});

function playing() {
  const game = createGame(LEVELS[0]);
  const input = createInput();
  queueKey(input, 'Enter', true);
  queueKey(input, 'Enter', false);
  beginStep(input);
  stepGame(game, input, STEP);
  return game;
}

test('the title screens play the title theme; a level its own song, quieter while paused', () => {
  for (const screen of ['title', 'controls', 'highScores']) assert.deepEqual(musicFor({ screen }), { song: 'title', volume: 1 });
  const game = playing();
  assert.deepEqual(musicFor(game), { song: 'suburbs', volume: 1 });
  pauseGame(game);
  assert.deepEqual(musicFor(game), { song: 'suburbs', volume: PAUSED_VOLUME });
});

test('the prosecutor has his theme while he fights, and the level\'s comes back after', () => {
  const game = playing();
  const boss = game.world.enemies.find((enemy) => ENEMIES[enemy.type].boss);
  boss.awake = true;
  assert.equal(musicFor(game).song, 'prosecutor');
  boss.defeated = true;
  assert.equal(musicFor(game).song, 'suburbs');
});

test('a lost life is silent, the last plays the game over on to its screen, the goal its jingle, the report its muzak', () => {
  const game = playing();
  game.world.down = 1;
  assert.equal(musicFor(game).song, null);
  game.world.down = 0;
  game.world.over = true;
  assert.equal(musicFor(game).song, 'gameOver');
  assert.equal(musicFor({ ...game, screen: 'gameOver' }).song, 'gameOver');
  game.world.over = false;
  game.world.complete = true;
  assert.equal(musicFor(game).song, 'levelComplete');
  for (const screen of ['levelComplete', 'yearReport']) assert.equal(musicFor({ screen }).song, 'report');
  for (const screen of ['nameEntry', 'consent']) assert.equal(musicFor({ screen }).song, 'highScore');
});

test('every song the game asks for exists, every level names one, and jingles play once', () => {
  for (const level of [...LEVELS, TEST_LEVEL]) assert.ok(SONGS[level.music], `${level.id} plays '${level.music}'`);
  const screens = ['title', 'controls', 'highScores', 'levelComplete', 'yearReport', 'gameOver', 'nameEntry', 'consent'];
  for (const screen of screens) assert.ok(SONGS[musicFor({ screen }).song], screen);
  for (const id of ['prosecutor', 'levelComplete', 'gameOver']) assert.ok(SONGS[id], id);
  for (const id of ['levelComplete', 'gameOver', 'highScore']) assert.equal(SONGS[id].loopBar, null, `${id} is a jingle`);
});

test('a jingle keeps what rings on past its last bar, and has no loop', () => {
  const { samples, loopStart, duration } = renderSong(song({ lead: ['.'], drums: [`${'. '.repeat(15)}o`] }, { bpm: 240, loopBar: null }), RATE);
  assert.equal(loopStart, null);
  assert.ok(duration > 1);
  assert.equal(samples.length, Math.round(duration * RATE));
});

test('the level\'s goal jingle is over before the report comes', () => {
  assert.ok(renderSong(SONGS.levelComplete, RATE).duration <= COMPLETE_TIME + 0.1);
});
