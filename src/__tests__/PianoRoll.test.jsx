import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import PianoRoll from '../components/PianoRoll/PianoRoll';

describe('PianoRoll component', () => {
  const defaultProps = {
    notes: [],
    addNote: vi.fn(),
    deleteNote: vi.fn(),
    updateNote: vi.fn(),
    currentStep: -1,
    isPlaying: false,
    tuning: 'honchoshi',
    basePitch: 48,
    bpm: 120,
    measureCount: 8,
    timeSignature: { numerator: 4, denominator: 4 },
    playKeySound: vi.fn(),
    audioContext: {}
  };

  it('renders Keyboard and Grid components', () => {
    render(<PianoRoll {...defaultProps} />);
    expect(screen.getByTestId('keyboard')).toBeInTheDocument();
    expect(screen.getByTestId('grid')).toBeInTheDocument();
  });

  it('scrolls grid container to keep playhead in view when currentStep changes', () => {
    const { rerender } = render(
      <PianoRoll {...defaultProps} currentStep={0} isPlaying={true} />
    );
    const containerElement = screen.getByTestId('piano-roll');

    // Mock scrollTo
    containerElement.scrollTo = vi.fn();

    // Change currentStep and rerender
    rerender(<PianoRoll {...defaultProps} currentStep={8} isPlaying={true} />);

    // Since step 8 triggers scrollTo, it should have been called
    expect(containerElement.scrollTo).toHaveBeenCalled();
  });
});
