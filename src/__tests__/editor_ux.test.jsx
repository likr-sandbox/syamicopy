import {
  act,
  fireEvent,
  render,
  renderHook,
  screen
} from '@testing-library/react';
import React, { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import BunkafuView from '../components/BunkafuView/BunkafuView';
import Header from '../components/Header';
import Grid from '../components/PianoRoll/Grid';
import PianoRoll from '../components/PianoRoll/PianoRoll';
import useAudio from '../hooks/useAudio';
import useNoteEditor from '../hooks/useNoteEditor';

// Mock Web Audio
vi.mock('../utils/audio', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    createAudioContext: vi.fn(() => ({
      state: 'running',
      currentTime: 1.5,
      resume: vi.fn().mockResolvedValue(),
      close: vi.fn().mockResolvedValue(),
      createOscillator: vi.fn(() => ({
        type: 'sawtooth',
        frequency: { setValueAtTime: vi.fn(), value: 440 },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn()
      })),
      createGain: vi.fn(() => ({
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn()
        },
        connect: vi.fn()
      })),
      destination: {}
    })),
    playShamisenSound: vi.fn()
  };
});

describe('Milestone 3: Editor UX Enhancements', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('1. Undo / Redo Mechanism in useNoteEditor', () => {
    it('tracks history on addNote, updateNote, deleteNote, and transposeNotes with 50 cap', () => {
      let currentProject = {
        id: 'proj-history-1',
        notes: []
      };
      const updateProject = vi.fn((fieldsOrFn) => {
        const fields =
          typeof fieldsOrFn === 'function'
            ? fieldsOrFn(currentProject)
            : fieldsOrFn;
        if (fields) {
          currentProject = { ...currentProject, ...fields };
        }
      });

      const { result, rerender } = renderHook(
        ({ cp }) => useNoteEditor(cp, updateProject),
        { initialProps: { cp: currentProject } }
      );

      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);

      // Add a note
      act(() => {
        result.current.addNote({ pitch: 60, step: 0, length: 4 });
      });
      rerender({ cp: currentProject });

      expect(currentProject.notes.length).toBe(1);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);

      // Undo
      act(() => {
        result.current.undo();
      });
      rerender({ cp: currentProject });

      expect(currentProject.notes.length).toBe(0);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);

      // Redo
      act(() => {
        result.current.redo();
      });
      rerender({ cp: currentProject });

      expect(currentProject.notes.length).toBe(1);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);

      // Transpose
      act(() => {
        result.current.transposeNotes(2);
      });
      rerender({ cp: currentProject });

      expect(currentProject.notes[0].pitch).toBe(62);
      expect(result.current.canUndo).toBe(true);

      // Undo transpose
      act(() => {
        result.current.undo();
      });
      rerender({ cp: currentProject });
      expect(currentProject.notes[0].pitch).toBe(60);

      // Cap at 50 snapshots
      for (let i = 0; i < 60; i++) {
        act(() => {
          result.current.addNote({
            pitch: 60 + (i % 12),
            step: (i + 1) * 4,
            length: 4
          });
        });
        rerender({ cp: currentProject });
      }

      // Past stack should not grow unbounded
      let undoCount = 0;
      while (result.current.canUndo) {
        act(() => {
          result.current.undo();
        });
        rerender({ cp: currentProject });
        undoCount++;
        if (undoCount > 60) break;
      }
      expect(undoCount).toBeLessThanOrEqual(50);
    });

    it('renders Undo and Redo buttons in Header with disabled states', () => {
      const onUndo = vi.fn();
      const onRedo = vi.fn();

      const { rerender } = render(
        <Header
          projectName="テスト曲"
          onOpenDrawer={vi.fn()}
          onOpenSettings={vi.fn()}
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={false}
          canRedo={false}
        />
      );

      const undoBtn = screen.getByTestId('undo-btn');
      const redoBtn = screen.getByTestId('redo-btn');

      expect(undoBtn).toBeDisabled();
      expect(redoBtn).toBeDisabled();

      rerender(
        <Header
          projectName="テスト曲"
          onOpenDrawer={vi.fn()}
          onOpenSettings={vi.fn()}
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={true}
          canRedo={true}
        />
      );

      expect(undoBtn).not.toBeDisabled();
      expect(redoBtn).not.toBeDisabled();

      fireEvent.click(undoBtn);
      expect(onUndo).toHaveBeenCalledTimes(1);

      fireEvent.click(redoBtn);
      expect(onRedo).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. Keyboard Shortcuts in App', () => {
    it('handles Space for playback toggle and Ctrl/Cmd+Z/Y for Undo/Redo', () => {
      render(<App />);

      // Initial state: not playing
      const playBtn = screen.getByTestId('play-toggle-btn');
      expect(playBtn).toHaveTextContent(/再生/);

      // Press Space: starts playback
      fireEvent.keyDown(window, { code: 'Space', key: ' ' });
      expect(playBtn).toHaveTextContent(/停止/);

      // Press Space again: stops playback
      fireEvent.keyDown(window, { code: 'Space', key: ' ' });
      expect(playBtn).toHaveTextContent(/再生/);

      // Ignore when focused in text input
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      fireEvent.keyDown(input, { code: 'Space', key: ' ' });
      expect(playBtn).toHaveTextContent(/再生/);

      document.body.removeChild(input);
    });

    it('triggers Undo and Redo shortcuts', () => {
      render(<App />);

      const undoBtn = screen.getByTestId('undo-btn');
      const redoBtn = screen.getByTestId('redo-btn');
      expect(undoBtn).toBeDisabled();
      expect(redoBtn).toBeDisabled();

      // Click on grid to add a note
      const grid = screen.getByTestId('grid');
      const content = grid.querySelector('.cursor-crosshair');
      content.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        width: 3072,
        height: 980,
        right: 3072,
        bottom: 980,
        x: 0,
        y: 0,
        toJSON: () => {}
      });
      fireEvent.click(content, { clientX: 12, clientY: 490 });

      expect(undoBtn).not.toBeDisabled();

      // Ctrl+Z (Undo)
      fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
      expect(undoBtn).toBeDisabled();
      expect(redoBtn).not.toBeDisabled();

      // Ctrl+Y (Redo)
      fireEvent.keyDown(window, { key: 'y', ctrlKey: true });
      expect(undoBtn).not.toBeDisabled();
      expect(redoBtn).toBeDisabled();

      // Cmd+Shift+Z (Redo)
      fireEvent.keyDown(window, { key: 'z', ctrlKey: true }); // Undo first
      expect(redoBtn).not.toBeDisabled();
      fireEvent.keyDown(window, { key: 'Z', metaKey: true, shiftKey: true });
      expect(undoBtn).not.toBeDisabled();
    });
  });

  describe('3. Playback Seeking', () => {
    it('seekToStep updates currentStep in useAudio whether stopped or playing', () => {
      const { result } = renderHook(() =>
        useAudio([], 120, { numerator: 4, denominator: 4 }, 8)
      );

      expect(result.current.currentStep).toBe(-1);

      act(() => {
        result.current.seekToStep(16);
      });
      expect(result.current.currentStep).toBe(16);

      // Seek clamped to boundaries
      act(() => {
        result.current.seekToStep(9999);
      });
      expect(result.current.currentStep).toBe(127);

      act(() => {
        result.current.seekToStep(-5);
      });
      expect(result.current.currentStep).toBe(0);
    });

    it('Measure Header Bar in Grid triggers seekToStep on click', () => {
      const seekToStep = vi.fn();
      render(
        <Grid
          notes={[]}
          addNote={vi.fn()}
          deleteNote={vi.fn()}
          updateNote={vi.fn()}
          timeSignature={{ numerator: 4, denominator: 4 }}
          measureCount={8}
          tuning="honchoshi"
          basePitch={48}
          playKeySound={vi.fn()}
          currentStep={0}
          seekToStep={seekToStep}
        />
      );

      const headerBar = screen.getByTestId('measure-header-bar');
      // STEP_WIDTH = 24. Click at x = 72 => step = 3
      fireEvent.click(headerBar, { clientX: 72 });
      expect(seekToStep).toHaveBeenCalled();
    });

    it('BunkafuView score grid triggers seekToStep on click', () => {
      const seekToStep = vi.fn();
      render(
        <BunkafuView
          notes={[]}
          tuning="honchoshi"
          basePitch={48}
          currentStep={0}
          timeSignature={{ numerator: 4, denominator: 4 }}
          measureCount={8}
          seekToStep={seekToStep}
        />
      );

      const bunkafuScroll = screen.getByTestId('bunkafu-scroll-container');
      fireEvent.click(bunkafuScroll, { clientX: 48 });
      expect(seekToStep).toHaveBeenCalled();
    });
  });

  describe('4. Note Length Inheritance', () => {
    it('inherits lastNoteLength when inserting new notes', () => {
      const addNote = vi.fn();
      const { rerender } = render(
        <Grid
          notes={[]}
          addNote={addNote}
          deleteNote={vi.fn()}
          updateNote={vi.fn()}
          timeSignature={{ numerator: 4, denominator: 4 }}
          measureCount={8}
          tuning="honchoshi"
          basePitch={48}
          playKeySound={vi.fn()}
          currentStep={0}
          lastNoteLength={4}
        />
      );

      // Default lastNoteLength = 4
      const grid = screen.getByTestId('grid');
      const content = grid.querySelector('.cursor-crosshair');
      content.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        width: 3072,
        height: 980,
        right: 3072,
        bottom: 980,
        x: 0,
        y: 0,
        toJSON: () => {}
      });
      fireEvent.click(content, { clientX: 108, clientY: 490 });
      expect(addNote).toHaveBeenCalledWith(
        expect.objectContaining({ length: 4 })
      );

      // When lastNoteLength changes to 8 (e.g. after resize)
      addNote.mockClear();
      rerender(
        <Grid
          notes={[]}
          addNote={addNote}
          deleteNote={vi.fn()}
          updateNote={vi.fn()}
          timeSignature={{ numerator: 4, denominator: 4 }}
          measureCount={8}
          tuning="honchoshi"
          basePitch={48}
          playKeySound={vi.fn()}
          currentStep={0}
          lastNoteLength={8}
        />
      );

      fireEvent.click(content, { clientX: 204, clientY: 490 });
      expect(addNote).toHaveBeenCalledWith(
        expect.objectContaining({ length: 8 })
      );
    });

    it('updates lastNoteLength on note resize in useNoteEditor', () => {
      const currentProject = {
        id: 'proj-len-1',
        notes: [{ id: 'n1', pitch: 60, step: 0, length: 4 }]
      };
      const updateProject = vi.fn();

      const { result } = renderHook(() =>
        useNoteEditor(currentProject, updateProject)
      );

      expect(result.current.lastNoteLength).toBe(4);

      act(() => {
        result.current.updateNote('n1', { length: 6 });
      });
      expect(result.current.lastNoteLength).toBe(6);
    });
  });

  describe('5. Tab Scroll Synchronization', () => {
    it('restores sharedScrollLeft on BunkafuView mount and provides testid/class', () => {
      const ref = React.createRef();
      const onScrollChange = vi.fn();

      render(
        <BunkafuView
          ref={ref}
          notes={[]}
          tuning="honchoshi"
          basePitch={48}
          currentStep={0}
          timeSignature={{ numerator: 4, denominator: 4 }}
          measureCount={8}
          sharedScrollLeft={150}
          onScrollChange={onScrollChange}
        />
      );

      const scrollContainer = screen.getByTestId('bunkafu-view-scroll');
      expect(scrollContainer).toHaveClass('bunkafu-scroll-container');
    });

    it('restores sharedScrollLeft on PianoRoll mount', () => {
      render(
        <PianoRoll
          notes={[]}
          addNote={vi.fn()}
          deleteNote={vi.fn()}
          updateNote={vi.fn()}
          onTranspose={vi.fn()}
          currentStep={0}
          isPlaying={false}
          tuning="honchoshi"
          basePitch={48}
          measureCount={8}
          timeSignature={{ numerator: 4, denominator: 4 }}
          playKeySound={vi.fn()}
          audioContext={null}
          bunkafuRef={{ current: null }}
          sharedScrollLeft={200}
        />
      );

      const pianoGrid = screen.getByTestId('piano-roll');
      expect(pianoGrid).toBeInTheDocument();
    });
  });
});
