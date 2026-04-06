import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { storageService, Language } from '@/services/storageService';
import { ja } from '../i18n/translations/ja';
import { en } from '../i18n/translations/en';
import { Translations } from '../i18n/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

const translationsMap: Record<Language, Translations> = {
  ja,
  en,
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('ja');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load language preference from IndexedDB on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await storageService.getLanguage();
        setLanguageState(savedLanguage);
      } catch (error) {
        console.error('Failed to load language preference:', error);
        // Default to Japanese if loading fails
        setLanguageState('ja');
      } finally {
        setIsLoaded(true);
      }
    };

    loadLanguage();
  }, []);

  // Save language preference to IndexedDB when changed
  const setLanguage = useCallback(async (lang: Language) => {
    try {
      await storageService.setLanguage(lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Failed to save language preference:', error);
      // Still update UI even if saving fails
      setLanguageState(lang);
    }
  }, []);

  const translations = translationsMap[language];

  // Don't render children until language is loaded from IndexedDB
  if (!isLoaded) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
