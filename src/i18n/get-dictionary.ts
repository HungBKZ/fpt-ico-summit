/**
 * i18n/get-dictionary.ts — Dictionary loader helper.
 */

import { Locale } from "./config";
import { en } from "./dictionaries/en";
import { vi } from "./dictionaries/vi";
import type { Dictionary } from "./types";

const dictionaries: Record<Locale, Dictionary> = {
  en,
  vi,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}
