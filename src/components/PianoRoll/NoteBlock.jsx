import React, { useState, useRef } from 'react';
import {
  MAX_PITCH,
  MIN_PITCH,
  ROW_HEIGHT,
  STEP_WIDTH
} from '../../utils/constants';
import { getPitchLabel } from '../../utils/music';
import { convertToShamisenNote } from '../../utils/shamisen';

export const NoteBlock = ({
  note,
  deleteNote,
  updateNote,
  totalSteps,
  tuning,
  basePitch,
  playKeySound
}) => {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeWidth, setResizeWidth] = useState(null);

  const stateRef = useRef({
    isDragging: false,
    isResizing: false,
    initialX: 0,
    initialY: 0,
    initialStep: 0,
    initialPitch: 0,
    initialLength: 0
  });

  const handleResizePointerDown = (e) => {
    if (!e.currentTarget.contains(e.target)) return;
    e.stopPropagation();
    e.preventDefault();
    if (typeof e.currentTarget.setPointerCapture === 'function') {
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    stateRef.current = {
      isDragging: false,
      isResizing: true,
      initialX: e.clientX,
      initialY: e.clientY,
      initialStep: note.step,
      initialPitch: note.pitch,
      initialLength: note.length
    };
  };

  const handleResizePointerMove = (e) => {
    if (!stateRef.current.isResizing) return;
    e.stopPropagation();
    e.preventDefault();

    const dx = e.clientX - stateRef.current.initialX;
    const maxLen = totalSteps - note.step;
    const clampedLength = Math.max(
      1,
      Math.min(
        maxLen,
        Math.round(
          (stateRef.current.initialLength * STEP_WIDTH + dx) / STEP_WIDTH
        )
      )
    );
    setResizeWidth(clampedLength * STEP_WIDTH);
  };

  const handleResizePointerUp = (e) => {
    if (!stateRef.current.isResizing) return;
    e.stopPropagation();
    e.preventDefault();
    if (typeof e.currentTarget.releasePointerCapture === 'function') {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const dx = e.clientX - stateRef.current.initialX;
    const maxLen = totalSteps - note.step;
    const clampedLength = Math.max(
      1,
      Math.min(
        maxLen,
        Math.round(
          (stateRef.current.initialLength * STEP_WIDTH + dx) / STEP_WIDTH
        )
      )
    );

    stateRef.current.isResizing = false;
    setResizeWidth(null);

    if (clampedLength !== note.length) {
      updateNote(note.id, { length: clampedLength });
    }
  };

  const handleDragPointerDown = (e) => {
    if (!e.currentTarget.contains(e.target)) return;
    e.stopPropagation();
    e.preventDefault();
    if (typeof e.currentTarget.setPointerCapture === 'function') {
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    stateRef.current = {
      isDragging: true,
      isResizing: false,
      initialX: e.clientX,
      initialY: e.clientY,
      initialStep: note.step,
      initialPitch: note.pitch,
      initialLength: note.length
    };
  };

  const handleDragPointerMove = (e) => {
    if (!stateRef.current.isDragging) return;
    e.stopPropagation();
    e.preventDefault();

    const dx = e.clientX - stateRef.current.initialX;
    const dy = e.clientY - stateRef.current.initialY;

    const dStep = Math.round(dx / STEP_WIDTH);
    const dPitch = -Math.round(dy / ROW_HEIGHT);

    const tempStep = Math.max(
      0,
      Math.min(totalSteps - note.length, stateRef.current.initialStep + dStep)
    );
    const tempPitch = Math.max(
      MIN_PITCH,
      Math.min(MAX_PITCH, stateRef.current.initialPitch + dPitch)
    );

    setDragOffset({
      x: (tempStep - note.step) * STEP_WIDTH,
      y: (note.pitch - tempPitch) * ROW_HEIGHT
    });
  };

  const handleDragPointerUp = (e) => {
    if (!stateRef.current.isDragging) return;
    e.stopPropagation();
    e.preventDefault();
    if (typeof e.currentTarget.releasePointerCapture === 'function') {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const dx = e.clientX - stateRef.current.initialX;
    const dy = e.clientY - stateRef.current.initialY;
    const distance = Math.hypot(dx, dy);

    stateRef.current.isDragging = false;
    setDragOffset({ x: 0, y: 0 });

    if (distance < 3) {
      // Tap to delete
      deleteNote(note.id);
    } else {
      const dStep = Math.round(dx / STEP_WIDTH);
      const dPitch = -Math.round(dy / ROW_HEIGHT);

      const newStep = Math.max(
        0,
        Math.min(totalSteps - note.length, stateRef.current.initialStep + dStep)
      );
      const newPitch = Math.max(
        MIN_PITCH,
        Math.min(MAX_PITCH, stateRef.current.initialPitch + dPitch)
      );

      if (newStep !== note.step || newPitch !== note.pitch) {
        updateNote(note.id, { step: newStep, pitch: newPitch });
        playKeySound(newPitch);
      }
    }
  };

  // Calculations for positioning
  const left = note.step * STEP_WIDTH + dragOffset.x;
  const top = (MAX_PITCH - note.pitch) * ROW_HEIGHT + dragOffset.y;
  const width = resizeWidth !== null ? resizeWidth : note.length * STEP_WIDTH;

  const shamiNote = convertToShamisenNote(note.pitch, tuning, basePitch);
  const shamiLabel = shamiNote
    ? `${shamiNote.stringIndex + 1}-${shamiNote.tsubo}`
    : '';

  return (
    <div
      className="absolute bg-shamiRed/90 hover:bg-shamiRed text-washiWhite rounded border border-white/20 select-none flex items-center justify-between px-2 text-[10px] font-sans shadow-sm cursor-grab active:cursor-grabbing"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${ROW_HEIGHT}px`,
        touchAction: 'none'
      }}
      onPointerDown={handleDragPointerDown}
      onPointerMove={handleDragPointerMove}
      onPointerUp={handleDragPointerUp}
      onPointerCancel={handleDragPointerUp}
      data-testid={`note-block-${note.id}`}
    >
      {note.length >= 2 && (
        <>
          <span className="truncate pr-1">{getPitchLabel(note.pitch)}</span>
          <span className="opacity-80 text-[8px] bg-black/20 px-1 rounded flex-shrink-0">
            {shamiLabel}
          </span>
        </>
      )}

      {/* Resize Handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-white/20 z-10"
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        onPointerCancel={handleResizePointerUp}
        data-testid="note-handle-right"
      />
    </div>
  );
};

export default NoteBlock;
