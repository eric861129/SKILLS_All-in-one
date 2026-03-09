import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOC_PAGES } from '../src/data/docs.ts';
import { MOCK_SKILLS } from '../src/data/skills.ts';
import { buildCanonicalUrl } from '../src/seo/site.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const publicDir = path.join(repoRoot, 'public');
const sitemapFile = path.join(publicDir, 'sitemap.xml');
const seoRoutesFile = path.join(publicDir, 'seo-routes.json');

type SeoRouteEntry = {
  path: string;
  url: string;
  type: 'home' | 'setup' | 'docs' | 'skill';
  title: string;
  description: string;
};

const homeEntry: SeoRouteEntry = {
  path: '/',
  url: buildCanonicalUrl('/'),
  type: 'home',
  title: 'AI Agent Skills Library | Claude Code, ChatGPT, MCP Workflows',
  description:
    'Browse downloadable open-source AI agent skills for Claude Code, ChatGPT, and MCP workflows across development, data, writing, and automation.',
};

const setupEntry: SeoRouteEntry = {
  path: '/setup',
  url: buildCanonicalUrl('/setup'),
  type: 'setup',
  title: 'AI Agent Setup Guide | Claude Code, ChatGPT, MCP Integration',
  description:
    'Follow the AI agent setup guide to integrate skills into Claude Code, ChatGPT, and other MCP-ready workflows.',
};

const docEntries: SeoRouteEntry[] = DOC_PAGES.filter((page) => page.includeInSitemap).map((page) => ({
  path: page.path,
  url: buildCanonicalUrl(page.path),
  type: 'docs',
  title: page.title,
  description: page.description,
}));

const skillEntries: SeoRouteEntry[] = MOCK_SKILLS.map((skill) => ({
  path: `/skill/${skill.id}`,
  url: buildCanonicalUrl(`/skill/${skill.id}`),
  type: 'skill',
  title: `${skill.name} | ${skill.category} Skill by ${skill.author} | SKILLS All-in-one`,
  description: skill.description.length > 160 ? `${skill.description.slice(0, 159).trimEnd()}…` : skill.description,
}));

const allEntries = [homeEntry, setupEntry, ...docEntries, ...skillEntries];
const lastmod = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries
  .map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.type === 'skill' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${entry.type === 'home' ? '1.0' : entry.type === 'skill' ? '0.8' : '0.7'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync(sitemapFile, sitemap, 'utf8');
fs.writeFileSync(seoRoutesFile, `${JSON.stringify(allEntries, null, 2)}\n`, 'utf8');
console.log(`SEO assets generated: ${path.relative(repoRoot, sitemapFile)}, ${path.relative(repoRoot, seoRoutesFile)}`);
