import { useCallback, useEffect, useRef, useState } from 'react';
import { createAudioContext, playShamisenSound } from '../utils/audio';
import { getStepsPerBeat, getTotalSteps } from '../utils/timeSignature';

export const useAudio = (notes, bpm, timeSignature, measureCount) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    return () => {
      if (
        audioCtxRef.current &&
        typeof audioCtxRef.current.close === 'function'
      ) {
        try {
          const p = audioCtxRef.current.close();
          if (p && typeof p.catch === 'function') {
            p.catch(() => {});
          }
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = createAudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const startPlayback = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    setIsPlaying(true);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
  };

  const playKeySound = (pitch) => {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      playShamisenSound(ctx, pitch, 0.8);
    }
  };

  // Playback loop effect for step advancement
  useEffect(() => {
    if (!isPlaying) return;

    let totalSteps = 128;
    try {
      totalSteps = getTotalSteps(timeSignature, measureCount);
    } catch {
      // ignore
    }

    let stepsPerBeat = 4;
    try {
      stepsPerBeat = getStepsPerBeat(timeSignature);
    } catch {
      // ignore
    }

    const baseBpm = bpm || 100;
    const clampedBpm = Math.max(30, Math.min(240, baseBpm));
    const stepDurationMs = (60 / clampedBpm / stepsPerBeat) * 1000;

    setCurrentStep((prev) => {
      if (prev === -1) return 0;
      return prev;
    });

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev === -1 ? 0 : prev + 1) % totalSteps;
        return next;
      });
    }, stepDurationMs);

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, bpm, timeSignature, measureCount]);

  // Audio trigger effect when step changes
  useEffect(() => {
    if (!isPlaying || currentStep < 0) return;

    let stepsPerBeat = 4;
    try {
      stepsPerBeat = getStepsPerBeat(timeSignature);
    } catch {
      // ignore
    }

    const baseBpm = bpm || 100;
    const clampedBpm = Math.max(30, Math.min(240, baseBpm));
    const stepDurationSec = 60 / clampedBpm / stepsPerBeat;
    const ctx = getAudioContext();

    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const stepNotes = (Array.isArray(notes) ? notes : []).filter(
        (n) => n.step === currentStep
      );
      for (const note of stepNotes) {
        const dur = note.length * stepDurationSec;
        playShamisenSound(ctx, note.pitch, dur);
      }
    }
  }, [currentStep, isPlaying, notes, bpm, timeSignature, getAudioContext]);

  return {
    isPlaying,
    currentStep,
    startPlayback,
    stopPlayback,
    playKeySound,
    getAudioContext
  };
};

export default useAudio;
