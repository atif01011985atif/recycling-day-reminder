import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell, BellOff } from 'lucide-react-native';
import { HIT_SLOP } from '../constants/config';
import { theme } from '../constants/theme';
import { formatTime } from '../game/collectionLogic';
import type { ReminderStatus } from '../types';

type Props = {
  status: ReminderStatus;
  hour: number;
  minute: number;
  nextEvening?: string;
  onPress?: () => void;
};

/**
 * Single source of reminder wording, shared by the dashboard, the schedule
 * editor, the saved result and Settings.
 */
function ReminderStatusRowBase({
  status,
  hour,
  minute,
  nextEvening,
  onPress,
}: Props) {
  const ready = status === 'ready';
  const Icon = ready ? Bell : BellOff;
  const tint = ready ? theme.colors.eco.olive : theme.colors.text.muted;
  const headline = ready
    ? `Evening reminder at ${formatTime(hour, minute)}`
    : 'Reminders are off';
  const detail = ready
    ? nextEvening
      ? `Next: ${nextEvening}, the evening before collection`
      : 'Set a collection day to get the first reminder'
    : 'Turn on evening reminders in Settings';

  const body = (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: tint + '1F' }]}>
        <Icon size={22} color={tint} strokeWidth={1.8} />
      </View>
      <View style={styles.text}>
        <Text style={styles.headline} numberOfLines={1}>
          {headline}
        </Text>
        <Text style={styles.detail} numberOfLines={2}>
          {detail}
        </Text>
      </View>
    </View>
  );

  if (!onPress) {
    return body;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${headline}. ${detail}`}
      hitSlop={HIT_SLOP}
      onPress={onPress}
      style={styles.press}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%', minHeight: 56, justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    minHeight: 56,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  headline: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  detail: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.text.muted,
    marginTop: 1,
  },
});

export const ReminderStatusRow = memo(ReminderStatusRowBase);
