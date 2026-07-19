import { describe, expect, it } from 'vitest';
import { getPitchLabel, isBlackKey, midiToFrequency } from '../music';

describe('music utility helpers', () => {
  describe('isBlackKey', () => {
    it('returns true for black keys and false for white keys', () => {
      // Black keys: C# (1), D# (3), F# (6), G# (8), A# (10)
      expect(isBlackKey(1)).toBe(true);
      expect(isBlackKey(3)).toBe(true);
      expect(isBlackKey(6)).toBe(true);
      expect(isBlackKey(8)).toBe(true);
      expect(isBlackKey(10)).toBe(true);

      // White keys: C (0), D (2), E (4), F (5), G (7), A (9), B (11)
      expect(isBlackKey(0)).toBe(false);
      expect(isBlackKey(2)).toBe(false);
      expect(isBlackKey(4)).toBe(false);
      expect(isBlackKey(5)).toBe(false);
      expect(isBlackKey(7)).toBe(false);
      expect(isBlackKey(9)).toBe(false);
      expect(isBlackKey(11)).toBe(false);
    });

    it('handles octave invariance', () => {
      expect(isBlackKey(49)).toBe(true); // C#3 (49 % 12 = 1)
      expect(isBlackKey(61)).toBe(true); // C#4 (61 % 12 = 1)
      expect(isBlackKey(48)).toBe(false); // C3 (48 % 12 = 0)
      expect(isBlackKey(60)).toBe(false); // C4 (60 % 12 = 0)
    });

    it('handles negative pitches correctly', () => {
      expect(isBlackKey(-2)).toBe(true); // A#-1
      expect(isBlackKey(-12)).toBe(false); // C-2
    });

    it('returns false for invalid inputs', () => {
      expect(isBlackKey(null)).toBe(false);
      expect(isBlackKey(undefined)).toBe(false);
      expect(isBlackKey('C#')).toBe(false);
    });
  });

  describe('getPitchLabel', () => {
    it('returns correct label with octave', () => {
      expect(getPitchLabel(48)).toBe('C3');
      expect(getPitchLabel(60)).toBe('C4');
      expect(getPitchLabel(63)).toBe('D#4');
      expect(getPitchLabel(42)).toBe('G♭2');
    });

    it('handles boundaries', () => {
      expect(getPitchLabel(0)).toBe('C-1');
      expect(getPitchLabel(127)).toBe('G9');
    });

    it('handles negative pitches', () => {
      expect(getPitchLabel(-1)).toBe('B-2');
      expect(getPitchLabel(-12)).toBe('C-2');
    });

    it('safeguards against invalid types and NaN/Infinity', () => {
      expect(getPitchLabel(null)).toBe('');
      expect(getPitchLabel(undefined)).toBe('');
      expect(getPitchLabel(Number.NaN)).toBe('');
      expect(getPitchLabel(Number.POSITIVE_INFINITY)).toBe('');
    });
  });

  describe('midiToFrequency', () => {
    it('converts MIDI pitch to frequency in Hz', () => {
      expect(midiToFrequency(69)).toBeCloseTo(440, 2);
      expect(midiToFrequency(57)).toBeCloseTo(220, 2);
      expect(midiToFrequency(81)).toBeCloseTo(880, 2);
      expect(midiToFrequency(60)).toBeCloseTo(261.63, 2);
    });

    it('returns NaN for invalid inputs', () => {
      expect(midiToFrequency(null)).toBeNaN();
      expect(midiToFrequency(undefined)).toBeNaN();
    });
  });
});
