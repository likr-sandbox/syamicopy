import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NoteBlock from '../components/PianoRoll/NoteBlock';

if (typeof window !== 'undefined' && !window.PointerEvent) {
  class PointerEvent extends MouseEvent {
    constructor(type, params = {}) {
      super(type, params);
      this._clientX = params.clientX || 0;
      this._clientY = params.clientY || 0;
      this.pointerId = params.pointerId || 0;
      this.pointerType = params.pointerType || 'mouse';
    }
    get clientX() {
      return this._clientX;
    }
    get clientY() {
      return this._clientY;
    }
  }
  window.PointerEvent = PointerEvent;
}

describe('NoteBlock component', () => {
  const defaultProps = {
    note: { id: 'note-1', pitch: 60, step: 8, length: 4 },
    deleteNote: vi.fn(),
    updateNote: vi.fn(),
    totalSteps: 128,
    tuning: 'honchoshi',
    basePitch: 48,
    playKeySound: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with absolute position and style', () => {
    render(<NoteBlock {...defaultProps} />);
    const block = screen.getByTestId('note-block-note-1');
    expect(block).toBeInTheDocument();

    // Position checks
    // left: 8 * 24 = 192px
    // top: (81 - 60) * 20 = 21 * 20 = 420px
    // width: 4 * 24 = 96px
    expect(block.style.left).toBe('192px');
    expect(block.style.top).toBe('420px');
    expect(block.style.width).toBe('96px');

    // Label: pitch label + shamisen label
    // Pitch 60 is C4
    expect(screen.getByText('C4')).toBeInTheDocument();
    // honchoshi open 48, 53, 60. Pitch 60 is string index 2, tsubo '0' -> '3-0'
    expect(screen.getByText('3-0')).toBeInTheDocument();
  });

  it('triggers deleteNote when tapped/clicked without movement', () => {
    render(<NoteBlock {...defaultProps} />);
    const block = screen.getByTestId('note-block-note-1');

    fireEvent.pointerDown(block, { clientX: 100, clientY: 100 });
    fireEvent.pointerUp(block, { clientX: 100, clientY: 100 });

    expect(defaultProps.deleteNote).toHaveBeenCalledWith('note-1');
  });

  it('updates step and pitch on drag end', () => {
    render(<NoteBlock {...defaultProps} />);
    const block = screen.getByTestId('note-block-note-1');

    // Drag: step 8 -> step 12 (dx = 4 * 24 = 96px)
    // Drag: pitch 60 -> pitch 62 (dy = -2 * 20 = -40px)
    fireEvent.pointerDown(block, { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(block, { clientX: 196, clientY: 60 });
    fireEvent.pointerUp(block, { clientX: 196, clientY: 60 });

    expect(defaultProps.updateNote).toHaveBeenCalledWith('note-1', {
      step: 12,
      pitch: 62
    });
    expect(defaultProps.playKeySound).toHaveBeenCalledWith(62);
  });

  it('updates length when resizing handle is dragged', () => {
    render(<NoteBlock {...defaultProps} />);
    const handle = screen.getByTestId('note-handle-right');

    // Drag resize handle: length 4 -> length 6 (dx = 2 * 24 = 48px)
    fireEvent.pointerDown(handle, { clientX: 200, clientY: 100 });
    fireEvent.pointerMove(handle, { clientX: 248, clientY: 100 });
    fireEvent.pointerUp(handle, { clientX: 248, clientY: 100 });

    expect(defaultProps.updateNote).toHaveBeenCalledWith('note-1', {
      length: 6
    });
  });
});
