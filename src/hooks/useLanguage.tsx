import React, { createContext, useContext, useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';

export type Language = "en" | "zh";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { i18n, t: i18nT } = useTranslation();
  
  // Use a local state to force re-renders when i18n language changes
  const [currentLang, setCurrentLang] = useState<Language>(
    (i18n.language?.split('-')[0] || 'zh') as Language
  );

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const simplifiedLng = (lng.split('-')[0] || 'zh') as Language;
      setCurrentLang(simplifiedLng);
      document.documentElement.lang = simplifiedLng;
    };

    i18n.on('languageChanged', handleLanguageChange);
    
    // Initial sync
    handleLanguageChange(i18n.language);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
  };

  const t = (key: string, options?: any) => {
    return i18nT(key, options) as string;
  };

  return (
    <LanguageContext.Provider value={{ language: currentLang, setLanguage, t }}>
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
