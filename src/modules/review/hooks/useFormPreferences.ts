import { useCallback } from 'react';
import type { PlayMethod, TranslationLayer } from '@macgamingdb/server/schema';

interface FormPreferences {
  playMethod?: PlayMethod;
  translationLayer?: TranslationLayer;
  macConfigIdentifier?: string;
}

const STORAGE_KEY = 'macgamingdb-form-preferences';

export function useFormPreferences() {
  const getPreferences = useCallback((): FormPreferences => {
    if (typeof window === 'undefined') return {};

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  const updatePreference = useCallback(
    <K extends keyof FormPreferences>(key: K, value: FormPreferences[K]) => {
      if (typeof window === 'undefined') return;
        const current = getPreferences();
        const updated = { ...current, [key]: value };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    [getPreferences],
  );

  return {
    getPreferences,
    updatePreference,
  };
}
