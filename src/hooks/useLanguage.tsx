import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'zh';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  title: { en: 'SKILLS ALL IN ONE', zh: 'AI 技能下載中心' },
  subtitle: { en: 'A curated collection of professional AI Agent skills.', zh: '高品質 AI Agent 技能展示與下載平台' },
  searchPlaceholder: { en: 'Search by name, tag, or author...', zh: '搜尋名稱、標籤或作者...' },
  allCategories: { en: 'All', zh: '全部' },
  sortByPopular: { en: 'Popular', zh: '熱門排序' },
  sortByLatest: { en: 'Latest', zh: '最新發佈' },
  download: { en: 'Download', zh: '下載' },
  viewOnGithub: { en: 'View', zh: '預覽' },
  loading: { en: 'Loading...', zh: '載入中...' },
  noResults: { en: 'No skills found matching your search.', zh: '找不到符合搜尋條件的技能。' },
  tagSearch: { en: 'Search Tags', zh: '搜尋標籤' },
  authorSearch: { en: 'Search Authors', zh: '搜尋作者' },
  originalSource: { en: 'Source', zh: '原始來源' },
  viewInRepo: { en: 'Repo', zh: '本站來源' },
  skillPreview: { en: 'Preview', zh: '線上檢視' },
  filterByAuthor: { en: 'By Author', zh: '依作者篩選' },
  filterByTag: { en: 'By Tag', zh: '依標籤篩選' },
  clearAllFilters: { en: 'Clear All', zh: '清除篩選' },
  showMore: { en: 'Show More', zh: '展開更多' },
  showLess: { en: 'Show Less', zh: '收起' },
  advancedFilters: { en: 'Filters', zh: '進階篩選' },
  closeModal: { en: 'Close', zh: '關閉' },
  fileTree: { en: 'Files', zh: '檔案結構' },
  loadingFile: { en: 'Loading file...', zh: '載入中...' },
  selectFile: { en: 'Select a file to preview', zh: '選擇檔案以預覽' },
  noFilesFound: { en: 'No files found for this skill.', zh: '找不到此技能的檔案。' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'zh';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
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
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
