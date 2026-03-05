/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SkillPage } from '../pages/SkillPage';

const showToastMock = vi.fn();
const clipboardWriteMock = vi.fn();

vi.mock('../hooks/useLanguage', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    t: (key: string) => key,
  }),
}));

vi.mock('../components/Toast', () => ({
  useToast: () => ({
    showToast: showToastMock,
  }),
}));

vi.mock('../utils/downloadSkill', () => ({
  downloadAndZipSkill: vi.fn(),
}));

vi.mock('../components/GiscusComments', () => ({
  GiscusComments: () => <div data-testid="mock-giscus">comments</div>,
}));

vi.mock('../data/skills', () => ({
  MOCK_SKILLS: [
    {
      id: 1,
      name: 'demo-skill',
      author: 'tester',
      description: 'demo',
      source: 'demo-skill',
      downloadCount: 12,
      createdAt: '2026-03-01',
      category: 'Development & Code Tools',
      tags: ['demo'],
    },
  ],
}));

const renderSkillPage = () =>
  render(
    <MemoryRouter initialEntries={['/skill/1']}>
      <Routes>
        <Route path="/skill/:id" element={<SkillPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('SkillPage Deep Preview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: clipboardWriteMock.mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders deep preview with real folder tree, frontmatter block, copy and reader mode', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('skills-manifest.json')) {
        return {
          ok: true,
          json: async () => ({
            'demo-skill': {
              category: 'Development & Code Tools',
              files: ['SKILL.md', 'scripts/query.py', 'config/settings.json'],
              fileMeta: {
                'SKILL.md': { sizeBytes: 10, lineCount: 4, ext: 'md', tabKey: 'root' },
                'scripts/query.py': { sizeBytes: 20, lineCount: 3, ext: 'py', tabKey: 'scripts' },
                'config/settings.json': { sizeBytes: 18, lineCount: 2, ext: 'json', tabKey: 'config' },
              },
              tokenEstimate: { heuristic: 120, cl100k: 88 },
            },
          }),
        } as Response;
      }
      if (url.includes('scripts/query.py')) {
        return { ok: true, text: async () => 'print("hello")\nprint("world")' } as Response;
      }
      if (url.includes('config/settings.json')) {
        return { ok: true, text: async () => '{"debug": true}' } as Response;
      }
      return {
        ok: true,
        text: async () => '---\nname: Demo Skill\nversion: 1\n---\n\n# Demo Skill\n\nSome markdown.',
      } as Response;
    });
    vi.stubGlobal('fetch', fetchMock);

    renderSkillPage();

    await waitFor(() => {
      expect(screen.getByTestId('skill-deep-preview')).toBeDefined();
    });
    expect(screen.getByText('SKILL.md')).toBeDefined();
    expect(screen.getByText('scripts')).toBeDefined();
    expect(screen.getByText('config')).toBeDefined();
    await waitFor(() => {
      expect(screen.getByText('Some markdown.')).toBeDefined();
    });
    expect(screen.getByText('120')).toBeDefined();
    expect(screen.getByText('88')).toBeDefined();

    const copyButton = screen.getByRole('button', { name: /Copy File/i }) as HTMLButtonElement;
    await waitFor(() => {
      expect(copyButton.disabled).toBe(false);
    });
    fireEvent.click(copyButton);
    await waitFor(() => {
      expect(clipboardWriteMock).toHaveBeenCalled();
    });
    expect(showToastMock).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Reader Mode' }));
    await waitFor(() => {
      expect(screen.getByTestId('reader-mode-overlay')).toBeDefined();
    });
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByTestId('reader-mode-overlay')).toBeNull();
    });
  });

  it('renders syntax highlighter for non-markdown files', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('skills-manifest.json')) {
          return {
            ok: true,
            json: async () => ({
              'demo-skill': {
                category: 'Development & Code Tools',
                files: ['scripts/query.py'],
                fileMeta: {
                  'scripts/query.py': { sizeBytes: 20, lineCount: 3, ext: 'py', tabKey: 'scripts' },
                },
              },
            }),
          } as Response;
        }
        return {
          ok: true,
          text: async () => 'print("hello")',
        } as Response;
      })
    );

    renderSkillPage();

    await waitFor(() => {
      expect(screen.getByTestId('syntax-viewer')).toBeDefined();
      expect(screen.getByText(/hello/i)).toBeDefined();
    });
  });

  it('falls back to alternate file URL when SPA html is returned', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('skills-manifest.json')) {
          return {
            ok: true,
            json: async () => ({
              'demo-skill': {
                category: 'Development & Code Tools',
                files: ['SKILL.md'],
              },
            }),
          } as Response;
        }
        if (url.includes('Development%20%26%20Code%20Tools')) {
          return {
            ok: true,
            text: async () => '# Real Skill Content',
          } as Response;
        }
        return {
          ok: true,
          text: async () =>
            '<!doctype html><html><body><div id="root"></div><script type="module" src="/@vite/client"></script></body></html>',
        } as Response;
      })
    );

    renderSkillPage();

    await waitFor(() => {
      expect(screen.getByText('Real Skill Content')).toBeDefined();
    });
  });

  it('falls back when metadata fields are missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('skills-manifest.json')) {
          return {
            ok: true,
            json: async () => ({
              'demo-skill': {
                category: 'Development & Code Tools',
                files: ['SKILL.md'],
              },
            }),
          } as Response;
        }
        return {
          ok: true,
          text: async () => '# Demo Skill',
        } as Response;
      })
    );

    renderSkillPage();

    await waitFor(() => {
      expect(screen.getByTestId('skill-deep-preview')).toBeDefined();
    });
    expect(screen.getAllByText('N/A').length).toBeGreaterThanOrEqual(2);
  });

  it('shows binary fallback UI for tar.gz files instead of gibberish text', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('skills-manifest.json')) {
          return {
            ok: true,
            json: async () => ({
              'demo-skill': {
                category: 'Development & Code Tools',
                files: ['scripts/shadcn-components.tar.gz'],
                fileMeta: {
                  'scripts/shadcn-components.tar.gz': {
                    sizeBytes: 4096,
                    lineCount: 0,
                    ext: 'gz',
                    tabKey: 'scripts',
                  },
                },
              },
            }),
          } as Response;
        }
        return {
          ok: true,
          headers: { get: () => 'application/gzip' },
          arrayBuffer: async () => new Uint8Array([31, 139, 8, 0, 1, 2, 3, 4]).buffer,
          text: async () => '',
        } as unknown as Response;
      })
    );

    renderSkillPage();

    await waitFor(() => {
      expect(screen.getByText('Binary file cannot be previewed as text')).toBeDefined();
    });

    const copyButton = screen.getByRole('button', { name: /Copy File/i }) as HTMLButtonElement;
    expect(copyButton.disabled).toBe(true);
  });
});
