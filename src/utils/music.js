export const isBlackKey = (pitch) => {
  if (
    pitch === null ||
    pitch === undefined ||
    typeof pitch !== 'number' ||
    !Number.isFinite(pitch)
  ) {
    return false;
  }
  const note = ((pitch % 12) + 12) % 12;
  return [1, 3, 6, 8, 10].includes(note);
};

export const getPitchLabel = (pitch) => {
  if (
    pitch === null ||
    pitch === undefined ||
    typeof pitch !== 'number' ||
    !Number.isFinite(pitch) ||
    !Number.isInteger(pitch)
  ) {
    return '';
  }
  const noteNames = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'G♭',
    'G',
    'G#',
    'A',
    'B♭',
    'B'
  ];
  const note = ((pitch % 12) + 12) % 12;
  const name = noteNames[note];
  const octave = Math.floor(pitch / 12) - 1;
  return `${name}${octave}`;
};

export const midiToFrequency = (pitch) => {
  if (
    pitch === null ||
    pitch === undefined ||
    typeof pitch !== 'number' ||
    Number.isNaN(pitch)
  ) {
    return Number.NaN;
  }
  return 440 * 2 ** ((pitch - 69) / 12);
};
