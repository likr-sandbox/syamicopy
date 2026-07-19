import {
  act,
  fireEvent,
  render,
  renderHook,
  screen
} from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { Drawer } from '../components/Drawer';
import NewProjectModal from '../components/NewProjectModal';
import PianoRoll from '../components/PianoRoll/PianoRoll';
import { SettingsModal } from '../components/SettingsModal';
import { useAudio } from '../hooks/useAudio';
import * as audioUtils from '../utils/audio';

// Mock audio context to prevent actual sound output
vi.mock('../utils/audio', () => ({
  createAudioContext: vi.fn(() => ({
    state: 'suspended',
    currentTime: 0,
    resume: vi.fn().mockResolvedValue(),
    close: vi.fn().mockResolvedValue(),
    createOscillator: vi.fn(() => ({
      type: '',
      frequency: { value: 0, setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn()
    })),
    createGain: vi.fn(() => ({
      gain: {
        value: 0.8,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        cancelScheduledValues: vi.fn()
      },
      connect: vi.fn()
    }))
  })),
  playShamisenSound: vi.fn()
}));

// Mock window.confirm & alert
const confirmMock = vi.fn();
const alertMock = vi.fn();
window.confirm = confirmMock;
window.alert = alertMock;

describe('Milestone 4 Layout & State Hooks Stress Tests', () => {
  let originalFileReader;

  beforeEach(() => {
    confirmMock.mockReset();
    alertMock.mockReset();
    localStorage.clear();
    originalFileReader = globalThis.FileReader;
  });

  afterEach(() => {
    globalThis.FileReader = originalFileReader;
    vi.restoreAllMocks();
  });

  describe('Adversarial JSON Import in NewProjectModal', () => {
    const setupFileReaderMock = (fileContent, shouldSucceed = true) => {
      class MockFileReader {
        readAsText(_file) {
          setTimeout(() => {
            if (shouldSucceed) {
              this.onload({
                target: { result: fileContent }
              });
            } else {
              this.onerror(new Error('Read failed'));
            }
          }, 0);
        }
      }
      globalThis.FileReader = MockFileReader;
    };

    it('handles empty JSON file without crashing', async () => {
      setupFileReaderMock('');
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
      const file = new File([], 'empty.json', { type: 'application/json' });

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
        // Wait for FileReader timeout to complete
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(alertMock).toHaveBeenCalledWith(expect.any(String));
      expect(onCreateProject).not.toHaveBeenCalled();
    });

    it('handles malformed JSON file syntax without crashing', async () => {
      setupFileReaderMock('{ "invalid": json }');
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
      const file = new File([], 'malformed.json', { type: 'application/json' });

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(alertMock).toHaveBeenCalledWith(expect.any(String));
      expect(onCreateProject).not.toHaveBeenCalled();
    });

    it('handles JSON with null/primitive value without crashing', async () => {
      setupFileReaderMock('null');
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
      const file = new File([], 'null.json', { type: 'application/json' });

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(alertMock).toHaveBeenCalledWith(expect.any(String));
      expect(onCreateProject).not.toHaveBeenCalled();
    });

    it('gracefully handles JSON with malformed structures (e.g. notes is string) without crashing', async () => {
      vi.useFakeTimers();

      // Setup mock file content with malformed notes structure (string instead of array)
      const badProjectJson = JSON.stringify({
        name: 'Bad Project',
        bpm: 120,
        notes: 'this_is_not_an_array_which_causes_crash'
      });
      setupFileReaderMock(badProjectJson);

      // Render the full App to test if it crashes the main thread
      render(<App />);

      // Open the drawer
      fireEvent.click(screen.getByTestId('drawer-toggle-btn'));
      expect(screen.getByTestId('drawer-overlay')).toBeInTheDocument();

      // Open NewProjectModal
      fireEvent.click(screen.getByTestId('drawer-new-project-btn'));

      const fileInput = screen.getByTestId('notes-file-input');
      const file = new File([], 'bad_project.json', {
        type: 'application/json'
      });

      // Trigger import and let it run
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
        vi.advanceTimersByTime(50);
      });

      // Trigger play to execute the playback loop which queries the notes array
      const playBtn = screen.getByTestId('play-toggle-btn');

      let threwError = false;
      const errorHandler = (e) => {
        e.preventDefault();
        threwError = true;
      };
      window.addEventListener('error', errorHandler);

      try {
        await act(async () => {
          fireEvent.click(playBtn);
          vi.advanceTimersByTime(500);
        });
      } catch {
        threwError = true;
      } finally {
        window.removeEventListener('error', errorHandler);
      }

      // Assert that it did not throw an error (did not crash) because of the notes property validation.
      expect(threwError).toBe(false);

      // Stop playback to clean up timers
      await act(async () => {
        fireEvent.click(playBtn);
        vi.advanceTimersByTime(100);
      });

      vi.useRealTimers();
    });
  });

  describe('BPM Boundaries inside useAudio and settings', () => {
    it('sets default BPM if bpm is 0 (falsy evaluation)', () => {
      const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
      const timeSignature = { numerator: 4, denominator: 4 };

      const { result } = renderHook(() => useAudio([], 0, timeSignature, 8));

      act(() => {
        result.current.startPlayback();
      });

      // bpm || 100 fallback is triggered, using 100 BPM.
      // stepsPerBeat = 4. stepDuration = 60 / 100 / 4 * 1000 = 150ms.
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 150);
    });

    it('clamps stepDuration to 500ms (30 BPM) when BPM is negative', () => {
      const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
      const timeSignature = { numerator: 4, denominator: 4 };

      // Pass -60 BPM. Since -60 is below 30, it clamps to 30 BPM.
      const { result } = renderHook(() => useAudio([], -60, timeSignature, 8));

      act(() => {
        result.current.startPlayback();
      });

      // stepsPerBeat = 4. stepDuration = 60 / 30 / 4 * 1000 = 500ms.
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 500);
    });

    it('clamps stepDuration to 62.5ms (240 BPM) when BPM is huge (e.g. 100000)', () => {
      const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
      const timeSignature = { numerator: 4, denominator: 4 };

      // Pass 100000 BPM. Since it is above 240, it clamps to 240 BPM.
      const { result } = renderHook(() =>
        useAudio([], 100000, timeSignature, 8)
      );

      act(() => {
        result.current.startPlayback();
      });

      // stepsPerBeat = 4. stepDuration = 60 / 240 / 4 * 1000 = 62.5ms.
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 62.5);
    });
  });

  describe('PianoRoll Note Pitch Transpositions', () => {
    it('successfully triggers transpose callback on click', () => {
      const onTranspose = vi.fn();
      render(
        <PianoRoll
          notes={[]}
          onTranspose={onTranspose}
          timeSignature={{ numerator: 4, denominator: 4 }}
          measureCount={8}
        />
      );

      fireEvent.click(screen.getByTestId('transpose-up-btn'));
      expect(onTranspose).toHaveBeenCalledWith(1);

      fireEvent.click(screen.getByTestId('transpose-down-btn'));
      expect(onTranspose).toHaveBeenCalledWith(-1);
    });
  });

  describe('TabBar Accessibility', () => {
    it('applies correct role and aria-selected attributes for tabs in App', () => {
      render(<App />);
      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(2);

      // By default, piano roll is active
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');

      // Click the second tab (bunkafu)
      fireEvent.click(tabs[1]);
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Playback State Interceptors', () => {
    it('stops playback when switching projects, deleting projects, loading presets, or creating projects', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<App />);

      const playBtn = screen.getByTestId('play-toggle-btn');

      // Helper to assert playback state
      const assertPlaying = (playing) => {
        if (playing) {
          expect(playBtn).toHaveTextContent('停止');
        } else {
          expect(playBtn).toHaveTextContent('再生');
        }
      };

      // Helper to open drawer if it is closed
      const openDrawer = () => {
        const drawer = screen.queryByTestId('drawer-container');
        if (!drawer) {
          fireEvent.click(screen.getByTestId('drawer-toggle-btn'));
        }
      };

      // 1. Check stop on loading preset
      fireEvent.click(playBtn);
      assertPlaying(true);

      openDrawer();
      fireEvent.click(screen.getByTestId('drawer-new-project-btn'));
      // Switch tab and click preset item in NewProjectModal
      fireEvent.click(screen.getByTestId('new-project-tab-preset'));
      fireEvent.click(screen.getByTestId('preset-project-btn-sakura'));
      assertPlaying(false); // Should be stopped

      // 2. Check stop on creating new project
      fireEvent.click(playBtn);
      assertPlaying(true);

      openDrawer();
      fireEvent.click(screen.getByTestId('drawer-new-project-btn'));
      const submitBtn = screen.getByTestId('create-project-submit');
      fireEvent.click(submitBtn);
      assertPlaying(false); // Should be stopped

      // 3. Check stop on selecting project
      fireEvent.click(playBtn);
      assertPlaying(true);

      openDrawer();
      // Find another project in the list using querySelectorAll
      const projectItems = document.querySelectorAll(
        '[data-testid^="drawer-project-item-"]'
      );
      if (projectItems.length > 0) {
        fireEvent.click(projectItems[0]);
      }
      assertPlaying(false); // Should be stopped

      // 4. Check stop on deleting project
      fireEvent.click(playBtn);
      assertPlaying(true);

      openDrawer();
      // Find the delete button of some project in the list
      const deleteBtns = document.querySelectorAll(
        '[data-testid^="delete-project-btn-"]'
      );
      if (deleteBtns.length > 0) {
        fireEvent.click(deleteBtns[0]);
      }
      assertPlaying(false); // Should be stopped

      confirmSpy.mockRestore();
    });
  });
});
