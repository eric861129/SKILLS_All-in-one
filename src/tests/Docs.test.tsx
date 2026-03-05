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

describe('Docs Page Layout', () => {
  it('should render a sidebar with navigation links', async () => {
    render(
      <MemoryRouter initialEntries={['/docs']}>
        <App />
      </MemoryRouter>
    );
    
    // Check if the sidebar exists (we expect it to have a specific role or class later, 
    // but for now we just look for nav links that SHOULD be there)
    // This will FAIL because we haven't added the sidebar yet.
    expect(screen.queryByRole('navigation')).not.toBeNull();
  });

  it('should render markdown content using a dedicated component', async () => {
    render(
      <MemoryRouter initialEntries={['/docs']}>
        <App />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome to Docs/i)).toBeDefined();
    });
  });
});
