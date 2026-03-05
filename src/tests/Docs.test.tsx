/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import App from '../App';

// Mock the hooks used in App or its children
vi.mock('../hooks/useLanguage', () => ({
  useLanguage: () => ({
    language: 'zh',
    setLanguage: vi.fn(),
    t: (key: string) => key
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
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
    toggleAuthor: vi.fn(),
    toggleTag: vi.fn(),
    clearSidebarFilters: vi.fn()
  })
}));

describe('App Routing', () => {
  it('should render Docs page when navigating to /docs and load markdown', async () => {
    render(
      <MemoryRouter initialEntries={['/docs']}>
        <App />
      </MemoryRouter>
    );
    
    // Check if the page title exists
    expect(screen.getByText(/docsTitle/i)).toBeDefined();
    
    // Check if markdown content is loaded (async)
    await waitFor(() => {
      expect(screen.getByText(/Welcome to Docs/i)).toBeDefined();
    }, { timeout: 2000 });
  });
});
