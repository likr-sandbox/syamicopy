import React, { useRef, useEffect } from 'react';
import { startSustainedNote, stopSustainedNote } from '../../utils/audio';
import { MAX_PITCH, MIN_PITCH } from '../../utils/constants';
import { getPitchLabel, isBlackKey } from '../../utils/music';
import { getStringOpenPitches } from '../../utils/shamisen';

export const Keyboard = ({ tuning, basePitch, playKeySound, audioContext }) => {
  const activeOscillatorsRef = useRef({});

  // Clean up active oscillators on unmount
  useEffect(() => {
    return () => {
      const active = activeOscillatorsRef.current;
      if (active) {
        for (const pitch of Object.keys(active)) {
          if (active[pitch]) {
            try {
              stopSustainedNote(active[pitch]);
            } catch (err) {
              console.error('Failed to stop oscillator on unmount', err);
            }
          }
        }
        activeOscillatorsRef.current = {};
      }
    };
  }, []);

  // Generate pitches from MAX_PITCH down to MIN_PITCH
  const pitches = [];
  for (let p = MAX_PITCH; p >= MIN_PITCH; p--) {
    pitches.push(p);
  }

  const openPitches = getStringOpenPitches(tuning, basePitch);
  const badges = ['①', '②', '③'];

  const handlePointerDown = (e, pitch) => {
    e.preventDefault();
    if (audioContext) {
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }
      // Stop existing if any
      if (activeOscillatorsRef.current[pitch]) {
        stopSustainedNote(activeOscillatorsRef.current[pitch]);
      }
      const osc = startSustainedNote(audioContext, pitch);
      if (osc) {
        activeOscillatorsRef.current[pitch] = osc;
      }
    } else {
      // Fallback
      playKeySound(pitch);
    }
  };

  const handlePointerUpOrLeave = (pitch) => {
    if (activeOscillatorsRef.current[pitch]) {
      stopSustainedNote(activeOscillatorsRef.current[pitch]);
      delete activeOscillatorsRef.current[pitch];
    }
  };

  return (
    <div
      className="flex flex-col select-none"
      style={{ width: '100px' }}
      data-testid="keyboard"
    >
      {pitches.map((pitch) => {
        const isBlack = isBlackKey(pitch);
        const openIndex = openPitches.indexOf(pitch);
        const isHighlighted = openIndex !== -1;

        let className = isBlack
          ? 'bg-nouaiBlue hover:bg-nouaiBlue/90 border-b border-nouaiBlue/40 text-washiWhite text-[8px] font-sans flex items-center justify-end pr-2 cursor-pointer select-none active:bg-nouaiBlue/80 transition-colors h-[20px] w-full'
          : 'bg-white hover:bg-neutral-50 border-b border-r border-nouaiBlue/20 text-nouaiBlue/50 text-[9px] font-sans flex items-center justify-end pr-2 cursor-pointer select-none active:bg-neutral-200 transition-colors h-[20px] w-full';

        if (isHighlighted) {
          className += isBlack
            ? ' border-l-[4px] border-l-shamiRed bg-shamiRed/30'
            : ' border-l-[4px] border-l-shamiRed bg-shamiRed/10';
        }

        const badge = isHighlighted ? badges[openIndex] : '';

        return (
          <div
            key={pitch}
            data-testid={`keyboard-key-${pitch}`}
            className="w-full"
          >
            <div
              className={className}
              style={{ height: '20px' }}
              onPointerDown={(e) => handlePointerDown(e, pitch)}
              onPointerUp={() => handlePointerUpOrLeave(pitch)}
              onPointerLeave={() => handlePointerUpOrLeave(pitch)}
              onPointerCancel={() => handlePointerUpOrLeave(pitch)}
              data-testid={`key-${pitch}`}
            >
              {badge && (
                <span className="mr-1 text-shamiRed font-bold text-[10px]">
                  {badge}
                </span>
              )}
              <span>{getPitchLabel(pitch)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Keyboard;
