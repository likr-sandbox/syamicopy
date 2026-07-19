import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Keyboard from '../components/PianoRoll/Keyboard';
import * as audioUtils from '../utils/audio';

if (typeof window !== 'undefined' && !window.PointerEvent) {
  class PointerEvent extends MouseEvent {
    constructor(type, params = {}) {
      super(type, params);
      this._clientX = params.clientX || 0;
      this._clientY = params.clientY || 0;
      this.pointerId = params.pointerId || 0;
      this.pointerType = params.pointerType || 'mouse';
    }
    get clientX() {
      return this._clientX;
    }
    get clientY() {
      return this._clientY;
    }
  }
  window.PointerEvent = PointerEvent;
}

// Mock audio utils
vi.mock('../utils/audio', () => ({
  createAudioContext: vi.fn(),
  playShamisenSound: vi.fn(),
  startSustainedNote: vi.fn(() => ({
    stop: vi.fn()
  })),
  stopSustainedNote: vi.fn()
}));

describe('Keyboard component', () => {
  const defaultProps = {
    tuning: 'honchoshi',
    basePitch: 60,
    playKeySound: vi.fn(),
    audioContext: {
      state: 'running',
      resume: vi.fn().mockResolvedValue(),
      currentTime: 0
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders exactly 37 keys', () => {
    render(<Keyboard {...defaultProps} />);
    const keys = screen.getAllByTestId(/^key-/);
    expect(keys).toHaveLength(37);
  });

  it('renders pitch 93 at the top and 57 at the bottom', () => {
    render(<Keyboard {...defaultProps} />);
    const keys = screen.getAllByTestId(/^key-/);
    expect(keys[0]).toHaveAttribute('data-testid', 'key-93');
    expect(keys[36]).toHaveAttribute('data-testid', 'key-57');
  });

  it('applies bg-nouaiBlue for black keys and bg-white for white keys', () => {
    render(<Keyboard {...defaultProps} />);
    // MIDI 93 is A6 (white key)
    const key93 = screen.getByTestId('key-93');
    expect(key93.className).toContain('bg-white');

    // MIDI 92 is G#6 (black key)
    const key92 = screen.getByTestId('key-92');
    expect(key92.className).toContain('bg-nouaiBlue');
  });

  it('highlights open strings correctly (honchoshi open: 60, 65, 72)', () => {
    render(<Keyboard {...defaultProps} />);
    const key60 = screen.getByTestId('key-60');
    const key65 = screen.getByTestId('key-65');
    const key72 = screen.getByTestId('key-72');

    expect(key60.className).toContain('border-l-shamiRed');
    expect(key60.className).toContain('bg-shamiRed/10');
    expect(screen.getByText('①')).toBeInTheDocument();

    expect(key65.className).toContain('border-l-shamiRed');
    expect(screen.getByText('②')).toBeInTheDocument();

    expect(key72.className).toContain('border-l-shamiRed');
    expect(screen.getByText('③')).toBeInTheDocument();
  });

  it('triggers sustained note play and stop on pointer actions', () => {
    render(<Keyboard {...defaultProps} />);
    const key60 = screen.getByTestId('key-60');

    // PointerDown triggers startSustainedNote
    fireEvent.pointerDown(key60);
    expect(audioUtils.startSustainedNote).toHaveBeenCalledWith(
      defaultProps.audioContext,
      60
    );

    // PointerUp triggers stopSustainedNote
    fireEvent.pointerUp(key60);
    expect(audioUtils.stopSustainedNote).toHaveBeenCalled();
  });

  it('triggers stop on PointerLeave', () => {
    render(<Keyboard {...defaultProps} />);
    const key60 = screen.getByTestId('key-60');

    fireEvent.pointerDown(key60);
    fireEvent.pointerLeave(key60);
    expect(audioUtils.stopSustainedNote).toHaveBeenCalled();
  });
});
