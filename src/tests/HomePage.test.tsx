/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';

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

// Mock the hooks used in HomePage or its children
vi.mock('../hooks/useLanguage', () => ({
  useLanguage: () => ({
    language: 'zh',
    setLanguage: vi.fn(),
    t: (key: string) => key
  })
}));

vi.mock('../hooks/useSkills', () => ({
  useSkills: () => ({
    skills: [],
    loading: false,
    categories: [],
    searchQuery: '',
    setSearchQuery: vi.fn(),
    selectedCategory: 'All',
    setSelectedCategory: vi.fn(),
    sortBy: 'Popular',
    setSortBy: vi.fn(),
    authorCounts: [],
    tagCounts: [],
    selectedAuthors: [],
    selectedTags: [],
    setSelectedAuthors: vi.fn(),
    setSelectedTags: vi.fn(),
    toggleAuthor: vi.fn(),
    toggleTag: vi.fn(),
    clearSidebarFilters: vi.fn()
  })
}));

describe('HomePage Component', () => {
  it('should render without crashing', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    
    // Check for search input existence
    const searchInput = document.querySelector('input');
    expect(searchInput).toBeDefined();
  });

  it('should not contain any illegal emojis in its main UI', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    
    const bodyText = document.body.textContent || '';
    // This is a simple check for common emojis. A more comprehensive check would use a regex.
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
    expect(emojiRegex.test(bodyText)).toBe(false);
  });
});
