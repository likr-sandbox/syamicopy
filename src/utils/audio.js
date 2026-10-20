import { midiToFrequency } from './music';

export const createAudioContext = () => {
  if (typeof window === 'undefined') return null;
  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  return AudioCtxClass ? new AudioCtxClass() : null;
};

export const playShamisenSound = (
  ctx,
  pitch,
  duration = 1.0,
  startTime = ctx ? ctx.currentTime : 0
) => {
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
  const time =
    typeof startTime === 'number' && !Number.isNaN(startTime)
      ? startTime
      : ctx.currentTime;
  const noteFreq = midiToFrequency(pitch);

  try {
    // 1. Primary Note Pitch Oscillator (sawtooth) - Must be configured and started FIRST
    osc.role = 'fundamental';
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(noteFreq, time);

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.8, time + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + dur);

    osc.connect(gainNode);
    osc.start(time);
    osc.stop(time + dur);

    // Advanced acoustic shamisen modeling when extended Web Audio nodes are supported
    const hasFilter = typeof ctx.createBiquadFilter === 'function';
    let outputFilter = null;

    if (hasFilter) {
      // 2. Lowpass Filter: Sweeps downward from high frequencies to model natural silk string harmonic decay
      outputFilter = ctx.createBiquadFilter();
      outputFilter.type = 'lowpass';
      const startFreq = Math.min(6000, Math.max(1200, noteFreq * 6));
      const endFreq = Math.max(200, noteFreq * 1.2);
      outputFilter.frequency.setValueAtTime(startFreq, time);
      if (
        typeof outputFilter.frequency.exponentialRampToValueAtTime ===
        'function'
      ) {
        outputFilter.frequency.exponentialRampToValueAtTime(
          endFreq,
          time + Math.min(dur, 0.4)
        );
      }
      if (
        outputFilter.Q &&
        typeof outputFilter.Q.setValueAtTime === 'function'
      ) {
        outputFilter.Q.setValueAtTime(2.0, time);
      }

      gainNode.connect(outputFilter);
      outputFilter.connect(ctx.destination);

      // 3. Bachi Attack Transient: Fast pitch drop modeling plectrum striking the silk string
      try {
        const attackOsc = ctx.createOscillator();
        const attackGain = ctx.createGain();
        attackOsc.role = 'transient';
        attackOsc.type = 'sawtooth';
        const attackDur = 0.015; // 15ms fast transient decay
        attackOsc.frequency.setValueAtTime(noteFreq * 4, time);
        if (
          typeof attackOsc.frequency.exponentialRampToValueAtTime === 'function'
        ) {
          attackOsc.frequency.exponentialRampToValueAtTime(
            noteFreq,
            time + attackDur
          );
        }
        attackGain.gain.setValueAtTime(0.4, time);
        if (
          typeof attackGain.gain.exponentialRampToValueAtTime === 'function'
        ) {
          attackGain.gain.exponentialRampToValueAtTime(0.001, time + attackDur);
        }
        attackOsc.connect(attackGain);
        attackGain.connect(outputFilter);
        attackOsc.start(time);
        attackOsc.stop(time + attackDur);
      } catch (_e) {
        // Fallback gracefully if node creation fails
      }

      // 4. Sawari Resonance: Subtle detuned harmonic modeling the distinctive buzzing resonance
      try {
        const sawariOsc = ctx.createOscillator();
        const sawariGain = ctx.createGain();
        sawariOsc.role = 'sawari';
        sawariOsc.type = 'sawtooth';
        sawariOsc.frequency.setValueAtTime(noteFreq * 2 + 1.5, time);
        sawariGain.gain.setValueAtTime(0, time);
        sawariGain.gain.linearRampToValueAtTime(0.12, time + attack);
        if (
          typeof sawariGain.gain.exponentialRampToValueAtTime === 'function'
        ) {
          sawariGain.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.7);
        }
        sawariOsc.connect(sawariGain);
        sawariGain.connect(outputFilter);
        sawariOsc.start(time);
        sawariOsc.stop(time + dur * 0.7);
      } catch (_e) {
        // Fallback gracefully
      }
    } else {
      // Direct destination routing for basic contexts / unit test mocks
      gainNode.connect(ctx.destination);
    }
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
    osc.role = 'fundamental';
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
