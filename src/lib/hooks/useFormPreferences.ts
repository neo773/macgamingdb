import { useCallback } from "react";
import type {
  PlayMethod,
  TranslationLayer,
  Chipset,
  ChipsetVariant,
} from "@/server/schema";

interface FormPreferences {
  playMethod?: PlayMethod;
  translationLayer?: TranslationLayer;
  chipset?: Chipset;
  chipsetVariant?: ChipsetVariant;
}

const STORAGE_KEY = "macgamingdb-form-preferences";

export function useFormPreferences() {
  const getPreferences = useCallback((): FormPreferences => {
    if (typeof window === "undefined") return {};

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  const updatePreference = useCallback(
    <K extends keyof FormPreferences>(key: K, value: FormPreferences[K]) => {
      if (typeof window === "undefined") return;

      try {
        const current = getPreferences();
        const updated = { ...current, [key]: value };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Silently fail if localStorage is not available
      }
    },
    [getPreferences]
  );

  return {
    getPreferences,
    updatePreference,
  };
}
