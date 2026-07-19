import { describe, expect, it } from 'vitest';
import {
  getStepsPerBeat,
  getStepsPerMeasure,
  getTotalSteps
} from '../timeSignature';

describe('timeSignature utility helpers', () => {
  describe('getStepsPerBeat', () => {
    it('calculates steps per beat correctly', () => {
      expect(getStepsPerBeat({ numerator: 4, denominator: 4 })).toBe(4);
      expect(getStepsPerBeat({ numerator: 3, denominator: 4 })).toBe(4);
      expect(getStepsPerBeat({ numerator: 6, denominator: 8 })).toBe(2);
      expect(getStepsPerBeat({ numerator: 2, denominator: 2 })).toBe(8);
    });

    it('throws error for invalid denominator', () => {
      expect(() => getStepsPerBeat({ denominator: 0 })).toThrow();
      expect(() => getStepsPerBeat({ denominator: -4 })).toThrow();
      expect(() => getStepsPerBeat({ denominator: Number.NaN })).toThrow();
      expect(() => getStepsPerBeat(null)).toThrow();
    });
  });

  describe('getStepsPerMeasure', () => {
    it('calculates steps per measure correctly', () => {
      expect(getStepsPerMeasure({ numerator: 4, denominator: 4 })).toBe(16);
      expect(getStepsPerMeasure({ numerator: 2, denominator: 4 })).toBe(8);
      expect(getStepsPerMeasure({ numerator: 3, denominator: 4 })).toBe(12);
      expect(getStepsPerMeasure({ numerator: 6, denominator: 8 })).toBe(12);
    });

    it('throws error for invalid numerator', () => {
      expect(() =>
        getStepsPerMeasure({ numerator: 0, denominator: 4 })
      ).toThrow();
      expect(() =>
        getStepsPerMeasure({ numerator: -4, denominator: 4 })
      ).toThrow();
      expect(() =>
        getStepsPerMeasure({ numerator: Number.NaN, denominator: 4 })
      ).toThrow();
    });
  });

  describe('getTotalSteps', () => {
    it('calculates total steps correctly based on measures', () => {
      expect(getTotalSteps({ numerator: 4, denominator: 4 }, 8)).toBe(128);
      expect(getTotalSteps({ numerator: 3, denominator: 4 }, 8)).toBe(96);
      expect(getTotalSteps({ numerator: 6, denominator: 8 }, 4)).toBe(48);
    });

    it('throws error for invalid measureCount', () => {
      expect(() =>
        getTotalSteps({ numerator: 4, denominator: 4 }, -1)
      ).toThrow();
      expect(() =>
        getTotalSteps({ numerator: 4, denominator: 4 }, Number.NaN)
      ).toThrow();
    });
  });
});
