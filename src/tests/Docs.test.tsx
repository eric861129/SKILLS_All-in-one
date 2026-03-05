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
    
    expect(screen.queryByRole('navigation')).not.toBeNull();
  });

  it('should render welcome content by default', async () => {
    render(
      <MemoryRouter initialEntries={['/docs']}>
        <App />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome to Docs/i)).toBeDefined();
    });
  });

  it('should render different content based on sub-route', async () => {
    render(
      <MemoryRouter initialEntries={['/docs/what-is-a-skill']}>
        <App />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      // Find the h1 specifically within the main content area
      const heading = screen.getAllByRole('heading', { level: 1 })
        .find(h => h.textContent === 'What is a Skill?');
      expect(heading).toBeDefined();
    });
  });
});
