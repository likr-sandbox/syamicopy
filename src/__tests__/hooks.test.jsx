import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAudio } from '../hooks/useAudio';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { useNoteEditor } from '../hooks/useNoteEditor';
import { useProjects } from '../hooks/useProjects';
import * as audioUtils from '../utils/audio';

// Mock audio utility functions
vi.mock('../utils/audio', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    createAudioContext: vi.fn(),
    playShamisenSound: vi.fn()
  };
});

describe('useProjects hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with a default project if localStorage is empty', () => {
    const { result } = renderHook(() => useProjects());
    expect(result.current.projects.length).toBe(1);
    expect(result.current.currentProject).not.toBeNull();
    expect(result.current.currentProject.name).toBe('無題のプロジェクト');
  });

  it('should create a project and select it', () => {
    const { result } = renderHook(() => useProjects());
    let newProj;
    act(() => {
      newProj = result.current.createProject({ name: 'Test Proj', bpm: 120 });
    });
    expect(result.current.projects.length).toBe(2);
    expect(result.current.currentProject.id).toBe(newProj.id);
    expect(result.current.currentProject.name).toBe('Test Proj');
    expect(result.current.currentProject.bpm).toBe(120);
  });

  it('should update the active project', () => {
    const { result } = renderHook(() => useProjects());
    act(() => {
      result.current.updateProject({ composer: 'John Doe', memo: 'My lyrics' });
    });
    expect(result.current.currentProject.composer).toBe('John Doe');
    expect(result.current.currentProject.memo).toBe('My lyrics');
    expect(result.current.currentProject.updatedAt).toBeDefined();
  });

  it('should select a project', () => {
    const { result } = renderHook(() => useProjects());
    let _newProj;
    act(() => {
      _newProj = result.current.createProject({ name: 'Another' });
    });
    const defaultId = result.current.projects[0].id;
    act(() => {
      result.current.selectProject(defaultId);
    });
    expect(result.current.currentProject.id).toBe(defaultId);
  });

  it('should delete a project and select another one', () => {
    const { result } = renderHook(() => useProjects());
    let p2;
    act(() => {
      p2 = result.current.createProject({ name: 'P2' });
    });
    const p1Id = result.current.projects[0].id;

    // delete the current project (P2)
    act(() => {
      result.current.deleteProject(p2.id);
    });
    expect(result.current.projects.length).toBe(1);
    expect(result.current.currentProject.id).toBe(p1Id);

    // delete the last remaining project
    act(() => {
      result.current.deleteProject(p1Id);
    });
    expect(result.current.projects.length).toBe(1); // should auto create default project
    expect(result.current.currentProject.name).toBe('無題のプロジェクト');
  });

  it('should load preset key', () => {
    const { result } = renderHook(() => useProjects());
    act(() => {
      result.current.loadPreset('kaeru');
    });
    expect(result.current.currentProject.name).toBe('かえるの合唱');
    expect(result.current.currentProject.notes.length).toBeGreaterThan(0);
  });
});

