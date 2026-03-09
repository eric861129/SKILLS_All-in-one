import type { Skill } from '../types/skill';
import { getLocalized } from '../utils/i18n';
import { DEFAULT_OG_IMAGE_URL, SITE_NAME, buildCanonicalUrl } from './site';
import type { DocPageEntry } from '../data/docs';

export type SeoJsonLd = Record<string, unknown>;

export type SeoMeta = {
  title: string;
  description: string;
  canonicalPath: string;
  robots?: string;
  lang?: string;
  keywords?: string[];
  openGraph?: {
    type?: string;
    title?: string;
    description?: string;
    image?: string;
    url?: string;
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image';
    title?: string;
    description?: string;
    image?: string;
  };
  jsonLd?: SeoJsonLd | SeoJsonLd[];
};

const HOME_KEYWORDS = [
  'AI agent skills',
  'Claude Code skills',
  'ChatGPT skills',
  'MCP workflows',
  'open-source skills',
  'AI tools library',
];

const zhOrEn = (language: string, zh: string, en: string) => (language === 'zh' ? zh : en);

export const truncateDescription = (description: string, maxLength = 160) => {
  const trimmed = description.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
};

const baseMeta = (
  language: string,
  canonicalPath: string,
  title: string,
  description: string,
  jsonLd?: SeoJsonLd | SeoJsonLd[],
  robots = 'index,follow'
): SeoMeta => ({
  title,
  description,
  canonicalPath,
  robots,
  lang: language === 'zh' ? 'zh-Hant' : 'en',
  keywords: HOME_KEYWORDS,
  openGraph: {
    type: 'website',
    title,
    description,
    url: buildCanonicalUrl(canonicalPath),
    image: DEFAULT_OG_IMAGE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    image: DEFAULT_OG_IMAGE_URL,
  },
  jsonLd,
});

export const buildHomeSeo = (language: string, skills: Skill[], categories: string[]): SeoMeta => {
  const title = zhOrEn(
    language,
    'AI Agent 技能庫 | Claude Code、ChatGPT、MCP Skills',
    'AI Agent Skills Library | Claude Code, ChatGPT, MCP Workflows'
  );
  const description = zhOrEn(
    language,
    '探索可下載的開源 AI Agent Skills，支援 Claude Code、ChatGPT 與 MCP 工作流，涵蓋開發、資料分析、寫作與自動化場景。',
    'Browse downloadable open-source AI agent skills for Claude Code, ChatGPT, and MCP workflows across development, data, writing, and automation.'
  );

  const itemListElements = skills.slice(0, 12).map((skill, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: buildCanonicalUrl(`/skill/${skill.id}`),
    name: getLocalized(skill, 'name', language),
  }));

  const jsonLd: SeoJsonLd[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: buildCanonicalUrl('/'),
      inLanguage: language === 'zh' ? 'zh-Hant' : 'en',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${SITE_NAME} skills`,
      numberOfItems: skills.length,
      itemListElement: itemListElements,
      about: categories,
    },
  ];

  return baseMeta(language, '/', title, description, jsonLd);
};

export const buildSkillSeo = (skill: Skill, language: string): SeoMeta => {
  const displayName = getLocalized(skill, 'name', language);
  const displayDescription = truncateDescription(getLocalized(skill, 'description', language) || skill.description);
  const title = `${displayName} | ${skill.category} Skill by ${skill.author} | ${SITE_NAME}`;
  const keywords = [...new Set([...HOME_KEYWORDS, skill.category, skill.author, ...skill.tags])];

  return {
    ...baseMeta(
      language,
      `/skill/${skill.id}`,
      title,
      displayDescription,
      {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: displayName,
        description: displayDescription,
        author: {
          '@type': 'Person',
          name: skill.author,
        },
        keywords,
        datePublished: skill.createdAt,
        url: buildCanonicalUrl(`/skill/${skill.id}`),
      }
    ),
    keywords,
    openGraph: {
      type: 'article',
      title,
      description: displayDescription,
      url: buildCanonicalUrl(`/skill/${skill.id}`),
      image: DEFAULT_OG_IMAGE_URL,
    },
  };
};

export const buildSkillNotFoundSeo = (language: string, skillId?: string): SeoMeta =>
  baseMeta(
    language,
    '/404',
    zhOrEn(language, '找不到技能 | SKILLS All-in-one', 'Skill not found | SKILLS All-in-one'),
    zhOrEn(
      language,
      `找不到技能頁面${skillId ? `：${skillId}` : ''}。`,
      `The requested skill page could not be found${skillId ? `: ${skillId}` : ''}.`
    ),
    undefined,
    'noindex,follow'
  );

export const buildDocsSeo = (page: DocPageEntry, language: string): SeoMeta => {
  const title = zhOrEn(language, page.titleZh, page.title);
  const description = zhOrEn(language, page.descriptionZh, page.description);

  return baseMeta(
    language,
    page.path,
    title,
    description,
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: title,
      description,
      url: buildCanonicalUrl(page.path),
      about: SITE_NAME,
    }
  );
};

export const buildSetupSeo = (language: string): SeoMeta =>
  baseMeta(
    language,
    '/setup',
    zhOrEn(
      language,
      'AI Agent 技能掛載指南 | Claude Code、ChatGPT、MCP',
      'AI Agent Setup Guide | Claude Code, ChatGPT, MCP Integration'
    ),
    zhOrEn(
      language,
      '查看 AI Agent 技能掛載與整合指南，快速將技能導入 Claude Code、ChatGPT 與其他支援 MCP 的工作流。',
      'Follow the AI agent setup guide to integrate skills into Claude Code, ChatGPT, and other MCP-ready workflows.'
    ),
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: 'AI agent setup guide',
      description:
        'Step-by-step setup instructions for loading reusable skills into AI agents and MCP-compatible environments.',
      url: buildCanonicalUrl('/setup'),
    }
  );

export const buildAuthorSeo = (name: string, language: string): SeoMeta =>
  baseMeta(
    language,
    `/author/${encodeURIComponent(name)}`,
    `${name} | ${SITE_NAME}`,
    zhOrEn(
      language,
      `瀏覽 ${name} 發布的 AI Agent Skills 與相關技能組合。`,
      `Browse AI agent skills published by ${name} in the SKILLS All-in-one library.`
    ),
    undefined,
    'noindex,follow'
  );
