import React from 'react';
import { JA } from '../i18n/ja';
import { getStepsPerMeasure } from '../utils/timeSignature';

export function Footer({
  isPlaying,
  currentStep,
  bpm,
  timeSignature,
  onPlayToggle
}) {
  let measure = 1;
  try {
    const stepsPerMeasure = getStepsPerMeasure(timeSignature);
    measure =
      currentStep >= 0 ? Math.floor(currentStep / stepsPerMeasure) + 1 : 1;
  } catch {
    measure = 1;
  }

  return (
    <footer
      data-testid="footer-container"
      className="px-4 py-3 bg-washiWhite border-t border-nouaiBlue/20 flex justify-between items-center z-10 shadow-md"
    >
      <button
        type="button"
        data-testid="play-toggle-btn"
        onClick={onPlayToggle}
        className="px-5 py-2 rounded bg-shamiRed text-washiWhite font-bold hover:bg-shamiRed/95 active:scale-95 transition-all flex items-center gap-2 text-sm"
      >
        {isPlaying ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 fill-current"
              viewBox="0 0 20 20"
            >
              <title>停止</title>
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {JA.footer.stop}
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 fill-current"
              viewBox="0 0 20 20"
            >
              <title>再生</title>
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            {JA.footer.play}
          </>
        )}
      </button>

      <div className="flex gap-4 text-xs font-mono text-nouaiBlue/75">
        <div data-testid="current-measure-display">
          {JA.footer.currentMeasure.replace('{measure}', String(measure))}
        </div>
        <div data-testid="current-step-display">
          {currentStep === -1
            ? '-1'
            : JA.footer.currentStep.replace('{step}', String(currentStep))}
        </div>
        <div data-testid="current-tempo-display" className="hidden sm:block">
          {JA.footer.tempo.replace('{bpm}', String(bpm || 100))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
