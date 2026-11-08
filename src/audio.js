// The sound's thin Web Audio layer: it plays the samples synth.js and
// music.js render and decides nothing itself (cues.js says what plays).
// Browsers start sound only after the player has done something, so the
// context is made on the first key press (unlockAudio) and everything
// before it is silent.
import { continueRender, startRender } from './music.js';
import { volumeFactor } from './settings.js';
import { renderSound, SAMPLE_RATE } from './synth.js';

// The whole game's level, under full scale so several sounds at once
// still fit; the music sits under the effects.
export const MASTER_GAIN = 0.7;
export const MUSIC_GAIN = 0.5;
// A song that stops fades out over about this long (a time constant: it
// is all but silent after three).
const MUSIC_FADE = 0.15;
// A change of volume glides over about this long (a time constant), so it
// doesn't click.
const LEVEL_GLIDE = 0.02;
// Songs render this many voices between looks at the clock: a held note
// can take a few milliseconds alone.
const VOICES_PER_LOOK = 1;

export function createAudio(sounds, songs) {
  return {
    sounds,
    context: null,
    master: null,
    effects: null,
    music: null,
    // Each effect's samples once rendered, and its buffer once there is a
    // context.
    samples: {},
    buffers: {},
    // The source playing on each channel, cut off by the next on it.
    channels: {},
    // The player's settings (settings.js), and the ones the gains were
    // last set to.
    settings: null,
    applied: null,
    // Each song's render while it is under way, then its samples, then
    // its buffer once there is a context; and the song playing.
    songs: Object.fromEntries(Object.entries(songs).map(([id, song]) => [id, { song, job: null, result: null, buffer: null }])),
    playing: null,
  };
}

// Renders the effects, then the songs in their order, for up to budget
// milliseconds; call once a frame until it returns true (all are ready).
// Needs no context, so it runs before the first key press, which then
// only has to make the context: rendered all at once the sounds would
// stall the page for a tenth of a second or more.
export function prepareAudio(audio, budget) {
  const until = performance.now() + budget;
  for (const [id, sound] of Object.entries(audio.sounds)) {
    if (audio.samples[id]) continue;
    audio.samples[id] = renderSound(sound);
    if (performance.now() >= until) return false;
  }
  for (const entry of Object.values(audio.songs)) {
    if (entry.result) continue;
    entry.job ??= startRender(entry.song, SAMPLE_RATE);
    while (!entry.result) {
      entry.result = continueRender(entry.job, VOICES_PER_LOOK);
      if (performance.now() >= until) return false;
    }
    entry.job = null;
  }
  return true;
}

function toBuffer(context, samples) {
  const buffer = context.createBuffer(1, samples.length, SAMPLE_RATE);
  buffer.copyToChannel(samples, 0);
  return buffer;
}

// Call from a key press's handler: the browser lets sound start only then.
// Returns whether sound is available.
export function unlockAudio(audio) {
  if (audio.context) {
    if (audio.context.state === 'suspended') audio.context.resume();
    return true;
  }
  const Context = globalThis.AudioContext ?? globalThis.webkitAudioContext;
  if (!Context) {
    console.info('No Web Audio in this browser; the game plays silent');
    return false;
  }
  try {
    const context = new Context();
    const master = context.createGain();
    master.gain.value = MASTER_GAIN;
    master.connect(context.destination);
    const effects = context.createGain();
    effects.connect(master);
    const music = context.createGain();
    music.gain.value = MUSIC_GAIN;
    music.connect(master);
    // An effect the frames haven't rendered yet is rendered now.
    for (const [id, sound] of Object.entries(audio.sounds)) {
      audio.samples[id] ??= renderSound(sound);
      audio.buffers[id] = toBuffer(context, audio.samples[id]);
    }
    Object.assign(audio, { context, master, effects, music });
    applyLevels(audio);
    context.resume();
    return true;
  } catch (error) {
    console.warn('Sound could not start; the game plays silent', { error });
    return false;
  }
}

