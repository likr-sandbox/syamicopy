import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createAudioContext,
  playShamisenSound,
  startSustainedNote,
  stopSustainedNote
} from '../audio';

describe('audio synthesis helpers', () => {
  let mockOscillator;
  let mockGainNode;
  let mockAudioContext;

  beforeEach(() => {
    vi.restoreAllMocks();

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
      currentTime: 12.34,
      destination: {},
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGainNode)
    };

    mockOscillator.context = mockAudioContext;
  });

  describe('createAudioContext', () => {
    it('returns a new AudioContext if supported by the window object', () => {
      const originalAudioContext = window.AudioContext;
      window.AudioContext = vi.fn().mockImplementation(() => mockAudioContext);

      const ctx = createAudioContext();
      expect(ctx).toBe(mockAudioContext);
      expect(window.AudioContext).toHaveBeenCalled();

      window.AudioContext = originalAudioContext;
    });

    it('falls back to webkitAudioContext if AudioContext is not present', () => {
      const originalAudioContext = window.AudioContext;
      const originalWebkitAudioContext = window.webkitAudioContext;

      window.AudioContext = undefined;
      window.webkitAudioContext = vi
        .fn()
        .mockImplementation(() => mockAudioContext);

      const ctx = createAudioContext();
      expect(ctx).toBe(mockAudioContext);
      expect(window.webkitAudioContext).toHaveBeenCalled();

      window.AudioContext = originalAudioContext;
      window.webkitAudioContext = originalWebkitAudioContext;
    });

    it('returns null if neither is supported', () => {
      const originalAudioContext = window.AudioContext;
      const originalWebkitAudioContext = window.webkitAudioContext;

      window.AudioContext = undefined;
      window.webkitAudioContext = undefined;

      const ctx = createAudioContext();
      expect(ctx).toBeNull();

      window.AudioContext = originalAudioContext;
      window.webkitAudioContext = originalWebkitAudioContext;
    });
  });

  describe('playShamisenSound', () => {
    it('correctly creates nodes, connects them, and schedules play and stop times', () => {
      const result = playShamisenSound(mockAudioContext, 60, 1.5);

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();

      expect(mockOscillator.type).toBe('sawtooth');
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        expect.any(Number),
        mockAudioContext.currentTime
      );

      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(
        0,
        mockAudioContext.currentTime
      );
      // attack is Min(0.02, 1.5 * 0.2) = 0.02
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.8,
        mockAudioContext.currentTime + 0.02
      );
      expect(
        mockGainNode.gain.exponentialRampToValueAtTime
      ).toHaveBeenCalledWith(0.01, mockAudioContext.currentTime + 1.5);

      expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode);
      expect(mockGainNode.connect).toHaveBeenCalledWith(
        mockAudioContext.destination
      );

      expect(mockOscillator.start).toHaveBeenCalledWith(
        mockAudioContext.currentTime
      );
      expect(mockOscillator.stop).toHaveBeenCalledWith(
        mockAudioContext.currentTime + 1.5
      );

      expect(result).toEqual({
        oscillator: mockOscillator,
        gainNode: mockGainNode
      });
    });

    it('scales attack phase down when duration is very short', () => {
      playShamisenSound(mockAudioContext, 60, 0.04);
      // attack should be 0.04 * 0.2 = 0.008
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.8,
        mockAudioContext.currentTime + 0.008
      );
    });

    it('clamps duration to minimum positive value of 0.01', () => {
      playShamisenSound(mockAudioContext, 60, 0);
      expect(mockOscillator.stop).toHaveBeenCalledWith(
        mockAudioContext.currentTime + 0.01
      );

      playShamisenSound(mockAudioContext, 60, -1);
      expect(mockOscillator.stop).toHaveBeenCalledWith(
        mockAudioContext.currentTime + 0.01
      );
    });

    it('returns null if pitch is not a number', () => {
      expect(playShamisenSound(mockAudioContext, 'invalid-pitch')).toBeNull();
      expect(playShamisenSound(mockAudioContext, null)).toBeNull();
      expect(playShamisenSound(mockAudioContext, Number.NaN)).toBeNull();
    });

    it('handles closed/broken AudioContext node creation gracefully by returning null', () => {
      const closedContext = {
        ...mockAudioContext,
        createOscillator: () => {
          throw new Error('Context closed');
        }
      };
      expect(playShamisenSound(closedContext, 60, 1.0)).toBeNull();
    });
  });

  describe('startSustainedNote', () => {
    it('starts note and sets up gain envelope without scheduling stop', () => {
      const osc = startSustainedNote(mockAudioContext, 60);

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();

      expect(mockOscillator.type).toBe('sawtooth');
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        expect.any(Number),
        mockAudioContext.currentTime
      );

      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(
        0,
        mockAudioContext.currentTime
      );
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.8,
        mockAudioContext.currentTime + 0.02
      );

      expect(mockOscillator.start).toHaveBeenCalledWith(
        mockAudioContext.currentTime
      );
      expect(mockOscillator.stop).not.toHaveBeenCalled();

      expect(osc).toBe(mockOscillator);
      expect(osc.gainNode).toBe(mockGainNode);
    });
  });

  describe('stopSustainedNote', () => {
    it('ramps down gain node and schedules stop on direct oscillator param', () => {
      const osc = startSustainedNote(mockAudioContext, 60);
      stopSustainedNote(osc);

      expect(mockGainNode.gain.cancelScheduledValues).toHaveBeenCalledWith(
        mockAudioContext.currentTime
      );
      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(
        0.8,
        mockAudioContext.currentTime
      );
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0,
        mockAudioContext.currentTime + 0.05
      );
      expect(mockOscillator.stop).toHaveBeenCalledWith(
        mockAudioContext.currentTime + 0.05
      );
    });

    it('ramps down gain node and schedules stop on object param containing nodes', () => {
      const osc = mockOscillator;
      const paramObj = {
        oscillator: osc,
        gainNode: mockGainNode
      };

      stopSustainedNote(paramObj);

      expect(mockGainNode.gain.cancelScheduledValues).toHaveBeenCalledWith(
        mockAudioContext.currentTime
      );
      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(
        0.8,
        mockAudioContext.currentTime
      );
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0,
        mockAudioContext.currentTime + 0.05
      );
      expect(mockOscillator.stop).toHaveBeenCalledWith(
        mockAudioContext.currentTime + 0.05
      );
    });

    it('gracefully calls stop directly if context or gainNode is missing', () => {
      const bareOscillator = {
        stop: vi.fn()
      };
      stopSustainedNote(bareOscillator);
      expect(bareOscillator.stop).toHaveBeenCalled();
    });
  });
});
