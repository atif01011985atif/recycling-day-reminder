import React, { memo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import {
  HIT_SLOP,
  PRESS_SPRING,
  SECONDARY_BUTTON_H,
} from '../constants/config';
import { theme } from '../constants/theme';

type Props = {
  label: string;
  onPress: () => void;
  Icon?: LucideIcon;
  disabled?: boolean;
  tone?: 'default' | 'quiet';
  accessibilityLabel?: string;
};

/** 48 dp tinted action. Same press mechanics as PrimaryButton. */
function SecondaryButtonBase({
  label,
  onPress,
  Icon,
  disabled = false,
  tone = 'default',
  accessibilityLabel,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    if (disabled) {
      return;
    }
    Animated.spring(scale, {
      toValue: 0.98,
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

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled }}
      hitSlop={HIT_SLOP}
      disabled={disabled}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={[styles.press, { opacity: disabled ? 0.5 : 1 }]}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.fill,
          {
            transform: [{ scale }],
            backgroundColor:
              tone === 'quiet'
                ? theme.colors.bg.secondary
                : theme.colors.ui.tint,
          },
        ]}>
        <View style={styles.row}>
          {Icon ? (
            <Icon
              size={24}
              color={theme.colors.text.primary}
              strokeWidth={1.5}
            />
          ) : null}
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
    height: SECONDARY_BUTTON_H,
    borderRadius: theme.radius.control,
  },
  fill: {
    width: '100%',
    height: SECONDARY_BUTTON_H,
    borderRadius: theme.radius.control,
    borderWidth: 1,
    borderColor: theme.colors.ui.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: theme.colors.text.primary,
  },
});

export const SecondaryButton = memo(SecondaryButtonBase);
