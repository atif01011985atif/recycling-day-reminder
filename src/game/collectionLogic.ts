/**
 * Local-calendar recurrence engine.
 * Every value is a date-only string in YYYY-MM-DD form; no UTC midnight tricks.
 */
import type {
  Bin,
  CollectionException,
  CollectionGroup,
  CollectionRule,
  Occurrence,
} from '../types';

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function pad(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function todayISO(): string {
  return toISO(new Date());
}

export function addDaysISO(iso: string, days: number): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function diffDays(fromIso: string, toIso: string): number {
  const a = fromISO(fromIso);
  const b = fromISO(toIso);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function compareISO(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Monday-start week containing `iso`. */
export function startOfWeek(iso: string): string {
  const d = fromISO(iso);
  const shift = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - shift);
  return toISO(d);
}

export function weekRangeLabel(mondayIso: string): string {
  const end = addDaysISO(mondayIso, 6);
  return `${formatShort(mondayIso)} - ${formatShort(end)}`;
}

export function formatShort(iso: string): string {
  const d = fromISO(iso);
  return `${WEEKDAYS_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

export function formatFull(iso: string): string {
  const d = fromISO(iso);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

export function weekdayName(iso: string): string {
  return WEEKDAYS[fromISO(iso).getDay()];
}

/** "Today" / "Tomorrow" / weekday — always shown next to the real date. */
export function relativeLabel(iso: string, today: string): string {
  const delta = diffDays(today, iso);
  if (delta === 0) {
    return 'Today';
  }
  if (delta === 1) {
    return 'Tomorrow';
  }
  if (delta > 1 && delta < 7) {
    return weekdayName(iso);
  }
  return formatShort(iso);
}

export function recurrenceSentence(rule: CollectionRule): string {
  const day = weekdayName(rule.anchorDate);
  return rule.intervalWeeks === 1
    ? `Every week on ${day}`
    : `Every ${rule.intervalWeeks} weeks on ${day}`;
}

/**
 * Raw occurrences of a rule from its anchor, before exceptions.
 * Walks forward in whole interval steps so the weekday never drifts.
 */
function rawOccurrences(rule: CollectionRule, fromIso: string, count: number): string[] {
  const step = 7 * Math.max(1, rule.intervalWeeks);
  const out: string[] = [];
  const behind = diffDays(rule.anchorDate, fromIso);
  let index = behind > 0 ? Math.floor(behind / step) : 0;
  let guard = 0;
  while (out.length < count && guard < count + 200) {
    const candidate = addDaysISO(rule.anchorDate, step * index);
    if (compareISO(candidate, fromIso) >= 0) {
      out.push(candidate);
    }
    index += 1;
    guard += 1;
  }
  return out;
}

/** Original (pre-exception) dates — used by the one-off exception picker. */
export function originalOccurrences(
  rule: CollectionRule,
  fromIso: string,
  count: number,
): string[] {
  return rawOccurrences(rule, fromIso, count);
}

/**
 * Real collection dates for one bin: exceptions applied, duplicates merged, sorted.
 */
export function occurrencesForBin(
  rule: CollectionRule,
  exceptions: CollectionException[],
  fromIso: string,
  count: number,
): Occurrence[] {
  const mine = exceptions.filter(e => e.binId === rule.binId);
  // Look a little further back so a moved-forward date is not missed.
  const scanFrom = addDaysISO(fromIso, -14);
  const raw = rawOccurrences(rule, scanFrom, count + 6);
  const seen = new Set<string>();
  const out: Occurrence[] = [];
  for (const original of raw) {
    const exception = mine.find(e => e.originalDate === original);
    if (exception && exception.kind === 'skip') {
      continue;
    }
    const date =
      exception && exception.kind === 'move' && exception.replacementDate
        ? exception.replacementDate
        : original;
    if (compareISO(date, fromIso) < 0 || seen.has(date)) {
      continue;
    }
    seen.add(date);
    out.push({ binId: rule.binId, date, moved: Boolean(exception) });
  }
  out.sort((a, b) => compareISO(a.date, b.date));
  return out.slice(0, count);
}

export function nextDatesForBin(
  rule: CollectionRule | undefined,
  exceptions: CollectionException[],
  fromIso: string,
  count: number,
): string[] {
  if (!rule) {
    return [];
  }
  return occurrencesForBin(rule, exceptions, fromIso, count).map(o => o.date);
}

/** Flattened upcoming occurrences of every enabled, scheduled bin. */
export function upcomingOccurrences(
  bins: Bin[],
  rules: CollectionRule[],
  exceptions: CollectionException[],
  fromIso: string,
  perBin: number,
): Occurrence[] {
  const out: Occurrence[] = [];
  for (const bin of bins) {
    if (!bin.enabled) {
      continue;
    }
    const rule = rules.find(r => r.binId === bin.id);
    if (!rule) {
      continue;
    }
    out.push(...occurrencesForBin(rule, exceptions, fromIso, perBin));
  }
  out.sort((a, b) => compareISO(a.date, b.date));
  return out;
}

/** Bins due on the same local date, grouped — one group becomes one reminder. */
export function groupOccurrences(occurrences: Occurrence[]): CollectionGroup[] {
  const map = new Map<string, string[]>();
  for (const o of occurrences) {
    const list = map.get(o.date) || [];
    if (!list.includes(o.binId)) {
      list.push(o.binId);
    }
    map.set(o.date, list);
  }
  return Array.from(map.entries())
    .map(([date, binIds]) => ({ date, binIds }))
    .sort((a, b) => compareISO(a.date, b.date));
}

export function groupsInWeek(
  groups: CollectionGroup[],
  mondayIso: string,
): CollectionGroup[] {
  const sunday = addDaysISO(mondayIso, 6);
  return groups.filter(
    g => compareISO(g.date, mondayIso) >= 0 && compareISO(g.date, sunday) <= 0,
  );
}

/** Evening-before reminder moment for a collection date. */
export function reminderLabel(
  dateIso: string,
  hour: number,
  minute: number,
): string {
  const eve = addDaysISO(dateIso, -1);
  return `${weekdayName(eve)} ${formatShort(eve).slice(4)} at ${pad(hour)}:${pad(minute)}`;
}

export function formatTime(hour: number, minute: number): string {
  return `${pad(hour)}:${pad(minute)}`;
}