// Plays what cueEvents returned: [{ sound, rate, volume }].
export function playCues(audio, plays) {
  const { context } = audio;
  if (!context || context.state !== 'running') return;
  for (const { sound, rate, volume } of plays) {
    const buffer = audio.buffers[sound];
    if (!buffer) {
      console.warn('A cue for a sound that does not exist', { sound });
      continue;
    }
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    const gain = context.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(audio.effects);
    const { channel } = audio.sounds[sound];
    if (channel) {
      // A cut-off sound ends a few milliseconds later, faded, not clicked.
      const previous = audio.channels[channel];
      if (previous) {
        previous.gain.gain.setTargetAtTime(0, context.currentTime, 0.004);
        previous.source.stop(context.currentTime + 0.03);
      }
      audio.channels[channel] = { source, gain };
      source.onended = () => {
        if (audio.channels[channel]?.source === source) delete audio.channels[channel];
      };
    }
    source.start();
  }
}

function stopSong(audio) {
  const { context, playing } = audio;
  if (!playing) return;
  playing.gain.gain.setTargetAtTime(0, context.currentTime, MUSIC_FADE);
  playing.source.stop(context.currentTime + MUSIC_FADE * 6);
  audio.playing = null;
}

// The song must be rendered (setMusic sees to it).
function startSong(audio, id, volume) {
  const { context } = audio;
  const entry = audio.songs[id];
  entry.buffer ??= toBuffer(context, entry.result.samples);
  const source = context.createBufferSource();
  source.buffer = entry.buffer;
  if (entry.result.loopStart !== null) {
    source.loop = true;
    source.loopStart = entry.result.loopStart;
    source.loopEnd = entry.result.duration;
  }
  const gain = context.createGain();
  gain.gain.value = volume;
  source.connect(gain).connect(audio.music);
  source.start();
  audio.playing = { id, source, gain, volume };
}

// Plays the song with this id (looped, unless it is a jingle) at this
// volume, or none for null; call it every frame with what should play
// (musicFor in cues.js). The song before fades out, and a new volume is
// faded to. A song not rendered yet starts as soon as it is.
export function setMusic(audio, { song: id, volume }) {
  const { context } = audio;
  if (!context || context.state !== 'running') return;
  if ((audio.playing?.id ?? null) === id) {
    if (audio.playing && audio.playing.volume !== volume) {
      audio.playing.gain.gain.setTargetAtTime(volume, context.currentTime, MUSIC_FADE);
      audio.playing.volume = volume;
    }
    return;
  }
  if (id !== null && !audio.songs[id]?.result) {
    if (!audio.songs[id]) throw new Error(`No song '${id}'`);
    return;
  }
  stopSong(audio);
  if (id !== null) startSong(audio, id, volume);
}

// The gains for the settings. The first time they are set outright, so
// sound that should be off never starts on; after that they glide.
function applyLevels(audio) {
  const { context, settings, applied } = audio;
  if (!context || !settings || settings === applied) return;
  const gains = [
    [audio.master.gain, settings.muted ? 0 : MASTER_GAIN],
    [audio.effects.gain, volumeFactor(settings.effects)],
    [audio.music.gain, MUSIC_GAIN * volumeFactor(settings.music)],
  ];
  for (const [gain, value] of gains) {
    if (applied) gain.setTargetAtTime(value, context.currentTime, LEVEL_GLIDE);
    else gain.value = value;
  }
  audio.applied = settings;
}

// The volumes and whether sound is off, from the game's settings; call it
// every frame (it changes nothing until they change: the game replaces
// its settings object on every change).
export function setLevels(audio, settings) {
  audio.settings = settings;
  applyLevels(audio);
}

// A hidden tab, or a window left for another, is silent; it sounds again
// when it is back.
export function setAudioHidden(audio, hidden) {
  const { context } = audio;
  if (!context) return;
  if (hidden) context.suspend();
  else context.resume();
}
