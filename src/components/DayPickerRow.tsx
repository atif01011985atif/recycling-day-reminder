import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { HIT_SLOP } from '../constants/config';
import { theme } from '../constants/theme';
import { addDaysISO, formatFull, fromISO, todayISO } from '../game/collectionLogic';

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type DayCell = { iso: string; weekday: string; dayNumber: string };

type CellProps = {
  cell: DayCell;
  selected: boolean;
  onSelect: (iso: string) => void;
};

const DayCellView = memo(function DayCellView({
  cell,
  selected,
  onSelect,
}: CellProps) {
  const handlePress = useCallback(
    () => onSelect(cell.iso),
    [onSelect, cell.iso],
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={formatFull(cell.iso)}
      accessibilityState={{ selected }}
      hitSlop={HIT_SLOP}
      onPress={handlePress}
      style={[styles.cell, selected ? styles.cellSelected : null]}>
      <Text
        style={[styles.weekday, selected ? styles.textSelected : null]}
        numberOfLines={1}>
        {cell.weekday}
      </Text>
      <Text
        style={[styles.dayNumber, selected ? styles.textSelected : null]}
        numberOfLines={1}>
        {cell.dayNumber}
      </Text>
    </Pressable>
  );
});

type Props = {
  value: string;
  onChange: (iso: string) => void;
  error?: string;
  days?: number;
};

/**
 * Bounded horizontal day chooser for the next collection date.
 * Each cell is a 56 dp control, well above the minimum touch target.
 */
function DayPickerRowBase({ value, onChange, error, days = 21 }: Props) {
  const cells = useMemo<DayCell[]>(() => {
    const start = todayISO();
    return Array.from({ length: days }, (_, i) => {
      const iso = addDaysISO(start, i);
      const date = fromISO(iso);
      return {
        iso,
        weekday: WEEKDAYS_SHORT[date.getDay()],
        dayNumber: String(date.getDate()),
      };
    });
  }, [days]);

  const renderItem = useCallback(
    ({ item }: { item: DayCell }) => (
      <DayCellView
        cell={item}
        selected={item.iso === value}
        onSelect={onChange}
      />
    ),
    [value, onChange],
  );

  const keyExtractor = useCallback((item: DayCell) => item.iso, []);

  return (
    <View>
      <Text style={styles.label}>Next collection date</Text>
      <View style={styles.strip}>
        <FlatList
          horizontal
          data={cells}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          initialNumToRender={8}
          windowSize={5}
        />
      </View>
      <Text style={styles.selected} numberOfLines={1}>
        {formatFull(value)}
      </Text>
      {error ? (
        <View style={styles.errorRow}>
          <AlertCircle size={18} color={theme.colors.text.primary} strokeWidth={2} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
    marginBottom: theme.spacing.sm,
  },
  strip: { height: 72, justifyContent: 'center' },
  listContent: { gap: theme.spacing.sm, paddingRight: theme.spacing.sm },
  cell: {
    width: 56,
    height: 64,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.bg.primary,
    borderWidth: 1,
    borderColor: theme.colors.ui.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  cellSelected: {
    backgroundColor: theme.colors.action.primary,
    borderColor: theme.colors.action.primary,
  },
  weekday: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: theme.colors.text.muted,
  },
  dayNumber: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    color: theme.colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  textSelected: { color: theme.colors.action.onPrimary },
  selected: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    fontWeight: '600',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.helper,
    color: theme.colors.text.primary,
    flex: 1,
  },
});

export const DayPickerRow = memo(DayPickerRowBase);
