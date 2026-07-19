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

describe('Adversarial and Correctness Stress Tests', () => {
  describe('music.js adversarial inputs', () => {
    describe('isBlackKey', () => {
      it('handles negative pitches correctly', () => {
        // Pitch -2 (A#-1, midi pitch 10) is a black key.
        expect(isBlackKey(-2)).toBe(true);
      });

      it('handles non-integer / float pitches', () => {
        expect(isBlackKey(60.5)).toBe(false);
        expect(isBlackKey(61.2)).toBe(false);
      });

      it('handles extreme values, NaN, and Infinity', () => {
        expect(isBlackKey(Number.MAX_SAFE_INTEGER)).toBe(false);
        expect(isBlackKey(Number.NaN)).toBe(false);
        expect(isBlackKey(Number.POSITIVE_INFINITY)).toBe(false);
        expect(isBlackKey(Number.NEGATIVE_INFINITY)).toBe(false);
      });

      it('handles null and undefined safely', () => {
        expect(isBlackKey(null)).toBe(false);
        expect(isBlackKey(undefined)).toBe(false);
      });
    });

    describe('getPitchLabel', () => {
      it('handles negative pitches correctly', () => {
        expect(getPitchLabel(-1)).toBe('B-2');
      });

      it('handles extreme values and NaN/Infinity', () => {
        expect(getPitchLabel(10000)).toBe('E832');
        expect(getPitchLabel(Number.NaN)).toBe('');
        expect(getPitchLabel(Number.POSITIVE_INFINITY)).toBe('');
      });
    });

    describe('midiToFrequency', () => {
      it('handles extreme values', () => {
        expect(midiToFrequency(13000)).toBe(Number.POSITIVE_INFINITY);
        expect(midiToFrequency(-13000)).toBe(0);
        expect(midiToFrequency(Number.NaN)).toBeNaN();
        expect(midiToFrequency(Number.POSITIVE_INFINITY)).toBe(
          Number.POSITIVE_INFINITY
        );
        expect(midiToFrequency(Number.NEGATIVE_INFINITY)).toBe(0);
      });
    });
  });

  describe('shamisen.js adversarial inputs', () => {
    describe('getStringOpenPitches', () => {
      it('handles unusual tuning keys and base pitches', () => {
        // Unexpected tuning name -> fallback to honchoshi
        expect(getStringOpenPitches('random-tuning', 48)).toEqual([48, 53, 60]);
        // Negative basePitch
        expect(getStringOpenPitches('honchoshi', -10)).toEqual([-10, -5, 2]);
        // Floating point basePitch
        expect(getStringOpenPitches('honchoshi', 48.5)).toEqual([
          48.5, 53.5, 60.5
        ]);
        // NaN basePitch
        expect(getStringOpenPitches('honchoshi', Number.NaN)).toEqual([
          Number.NaN,
          Number.NaN,
          Number.NaN
        ]);
      });
    });

    describe('convertToShamisenNote', () => {
      it('verifies boundary conditions at limits', () => {
        // Base pitch 48. Open pitches are [48, 53, 60] (honchoshi)
        // Max pitch offset on string 2 is 60 + 15 = 75. TSUBO_MAP[15] is '13'
        expect(convertToShamisenNote(75, 'honchoshi', 48)).toEqual({
          stringIndex: 2,
          tsubo: '13'
        });

        // Pitch 76 is out of range (> 15 diff)
        expect(convertToShamisenNote(76, 'honchoshi', 48)).toBeNull();
      });

      it('handles negative or invalid inputs', () => {
        // For pitch -5 and base pitch -10 under honchoshi:
        // open strings are [-10, -5, 2].
        // String 1 open pitch is -5. diff = -5 - (-5) = 0.
        // Returns stringIndex: 1, tsubo: '0'.
        expect(convertToShamisenNote(-5, 'honchoshi', -10)).toEqual({
          stringIndex: 1,
          tsubo: '0'
        });
        expect(convertToShamisenNote(Number.NaN, 'honchoshi', 48)).toBeNull();
      });
    });
  });

  describe('storage.js robustness against corrupted JSON/localStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('handles non-array valid JSON in loadProjects (bug: returns object directly)', () => {
      // If localStorage holds valid JSON but not an array (e.g. object, number, string, boolean)
      localStorage.setItem(
        'syamicopy_projects',
        JSON.stringify({ name: 'Not an array' })
      );
      const loaded = loadProjects();
      expect(loaded).toEqual([]);
    });

    it('handles null representation in localStorage (returns empty array)', () => {
      localStorage.setItem('syamicopy_projects', 'null');
      expect(loadProjects()).toEqual([]);
    });

    it('handles saving falsy values in saveCurrentProjectId correctly', () => {
      saveCurrentProjectId(0);
      expect(loadCurrentProjectId()).toBe('0');

      saveCurrentProjectId('');
      expect(loadCurrentProjectId()).toBe('');
    });

    it('importAllData checks types', () => {
      // Import invalid projects structures
      const invalidData1 = { projects: 'not-an-array' };
      expect(importAllData(JSON.stringify(invalidData1))).toBe(false);

      const invalidData2 = { projects: null };
      expect(importAllData(JSON.stringify(invalidData2))).toBe(false);
    });

    it('importProjectNotes checks types', () => {
      // What if json is valid array but containing numbers or garbage?
      const garbageArray = importProjectNotes(JSON.stringify([1, 2, 3]));
      expect(garbageArray).toEqual([1, 2, 3]); // Returns array as is, caller has to validate elements.
    });
  });

  describe('timeSignature.js out-of-bounds/invalid inputs', () => {
    it('handles division by zero and negative values with throws', () => {
      const zeroDenominator = { numerator: 4, denominator: 0 };
      expect(() => getStepsPerBeat(zeroDenominator)).toThrow();
      expect(() => getStepsPerMeasure(zeroDenominator)).toThrow();
      expect(() => getTotalSteps(zeroDenominator, 8)).toThrow();

      const negativeDenominator = { numerator: 4, denominator: -4 };
      expect(() => getStepsPerBeat(negativeDenominator)).toThrow();
      expect(() => getStepsPerMeasure(negativeDenominator)).toThrow();
      expect(() => getTotalSteps(negativeDenominator, 8)).toThrow();

      const negativeNumerator = { numerator: -4, denominator: 4 };
      expect(() => getStepsPerMeasure(negativeNumerator)).toThrow();
      expect(() => getTotalSteps(negativeNumerator, 8)).toThrow();

      const negativeMeasures = { numerator: 4, denominator: 4 };
      expect(() => getTotalSteps(negativeMeasures, -8)).toThrow();
    });

    it('handles float values and NaN', () => {
      const floatDenominator = { numerator: 4, denominator: 3 };
      expect(getStepsPerBeat(floatDenominator)).toBeCloseTo(5.33, 2);

      const nanDenominator = { numerator: 4, denominator: Number.NaN };
      expect(() => getStepsPerBeat(nanDenominator)).toThrow();
    });
  });

  describe('audio.js audio context anomalies', () => {
    let mockOscillator;
    let mockGainNode;
    let mockAudioContext;

    beforeEach(() => {
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
        currentTime: 10.0,
        destination: {},
        createOscillator: vi.fn(() => mockOscillator),
        createGain: vi.fn(() => mockGainNode)
      };

      mockOscillator.context = mockAudioContext;
    });

    it('handles playShamisenSound with duration = 0 by clamping to 0.01', () => {
      const result = playShamisenSound(mockAudioContext, 60, 0);
      expect(result).toBeDefined();
      expect(mockOscillator.stop).toHaveBeenCalledWith(10.01);
    });

    it('handles playShamisenSound with negative duration by clamping to 0.01', () => {
      const result = playShamisenSound(mockAudioContext, 60, -1);
      expect(result).toBeDefined();
      expect(mockOscillator.stop).toHaveBeenCalledWith(10.01);
    });

    it('handles stopSustainedNote with various parameter types', () => {
      // Param is null
      expect(() => stopSustainedNote(null)).not.toThrow();

      // Param is string
      expect(() => stopSustainedNote('garbage')).not.toThrow();

      // Param is number
      expect(() => stopSustainedNote(123)).not.toThrow();

      // Param is empty object
      expect(() => stopSustainedNote({})).not.toThrow();
    });

    it('handles stopSustainedNote when Web Audio throws errors', () => {
      // Make cancelScheduledValues throw an error
      mockGainNode.gain.cancelScheduledValues.mockImplementation(() => {
        throw new Error('Web Audio Error');
      });

      const osc = startSustainedNote(mockAudioContext, 60);
      expect(() => stopSustainedNote(osc)).not.toThrow();
      expect(mockOscillator.stop).toHaveBeenCalled(); // Should fallback to calling stop()
    });

    it('handles createAudioContext in environment without window safely by returning null', () => {
      // Temporarily delete window
      const originalWindow = globalThis.window;
      // In Node.js / JSDOM, window is in globalThis
      globalThis.window = undefined;

      expect(createAudioContext()).toBeNull();

      // Restore window
      globalThis.window = originalWindow;
    });
  });
});
