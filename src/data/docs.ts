export type DocSlug = 'welcome' | 'what-is-a-skill' | 'supported-agents' | 'security';

export type DocPageEntry = {
  slug: DocSlug;
  path: string;
  fileName: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  includeInSitemap: boolean;
};

export const DOC_PAGES: DocPageEntry[] = [
  {
    slug: 'welcome',
    path: '/docs',
    fileName: 'welcome',
    title: 'SKILLS All-in-one Docs | Setup guides and AI agent integration help',
    titleZh: 'SKILLS All-in-one 文件 | AI Agent 掛載與設定指南',
    description:
      'Technical documentation for SKILLS All-in-one, including setup guides, platform support, and integration help for Claude Code, ChatGPT, and AI agent workflows.',
    descriptionZh:
      'SKILLS All-in-one 技術文件，涵蓋設定流程、支援平台與整合說明，協助你將技能掛載到 Claude Code、ChatGPT 與各種 AI Agent 工作流。',
    includeInSitemap: true,
  },
  {
    slug: 'what-is-a-skill',
    path: '/docs/what-is-a-skill',
    fileName: 'what-is-a-skill',
    title: 'What Is an AI Agent Skill? | SKILLS All-in-one Docs',
    titleZh: '什麼是 AI Agent Skill？ | SKILLS All-in-one 文件',
    description:
      'Learn what an AI agent skill is, how modular instructions and tools work, and how SKILLS All-in-one packages reusable capabilities for modern agents.',
    descriptionZh:
      '了解 AI Agent Skill 的概念、模組化指令與工具如何運作，以及 SKILLS All-in-one 如何封裝可重用的 Agent 能力。',
    includeInSitemap: true,
  },
  {
    slug: 'supported-agents',
    path: '/docs/supported-agents',
    fileName: 'supported-agents',
    title: 'Supported AI Agents and Platforms | SKILLS All-in-one Docs',
    titleZh: '支援的 AI Agent 與平台 | SKILLS All-in-one 文件',
    description:
      'See which AI agents and platforms are supported by SKILLS All-in-one, including Claude Desktop, Claude Code, ChatGPT, and Gemini CLI.',
    descriptionZh:
      '查看 SKILLS All-in-one 目前支援的 AI Agent 與平台，包括 Claude Desktop、Claude Code、ChatGPT 與 Gemini CLI。',
    includeInSitemap: true,
  },
  {
    slug: 'security',
    path: '/docs/security',
    fileName: 'security',
    title: 'Security Review Process | SKILLS All-in-one Docs',
    titleZh: '安全審查流程 | SKILLS All-in-one 文件',
    description:
      'Review the security auditing workflow for skills, including static analysis, behavioral review, sandbox testing, and vulnerability reporting.',
    descriptionZh:
      '檢視技能的安全審查流程，包含靜態分析、行為審查、沙箱測試與弱點回報機制。',
    includeInSitemap: true,
  },
];

export const getDocPageBySlug = (slug?: string) => {
  if (!slug || slug === 'welcome') {
    return DOC_PAGES[0];
  }

  return DOC_PAGES.find((page) => page.slug === slug) || DOC_PAGES[0];
};

export const loadDocContent = async (slug?: string) => {
  const page = getDocPageBySlug(slug);

  switch (page.fileName) {
    case 'welcome':
      return (await import('./doc/welcome.md?raw')).default;
    case 'what-is-a-skill':
      return (await import('./doc/what-is-a-skill.md?raw')).default;
    case 'supported-agents':
      return (await import('./doc/supported-agents.md?raw')).default;
    case 'security':
      return (await import('./doc/security.md?raw')).default;
    default:
      return (await import('./doc/welcome.md?raw')).default;
  }
};