describe('useNoteEditor hook', () => {
  it('should add, delete, and update notes', () => {
    let currentProject = {
      id: 'proj-1',
      notes: [{ id: 'n1', pitch: 60, step: 0, length: 4 }]
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

    // Test addNote
    act(() => {
      result.current.addNote({ id: 'n2', pitch: 64, step: 4, length: 4 });
    });
    expect(updateProject).toHaveBeenCalled();

    // update CP prop
    rerender({ cp: currentProject });
    expect(currentProject.notes.length).toBe(2);
    expect(currentProject.notes.find((n) => n.id === 'n2')).toBeDefined();

    // Test addNote overlap prevention
    updateProject.mockClear();
    act(() => {
      result.current.addNote({ id: 'n3', pitch: 64, step: 4, length: 4 });
    });
    expect(currentProject.notes.length).toBe(2);

    // Test updateNote
    act(() => {
      result.current.updateNote('n2', { pitch: 65, length: 8 });
    });
    rerender({ cp: currentProject });
    const n2 = currentProject.notes.find((n) => n.id === 'n2');
    expect(n2.pitch).toBe(65);
    expect(n2.length).toBe(8);

    // Test deleteNote
    act(() => {
      result.current.deleteNote('n1');
    });
    rerender({ cp: currentProject });
    expect(currentProject.notes.length).toBe(1);
    expect(currentProject.notes.find((n) => n.id === 'n1')).toBeUndefined();
  });
});

describe('useAudio hook', () => {
  let mockOscillator;
  let mockGainNode;
  let mockAudioContext;

  const mockNotes = [
    { id: '1', pitch: 60, step: 0, length: 4 },
    { id: '2', pitch: 64, step: 8, length: 4 }
  ];
  const bpm = 120;
  const timeSignature = { numerator: 4, denominator: 4 };
  const measureCount = 2;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();

    mockOscillator = {
      type: '',
      frequency: {
        value: 0,
        setValueAtTime: vi.fn()
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn()
    };

    mockGainNode = {
      gain: {
        value: 0.8,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        cancelScheduledValues: vi.fn()
      },
      connect: vi.fn()
    };

    mockAudioContext = {
      currentTime: 0,
      state: 'suspended',
      destination: {},
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGainNode),
      resume: vi.fn().mockResolvedValue()
    };

    audioUtils.playShamisenSound.mockClear();
    audioUtils.createAudioContext.mockReturnValue(mockAudioContext);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with isPlaying false and currentStep -1', () => {
    const { result } = renderHook(() =>
      useAudio(mockNotes, bpm, timeSignature, measureCount)
    );
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentStep).toBe(-1);
  });

  it('should start playback, advance steps on timer ticks, play notes, and stop playback', () => {
    const { result } = renderHook(() =>
      useAudio(mockNotes, bpm, timeSignature, measureCount)
    );

    act(() => {
      result.current.startPlayback();
    });

    expect(result.current.isPlaying).toBe(true);
    expect(result.current.currentStep).toBe(0);
    expect(audioUtils.playShamisenSound).toHaveBeenCalledWith(
      mockAudioContext,
      60,
      expect.any(Number)
    );

    audioUtils.playShamisenSound.mockClear();

    // bpm = 120, stepsPerBeat = 4 => stepDuration = 125ms
    act(() => {
      vi.advanceTimersByTime(125);
    });
    expect(result.current.currentStep).toBe(1);
    expect(audioUtils.playShamisenSound).not.toHaveBeenCalled();

    // Advance to step 8 (7 more steps: 7 * 125 = 875ms)
    act(() => {
      vi.advanceTimersByTime(875);
    });
    expect(result.current.currentStep).toBe(8);
    expect(audioUtils.playShamisenSound).toHaveBeenCalledWith(
      mockAudioContext,
      64,
      expect.any(Number)
    );

    act(() => {
      result.current.stopPlayback();
    });
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentStep).toBe(-1);
  });

  it('should play immediate key sound on playKeySound', () => {
    const { result } = renderHook(() =>
      useAudio(mockNotes, bpm, timeSignature, measureCount)
    );
    act(() => {
      result.current.playKeySound(60);
    });
    expect(audioUtils.playShamisenSound).toHaveBeenCalledWith(
      mockAudioContext,
      60,
      0.8
    );
  });
});

describe('useAutoScroll hook', () => {
  it('should synchronize scrollLeft between grid and bunkafu views', () => {
    const gridEl = { scrollLeft: 100, scrollTo: vi.fn() };
    const bunkafuEl = { scrollLeft: 200, scrollTo: vi.fn() };

    const gridRef = { current: gridEl };
    const bunkafuRef = { current: bunkafuEl };

    const { result } = renderHook(() =>
      useAutoScroll(gridRef, bunkafuRef, -1, false)
    );

    act(() => {
      result.current.handleGridScroll();
    });
    expect(bunkafuEl.scrollLeft).toBe(100);

    bunkafuEl.scrollLeft = 150;
    act(() => {
      result.current.handleBunkafuScroll();
    });
    expect(gridEl.scrollLeft).toBe(150);
  });

  it('should auto-scroll to center playhead on step updates (every 8 steps or out of viewport)', () => {
    const gridEl = {
      scrollLeft: 0,
      clientWidth: 200,
      scrollTo: vi.fn(({ left }) => {
        gridEl.scrollLeft = left;
      })
    };
    const bunkafuEl = { scrollLeft: 0, scrollTo: vi.fn() };

    const gridRef = { current: gridEl };
    const bunkafuRef = { current: bunkafuEl };

    let currentStep = 0;
    const { rerender } = renderHook(
      ({ step }) => useAutoScroll(gridRef, bunkafuRef, step, true),
      { initialProps: { step: currentStep } }
    );

    expect(gridEl.scrollTo).toHaveBeenCalledWith({
      left: 0,
      behavior: 'smooth'
    });

    gridEl.scrollTo.mockClear();

    // Step 1: not every 8 steps, not out of viewport -> should not scroll
    currentStep = 1;
    rerender({ step: currentStep });
    expect(gridEl.scrollTo).not.toHaveBeenCalled();

    // Step 8: every 8 steps -> should scroll
    currentStep = 8;
    rerender({ step: currentStep });
    expect(gridEl.scrollTo).toHaveBeenCalledWith({
      left: 92,
      behavior: 'smooth'
    });

    gridEl.scrollTo.mockClear();

    // Step 20: not every 8 steps, but out of viewport (20 * 24 = 480, viewport is [92, 292]) -> should scroll
    currentStep = 20;
    rerender({ step: currentStep });
    expect(gridEl.scrollTo).toHaveBeenCalledWith({
      left: 380,
      behavior: 'smooth'
    });
  });
});
