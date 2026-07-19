export const getStepsPerBeat = (timeSignature) => {
  if (
    !timeSignature ||
    typeof timeSignature.denominator !== 'number' ||
    timeSignature.denominator <= 0 ||
    !Number.isFinite(timeSignature.denominator)
  ) {
    throw new Error('Denominator must be a positive finite number');
  }
  return 16 / timeSignature.denominator;
};

export const getStepsPerMeasure = (timeSignature) => {
  if (
    !timeSignature ||
    typeof timeSignature.numerator !== 'number' ||
    timeSignature.numerator <= 0 ||
    !Number.isFinite(timeSignature.numerator)
  ) {
    throw new Error('Numerator must be a positive finite number');
  }
  return timeSignature.numerator * getStepsPerBeat(timeSignature);
};

export const getTotalSteps = (timeSignature, measureCount) => {
  if (
    typeof measureCount !== 'number' ||
    measureCount < 0 ||
    !Number.isFinite(measureCount)
  ) {
    throw new Error('Measure count must be a non-negative finite number');
  }
  return getStepsPerMeasure(timeSignature) * measureCount;
};
