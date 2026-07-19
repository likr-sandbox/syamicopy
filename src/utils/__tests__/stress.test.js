import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createAudioContext,
  playShamisenSound,
  startSustainedNote,
  stopSustainedNote
} from '../audio';
import { getPitchLabel, isBlackKey, midiToFrequency } from '../music';
import { convertToShamisenNote, getStringOpenPitches } from '../shamisen';
import {
  exportAllData,
  exportProjectNotes,
  importAllData,
  importProjectNotes,
  loadCurrentProjectId,
  loadProjects,
  saveCurrentProjectId,
  saveProjects
} from '../storage';
import {
  getStepsPerBeat,
  getStepsPerMeasure,
  getTotalSteps
} from '../timeSignature';

describe('Adversarial Stress Testing — music.js', () => {
  describe('isBlackKey', () => {
    it('handles negative pitches correctly using positive modulo wrapper', () => {
      // A# (pitch -2) is index 10 % 12, which is black.
      expect(isBlackKey(-2)).toBe(true);
    });

    it('returns false for non-integer pitches without throwing', () => {
      expect(isBlackKey(45.5)).toBe(false);
    });

    it('returns false for invalid types (null, undefined, string, object) instead of throwing', () => {
      expect(isBlackKey(null)).toBe(false);
      expect(isBlackKey(undefined)).toBe(false);
      expect(isBlackKey('C#')).toBe(false);
      expect(isBlackKey({})).toBe(false);
    });
  });

  describe('getPitchLabel', () => {
    it('returns correct label format for negative pitches', () => {
      expect(getPitchLabel(-1)).toBe('B-2');
    });

    it('returns extremely high octaves for huge pitches', () => {
      expect(getPitchLabel(200)).toBe('G#15');
    });

    it('returns empty string for non-integers and invalid types without throwing', () => {
      expect(getPitchLabel(45.5)).toBe('');
      expect(getPitchLabel(null)).toBe('');
      expect(getPitchLabel(undefined)).toBe('');
      expect(getPitchLabel('C#')).toBe('');
    });
  });

  describe('midiToFrequency', () => {
    it('calculates frequency for negative or extremely high pitches without throwing', () => {
      expect(midiToFrequency(-100)).toBeCloseTo(0.025348, 6);
      expect(midiToFrequency(200)).toBeCloseTo(850544.0206, 4);
    });

    it('returns NaN for non-numeric types', () => {
      expect(midiToFrequency(undefined)).toBe(Number.NaN);
      expect(midiToFrequency('pitch')).toBe(Number.NaN);
      expect(midiToFrequency({})).toBe(Number.NaN);
    });
  });
});

describe('Adversarial Stress Testing — shamisen.js', () => {
  describe('convertToShamisenNote', () => {
    it('returns null for out-of-bounds pitches', () => {
      expect(convertToShamisenNote(-100, 'honchoshi', 48)).toBeNull();
      expect(convertToShamisenNote(1000, 'honchoshi', 48)).toBeNull();
      expect(convertToShamisenNote(Number.NaN, 'honchoshi', 48)).toBeNull();
    });

    it('falls back to honchoshi for invalid tuningKey', () => {
      expect(convertToShamisenNote(60, 'invalid_tuning', 48)).toEqual({
        stringIndex: 2,
        tsubo: '0'
      });
    });

    it('handles basePitch passed as a string correctly', () => {
      expect(convertToShamisenNote(60, 'honchoshi', '48')).toEqual({
        stringIndex: 2,
        tsubo: '0'
      });
    });

    it('returns null when basePitch is non-numeric or object', () => {
      expect(convertToShamisenNote(60, 'honchoshi', null)).toBeNull();
      expect(convertToShamisenNote(60, 'honchoshi', undefined)).toBeNull();
      expect(convertToShamisenNote(60, 'honchoshi', {})).toBeNull();
    });
  });
});

