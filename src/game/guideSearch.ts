import { SORTING_GUIDE, CATEGORY_LABELS } from '../data/sortingGuide';
import type { GuideEntry, MaterialCategory } from '../types';

/**
 * Case, whitespace, punctuation and diacritic insensitive matching key.
 * Display text is never altered.
 */
export function normalise(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 0 = exact name, 1 = name prefix, 2 = name substring, 3 = synonym/category, -1 = no match. */
function rank(entry: GuideEntry, query: string): number {
  const name = normalise(entry.name);
  if (name === query) {
    return 0;
  }
  if (name.startsWith(query)) {
    return 1;
  }
  if (name.includes(query)) {
    return 2;
  }
  const hay = entry.synonyms
    .map(normalise)
    .concat(normalise(CATEGORY_LABELS[entry.category]));
  if (hay.some(h => h.includes(query))) {
    return 3;
  }
  return -1;
}

export function searchGuide(
  rawQuery: string,
  category: MaterialCategory | 'all',
): GuideEntry[] {
  const pool =
    category === 'all'
      ? SORTING_GUIDE
      : SORTING_GUIDE.filter(e => e.category === category);
  const query = normalise(rawQuery);
  if (query.length === 0) {
    return pool.slice().sort((a, b) => a.name.localeCompare(b.name));
  }
  const scored: Array<{ entry: GuideEntry; score: number }> = [];
  for (const entry of pool) {
    const score = rank(entry, query);
    if (score >= 0) {
      scored.push({ entry, score });
    }
  }
  scored.sort(
    (a, b) => a.score - b.score || a.entry.name.localeCompare(b.entry.name),
  );
  return scored.map(s => s.entry);
}
