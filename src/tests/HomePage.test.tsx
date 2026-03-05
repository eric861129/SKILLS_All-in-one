/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomePage } from '../pages/HomePage';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// Mock the useLanguage hook
vi.mock('../hooks/useLanguage', () => ({
  useLanguage: () => ({
    language: 'zh',
    setLanguage: vi.fn(),
    t: (key: string) => key === 'subtitle' ? '高品質 AI Agent 技能展示與下載平台' : key
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock the useSkills hook
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

describe('HomePage Component', () => {
  it('should render without crashing', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    // Use zh as default language
    expect(screen.getByText(/AI 技能下載中心/i)).toBeDefined();
  });

  it('should not contain any illegal emojis in its main UI', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    const bodyText = document.body.textContent || '';
    const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(EMOJI_REGEX.test(bodyText)).toBe(false);
  });
});
