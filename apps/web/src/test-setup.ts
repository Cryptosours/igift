import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock next-intl for all component tests — returns the translation key or
// interpolates {param} placeholders from the second argument.
vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string, params?: Record<string, unknown>) => {
      if (!params) return key;
      let result = key;
      for (const [k, v] of Object.entries(params)) {
        result = result.replace(`{${k}}`, String(v));
      }
      return result;
    };
    return t;
  },
  useLocale: () => "en",
}));
