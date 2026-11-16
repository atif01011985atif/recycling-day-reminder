import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { HIT_SLOP, TOUCH_MIN } from '../constants/config';
import { theme } from '../constants/theme';
import { formatShort } from '../game/collectionLogic';
import { CATEGORY_LABELS } from '../data/sortingGuide';
import { BinBadge } from './BinBadge';
import type { MaterialCategory } from '../types';

type Props = {
  id: string;
  name: string;
  category: MaterialCategory;
  colour: string;
  nextDate: string | null;
  enabled: boolean;
  suggestion: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
  onToggle?: (id: string) => void;
};

/**
 * One row of the Bins list. Suggestions are labelled and carry no switch,
 * because they are not saved records yet.
 */
function BinCardBase({
  id,
  name,
  category,
  colour,
  nextDate,
  enabled,
  suggestion,
  selected,
  onSelect,
  onToggle,
}: Props) {
  const handleSelect = useCallback(() => onSelect(id), [onSelect, id]);
  const handleToggle = useCallback(() => onToggle?.(id), [onToggle, id]);

  const status = suggestion
    ? 'Suggestion'
    : !enabled
    ? 'Paused'
    : nextDate
    ? `Next ${formatShort(nextDate)}`
    : 'No schedule yet';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${CATEGORY_LABELS[category]}, ${status}`}
      accessibilityState={{ selected }}
      hitSlop={HIT_SLOP}
      onPress={handleSelect}
      style={[styles.card, selected ? styles.cardSelected : null]}>
      <BinBadge category={category} colour={colour} size={44} />
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {CATEGORY_LABELS[category]}
        </Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: suggestion
                  ? theme.colors.bg.tertiary
                  : nextDate && enabled
                  ? theme.colors.eco.paleGreen
                  : theme.colors.bg.accent,
              },
            ]}>
            <Text style={styles.statusText} numberOfLines={1}>
              {status}
            </Text>
          </View>
        </View>
      </View>
      {suggestion ? (
        <View style={styles.selectMark}>
          {selected ? (
            <Check size={24} color={theme.colors.action.primary} strokeWidth={2.4} />
          ) : null}
        </View>
      ) : (
        <View
          style={styles.switchWrap}
          accessibilityLabel={`${name} enabled`}>
          <Switch
            value={enabled}
            onValueChange={handleToggle}
            thumbColor={enabled ? theme.colors.action.primary : '#FAFAFA'}
            trackColor={{
              false: theme.colors.bg.accent,
              true: theme.colors.eco.paleGreen,
            }}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.ui.surface,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    ...theme.shadows.card,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: theme.colors.action.primary,
    backgroundColor: '#FBFBF4',
  },
  text: { flex: 1 },
  name: {
    ...theme.typography.cardTitle,
    color: theme.colors.text.primary,
  },
  category: {
    ...theme.typography.helper,
    color: theme.colors.text.secondary,
    marginTop: 1,
  },
  statusRow: { flexDirection: 'row', marginTop: theme.spacing.sm },
  statusPill: {
    paddingHorizontal: theme.spacing.md,
    height: 26,
    borderRadius: theme.radius.pill,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  switchWrap: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectMark: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const BinCard = memo(BinCardBase);