describe('Adversarial Stress Testing — storage.js', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadProjects malformed JSON content behavior', () => {
    it('returns empty array if they are valid JSON types but not arrays', () => {
      localStorage.setItem('syamicopy_projects', '123');
      expect(loadProjects()).toEqual([]);

      localStorage.setItem('syamicopy_projects', '"string"');
      expect(loadProjects()).toEqual([]);

      localStorage.setItem('syamicopy_projects', '{}');
      expect(loadProjects()).toEqual([]);
    });
  });

  describe('importAllData validation gaps', () => {
    it('imports malformed/empty objects in projects array without schema validation', () => {
      const payload = {
        projects: [{ malformedProject: true }, 123, null],
        currentProjectId: 'test-id'
      };
      const result = importAllData(JSON.stringify(payload));
      expect(result).toBe(true);
      expect(loadProjects()).toEqual([{ malformedProject: true }, 123, null]);
    });
  });

  describe('importProjectNotes validation gaps', () => {
    it('imports non-note structures if they are within an array', () => {
      const corruptedNotes = [
        { invalidNote: true },
        'string note',
        null,
        12345
      ];
      const result = importProjectNotes(JSON.stringify(corruptedNotes));
      expect(result).toEqual(corruptedNotes);
    });
  });
});

describe('Adversarial Stress Testing — timeSignature.js', () => {
  describe('getStepsPerBeat', () => {
    it('throws TypeError if timeSignature is null/undefined', () => {
      expect(() => getStepsPerBeat(null)).toThrow();
      expect(() => getStepsPerBeat(undefined)).toThrow();
    });

    it('throws error for boundary denominators', () => {
      expect(() => getStepsPerBeat({ denominator: 0 })).toThrow();
      expect(() => getStepsPerBeat({ denominator: -4 })).toThrow();
      expect(() => getStepsPerBeat({ denominator: undefined })).toThrow();
      expect(() => getStepsPerBeat({ denominator: 'invalid' })).toThrow();
      expect(() => getStepsPerBeat({ denominator: null })).toThrow();
    });
  });

  describe('getStepsPerMeasure', () => {
    it('throws error when steps per beat is Infinity or NaN', () => {
      expect(() =>
        getStepsPerMeasure({ numerator: 4, denominator: 0 })
      ).toThrow();
      expect(() =>
        getStepsPerMeasure({ numerator: 0, denominator: 0 })
      ).toThrow();
      expect(() =>
        getStepsPerMeasure({ numerator: -2, denominator: 4 })
      ).toThrow();
    });
  });

  describe('getTotalSteps', () => {
    it('throws error for negative measureCount', () => {
      expect(() =>
        getTotalSteps({ numerator: 4, denominator: 4 }, -5)
      ).toThrow();
      expect(getTotalSteps({ numerator: 4, denominator: 4 }, 0)).toBe(0);
    });
  });
});

describe('Adversarial Stress Testing — audio.js', () => {
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
      createGain: vi.fn(() => mockGainNode),
      state: 'running'
    };

    mockOscillator.context = mockAudioContext;
  });

  describe('Closed / Broken AudioContext', () => {
    it('returns null if context.createOscillator throws (e.g. context closed)', () => {
      const closedContext = {
        ...mockAudioContext,
        createOscillator: vi.fn(() => {
          throw new DOMException(
            'Cannot create oscillator when context is closed',
            'InvalidStateError'
          );
        })
      };

      expect(playShamisenSound(closedContext, 60, 1.0)).toBeNull();
      expect(startSustainedNote(closedContext, 60)).toBeNull();
    });
  });

  describe('Out-of-bounds duration triggers RangeError in AudioParam scheduling', () => {
    it('does not throw RangeError when playShamisenSound is called with negative duration due to clamping', () => {
      mockGainNode.gain.linearRampToValueAtTime.mockImplementation(
        (_val, time) => {
          if (time < mockAudioContext.currentTime) {
            throw new RangeError(
              'The target time must be greater than or equal to the current time'
            );
          }
        }
      );

      expect(() => playShamisenSound(mockAudioContext, 60, -1.0)).not.toThrow();
    });

    it('does not throw RangeError when playShamisenSound has 0 duration due to clamping', () => {
      mockGainNode.gain.exponentialRampToValueAtTime.mockImplementation(
        (_val, time) => {
          if (time <= mockAudioContext.currentTime) {
            throw new RangeError(
              'The target time must be strictly positive and greater than current time'
            );
          }
        }
      );

      expect(() => playShamisenSound(mockAudioContext, 60, 0)).not.toThrow();
    });
  });

  describe('Non-numeric pitch values in audio scheduling', () => {
    it('safeguards against invalid pitch values and returns null', () => {
      expect(playShamisenSound(mockAudioContext, 'invalid-pitch')).toBeNull();
      expect(mockOscillator.frequency.setValueAtTime).not.toHaveBeenCalled();
    });
  });
});
