/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { HowItWorks } from '../components/HowItWorks';

beforeAll(() => {
  class IntersectionObserverMock {
    constructor() {}
    disconnect() { return null; }
    observe() { return null; }
    takeRecords() { return []; }
    unobserve() { return null; }
  }

  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
});

describe('HowItWorks Component', () => {
  it('should render three steps', () => {
    render(<HowItWorks />);
    
    // Check for step labels or titles (we expect these based on the spec)
    // We use getAllByText because we have both desktop and mobile versions in the DOM
    expect(screen.getAllByText(/Connect/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Select/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Inject/i).length).toBeGreaterThanOrEqual(1);
  });
});
