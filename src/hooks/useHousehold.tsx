import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  REMINDER_HOUR_DEFAULT,
  MAX_BINS,
} from '../constants/config';
import type {
  Bin,
  CollectionException,
  CollectionRule,
  GuideOverride,
  Household,
  MaterialCategory,
  ReminderPreferences,
  ReminderStatus,
} from '../types';

const EMPTY: Household = {
  bins: [],
  rules: [],
  exceptions: [],
  reminders: { requested: false, hour: REMINDER_HOUR_DEFAULT, minute: 0 },
  overrides: [],
};

export type NewBin = {
  name: string;
  category: MaterialCategory;
  colour: string;
  spriteIndex: number;
};

type HouseholdApi = {
  household: Household;
  addBin: (draft: NewBin) => string | null;
  updateBin: (id: string, patch: Partial<Bin>) => void;
  toggleBin: (id: string) => void;
  deleteBin: (id: string) => void;
  saveSchedule: (
    binId: string,
    anchorDate: string,
    intervalWeeks: number,
    exceptions: CollectionException[],
  ) => void;
  setReminders: (prefs: ReminderPreferences) => void;
  saveOverride: (override: GuideOverride) => void;
  removeOverride: (entryKey: string) => void;
  resetAll: () => void;
};

const HouseholdContext = createContext<HouseholdApi | null>(null);

export function HouseholdProvider({ children }: { children: React.ReactNode }) {
  const [household, setHousehold] = useState<Household>(EMPTY);
  const idSeed = useRef(0);

  const addBin = useCallback((draft: NewBin): string | null => {
    let created: string | null = null;
    setHousehold(prev => {
      if (prev.bins.length >= MAX_BINS) {
        return prev;
      }
      idSeed.current += 1;
      const id = `bin-${Date.now().toString(36)}-${idSeed.current}`;
      created = id;
      const bin: Bin = {
        id,
        name: draft.name.trim(),
        category: draft.category,
        colour: draft.colour,
        spriteIndex: draft.spriteIndex,
        enabled: true,
      };
      return { ...prev, bins: [...prev.bins, bin] };
    });
    return created;
  }, []);

  const updateBin = useCallback((id: string, patch: Partial<Bin>) => {
    setHousehold(prev => ({
      ...prev,
      bins: prev.bins.map(b => (b.id === id ? { ...b, ...patch } : b)),
    }));
  }, []);

  const toggleBin = useCallback((id: string) => {
    setHousehold(prev => ({
      ...prev,
      bins: prev.bins.map(b =>
        b.id === id ? { ...b, enabled: !b.enabled } : b,
      ),
    }));
  }, []);

  const deleteBin = useCallback((id: string) => {
    setHousehold(prev => ({
      ...prev,
      bins: prev.bins.filter(b => b.id !== id),
      rules: prev.rules.filter(r => r.binId !== id),
      exceptions: prev.exceptions.filter(e => e.binId !== id),
      // Linked guide rules keep their note but lose the destination.
      overrides: prev.overrides.map(o =>
        o.destination === id ? { ...o, destination: '' } : o,
      ),
    }));
  }, []);

  const saveSchedule = useCallback(
    (
      binId: string,
      anchorDate: string,
      intervalWeeks: number,
      exceptions: CollectionException[],
    ) => {
      setHousehold(prev => {
        const rule: CollectionRule = { binId, anchorDate, intervalWeeks };
        const rules = prev.rules.some(r => r.binId === binId)
          ? prev.rules.map(r => (r.binId === binId ? rule : r))
          : [...prev.rules, rule];
        const others = prev.exceptions.filter(e => e.binId !== binId);
        return { ...prev, rules, exceptions: [...others, ...exceptions] };
      });
    },
    [],
  );

  const setReminders = useCallback((prefs: ReminderPreferences) => {
    setHousehold(prev => ({ ...prev, reminders: prefs }));
  }, []);

  const saveOverride = useCallback((override: GuideOverride) => {
    setHousehold(prev => ({
      ...prev,
      overrides: [
        ...prev.overrides.filter(o => o.entryKey !== override.entryKey),
        override,
      ],
    }));
  }, []);

  const removeOverride = useCallback((entryKey: string) => {
    setHousehold(prev => ({
      ...prev,
      overrides: prev.overrides.filter(o => o.entryKey !== entryKey),
    }));
  }, []);

  const resetAll = useCallback(() => {
    setHousehold({ ...EMPTY, reminders: { ...EMPTY.reminders } });
  }, []);

  const api = useMemo<HouseholdApi>(
    () => ({
      household,
      addBin,
      updateBin,
      toggleBin,
      deleteBin,
      saveSchedule,
      setReminders,
      saveOverride,
      removeOverride,
      resetAll,
    }),
    [
      household,
      addBin,
      updateBin,
      toggleBin,
      deleteBin,
      saveSchedule,
      setReminders,
      saveOverride,
      removeOverride,
      resetAll,
    ],
  );

  return (
    <HouseholdContext.Provider value={api}>{children}</HouseholdContext.Provider>
  );
}

export function useHousehold(): HouseholdApi {
  const ctx = useContext(HouseholdContext);
  if (!ctx) {
    throw new Error('useHousehold must be used inside HouseholdProvider');
  }
  return ctx;
}

/** Narrow selector so a screen does not re-render on unrelated household edits. */
export function useBins(): Bin[] {
  return useHousehold().household.bins;
}

export function useReminderPrefs(): ReminderPreferences {
  return useHousehold().household.reminders;
}

export function reminderStatusOf(prefs: ReminderPreferences): ReminderStatus {
  return prefs.requested ? 'ready' : 'off';
}
