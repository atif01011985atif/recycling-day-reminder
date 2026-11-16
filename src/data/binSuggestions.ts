import type { MaterialCategory } from '../types';

export type BinSuggestion = {
  key: string;
  name: string;
  category: MaterialCategory;
  colour: string;
  spriteIndex: number;
  blurb: string;
};

/**
 * Optional starter definitions. They create no records and no reminders
 * until the household picks one and saves its collection days.
 */
export const BIN_SUGGESTIONS: BinSuggestion[] = [
  { key: 's-paper', name: 'Paper', category: 'paper', colour: '#4A90E2', spriteIndex: 0, blurb: 'Newspaper, boxes, clean paper' },
  { key: 's-mixed', name: 'Mixed recycling', category: 'recycling', colour: '#3228E0', spriteIndex: 1, blurb: 'Bottles, cans, cartons' },
  { key: 's-food', name: 'Food waste', category: 'food', colour: '#A4AB2A', spriteIndex: 2, blurb: 'Peelings, cores, leftovers' },
  { key: 's-glass', name: 'Glass', category: 'glass', colour: '#7FE8C5', spriteIndex: 3, blurb: 'Jars and packaging glass' },
  { key: 's-general', name: 'General waste', category: 'general', colour: '#242418', spriteIndex: 4, blurb: 'Everything else at home' },
];
