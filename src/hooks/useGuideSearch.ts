import { useEffect, useMemo, useRef, useState } from 'react';
import { SEARCH_DEBOUNCE_MS } from '../constants/config';
import { searchGuide } from '../game/guideSearch';
import type { GuideEntry, MaterialCategory } from '../types';

/** Debounced guide search. Query/filter live in session memory only. */
export function useGuideSearch(
  query: string,
  category: MaterialCategory | 'all',
): GuideEntry[] {
  const [settled, setSettled] = useState(query);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => setSettled(query), SEARCH_DEBOUNCE_MS);
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [query]);

  return useMemo(() => searchGuide(settled, category), [settled, category]);
}
