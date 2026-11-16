import React, { memo, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { HIT_SLOP, PRESS_SPRING, TOUCH_MIN } from '../constants/config';
import { theme } from '../constants/theme';

type Props = {
  Icon: LucideIcon;
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  tone?: 'surface' | 'ghost' | 'accent';
};

/** Fixed 48 x 48 dp control. Never a bare glyph as the whole hit target. */
function IconButtonBase({
  Icon,
  label,
  onPress,
  selected = false,
  disabled = false,
  tone = 'surface',
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    if (disabled) {
      return;
    }
    Animated.spring(scale, {
      toValue: 0.94,
      ...PRESS_SPRING,
      useNativeDriver: true,
    }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      ...PRESS_SPRING,
      useNativeDriver: true,
    }).start();
  };

  const background =
    tone === 'ghost'
      ? 'transparent'
      : tone === 'accent'
      ? theme.colors.action.primary
      : theme.colors.ui.surface;
  const iconColour =
    tone === 'accent'
      ? theme.colors.action.onPrimary
      : theme.colors.text.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected }}
      hitSlop={HIT_SLOP}
      disabled={disabled}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={[styles.press, { opacity: disabled ? 0.45 : 1 }]}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.fill,
          {
            transform: [{ scale }],
            backgroundColor: background,
            borderColor: selected
              ? theme.colors.action.primary
              : theme.colors.ui.borderStrong,
            borderWidth: selected ? 2 : 1,
          },
        ]}>
        <Icon size={24} color={iconColour} strokeWidth={1.5} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    borderRadius: theme.radius.control,
  },
  fill: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    borderRadius: theme.radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const IconButton = memo(IconButtonBase);
