import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Grid from '../components/PianoRoll/Grid';
import Keyboard from '../components/PianoRoll/Keyboard';
import NoteBlock from '../components/PianoRoll/NoteBlock';
import * as audioUtils from '../utils/audio';
import {
  MAX_PITCH,
  MIN_PITCH,
  ROW_HEIGHT,
  STEP_WIDTH
} from '../utils/constants';

// Mock audio utils to isolate keyboard audio tests
vi.mock('../utils/audio', () => ({
  createAudioContext: vi.fn(),
  playShamisenSound: vi.fn(),
  startSustainedNote: vi.fn(() => ({
    stop: vi.fn()
  })),
  stopSustainedNote: vi.fn()
}));

describe('PianoRoll Components - Adversarial and Stress Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Grid Component Boundary & Target Isolation', () => {
    const defaultProps = {
      notes: [],
      addNote: vi.fn(),
      deleteNote: vi.fn(),
      updateNote: vi.fn(),
      timeSignature: { numerator: 4, denominator: 4 },
      measureCount: 8,
      tuning: 'honchoshi',
      basePitch: 48,
      playKeySound: vi.fn(),
      currentStep: -1
    };

    it('clamps negative click coordinates to step 0 and pitch MAX_PITCH', () => {
      render(<Grid {...defaultProps} />);
      const grid = screen.getByTestId('grid');
      const content = grid.querySelector('.cursor-crosshair');

      content.getBoundingClientRect = vi.fn(() => ({
        left: 100,
        top: 100,
        width: 3072,
        height: 740,
        right: 3172,
        bottom: 840,
        x: 100,
        y: 100,
        toJSON: () => {}
      }));

      // Simulate a click way off to the top-left (negative relative coordinates: clientX = 0, clientY = 0)
      // clickX = 0 - 100 = -100px. step = Math.floor(-100 / 24) = -5 -> clamped to 0
      // clickY = 0 - 100 = -100px. pitch = 81 - Math.floor(-100 / 20) = 81 - (-5) = 86 -> clamped to MAX_PITCH (81)
      fireEvent.click(content, { clientX: 0, clientY: 0 });

      expect(defaultProps.addNote).toHaveBeenCalledWith({
        pitch: MAX_PITCH,
        step: 0,
        length: 4
      });
      expect(defaultProps.playKeySound).toHaveBeenCalledWith(MAX_PITCH);
    });

    it('clamps extremely large click coordinates to max step and MIN_PITCH', () => {
      render(<Grid {...defaultProps} />);
      const grid = screen.getByTestId('grid');
      const content = grid.querySelector('.cursor-crosshair');

      content.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 3072,
        height: 740,
        right: 3072,
        bottom: 740,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      // Click coordinate is way beyond totalSteps (128 steps) and pitches (37 pitches)
      // e.g., clientX = 5000px, clientY = 5000px
      // step = Math.floor(5000 / 24) = 208 -> clamped to totalSteps - 1 (127)
      // pitch = 81 - Math.floor(5000 / 20) = 81 - 250 = -169 -> clamped to MIN_PITCH (45)
      fireEvent.click(content, { clientX: 5000, clientY: 5000 });

      expect(defaultProps.addNote).toHaveBeenCalledWith({
        pitch: MIN_PITCH,
        step: 127,
        length: 4
      });
      expect(defaultProps.playKeySound).toHaveBeenCalledWith(MIN_PITCH);
    });

    it('ignores clicks targeting elements within note blocks or resize handles', () => {
      const notes = [{ id: 'note-stress', pitch: 60, step: 4, length: 4 }];
      render(<Grid {...defaultProps} notes={notes} />);

      const block = screen.getByTestId('note-block-note-stress');
      const resizeHandle = screen.getByTestId('note-handle-right');

      // Click on NoteBlock block element
      fireEvent.click(block);
      expect(defaultProps.addNote).not.toHaveBeenCalled();

      // Click on Resize handle element
      fireEvent.click(resizeHandle);
      expect(defaultProps.addNote).not.toHaveBeenCalled();
    });
  });

  describe('NoteBlock Dragging Boundary Stress', () => {
    const defaultProps = {
      note: { id: 'note-drag', pitch: 60, step: 8, length: 4 },
      deleteNote: vi.fn(),
      updateNote: vi.fn(),
      totalSteps: 128,
      tuning: 'honchoshi',
      basePitch: 48,
      playKeySound: vi.fn()
    };

    it('clamps step and pitch coordinates to minimum boundaries during extremely negative drag', () => {
      render(<NoteBlock {...defaultProps} />);
      const block = screen.getByTestId('note-block-note-drag');

      // Start drag at (100, 100) and move to negative coordinates (-5000, -5000)
      fireEvent.pointerDown(block, { clientX: 100, clientY: 100 });
      fireEvent.pointerMove(block, { clientX: -5000, clientY: -5000 });
      fireEvent.pointerUp(block, { clientX: -5000, clientY: -5000 });

      // Extremely negative clientX: step clamps to 0
      // Extremely negative clientY: pitch clamps to MAX_PITCH (81)
      expect(defaultProps.updateNote).toHaveBeenCalledWith('note-drag', {
        step: 0,
        pitch: MAX_PITCH
      });
      expect(defaultProps.playKeySound).toHaveBeenCalledWith(MAX_PITCH);
    });

    it('clamps step and pitch coordinates to maximum boundaries during extremely positive drag', () => {
      render(<NoteBlock {...defaultProps} />);
      const block = screen.getByTestId('note-block-note-drag');

      // Start drag at (100, 100) and move to extremely large coordinates (10000, 10000)
      fireEvent.pointerDown(block, { clientX: 100, clientY: 100 });
      fireEvent.pointerMove(block, { clientX: 10000, clientY: 10000 });
      fireEvent.pointerUp(block, { clientX: 10000, clientY: 10000 });

      // Extremely positive clientX: step clamps to totalSteps - length = 128 - 4 = 124
      // Extremely positive clientY: pitch clamps to MIN_PITCH (45)
      expect(defaultProps.updateNote).toHaveBeenCalledWith('note-drag', {
        step: 124,
        pitch: MIN_PITCH
      });
      expect(defaultProps.playKeySound).toHaveBeenCalledWith(MIN_PITCH);
    });

    it('updates position correctly even when dragging to overlap with hypothetical other coordinates', () => {
      render(<NoteBlock {...defaultProps} />);
      const block = screen.getByTestId('note-block-note-drag');

      // Drag to step 12 (dx = 4 * 24 = 96px), pitch 58 (dy = 2 * 20 = 40px)
      fireEvent.pointerDown(block, { clientX: 100, clientY: 100 });
      fireEvent.pointerMove(block, { clientX: 196, clientY: 140 });
      fireEvent.pointerUp(block, { clientX: 196, clientY: 140 });

      expect(defaultProps.updateNote).toHaveBeenCalledWith('note-drag', {
        step: 12,
        pitch: 58
      });
      expect(defaultProps.playKeySound).toHaveBeenCalledWith(58);
    });
  });

  describe('NoteBlock Resizing Extremes', () => {
    const defaultProps = {
      note: { id: 'note-resize', pitch: 60, step: 8, length: 4 },
      deleteNote: vi.fn(),
      updateNote: vi.fn(),
      totalSteps: 128,
      tuning: 'honchoshi',
      basePitch: 48,
      playKeySound: vi.fn()
    };

    it('clamps new length to minimum value of 1 when resized with extremely negative width', () => {
      render(<NoteBlock {...defaultProps} />);
      const handle = screen.getByTestId('note-handle-right');

      // Start drag resize at clientX = 200, move left by 500px (dx = -500)
      // (4 * 24 - 500) / 24 = -16.8 steps. Clamped to 1.
      fireEvent.pointerDown(handle, { clientX: 200, clientY: 100 });
      fireEvent.pointerMove(handle, { clientX: -300, clientY: 100 });
      fireEvent.pointerUp(handle, { clientX: -300, clientY: 100 });

      expect(defaultProps.updateNote).toHaveBeenCalledWith('note-resize', {
        length: 1
      });
    });

    it('clamps maximum note length to grid boundary on extreme positive resizing', () => {
      render(<NoteBlock {...defaultProps} />);
      const handle = screen.getByTestId('note-handle-right');

      // Start drag resize at clientX = 200, move right by 4800px (dx = 4800px, 4800/24 = 200 steps)
      // New length = 4 + 200 = 204 steps, but clamped to totalSteps - step = 128 - 8 = 120.
      fireEvent.pointerDown(handle, { clientX: 200, clientY: 100 });
      fireEvent.pointerMove(handle, { clientX: 5000, clientY: 100 });
      fireEvent.pointerUp(handle, { clientX: 5000, clientY: 100 });

      expect(defaultProps.updateNote).toHaveBeenCalledWith('note-resize', {
        length: 120
      });
    });
  });

  describe('NoteBlock Heavy Event Sequence / Double-Click / Rapid Tapping', () => {
    const defaultProps = {
      note: { id: 'note-heavy', pitch: 60, step: 8, length: 4 },
      deleteNote: vi.fn(),
      updateNote: vi.fn(),
      totalSteps: 128,
      tuning: 'honchoshi',
      basePitch: 48,
      playKeySound: vi.fn()
    };

    it('remains stable and calls deleteNote on each tap in a rapid sequence of 100 taps', () => {
      render(<NoteBlock {...defaultProps} />);
      const block = screen.getByTestId('note-block-note-heavy');

      // Fire 100 rapid pointerDown/pointerUp event cycles at the exact same location (no drag)
      for (let i = 0; i < 100; i++) {
        fireEvent.pointerDown(block, { clientX: 100, clientY: 100 });
        fireEvent.pointerUp(block, { clientX: 100, clientY: 100 });
      }

      // Assert that deleteNote was triggered 100 times safely without throwing errors
      expect(defaultProps.deleteNote).toHaveBeenCalledTimes(100);
      expect(defaultProps.deleteNote).toHaveBeenCalledWith('note-heavy');
    });

    it('avoids delete actions when rapid movements are mixed in with pointer down/up events', () => {
      render(<NoteBlock {...defaultProps} />);
      const block = screen.getByTestId('note-block-note-heavy');

      // Loop to alternate between small drag pointerMoves and pointerUps
      for (let i = 0; i < 10; i++) {
        fireEvent.pointerDown(block, { clientX: 100, clientY: 100 });
        // Significant movement dx = 50px
        fireEvent.pointerMove(block, { clientX: 150, clientY: 100 });
        fireEvent.pointerUp(block, { clientX: 150, clientY: 100 });
      }

      // Since each sequence had a drag distance of 50px (which is >= 3px tap limit),
      // deleteNote should NOT have been called.
      expect(defaultProps.deleteNote).not.toHaveBeenCalled();
      // It should trigger updateNote for movement (dx = 50 -> 50/24 = 2 steps. newStep = 8 + 2 = 10)
      expect(defaultProps.updateNote).toHaveBeenCalledTimes(10);
      expect(defaultProps.updateNote).toHaveBeenLastCalledWith('note-heavy', {
        step: 10,
        pitch: 60
      });
    });
  });

  describe('Keyboard Component Extreme Pointer Input & Audio Context Failures', () => {
    const defaultProps = {
      tuning: 'honchoshi',
      basePitch: 48,
      playKeySound: vi.fn(),
      audioContext: {
        state: 'running',
        resume: vi.fn().mockResolvedValue(),
        createOscillator: vi.fn(),
        currentTime: 0
      }
    };

    it('safely handles glissando sweeps with 50 keys pressed and released rapidly without pointer leaks', () => {
      render(<Keyboard {...defaultProps} />);

      // Press 49 keys in sequence (all keys available) and verify no crashes
      const keys = screen.getAllByTestId(/^key-/);

      // Down on all keys
      for (const key of keys) {
        fireEvent.pointerDown(key);
      }

      // Assert that startSustainedNote was triggered for each key
      expect(audioUtils.startSustainedNote).toHaveBeenCalledTimes(49);

      // Release or pointerLeave all keys
      for (const key of keys) {
        fireEvent.pointerLeave(key);
      }

      // Assert that stopSustainedNote was triggered to clean up all keys
      expect(audioUtils.stopSustainedNote).toHaveBeenCalledTimes(49);
    });

    it('falls back to playKeySound when audioContext is null', () => {
      render(<Keyboard {...defaultProps} audioContext={null} />);

      const key60 = screen.getByTestId('key-60');
      fireEvent.pointerDown(key60);

      // Should not call startSustainedNote since audioContext is null
      expect(audioUtils.startSustainedNote).not.toHaveBeenCalled();
      // Should fallback to playKeySound prop
      expect(defaultProps.playKeySound).toHaveBeenCalledWith(60);
    });

    it('resumes suspended audioContext on key touch', async () => {
      const suspendedContext = {
        state: 'suspended',
        resume: vi.fn().mockResolvedValue(),
        currentTime: 0
      };

      render(<Keyboard {...defaultProps} audioContext={suspendedContext} />);
      const key60 = screen.getByTestId('key-60');

      fireEvent.pointerDown(key60);

      expect(suspendedContext.resume).toHaveBeenCalled();
    });
  });
});
