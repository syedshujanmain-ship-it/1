import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Language = 'english' | 'hinglish' | 'auto';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  languageLabel: string;
}

const labels: Record<Language, string> = {
  english: 'EN',
  hinglish: 'HI',
  auto: 'AUTO',
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'auto',
  setLanguage: () => {},
  languageLabel: 'AUTO',
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('rw_language');
    return (saved as Language) || 'auto';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang);
    localStorage.setItem('rw_language', lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languageLabel: labels[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
