import React, { createContext, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => localStorage.getItem('life-leveling-language') || 'en');

  useLayoutEffect(() => {
    document.documentElement.lang = language === 'hi' ? 'hi' : 'en';
    localStorage.setItem('life-leveling-language', language);
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage: setLanguageState,
    t: (text) => language === 'hi' ? translations.hi[text] || text : translations.en[text] || text
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
