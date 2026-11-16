import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Pencil } from 'lucide-react-native';
import { HIT_SLOP } from '../constants/config';
import { theme } from '../constants/theme';
import { formatFull, relativeLabel } from '../game/collectionLogic';
import { CATEGORY_LABELS } from '../data/sortingGuide';
import { BinBadge } from './BinBadge';
import { IconButton } from './IconButton';
import type { Bin } from '../types';

type Props = {
  bin: Bin;
  date: string;
  today: string;
  onEdit: (binId: string) => void;
};

/** One bin due on one date. The edit control keeps its own 48 dp target. */
function CollectionRowBase({ bin, date, today, onEdit }: Props) {
  const handleEdit = useCallback(() => onEdit(bin.id), [onEdit, bin.id]);

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${bin.name}, ${formatFull(date)}`}
        hitSlop={HIT_SLOP}
        onPress={handleEdit}
        style={styles.main}>
        <BinBadge category={bin.category} colour={bin.colour} size={40} />
        <View style={styles.text}>
          <Text style={styles.name} numberOfLines={1}>
            {bin.name}
          </Text>
          <Text style={styles.date} numberOfLines={1}>
            {formatFull(date)}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {`${relativeLabel(date, today)} · ${CATEGORY_LABELS[bin.category]}`}
          </Text>
        </View>
      </Pressable>
      <IconButton
        Icon={Pencil}
        label={`Edit collection days for ${bin.name}`}
        onPress={handleEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.ui.surface,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    ...theme.shadows.card,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    minHeight: 60,
  },
  text: { flex: 1 },
  name: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  date: {
    ...theme.typography.helper,
    color: theme.colors.text.secondary,
    marginTop: 1,
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.text.muted,
    marginTop: 1,
  },
});

export const CollectionRow = memo(CollectionRowBase);
