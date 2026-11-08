// Music written as text, like a tracker's rows, and rendered by synth.js
// into one loop of samples. Pure: no Web Audio.
//
// A song (see src/music/) has
//   bpm          beats per minute, four beats to a bar
//   loopBar      the bar the loop goes back to after the last (0: all of it)
//   instruments  per channel, the voice its notes are played with (synth.js:
//                wave, duty, gain and envelope); a channel named in DRUM_CHANNELS
//                plays the drum kit instead
//   bars         per channel, one string per bar, as many in every channel
//
// A bar is tokens split by spaces, all equally long: 4 are quarter notes, 8
// eighths, 16 sixteenths. A token is a note ('C5', 'F#4', 'Bb3'), '-' to
// hold the one before, or '.' for silence; on the drums, a letter from
// DRUMS or '.'.
import { addVoice, noteFrequency, voiceEnd } from './synth.js';

export const BEATS_PER_BAR = 4;
export const BAR_DIVISIONS = [1, 2, 4, 8, 16];
export const DRUM_CHANNELS = ['drums'];

// The kit: what each drum letter plays, its voices starting at the row.
export const DRUMS = {
  // Kick: a triangle thumping down.
  k: [{ wave: 'triangle', freq: 170, to: 50, length: 0.12, gain: 0.4, release: 0.03 }],
  // Snare: noise over a short tone.
  s: [
    { wave: 'noise', freq: 3500, length: 0.13, gain: 0.14, decay: 0.05, sustain: 0, release: 0.02 },
    { wave: 'triangle', freq: 220, to: 150, length: 0.06, gain: 0.18, release: 0.02 },
  ],
  // Closed and open hi-hat.
  h: [{ wave: 'noise', freq: 9000, length: 0.03, gain: 0.05, decay: 0.01, sustain: 0, release: 0.008 }],
  o: [{ wave: 'noise', freq: 9000, length: 0.12, gain: 0.05, decay: 0.05, sustain: 0.2, release: 0.03 }],
};

const HOLD = '-';
const REST = '.';

export function barTime(song) {
  return (60 / song.bpm) * BEATS_PER_BAR;
}

function tokensOf(bar, where) {
  const tokens = bar.trim().split(/\s+/);
  if (!BAR_DIVISIONS.includes(tokens.length)) {
    throw new Error(`${where}: ${tokens.length} steps in a bar; it takes ${BAR_DIVISIONS.join(', ')}`);
  }
  return tokens;
}

function drumVoices(tokens, start, step, where) {
  const voices = [];
  tokens.forEach((token, i) => {
    if (token === REST) return;
    const kit = DRUMS[token];
    if (!kit) throw new Error(`${where}: no drum '${token}'`);
    for (const voice of kit) voices.push({ ...voice, channel: 'drums', at: start + i * step + (voice.at ?? 0) });
  });
  return voices;
}

// One channel's notes as voices: a note lasts until the next note or rest.
function channelVoices(song, channel) {
  const bars = song.bars[channel];
  const bar = barTime(song);
  if (DRUM_CHANNELS.includes(channel)) {
    return bars.flatMap((text, b) => {
      const tokens = tokensOf(text, `${song.id} ${channel} bar ${b + 1}`);
      return drumVoices(tokens, b * bar, bar / tokens.length, `${song.id} ${channel} bar ${b + 1}`);
    });
  }
  const instrument = song.instruments[channel];
  if (!instrument) throw new Error(`${song.id}: no instrument for the channel '${channel}'`);
  const voices = [];
  let note = null;
  const end = (time) => {
    if (note) voices.push({ ...instrument, channel, at: note.at, length: time - note.at, freq: note.freq });
    note = null;
  };
  bars.forEach((text, b) => {
    const where = `${song.id} ${channel} bar ${b + 1}`;
    const tokens = tokensOf(text, where);
    tokens.forEach((token, i) => {
      const time = b * bar + (i * bar) / tokens.length;
      if (token === HOLD) {
        if (!note) throw new Error(`${where}: '${HOLD}' holds no note`);
        return;
      }
      end(time);
      if (token !== REST) note = { at: time, freq: noteFrequency(token) };
    });
  });
  end(bars.length * bar);
  return voices;
}

// The song as voices (each marked with its channel), with its length and
// where its loop starts (seconds).
export function parseSong(song) {
  const channels = Object.keys(song.bars);
  const counts = new Set(channels.map((channel) => song.bars[channel].length));
  if (counts.size !== 1) throw new Error(`${song.id}: the channels have different numbers of bars`);
  const [bars] = counts;
  if (!(song.loopBar >= 0 && song.loopBar < bars)) throw new Error(`${song.id}: no bar ${song.loopBar} to loop to`);
  return {
    duration: bars * barTime(song),
    loopStart: song.loopBar * barTime(song),
    voices: channels.flatMap((channel) => channelVoices(song, channel)),
  };
}

// A song takes a tenth of a second or more to render, too long for one
// frame, so it renders a few voices at a time: startRender, then
// continueRender until it returns the result.
export function startRender(song, rate) {
  const { duration, loopStart, voices } = parseSong(song);
  const end = Math.max(duration, ...voices.map(voiceEnd));
  return { rate, duration, loopStart, voices, next: 0, rendered: new Float32Array(Math.ceil(end * rate)), result: null };
}

// Renders up to count more voices. Returns the song once all are in:
// { samples, loopStart, duration } (seconds), one pass from its start to
// the end of its last bar. What rings on past the end is laid over the
// loop's start, where it would sound as the loop goes round, so the loop
// is seamless. Until then, null.
export function continueRender(job, count) {
  const { rate, voices, rendered } = job;
  const last = Math.min(job.next + count, voices.length);
  for (; job.next < last; job.next += 1) addVoice(rendered, voices[job.next], rate);
  if (job.result || job.next < voices.length) return job.result;
  const length = Math.round(job.duration * rate);
  const start = Math.round(job.loopStart * rate);
  const samples = rendered.slice(0, length);
  for (let i = length; i < rendered.length; i++) samples[start + ((i - length) % (length - start))] += rendered[i];
  job.result = { samples, loopStart: job.loopStart, duration: job.duration };
  job.rendered = null;
  return job.result;
}

export function renderSong(song, rate) {
  return continueRender(startRender(song, rate), Infinity);
}
