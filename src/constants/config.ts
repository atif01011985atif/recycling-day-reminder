import { Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export { SCREEN_W, SCREEN_H };

/** Splash duration. Must stay at 8000 — shorter races the screenshot window. */
export const LOADER_DURATION_MS = 8000;

export const HEADER_TOP_INSET = 44;
export const HEADER_HEIGHT = 72;
export const TAB_BAR_HEIGHT = 72;

export const H_PADDING = SCREEN_W < 360 ? 16 : 20;
export const CONTENT_MAX_W = Math.min(SCREEN_W - H_PADDING * 2, 840);

export const PRIMARY_BUTTON_H = 56;
export const SECONDARY_BUTTON_H = 48;
export const TOUCH_MIN = 48;

export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;

/** Recurrence bounds. */
export const INTERVAL_MIN = 1;
export const INTERVAL_MAX = 4;
export const INTERVAL_DEFAULT = 1;
export const MAX_BINS = 8;
export const BIN_NAME_MIN = 1;
export const BIN_NAME_MAX = 30;
export const ANCHOR_RANGE_DAYS = 366;
export const PREVIEW_COUNT = 3;
export const EXCEPTION_PICKER_COUNT = 12;

/** Reminder preferences. */
export const REMINDER_HOUR_MIN = 16;
export const REMINDER_HOUR_MAX = 23;
export const REMINDER_HOUR_DEFAULT = 19;
export const REMINDER_MINUTE_CHOICES = [0, 15, 30, 45];

/** Sort guide. */
export const SEARCH_DEBOUNCE_MS = 150;
export const SEARCH_MAX_CHARS = 80;
export const GUIDE_NOTE_MAX = 200;

/** Motion. */
export const DUR_FAST = 150;
export const DUR_BASE = 180;
export const STAGGER_MS = 20;
export const PRESS_SPRING = { tension: 180, friction: 20 } as const;

export const APP_VERSION = '1.0.0';
export const PACKAGE_ID = 'com.recyclingday.reminder';
export const APP_TITLE = 'Recycling Day Reminder';
