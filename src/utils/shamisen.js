export const TSUBO_MAP = [
  '0',
  '1',
  '2',
  '3',
  '#',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'b',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19'
];

export const getStringOpenPitches = (tuningKey, basePitch) => {
  const base = Number(basePitch);
  if (Number.isNaN(base)) {
    return [Number.NaN, Number.NaN, Number.NaN];
  }
  switch (tuningKey) {
    case 'honchoshi':
      return [base, base + 5, base + 12];
    case 'niagari':
      return [base, base + 7, base + 12];
    case 'sansagari':
      return [base, base + 5, base + 10];
    default:
      return [base, base + 5, base + 12];
  }
};

export const convertToShamisenNote = (
  pitch,
  tuningKey,
  basePitch,
  preferredString
) => {
  const base = Number(basePitch);
  if (
    Number.isNaN(base) ||
    pitch === null ||
    pitch === undefined ||
    Number.isNaN(Number(pitch))
  ) {
    return null;
  }

  const strings = getStringOpenPitches(tuningKey, base);
  if (!strings || Number.isNaN(strings[0])) {
    return null;
  }

  if (preferredString !== undefined && preferredString !== null) {
    const pStr = Number(preferredString);
    if ([0, 1, 2].includes(pStr)) {
      const diff = Number(pitch) - strings[pStr];
      if (diff >= 0 && diff < TSUBO_MAP.length) {
        const tsubo = TSUBO_MAP[diff];
        if (tsubo !== undefined) {
          return { stringIndex: pStr, tsubo };
        }
      }
    }
  }

  for (let i = 2; i >= 0; i--) {
    const diff = Number(pitch) - strings[i];
    if (diff >= 0 && diff < TSUBO_MAP.length) {
      const tsubo = TSUBO_MAP[diff];
      if (tsubo !== undefined) {
        return { stringIndex: i, tsubo };
      }
    }
  }
  return null;
};
