import { useLanguage } from '@/contexts/LanguageContext';

export function useTranslation() {
  const { translations, language, setLanguage } = useLanguage();

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return { t, language, setLanguage };
}

export * from './types';
