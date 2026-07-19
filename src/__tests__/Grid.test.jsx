import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Grid from '../components/PianoRoll/Grid';

describe('Grid component', () => {
  const defaultProps = {
    notes: [],
    addNote: vi.fn(),
    deleteNote: vi.fn(),
    updateNote: vi.fn(),
    timeSignature: { numerator: 4, denominator: 4 },
    measureCount: 8,
    tuning: 'honchoshi',
    basePitch: 60,
    playKeySound: vi.fn(),
    currentStep: -1
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with correct height, width, and number of rows', () => {
    render(<Grid {...defaultProps} />);
    const grid = screen.getByTestId('grid');
    expect(grid).toBeInTheDocument();

    // 8 measures * 16 steps/measure = 128 steps. Width = 128 * 24 = 3072px.
    expect(grid.style.width).toBe('3072px');

    // 37 rows correspond to pitches 93 down to 57
    const rows = grid.querySelectorAll('.border-b');
    // Note: includes the header bar border if styled with border-b, plus 37 rows
    expect(rows.length).toBeGreaterThanOrEqual(37);
  });

  it('draws vertical grid lines at correct coordinates', () => {
    const { container } = render(<Grid {...defaultProps} />);
    const lines = container.querySelectorAll('line');
    // Should have 127 vertical lines for 128 steps
    expect(lines.length).toBe(127);
  });

  it('triggers addNote and playKeySound when clicked on the grid background', () => {
    render(<Grid {...defaultProps} />);
    const grid = screen.getByTestId('grid');
    // Content area is the relative div with cursor-crosshair
    const content = grid.querySelector('.cursor-crosshair');

    content.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 3072,
      height: 740,
      right: 3072,
      bottom: 740,
      x: 0,
      y: 0,
      toJSON: () => {}
    }));

    // Click at step 4 (4 * 24 = 96px), row 33 (33 * 20 = 660px, corresponding to pitch 93 - 33 = 60)
    fireEvent.click(content, { clientX: 96, clientY: 660 });

    expect(defaultProps.addNote).toHaveBeenCalledWith({
      pitch: 60,
      step: 4,
      length: 4
    });
    expect(defaultProps.playKeySound).toHaveBeenCalledWith(60);
  });

  it('renders playback head at the correct horizontal position when currentStep is active', () => {
    render(<Grid {...defaultProps} currentStep={5} />);
    const head = screen.getByTestId('playback-head');
    expect(head).toBeInTheDocument();
    // 5 * 24 = 120px
    expect(head.style.left).toBe('120px');
  });
});
