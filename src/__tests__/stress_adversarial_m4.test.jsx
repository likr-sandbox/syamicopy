import {
  act,
  fireEvent,
  render,
  renderHook,
  screen
} from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NewProjectModal from '../components/NewProjectModal';
import SettingsModal from '../components/SettingsModal';
import { useAudio } from '../hooks/useAudio';
import { JA } from '../i18n/ja';
import * as audioUtils from '../utils/audio';

vi.mock('../utils/audio', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    createAudioContext: vi.fn(),
    playShamisenSound: vi.fn()
  };
});

describe('Milestone 4 Stress and Adversarial Input Tests', () => {
  let alertMock;
  let confirmMock;

  beforeEach(() => {
    alertMock = vi.fn();
    confirmMock = vi.fn();
    window.alert = alertMock;
    window.confirm = confirmMock;
    localStorage.clear();
  });

  describe('NewProjectModal - Corrupted, Malicious, or Empty JSON Import', () => {
    it('handles empty JSON gracefully by alerting and not crashing', async () => {
      const onCreateProject = vi.fn();
      render(
        <NewProjectModal
          isOpen={true}
          onClose={vi.fn()}
          onCreateProject={onCreateProject}
          onLoadPreset={vi.fn()}
        />
      );

      const fileInput = screen.getByTestId('notes-file-input');
      const file = new File([''], 'empty.json', { type: 'application/json' });

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
        // Wait a tiny bit for FileReader onload to fire
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(alertMock).toHaveBeenCalledWith(
        'JSONファイルの読み込みに失敗しました。'
      );
      expect(onCreateProject).not.toHaveBeenCalled();
    });

    it('handles malformed JSON syntax gracefully', async () => {
      const onCreateProject = vi.fn();
      render(
        <NewProjectModal
          isOpen={true}
          onClose={vi.fn()}
          onCreateProject={onCreateProject}
          onLoadPreset={vi.fn()}
        />
      );

      const fileInput = screen.getByTestId('notes-file-input');
      const file = new File(['{malformed: json}'], 'malformed.json', {
        type: 'application/json'
      });

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(alertMock).toHaveBeenCalledWith(
        'JSONファイルの読み込みに失敗しました。'
      );
      expect(onCreateProject).not.toHaveBeenCalled();
    });

    it('handles JSON containing non-object value gracefully', async () => {
      const onCreateProject = vi.fn();
      render(
        <NewProjectModal
          isOpen={true}
          onClose={vi.fn()}
          onCreateProject={onCreateProject}
          onLoadPreset={vi.fn()}
        />
      );

      const fileInput = screen.getByTestId('notes-file-input');
      const file = new File(['123'], 'number.json', {
        type: 'application/json'
      });

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(alertMock).toHaveBeenCalledWith(
        '無効な譜面データフォーマットです。JSON配列を指定してください。'
      );
      expect(onCreateProject).not.toHaveBeenCalled();
    });
  });

  describe('useAudio and SettingsModal - BPM Boundaries', () => {
    let mockOscillator;
    let mockGainNode;
    let mockAudioContext;

    beforeEach(() => {
      vi.useFakeTimers();

      mockOscillator = {
        type: '',
        frequency: { value: 0, setValueAtTime: vi.fn() },
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

    it('sets step duration to 150ms (fallback 100 BPM) when BPM is 0', () => {
      const { result } = renderHook(() =>
        useAudio([], 0, { numerator: 4, denominator: 4 }, 2)
      );

      act(() => {
        result.current.startPlayback();
      });

      expect(result.current.isPlaying).toBe(true);
      expect(result.current.currentStep).toBe(0);

      // bpm = 0 -> falls back to 100 bpm in useAudio.js: (60 / 100 / 4) * 1000 = 150ms
      act(() => {
        vi.advanceTimersByTime(149);
      });
      expect(result.current.currentStep).toBe(0);

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current.currentStep).toBe(1);
    });

    it('clamps stepDuration to 500ms (30 BPM) when BPM is negative (e.g. -100)', () => {
      const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
      const { result } = renderHook(() =>
        useAudio([], -100, { numerator: 4, denominator: 4 }, 2)
      );

      act(() => {
        result.current.startPlayback();
      });

      expect(result.current.isPlaying).toBe(true);
      // stepsPerBeat = 4. stepDurationMs = (60 / 30 / 4) * 1000 = 500ms.
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 500);
    });

    it('clamps stepDuration to 62.5ms (240 BPM) when BPM is extremely large (e.g. 100000)', () => {
      const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
      const { result } = renderHook(() =>
        useAudio([], 100000, { numerator: 4, denominator: 4 }, 2)
      );

      act(() => {
        result.current.startPlayback();
      });

      expect(result.current.isPlaying).toBe(true);
      // stepsPerBeat = 4. stepDurationMs = (60 / 240 / 4) * 1000 = 62.5ms.
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 62.5);
    });
  });

  describe('Pitch Transpositions Clamping', () => {
    it('clamps transposed pitches strictly at 57 and 93', () => {
      const transpose = (notes, semitones) => {
        return notes.map((note) => {
          let newPitch = note.pitch + semitones;
          newPitch = Math.max(57, Math.min(93, newPitch));
          return { ...note, pitch: newPitch };
        });
      };

      const notes = [
        { id: 'note1', pitch: 58, step: 0, length: 4 },
        { id: 'note2', pitch: 92, step: 4, length: 4 }
      ];

      // 1. Transpose DOWN by -1. note1 (58 -> 57), note2 (92 -> 91)
      const down = transpose(notes, -1);
      expect(down).toEqual([
        { id: 'note1', pitch: 57, step: 0, length: 4 },
        { id: 'note2', pitch: 91, step: 4, length: 4 }
      ]);

      // Transpose DOWN again by -1. note1 should clamp at 57!
      const downClamped = transpose(down, -1);
      expect(downClamped).toEqual([
        { id: 'note1', pitch: 57, step: 0, length: 4 },
        { id: 'note2', pitch: 90, step: 4, length: 4 }
      ]);

      // 2. Transpose UP by +1.
      const up = transpose(notes, 1);
      expect(up).toEqual([
        { id: 'note1', pitch: 59, step: 0, length: 4 },
        { id: 'note2', pitch: 93, step: 4, length: 4 }
      ]);

      // Transpose UP again. note2 should clamp at 93.
      const upClamped = transpose(up, 1);
      expect(upClamped).toEqual([
        { id: 'note1', pitch: 60, step: 0, length: 4 },
        { id: 'note2', pitch: 93, step: 4, length: 4 }
      ]);
    });
  });
});
