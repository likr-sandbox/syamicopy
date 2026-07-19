import React, { useRef } from 'react';
import useAutoScroll from '../../hooks/useAutoScroll';
import Grid from './Grid';
import Keyboard from './Keyboard';

export const PianoRoll = ({
  notes,
  addNote,
  deleteNote,
  updateNote,
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
    <div
      ref={gridContainerRef}
      className="w-full flex-1 overflow-auto relative h-[400px] flex border border-nouaiBlue/20 rounded bg-white"
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
  );
};

export default PianoRoll;
