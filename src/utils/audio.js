import { midiToFrequency } from './music';

export const createAudioContext = () => {
  if (typeof window === 'undefined') return null;
  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  return AudioCtxClass ? new AudioCtxClass() : null;
};

export const playShamisenSound = (ctx, pitch, duration = 1.0) => {
  if (!ctx || ctx.state === 'closed') return null;
  if (typeof pitch !== 'number' || Number.isNaN(pitch)) {
    return null;
  }

  let osc;
  let gainNode;
  try {
    osc = ctx.createOscillator();
    gainNode = ctx.createGain();
  } catch (e) {
    console.error('Failed to create audio nodes on AudioContext:', e);
    return null;
  }

  const dur = Math.max(
    0.01,
    typeof duration === 'number' && !Number.isNaN(duration) ? duration : 1.0
  );
  const attack = Math.min(0.02, dur * 0.2);

  try {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(midiToFrequency(pitch), ctx.currentTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.8, ctx.currentTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch (e) {
    console.error('Failed to schedule audio events:', e);
    return null;
  }

  return { oscillator: osc, gainNode };
};

export const startSustainedNote = (ctx, pitch) => {
  if (!ctx || ctx.state === 'closed') return null;
  if (typeof pitch !== 'number' || Number.isNaN(pitch)) {
    return null;
  }

  let osc;
  let gainNode;
  try {
    osc = ctx.createOscillator();
    gainNode = ctx.createGain();
  } catch (e) {
    console.error('Failed to create audio nodes on AudioContext:', e);
    return null;
  }

  try {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(midiToFrequency(pitch), ctx.currentTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.02);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(ctx.currentTime);
  } catch (e) {
    console.error('Failed to schedule sustained note:', e);
    return null;
  }

  // Attach properties for cleanup
  osc.gainNode = gainNode;
  osc.ctx = ctx;

  // Return the oscillator with attached properties, but also make it behaves nicely as an object
  return osc;
};

export const stopSustainedNote = (param) => {
  if (!param) return;

  let osc = param;
  let gainNode = param.gainNode;

  if (param.oscillator) {
    osc = param.oscillator;
    if (param.gainNode) {
      gainNode = param.gainNode;
    }
  }

  const ctx = osc.ctx || osc.context;
  if (ctx && gainNode) {
    const time = ctx.currentTime;
    try {
      gainNode.gain.cancelScheduledValues(time);
      gainNode.gain.setValueAtTime(gainNode.gain.value, time);
      gainNode.gain.linearRampToValueAtTime(0, time + 0.05);
      osc.stop(time + 0.05);
    } catch (_e) {
      try {
        osc.stop();
      } catch (_err) {
        // Ignore
      }
    }
  } else {
    try {
      osc.stop();
    } catch (_err) {
      // Ignore
    }
  }
};
