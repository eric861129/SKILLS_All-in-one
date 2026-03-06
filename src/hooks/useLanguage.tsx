import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "zh";

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  title: { en: "SKILLS ALL IN ONE", zh: "SKILLS ALL IN ONE" },
  subtitle: {
    en: "A curated collection of professional AI Agent skills.",
    zh: "高品質 AI Agent  SKILL 展示與下載平台",
  },
  searchPlaceholder: {
    en: "Search by name, tag, or author...",
    zh: "搜尋名稱、標籤或作者...",
  },
  allCategories: { en: "All", zh: "全部" },
  sortByPopular: { en: "Popular", zh: "熱門排序" },
  sortByLatest: { en: "Latest", zh: "最新發佈" },
  download: { en: "Download", zh: "下載" },
  viewOnGithub: { en: "View", zh: "預覽" },
  loading: { en: "Loading...", zh: "載入中..." },
  noResults: {
    en: "No skills found matching your search.",
    zh: "找不到符合搜尋條件的 SKILL 。",
  },
  tagSearch: { en: "Search Tags", zh: "搜尋標籤" },
  authorSearch: { en: "Search Authors", zh: "搜尋作者" },
  originalSource: { en: "Source", zh: "原始來源" },
  viewInRepo: { en: "Repo", zh: "本站來源" },
  skillPreview: { en: "Preview", zh: "線上檢視" },
  filterByAuthor: { en: "By Author", zh: "依作者篩選" },
  filterByTag: { en: "By Tag", zh: "依標籤篩選" },
  clearAllFilters: { en: "Clear All", zh: "清除篩選" },
  showMore: { en: "Show More", zh: "展開更多" },
  showLess: { en: "Show Less", zh: "收起" },
  advancedFilters: { en: "Filters", zh: "進階篩選" },
  closeModal: { en: "Close", zh: "關閉" },
  fileTree: { en: "Files", zh: "檔案結構" },
  loadingFile: { en: "Loading file...", zh: "載入中..." },
  selectFile: { en: "Select a file to preview", zh: "選擇檔案以預覽" },
  noFilesFound: {
    en: "No files found for this skill.",
    zh: "找不到此 SKILL 的檔案。",
  },
  submitSkill: { en: "Submit a Skill", zh: "提交新 SKILL " },
  whatIsSkill: { en: "What is AI Agent Skill?", zh: "什麼是 AI Agent SKILL？" },
  whatIsSkillSubtitle: {
    en: "Unlock the full potential of your AI Agent with specialized modular tools.",
    zh: "透過模組化工具，釋放 AI Agent 的完整潛力。",
  },
  skillConcept1: { en: "Modular Capabilities", zh: "模組化能力" },
  skillDesc1: {
    en: "Skills are standardized tools that allow agents to interact with external data, APIs, and systems.",
    zh: " SKILL 是標準化的工具包，讓 Agent 能夠與外部數據、API 及系統進行互動。",
  },
  skillConcept2: { en: "Dynamic Injection", zh: "動態注入" },
  skillDesc2: {
    en: "Unlike hard-coded logic, skills can be hot-reloaded into your agent environment at runtime.",
    zh: "不同於寫死的邏輯， SKILL 可以在運行時動態加載到您的 Agent 環境中。",
  },
  skillConcept3: { en: "Cross-Platform", zh: "跨平台相容" },
  skillDesc3: {
    en: "Based on the Model Context Protocol (MCP), these skills work across multiple AI ecosystems.",
    zh: "基於 MCP 標準，這些 SKILL 可在多種 AI 生態系統（如 Claude, Gemini）中運作。",
  },
  setupYourAgent: { en: "Injection Guide", zh: " SKILL 掛載引導" },
  setupSubtitle: {
    en: "Technical instructions for loading modular capabilities into production agents.",
    zh: "將模組化能力正確注入生產環境 Agent 的 SKILL 指南。",
  },
  stepByStep: { en: "Technical Protocol", zh: "掛載 SKILL 協議" },
  claudeCodeDesc: {
    en: "High-performance terminal agent by Anthropic. Supports global and project-level skill injection.",
    zh: "Anthropic 開發的高性能終端 Agent。支援全域與專案等級的 SKILL 注入。",
  },
  claudeStep1Title: {
    en: "1. Verify Structure",
    zh: "第一步：確認 SKILL 結構",
  },
  claudeStep1Desc: {
    en: "Ensure your folder contains a SKILL.md with valid YAML frontmatter (name & description).",
    zh: "確保資料夾內包含一個帶有正確 YAML（名稱與描述）的 SKILL.md。",
  },
  claudeStep2Title: { en: "2. Choose Path", zh: "第二步：選擇掛載路徑" },
  claudeStep2Desc: {
    en: "Global: ~/.claude/skills/ (Recommended) \nProject: ./.claude/skills/",
    zh: "全域：~/.claude/skills/ (推薦) \n專案：./.claude/skills/",
  },
  claudeStep3Title: { en: "3. Reload Session", zh: "第三步：重載工作階段" },
  claudeStep3Desc: {
    en: 'Exit current session with /exit and run "claude" again to detect new skills.',
    zh: '輸入 /exit 結束目前階段，重新輸入 "claude" 以偵測新 SKILL 。',
  },
  claudeStep4Title: { en: "4. Verify & Use", zh: "第四步：驗證與使用" },
  claudeStep4Desc: {
    en: 'Use "/skill-name" to trigger directly or use natural language to invoke the tool.',
    zh: '輸入 "/ SKILL 名稱" 直接觸發，或使用自然語言描述需求來自動呼叫。',
  },
  proTips: { en: "Master Tips", zh: "💡 小撇步" },
  claudeTip1: {
    en: "Conflict: Global skills override project-level ones if names collide.",
    zh: "衝突處理：如果全域與專案有同名 SKILL ，全域設定會優先被採用。",
  },
  claudeTip2: {
    en: 'Debug: Use "claude --debug" to view detailed skill loading logs.',
    zh: '偵錯模式：使用 "claude --debug" 來查看 SKILL 載入的詳細日誌。',
  },
  missingAgentTitle: {
    en: "Missing your favorite SKILL？?",
    zh: "沒看到您常用的 SKILL 嗎？",
  },
  missingAgentDesc: {
    en: "Help the community expand! If you have successfully integrated skills into a new platform, please contribute your technical steps via GitHub.",
    zh: "協助社群擴展！如果您已成功在新的平台上掛載 SKILL ，請透過 GitHub 貢獻您的 SKILL 步驟。",
  },
  submitProtocol: { en: "Submit Protocol", zh: "提交 SKILL " },
  skillStructureTitle: {
    en: "Standard Directory Structure",
    zh: "標準資料夾結構",
  },
  skillStructureDesc: {
    en: "A modular skill follows a strict hierarchical layout to ensure cross-platform compatibility.",
    zh: "模組化 SKILL 遵循嚴格的層次結構，以確保跨平台相容性與自動化識別。",
  },
  coreLogic: { en: "Core Logic", zh: "核心指令邏輯" },
  metadataInfo: { en: "Registry Metadata", zh: "檢索元數據" },
  extensibility: { en: "Advanced Extensibility", zh: "進階擴充能力" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language");
    return (saved as Language) || "zh";
  });

  useEffect(() => {
    localStorage.setItem("app-language", language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};
