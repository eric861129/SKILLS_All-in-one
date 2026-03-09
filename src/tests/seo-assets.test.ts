import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOC_PAGES } from '../data/docs';
import { MOCK_SKILLS } from '../data/skills';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');
const sitemapPath = path.join(repoRoot, 'public', 'sitemap.xml');
const seoRoutesPath = path.join(repoRoot, 'public', 'seo-routes.json');

describe('SEO assets', () => {
  it('generates sitemap entries for homepage, setup, docs, and skills', () => {
    const sitemap = fs.readFileSync(sitemapPath, 'utf8');
    const urlCount = (sitemap.match(/<url>/g) || []).length;
    const expectedCount = 2 + DOC_PAGES.filter((page) => page.includeInSitemap).length + MOCK_SKILLS.length;

    expect(urlCount).toBe(expectedCount);
    expect(sitemap).toContain('https://huangchiyu.com/SKILLS_All-in-one/setup');
    expect(sitemap).toContain('https://huangchiyu.com/SKILLS_All-in-one/docs');
  });

  it('writes seo-routes.json with the same route count', () => {
    const routes = JSON.parse(fs.readFileSync(seoRoutesPath, 'utf8')) as Array<{ path: string; type: string }>;
    const expectedCount = 2 + DOC_PAGES.filter((page) => page.includeInSitemap).length + MOCK_SKILLS.length;

    expect(routes).toHaveLength(expectedCount);
    expect(routes.some((route) => route.path === '/')).toBe(true);
    expect(routes.some((route) => route.path === '/setup')).toBe(true);
    expect(routes.some((route) => route.type === 'skill')).toBe(true);
  });
});
