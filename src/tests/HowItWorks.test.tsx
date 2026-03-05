/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HowItWorks } from '../components/HowItWorks';

vi.mock('../hooks/useLanguage', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    t: (key: string) => (key === 'whatIsSkill' ? 'What is AI Agent Skill?' : key),
  }),
}));

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
  it('should render when open', () => {
    render(
      <HowItWorks isOpen={true} onClose={vi.fn()} />
    );
    
    // Check for new header text (partial match for flexibility)
    expect(screen.getByText(/AI Agent/i)).toBeDefined();
  });
});
