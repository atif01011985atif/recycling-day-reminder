import React, { memo, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { INTERVAL_MAX, INTERVAL_MIN } from '../constants/config';
import { theme } from '../constants/theme';
import { IconButton } from './IconButton';

type Props = { value: number; onChange: (next: number) => void };

/** Repeat interval control. Bounds are explained in words, never hidden. */
function WeekStepperBase({ value, onChange }: Props) {
  const decrease = useCallback(
    () => onChange(Math.max(INTERVAL_MIN, value - 1)),
    [onChange, value],
  );
  const increase = useCallback(
    () => onChange(Math.min(INTERVAL_MAX, value + 1)),
    [onChange, value],
  );

  return (
    <View>
      <Text style={styles.label}>Repeats every</Text>
      <View style={styles.row}>
        <IconButton
          Icon={Minus}
          label="Fewer weeks between collections"
          onPress={decrease}
          disabled={value <= INTERVAL_MIN}
        />
        <View style={styles.readout}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.unit}>{value === 1 ? 'week' : 'weeks'}</Text>
        </View>
        <IconButton
          Icon={Plus}
          label="More weeks between collections"
          onPress={increase}
          disabled={value >= INTERVAL_MAX}
        />
      </View>
      <Text style={styles.bounds}>
        {`Supported range is ${INTERVAL_MIN} to ${INTERVAL_MAX} weeks.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  readout: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  value: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: theme.colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  unit: { ...theme.typography.body, color: theme.colors.text.secondary },
  bounds: {
    ...theme.typography.helper,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.md,
  },
});

export const WeekStepper = memo(WeekStepperBase);
