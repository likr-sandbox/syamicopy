import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import App from '../App';

describe('App Component', () => {
  it('renders the main app heading', () => {
    render(<App />);
    const headingElement = screen.getByRole('heading', {
      name: /シャミコピー/i
    });
    expect(headingElement).toBeInTheDocument();
  });
});
