import React, { useRef } from 'react';
import useAutoScroll from '../../hooks/useAutoScroll';
import Grid from './Grid';
import Keyboard from './Keyboard';

export const PianoRoll = ({
  notes,
  addNote,
  deleteNote,
  updateNote,
  onTranspose,
  currentStep,
  isPlaying,
  tuning,
  basePitch,
  measureCount,
  timeSignature,
  playKeySound,
  audioContext,
  bunkafuRef
}) => {
  const gridContainerRef = useRef(null);

  const { handleGridScroll } = useAutoScroll(
    gridContainerRef,
    bunkafuRef || { current: null },
    currentStep,
    isPlaying
  );

  return (
    <div className="w-full h-full flex flex-col gap-2 flex-1 min-h-0">
      {/* Control Bar */}
      <div className="flex justify-between items-center bg-white p-2 border border-nouaiBlue/20 rounded text-xs font-semibold select-none flex-shrink-0">
        <span className="text-nouaiBlue font-bold">ピアノロール</span>
        <div className="flex gap-2 items-center">
          <span className="text-nouaiBlue/70">移調:</span>
          <button
            type="button"
            data-testid="transpose-down-btn"
            onClick={() => onTranspose(-1)}
            className="px-3 py-1.5 border border-nouaiBlue hover:bg-nouaiBlue hover:text-washiWhite rounded text-[10px] font-bold transition-all text-nouaiBlue cursor-pointer"
          >
            半音下げる (-1)
          </button>
          <button
            type="button"
            data-testid="transpose-up-btn"
            onClick={() => onTranspose(1)}
            className="px-3 py-1.5 border border-nouaiBlue hover:bg-nouaiBlue hover:text-washiWhite rounded text-[10px] font-bold transition-all text-nouaiBlue cursor-pointer"
          >
            半音上げる (+1)
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div
        ref={gridContainerRef}
        className="w-full flex-1 overflow-auto relative flex border border-nouaiBlue/20 rounded bg-white"
        onScroll={handleGridScroll}
        data-testid="piano-roll"
      >
        {/* Sticky Keyboard */}
        <div
          className="sticky left-0 z-20 w-[100px] flex-shrink-0 bg-white border-r border-nouaiBlue/20 shadow-md"
          data-testid="piano-keyboard"
        >
          {/* Spacer aligned with grid header */}
          <div className="h-[20px] bg-neutral-100 border-b border-nouaiBlue/20" />
          <Keyboard
            tuning={tuning}
            basePitch={basePitch}
            playKeySound={playKeySound}
            audioContext={audioContext}
          />
        </div>

        {/* Grid */}
        <Grid
          notes={notes}
          addNote={addNote}
          deleteNote={deleteNote}
          updateNote={updateNote}
          timeSignature={timeSignature}
          measureCount={measureCount}
          tuning={tuning}
          basePitch={basePitch}
          playKeySound={playKeySound}
          currentStep={currentStep}
        />
      </div>
    </div>
  );
};

export default PianoRoll;
