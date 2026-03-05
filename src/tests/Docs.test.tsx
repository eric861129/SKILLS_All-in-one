/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
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

afterEach(() => {
  cleanup();
});

describe('Docs Page Layout', () => {
  it('should render a sidebar with navigation links', async () => {
    render(
      <MemoryRouter initialEntries={['/docs']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.queryByTestId('docs-nav')).not.toBeNull();
  });

  it('should render welcome content by default', async () => {
    render(
      <MemoryRouter initialEntries={['/docs']}>
        <App />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      // Find the h1 specifically
      const heading = screen.getAllByRole('heading', { level: 1 })
        .find(h => h.textContent === 'Welcome to Docs');
      expect(heading).toBeDefined();
    });
  });

  it('should render different content based on sub-route', async () => {
    render(
      <MemoryRouter initialEntries={['/docs/what-is-a-skill']}>
        <App />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      // Find the h1 specifically
      const heading = screen.getAllByRole('heading', { level: 1 })
        .find(h => h.textContent === 'What is a Skill?');
      expect(heading).toBeDefined();
    });
  });

  it('should generate a Table of Contents based on headings', async () => {
    render(
      <MemoryRouter initialEntries={['/docs/what-is-a-skill']}>
        <App />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      // Look for the TOC specifically. It contains links.
      // We expect "Core Components" to be in the TOC.
      const tocLinks = screen.getAllByRole('link');
      const coreComponentsLink = tocLinks.find(link => link.textContent === 'Core Components');
      expect(coreComponentsLink).toBeDefined();
    });
  });

  it('should toggle mobile menu when button is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/docs']}>
        <App />
      </MemoryRouter>
    );
    
    // Get the menu button
    const menuButtons = screen.getAllByRole('button', { name: /Toggle Menu/i });
    const menuButton = menuButtons[0];
    
    // Initially, there should be one navigation sidebar
    expect(screen.getAllByTestId('docs-nav').length).toBe(1);
    
    // Click menu button
    fireEvent.click(menuButton);
    
    // Now there should be two navigation sidebars (desktop aside + mobile overlay)
    expect(screen.getAllByTestId('docs-nav').length).toBe(2);
  });
});
