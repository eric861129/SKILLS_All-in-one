/**
 * @vitest-environment jsdom
 */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { SkillPage } from '../pages/SkillPage';
import { DocsPage } from '../pages/DocsPage';
import { AuthorPage } from '../pages/AuthorPage';

const { mockSkills } = vi.hoisted(() => ({
  mockSkills: [
    {
      id: 1,
      name: 'react-expert',
      author: 'Jeffallan',
      description: 'Build modern React applications with reusable patterns, hooks, testing, and performance guidance.',
      source: 'react-expert',
      downloadCount: 42,
      createdAt: '2026-03-01',
      category: 'Development & Code Tools',
      tags: ['React', 'Hooks', 'TypeScript'],
    },
    {
      id: 2,
      name: 'security-reviewer',
      author: 'Anthropic',
      description: 'Review code, workflows, and application behavior for security issues and implementation risks.',
      source: 'security-reviewer',
      downloadCount: 21,
      createdAt: '2026-03-02',
      category: 'Security & Web Testing',
      tags: ['Security', 'Review'],
    },
  ],
}));

beforeAll(() => {
  class IntersectionObserverMock {
    disconnect() { return null; }
    observe() { return null; }
    takeRecords() { return []; }
    unobserve() { return null; }
  }

  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
  window.scrollTo = vi.fn();
});

vi.mock('../hooks/useLanguage', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    t: (key: string) => key,
  }),
}));

vi.mock('../hooks/useSkills', () => ({
  useSkills: () => ({
    skills: mockSkills,
    loading: false,
    categories: ['Development & Code Tools', 'Security & Web Testing'],
    searchQuery: '',
    setSearchQuery: vi.fn(),
    selectedCategory: 'All',
    setSelectedCategory: vi.fn(),
    sortBy: 'Popular',
    setSortBy: vi.fn(),
    authorCounts: [['Jeffallan', 1]],
    tagCounts: [['React', 1]],
    selectedAuthors: [],
    selectedTags: [],
    setSelectedAuthors: vi.fn(),
    setSelectedTags: vi.fn(),
    toggleAuthor: vi.fn(),
    toggleTag: vi.fn(),
    clearSidebarFilters: vi.fn(),
  }),
}));

vi.mock('../components/Toast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

vi.mock('../utils/downloadSkill', () => ({
  downloadAndZipSkill: vi.fn(),
}));

vi.mock('../components/GiscusComments', () => ({
  GiscusComments: () => <div data-testid="mock-giscus">comments</div>,
}));

vi.mock('../data/skills', () => ({
  MOCK_SKILLS: mockSkills,
}));

const getMetaContent = (selector: string) =>
  document.head.querySelector<HTMLMetaElement>(selector)?.getAttribute('content');

describe('SEO metadata', () => {
  beforeEach(() => {
    cleanup();
    document.head.querySelectorAll('meta, link[rel="canonical"], script[data-seo-jsonld="true"]').forEach((tag) => {
      if (tag.getAttribute('data-seo-managed') === 'true' || tag.getAttribute('data-seo-jsonld') === 'true') {
        tag.remove();
      }
    });
    document.title = '';
  });

  it('sets homepage title, description, and canonical', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(document.title).toContain('AI Agent Skills Library');
    expect(getMetaContent('meta[name="description"]')).toContain('Claude Code');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://huangchiyu.com/SKILLS_All-in-one'
    );
  });

  it('sets skill page title, description, og tags, and canonical', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('skills-manifest.json')) {
          return {
            ok: true,
            json: async () => ({
              'react-expert': {
                category: 'Development & Code Tools',
                files: ['SKILL.md'],
              },
            }),
          } as Response;
        }

        return {
          ok: true,
          text: async () => '# React Expert',
        } as Response;
      })
    );

    render(
      <MemoryRouter initialEntries={['/skill/1']}>
        <Routes>
          <Route path="/skill/:id" element={<SkillPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('skill-deep-preview')).toBeDefined();
    });

    expect(document.title).toContain('react-expert');
    expect(getMetaContent('meta[name="description"]')).toContain('Build modern React applications');
    expect(getMetaContent('meta[property="og:title"]')).toContain('react-expert');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://huangchiyu.com/SKILLS_All-in-one/skill/1'
    );
  });

  it('sets docs page metadata from the docs registry', async () => {
    render(
      <MemoryRouter initialEntries={['/docs/what-is-a-skill']}>
        <Routes>
          <Route path="/docs/:slug" element={<DocsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByRole('heading', { level: 1 }).length).toBeGreaterThan(0);
    });

    expect(document.title).toContain('What Is an AI Agent Skill?');
    expect(getMetaContent('meta[name="description"]')).toContain('modular instructions');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://huangchiyu.com/SKILLS_All-in-one/docs/what-is-a-skill'
    );
  });

  it('marks author pages as noindex', () => {
    render(
      <MemoryRouter initialEntries={['/author/Jeffallan']}>
        <Routes>
          <Route path="/author/:name" element={<AuthorPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(document.title).toContain('Jeffallan');
    expect(getMetaContent('meta[name="robots"]')).toBe('noindex,follow');
  });
});
