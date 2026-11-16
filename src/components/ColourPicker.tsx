import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { HIT_SLOP, TOUCH_MIN } from '../constants/config';
import { BIN_COLOURS, onSwatch, theme } from '../constants/theme';

type SwatchProps = {
  value: string;
  label: string;
  selected: boolean;
  onSelect: (value: string) => void;
};

const Swatch = memo(function Swatch({
  value,
  label,
  selected,
  onSelect,
}: SwatchProps) {
  const handlePress = useCallback(() => onSelect(value), [onSelect, value]);
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      hitSlop={HIT_SLOP}
      onPress={handlePress}
      style={styles.swatchSlot}>
      <View
        style={[
          styles.swatch,
          {
            backgroundColor: value,
            borderColor: selected
              ? theme.colors.action.primary
              : theme.colors.ui.borderStrong,
            borderWidth: selected ? 3 : 1,
          },
        ]}>
        {selected ? (
          <Check size={20} color={onSwatch(value)} strokeWidth={2.6} />
        ) : null}
      </View>
    </Pressable>
  );
});

type Props = { value: string; onChange: (colour: string) => void };

/** Seven user-chosen bin colours. These are labels, not local-service claims. */
function ColourPickerBase({ value, onChange }: Props) {
  const current = BIN_COLOURS.find(c => c.value === value);
  return (
    <View>
      <Text style={styles.label}>Bin colour</Text>
      <View style={styles.grid}>
        {BIN_COLOURS.map(colour => (
          <Swatch
            key={colour.value}
            value={colour.value}
            label={colour.label}
            selected={colour.value === value}
            onSelect={onChange}
          />
        ))}
      </View>
      <Text style={styles.selected}>
        {`Selected: ${current ? current.label : 'none'}`}
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  swatchSlot: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    ...theme.typography.helper,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
});

export const ColourPicker = memo(ColourPickerBase);
