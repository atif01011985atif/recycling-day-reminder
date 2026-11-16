import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarCheck } from 'lucide-react-native';
import { onSwatch, theme } from '../constants/theme';
import { formatFull } from '../game/collectionLogic';

type Props = {
  sentence: string;
  dates: string[];
  binName: string;
  binColour: string;
};

/** Identical preview on the schedule editor and the saved-result screen. */
function SchedulePreviewBase({ sentence, dates, binName, binColour }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View style={[styles.iconWrap, { backgroundColor: binColour + '22' }]}>
          <CalendarCheck size={22} color={theme.colors.eco.olive} strokeWidth={1.8} />
        </View>
        <View style={styles.headText}>
          <Text style={styles.title} numberOfLines={1}>
            Next collections
          </Text>
          <Text style={styles.sentence} numberOfLines={2}>
            {`${binName} · ${sentence}`}
          </Text>
        </View>
      </View>
      <View style={styles.list}>
        {dates.map((iso, index) => (
          <View key={iso} style={styles.dateRow}>
            <View style={[styles.index, { backgroundColor: binColour }]}>
              <Text style={[styles.indexText, { color: onSwatch(binColour) }]}>
              {index + 1}
            </Text>
            </View>
            <Text style={styles.date} numberOfLines={1}>
              {formatFull(iso)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing.md },
  head: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: { flex: 1 },
  title: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
  },
  sentence: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  list: { gap: theme.spacing.sm },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    minHeight: 40,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.bg.primary,
  },
  index: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  date: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    flex: 1,
    fontVariant: ['tabular-nums'],
  },
});

export const SchedulePreview = memo(SchedulePreviewBase);
