import { useCallback, useEffect, useRef, useState } from 'react';
import { createAudioContext, playShamisenSound } from '../utils/audio';
import { getStepsPerBeat, getTotalSteps } from '../utils/timeSignature';

export const useAudio = (notes, bpm, timeSignature, measureCount) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const audioCtxRef = useRef(null);
  const currentStepRef = useRef(-1);
  const scheduleStepRef = useRef(0);
  const nextNoteTimeRef = useRef(0);
  const startTimeRef = useRef(0);
  const simulatedAudioTimeRef = useRef(0);
  const notesRef = useRef(notes);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

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
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
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
    currentStepRef.current = -1;
    scheduleStepRef.current = 0;
  };

  const seekToStep = useCallback(
    (step) => {
      let totalSteps = 128;
      try {
        totalSteps = getTotalSteps(timeSignature, measureCount);
      } catch {
        // ignore
      }
      const clampedStep = Math.max(0, Math.min(totalSteps - 1, step));
      currentStepRef.current = clampedStep;
      scheduleStepRef.current = clampedStep;

      const ctx = audioCtxRef.current;
      if (ctx) {
        nextNoteTimeRef.current = ctx.currentTime;
        startTimeRef.current = ctx.currentTime;
      } else {
        nextNoteTimeRef.current = 0;
        startTimeRef.current = 0;
      }
      simulatedAudioTimeRef.current = 0;

      setCurrentStep(clampedStep);
    },
    [timeSignature, measureCount]
  );

  const playKeySound = (pitch) => {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      playShamisenSound(ctx, pitch, 0.8);
    }
  };

  // Web Audio Lookahead Scheduler and playback loop
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
    const stepDurationSec = 60 / clampedBpm / stepsPerBeat;
    const stepDurationMs = stepDurationSec * 1000;

    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const initialAudioTime = ctx ? ctx.currentTime : 0;
    startTimeRef.current = initialAudioTime;

    if (currentStepRef.current === -1) {
      currentStepRef.current = 0;
      scheduleStepRef.current = 0;
      simulatedAudioTimeRef.current = 0;
      nextNoteTimeRef.current = initialAudioTime;
      setCurrentStep(0);
    } else {
      scheduleStepRef.current = currentStepRef.current;
      simulatedAudioTimeRef.current = currentStepRef.current * stepDurationSec;
      nextNoteTimeRef.current = initialAudioTime;
    }

    const scheduleAhead = () => {
      const audioCtx = getAudioContext();
      if (!audioCtx) return;

      const currentAudioTime =
        audioCtx.currentTime > startTimeRef.current
          ? audioCtx.currentTime
          : startTimeRef.current + simulatedAudioTimeRef.current;

      // Lookahead window: schedule ahead by 100ms (0.1s)
      while (nextNoteTimeRef.current < currentAudioTime + 0.1) {
        const step = scheduleStepRef.current;
        const currentNotes = notesRef.current || [];
        const stepNotes = (
          Array.isArray(currentNotes) ? currentNotes : []
        ).filter((n) => n.step === step);

        for (const note of stepNotes) {
          const dur = note.length * stepDurationSec;
          if (audioCtx.currentTime > 0) {
            playShamisenSound(
              audioCtx,
              note.pitch,
              dur,
              nextNoteTimeRef.current
            );
          } else {
            playShamisenSound(audioCtx, note.pitch, dur);
          }
        }

        nextNoteTimeRef.current += stepDurationSec;
        scheduleStepRef.current = (scheduleStepRef.current + 1) % totalSteps;
      }
    };

    // Schedule initial notes immediately on start
    scheduleAhead();

    // 25ms lookahead scheduler loop
    const lookaheadInterval = setInterval(scheduleAhead, 25);

    // Step duration interval for updating playhead position and fake timers
    const stepInterval = setInterval(() => {
      simulatedAudioTimeRef.current += stepDurationSec;
      scheduleAhead();

      setCurrentStep((prev) => {
        const next = (prev === -1 ? 0 : prev + 1) % totalSteps;
        currentStepRef.current = next;
        return next;
      });
    }, stepDurationMs);

    return () => {
      clearInterval(lookaheadInterval);
      clearInterval(stepInterval);
    };
  }, [isPlaying, bpm, timeSignature, measureCount, getAudioContext]);

  return {
    isPlaying,
    currentStep,
    startPlayback,
    stopPlayback,
    seekToStep,
    playKeySound,
    getAudioContext
  };
};

export default useAudio;
