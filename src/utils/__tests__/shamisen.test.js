import { describe, expect, it } from 'vitest';
import { convertToShamisenNote, getStringOpenPitches } from '../shamisen';

describe('shamisen utility helpers', () => {
  describe('getStringOpenPitches', () => {
    it('returns correct open pitches for honchoshi tuning', () => {
      expect(getStringOpenPitches('honchoshi', 48)).toEqual([48, 53, 60]);
      expect(getStringOpenPitches('honchoshi', 50)).toEqual([50, 55, 62]);
    });

    it('returns correct open pitches for niagari tuning', () => {
      expect(getStringOpenPitches('niagari', 48)).toEqual([48, 55, 60]);
      expect(getStringOpenPitches('niagari', 50)).toEqual([50, 57, 62]);
    });

    it('returns correct open pitches for sansagari tuning', () => {
      expect(getStringOpenPitches('sansagari', 48)).toEqual([48, 53, 58]);
      expect(getStringOpenPitches('sansagari', 50)).toEqual([50, 55, 60]);
    });

    it('falls back to honchoshi for unknown tuning', () => {
      expect(getStringOpenPitches('unknown', 48)).toEqual([48, 53, 60]);
    });
  });

  describe('convertToShamisenNote', () => {
    it('returns correct string index and tsubo position', () => {
      // open: [48, 53, 60]
      // Pitch 48 (C3): string 0, tsubo '0' (48 - 48 = 0)
      expect(convertToShamisenNote(48, 'honchoshi', 48)).toEqual({
        stringIndex: 0,
        tsubo: '0'
      });

      // Pitch 53 (F3): string 1, tsubo '0' (53 - 53 = 0). Even though string 0 has 53 - 48 = 5 (tsubo '4'), string 1 is preferred because we search 2 -> 1 -> 0
      expect(convertToShamisenNote(53, 'honchoshi', 48)).toEqual({
        stringIndex: 1,
        tsubo: '0'
      });
    });

    it('handles special tsubo characters like hash (#) and flat (b)', () => {
      // open: [48, 53, 60]
      // Pitch 52 (E3): 52 - 48 = 4 on string 0 -> '#'
      expect(convertToShamisenNote(52, 'honchoshi', 48)).toEqual({
        stringIndex: 0,
        tsubo: '#'
      });

      // Pitch 59 (B3) under sansagari tuning (open: [48, 53, 58])
      // 59 - 58 = 1 on string 2 -> '1'
      expect(convertToShamisenNote(59, 'sansagari', 48)).toEqual({
        stringIndex: 2,
        tsubo: '1'
      });

      // Pitch 71 (B4) on honchoshi (open: [48, 53, 60])
      // 71 - 60 = 11 on string 2 -> 'b'
      expect(convertToShamisenNote(71, 'honchoshi', 48)).toEqual({
        stringIndex: 2,
        tsubo: 'b'
      });
    });

    it('prefers the highest string index (thinnest string) when multiple options exist', () => {
      // Target pitch 60 (C4). honchoshi (open: [48, 53, 60])
      // String 2 (open 60): 60 - 60 = 0 (tsubo '0')
      // String 1 (open 53): 60 - 53 = 7 (tsubo '6')
      // String 0 (open 48): 60 - 48 = 12 (tsubo '10')
      // Should prefer String 2 (highest index)
      expect(convertToShamisenNote(60, 'honchoshi', 48)).toEqual({
        stringIndex: 2,
        tsubo: '0'
      });
    });

    it('returns null for out-of-range pitches', () => {
      // Pitch below lowest string open pitch (48)
      expect(convertToShamisenNote(40, 'honchoshi', 48)).toBeNull();

      // Pitch above maximum offset from highest string (60 + 15 = 75)
      expect(convertToShamisenNote(76, 'honchoshi', 48)).toBeNull();
    });

    it('forces basePitch to be a number and avoids string coercion bugs', () => {
      // With basePitch = '48', it should be parsed to 48 and convert pitch 60 to stringIndex 2, tsubo '0'
      // instead of stringIndex 0 tsubo '10' (due to '48' + 5 = '485' string concat)
      expect(convertToShamisenNote(60, 'honchoshi', '48')).toEqual({
        stringIndex: 2,
        tsubo: '0'
      });
    });

    it('handles NaN, null, and undefined basePitch safely', () => {
      expect(convertToShamisenNote(60, 'honchoshi', Number.NaN)).toBeNull();
      expect(convertToShamisenNote(60, 'honchoshi', null)).toBeNull();
      expect(convertToShamisenNote(60, 'honchoshi', undefined)).toBeNull();
    });
  });
});
