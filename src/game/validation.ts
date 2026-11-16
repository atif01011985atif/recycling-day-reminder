import {
  BIN_NAME_MAX,
  BIN_NAME_MIN,
  INTERVAL_MAX,
  INTERVAL_MIN,
  ANCHOR_RANGE_DAYS,
} from '../constants/config';
import { addDaysISO, compareISO, todayISO } from './collectionLogic';
import type { Bin } from '../types';

export type ValidationResult = { ok: boolean; message?: string };

export function validateBinName(
  raw: string,
  existing: Bin[],
  selfId?: string,
): ValidationResult {
  const name = raw.trim();
  if (name.length < BIN_NAME_MIN) {
    return { ok: false, message: 'Give the bin a name so you can recognise it.' };
  }
  if (name.length > BIN_NAME_MAX) {
    return { ok: false, message: `Use at most ${BIN_NAME_MAX} characters.` };
  }
  const clash = existing.some(
    b => b.id !== selfId && b.name.trim().toLowerCase() === name.toLowerCase(),
  );
  if (clash) {
    return { ok: false, message: 'You already have a bin with this name.' };
  }
  return { ok: true };
}

export function validateInterval(weeks: number): ValidationResult {
  if (!Number.isInteger(weeks) || weeks < INTERVAL_MIN || weeks > INTERVAL_MAX) {
    return {
      ok: false,
      message: `Choose between ${INTERVAL_MIN} and ${INTERVAL_MAX} weeks.`,
    };
  }
  return { ok: true };
}

export function validateAnchorDate(iso: string): ValidationResult {
  const today = todayISO();
  const latest = addDaysISO(today, ANCHOR_RANGE_DAYS);
  if (compareISO(iso, today) < 0) {
    return { ok: false, message: 'Pick today or a later collection day.' };
  }
  if (compareISO(iso, latest) > 0) {
    return { ok: false, message: 'Pick a day within the next 366 days.' };
  }
  return { ok: true };
}
