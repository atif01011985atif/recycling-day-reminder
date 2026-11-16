import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { HIT_SLOP } from '../constants/config';
import { theme } from '../constants/theme';
import { CATEGORY_LABELS, GUIDE_CATEGORIES } from '../data/sortingGuide';
import type { MaterialCategory } from '../types';

export type ChipValue = MaterialCategory | 'all';

type Chip = { value: ChipValue; label: string };

type ChipProps = {
  chip: Chip;
  selected: boolean;
  onSelect: (value: ChipValue) => void;
};

const ChipView = memo(function ChipView({
  chip,
  selected,
  onSelect,
}: ChipProps) {
  const handlePress = useCallback(
    () => onSelect(chip.value),
    [onSelect, chip.value],
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Filter by ${chip.label}`}
      accessibilityState={{ selected }}
      hitSlop={HIT_SLOP}
      onPress={handlePress}
      style={[styles.chip, selected ? styles.chipSelected : null]}>
      <Text
        style={[styles.text, selected ? styles.textSelected : null]}
        numberOfLines={1}>
        {chip.label}
      </Text>
    </Pressable>
  );
});

type Props = {
  value: ChipValue;
  onChange: (next: ChipValue) => void;
  includeAll?: boolean;
};

/** Bounded horizontal filter strip. Hit targets never shrink to fit. */
function CategoryChipsBase({ value, onChange, includeAll = true }: Props) {
  const chips = useMemo<Chip[]>(() => {
    const categories = GUIDE_CATEGORIES.map(c => ({
      value: c as ChipValue,
      label: CATEGORY_LABELS[c],
    }));
    return includeAll
      ? [{ value: 'all' as ChipValue, label: 'All' }, ...categories]
      : categories;
  }, [includeAll]);

  const renderItem = useCallback(
    ({ item }: { item: Chip }) => (
      <ChipView
        chip={item}
        selected={item.value === value}
        onSelect={onChange}
      />
    ),
    [value, onChange],
  );

  const keyExtractor = useCallback((item: Chip) => String(item.value), []);

  return (
    <FlatList
      horizontal
      data={chips}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsHorizontalScrollIndicator={false}
      style={styles.strip}
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  strip: { maxHeight: 56 },
  content: {
    gap: theme.spacing.sm,
    alignItems: 'center',
    paddingRight: theme.spacing.lg,
  },
  chip: {
    height: 48,
    minWidth: 64,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.ui.surface,
    borderWidth: 1,
    borderColor: theme.colors.ui.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: theme.colors.eco.paleGreen,
    borderColor: theme.colors.action.primary,
    borderWidth: 2,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: theme.colors.text.secondary,
  },
  textSelected: { color: theme.colors.text.primary },
});

export const CategoryChips = memo(CategoryChipsBase);
