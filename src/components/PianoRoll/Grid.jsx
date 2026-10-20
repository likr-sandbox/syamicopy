import React, { useRef } from 'react';
import {
  MAX_PITCH,
  MIN_PITCH,
  ROW_HEIGHT,
  STEP_WIDTH
} from '../../utils/constants';
import { isBlackKey } from '../../utils/music';
import { getStringOpenPitches } from '../../utils/shamisen';
import {
  getStepsPerBeat,
  getStepsPerMeasure,
  getTotalSteps
} from '../../utils/timeSignature';
import NoteBlock from './NoteBlock';

export const Grid = ({
  notes,
  addNote,
  deleteNote,
  updateNote,
  timeSignature,
  measureCount,
  tuning,
  basePitch,
  playKeySound,
  currentStep,
  seekToStep,
  lastNoteLength = 4
}) => {
  const totalSteps = getTotalSteps(timeSignature, measureCount);
  const stepsPerBeat = getStepsPerBeat(timeSignature);
  const stepsPerMeasure = getStepsPerMeasure(timeSignature);

  const openPitches = getStringOpenPitches(tuning, basePitch);

  const lastDeleteTimeRef = useRef(0);

  const handleDeleteNote = (id) => {
    lastDeleteTimeRef.current = Date.now();
    deleteNote(id);
  };

  const pitches = [];
  for (let p = MAX_PITCH; p >= MIN_PITCH; p--) {
    pitches.push(p);
  }

  const handleGridClick = (e) => {
    // Avoid triggering when note blocks or resize handles are clicked
    if (e.target.closest('[data-testid^="note-block-"]')) {
      return;
    }

    if (Date.now() - lastDeleteTimeRef.current < 300) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const step = Math.floor(clickX / STEP_WIDTH);
    const pitch = MAX_PITCH - Math.floor(clickY / ROW_HEIGHT);

    const clampedStep = Math.max(0, Math.min(totalSteps - 1, step));
    const clampedPitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, pitch));

    addNote({
      pitch: clampedPitch,
      step: clampedStep,
      length: lastNoteLength || 4
    });
    playKeySound(clampedPitch);
  };

  // Generate vertical lines coordinates and styles
  const verticalLines = [];
  for (let x = 1; x < totalSteps; x++) {
    const xCoord = x * STEP_WIDTH;
    let strokeClass = 'stroke-nouaiBlue/10 stroke-[0.5px]';
    let dashArray = '2,2';

    if (x % stepsPerMeasure === 0) {
      strokeClass = 'stroke-nouaiBlue/40 stroke-[1.5px]';
      dashArray = undefined;
    } else if (x % stepsPerBeat === 0) {
      strokeClass = 'stroke-nouaiBlue/25 stroke-[1px]';
      dashArray = undefined;
    }

    verticalLines.push({ x: xCoord, strokeClass, dashArray });
  }

  // Generate measure numbers
  const measures = [];
  for (let m = 0; m < measureCount; m++) {
    measures.push({
      index: m,
      left: m * stepsPerMeasure * STEP_WIDTH
    });
  }

  const gridHeight = pitches.length * ROW_HEIGHT;
  const gridWidth = totalSteps * STEP_WIDTH;

  return (
    <div
      data-testid="piano-grid"
      style={{ width: `${gridWidth}px` }}
      className="relative"
    >
      <div
        className="flex flex-col select-none relative"
        style={{ width: `${gridWidth}px` }}
        data-testid="grid"
      >
        {/* Measure Header Bar */}
        <div
          className="h-[20px] bg-neutral-50 border-b border-nouaiBlue/20 relative cursor-pointer"
          style={{ width: `${gridWidth}px` }}
          data-testid="measure-header-bar"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const step = Math.floor(clickX / STEP_WIDTH);
            const clampedStep = Math.max(0, Math.min(totalSteps - 1, step));
            if (seekToStep) {
              seekToStep(clampedStep);
            }
          }}
          onKeyDown={() => {}}
          role="presentation"
        >
          {measures.map((measure) => (
            <div
              key={measure.index}
              className="absolute text-[9px] font-sans text-nouaiBlue/60 font-bold px-1 py-[2px] pointer-events-none"
              style={{ left: `${measure.left}px` }}
            >
              M{measure.index + 1}
            </div>
          ))}
        </div>

        {/* Grid Content Area */}
        <div
          className="relative overflow-hidden cursor-crosshair animate-fade-in"
          style={{
            width: `${gridWidth}px`,
            height: `${gridHeight}px`
          }}
          onClick={handleGridClick}
          onKeyDown={() => {}}
          role="presentation"
        >
          {/* Background Rows */}
          {pitches.map((pitch) => {
            const isBlack = isBlackKey(pitch);
            const isOpen = openPitches.includes(pitch);

            let rowClass = 'h-[20px] w-full border-b border-nouaiBlue/10';
            if (isOpen) {
              rowClass += ' bg-shamiRed/5';
            } else if (isBlack) {
              rowClass += ' bg-nouaiBlue/5';
            } else {
              rowClass += ' bg-white';
            }

            return (
              <div
                key={pitch}
                className={rowClass}
                style={{ height: `${ROW_HEIGHT}px` }}
              />
            );
          })}

          {/* SVG Grid Lines Overlay */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={gridWidth}
            height={gridHeight}
          >
            <title>Grid Lines</title>
            {/* Vertical Lines */}
            {verticalLines.map((line) => (
              <line
                key={`v-${line.x}`}
                x1={line.x}
                y1={0}
                x2={line.x}
                y2={gridHeight}
                className={line.strokeClass}
                strokeDasharray={line.dashArray}
              />
            ))}
          </svg>

          {/* Note Blocks */}
          {(Array.isArray(notes) ? notes : []).map((note) => (
            <NoteBlock
              key={note.id}
              note={note}
              deleteNote={handleDeleteNote}
              updateNote={updateNote}
              totalSteps={totalSteps}
              tuning={tuning}
              basePitch={basePitch}
              playKeySound={playKeySound}
            />
          ))}

          {/* Playback Head */}
          {currentStep >= 0 && currentStep < totalSteps && (
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-shamiRed z-10 pointer-events-none"
              style={{ left: `${currentStep * STEP_WIDTH}px` }}
              data-testid="playback-head"
            >
              <div className="absolute top-0 w-3 h-3 bg-shamiRed rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Grid;
