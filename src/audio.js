// The sound's thin Web Audio layer: it plays the samples synth.js renders
// and decides nothing itself (cues.js says what plays). Browsers start
// sound only after the player has done something, so the context is made
// on the first key press (unlockAudio) and everything before it is silent.
import { renderSound, SAMPLE_RATE } from './synth.js';

// The whole game's level, under full scale so several sounds at once
// still fit.
const MASTER_GAIN = 0.7;

export function createAudio(sounds) {
  return {
    sounds,
    context: null,
    master: null,
    effects: null,
    buffers: {},
    // The source playing on each channel, cut off by the next on it.
    channels: {},
  };
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
    for (const [id, sound] of Object.entries(audio.sounds)) {
      audio.buffers[id] = toBuffer(context, renderSound(sound));
    }
    Object.assign(audio, { context, master, effects });
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

// A hidden tab is silent; it sounds again when it shows.
export function setAudioHidden(audio, hidden) {
  const { context } = audio;
  if (!context) return;
  if (hidden) context.suspend();
  else context.resume();
}
