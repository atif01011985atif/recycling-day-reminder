import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HIT_SLOP } from '../constants/config';
import { theme } from '../constants/theme';
import { CATEGORY_LABELS, CATEGORY_TINTS } from '../data/sortingGuide';
import { CATEGORY_ICONS } from './BinBadge';
import type { GuideEntry } from '../types';

type Props = {
  entry: GuideEntry;
  destinationLabel: string | null;
  destinationColour: string | null;
  overridden: boolean;
  onOpen: (key: string) => void;
};

/** 88 dp minimum result card. Category colour is always paired with its label. */
function GuideItemCardBase({
  entry,
  destinationLabel,
  destinationColour,
  overridden,
  onOpen,
}: Props) {
  const handlePress = useCallback(() => onOpen(entry.key), [onOpen, entry.key]);
  const tint = CATEGORY_TINTS[entry.category];
  const Icon = CATEGORY_ICONS[entry.category];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${entry.name}, suggested category ${
        CATEGORY_LABELS[entry.category]
      }`}
      hitSlop={HIT_SLOP}
      onPress={handlePress}
      style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: tint + '1F' }]}>
        <Icon size={22} color={tint} strokeWidth={1.8} />
      </View>
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {entry.name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {CATEGORY_LABELS[entry.category]}
        </Text>
        <Text style={styles.hint} numberOfLines={2}>
          {entry.hint}
        </Text>
        {destinationLabel ? (
          <View style={styles.destination}>
            <View
              style={[
                styles.dot,
                { backgroundColor: destinationColour || theme.colors.bg.accent },
              ]}
            />
            <Text style={styles.destinationText} numberOfLines={1}>
              {overridden
                ? `Your household rule: ${destinationLabel}`
                : destinationLabel}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.ui.surface,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    ...theme.shadows.card,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  name: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  category: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 1,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.xs,
  },
  destination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  destinationText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    flex: 1,
  },
});

export const GuideItemCard = memo(GuideItemCardBase);
