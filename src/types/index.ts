export type MaterialCategory =
  | 'paper'
  | 'recycling'
  | 'food'
  | 'glass'
  | 'general'
  | 'special';

export type Bin = {
  id: string;
  name: string;
  category: MaterialCategory;
  colour: string;
  spriteIndex: number;
  enabled: boolean;
};

export type CollectionRule = {
  binId: string;
  anchorDate: string; // YYYY-MM-DD, local calendar date
  intervalWeeks: number; // 1..4
};

export type CollectionException = {
  binId: string;
  originalDate: string;
  kind: 'skip' | 'move';
  replacementDate?: string;
};

export type ReminderPreferences = {
  requested: boolean;
  hour: number; // 16..23
  minute: number; // 0 | 15 | 30 | 45
};

export type GuideOverride = {
  entryKey: string;
  destination: string; // bin id, or 'special'
  note: string;
};

export type Household = {
  bins: Bin[];
  rules: CollectionRule[];
  exceptions: CollectionException[];
  reminders: ReminderPreferences;
  overrides: GuideOverride[];
};

export type ReminderStatus = 'off' | 'ready';

/** One bin due on one concrete local date. */
export type Occurrence = {
  binId: string;
  date: string;
  moved: boolean;
};

/** All bins due on the same local date. */
export type CollectionGroup = {
  date: string;
  binIds: string[];
};

export type GuideEntry = {
  key: string;
  name: string;
  synonyms: string[];
  category: MaterialCategory;
  hint: string;
};

export type ScheduleDraft = {
  binId: string;
  anchorDate: string;
  intervalWeeks: number;
};

export type Screen =
  | 'loader'
  | 'menu'
  | 'game'
  | 'schedule'
  | 'gameover'
  | 'sortGuide'
  | 'settings'
  | 'about';

export type TabKey = 'menu' | 'game' | 'sortGuide' | 'settings';
