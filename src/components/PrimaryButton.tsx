import React, { memo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { HIT_SLOP, PRESS_SPRING, PRIMARY_BUTTON_H } from '../constants/config';
import { theme } from '../constants/theme';

type Props = {
  label: string;
  onPress: () => void;
  Icon?: LucideIcon;
  disabled?: boolean;
  busy?: boolean;
  accessibilityLabel?: string;
};

/**
 * 56 dp violet action.
 * The Pressable is the parent and the Animated.View scales inside it,
 * so the press target never moves and onPress always fires on Android.
 */
function PrimaryButtonBase({
  label,
  onPress,
  Icon,
  disabled = false,
  busy = false,
  accessibilityLabel,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const inactive = disabled || busy;

  const pressIn = () => {
    if (inactive) {
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
      accessibilityState={{ disabled: inactive, busy }}
      hitSlop={HIT_SLOP}
      disabled={inactive}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={[styles.press, { opacity: inactive ? 0.55 : 1 }]}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.scaler, { transform: [{ scale }] }]}>
        <LinearGradient
          colors={theme.gradients.primaryButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}>
          <View style={styles.row}>
            {Icon ? (
              <Icon
                size={24}
                color={theme.colors.action.onPrimary}
                strokeWidth={1.8}
              />
            ) : null}
            <Text style={styles.label} numberOfLines={1}>
              {busy ? 'Saving' : label}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
    height: PRIMARY_BUTTON_H,
    borderRadius: theme.radius.control,
    ...theme.shadows.action,
  },
  scaler: {
    width: '100%',
    height: PRIMARY_BUTTON_H,
    borderRadius: theme.radius.control,
    overflow: 'hidden',
    backgroundColor: theme.colors.text.primary,
  },
  fill: {
    width: '100%',
    height: '100%',
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
    ...theme.typography.button,
    lineHeight: 24,
    color: theme.colors.action.onPrimary,
  },
});

export const PrimaryButton = memo(PrimaryButtonBase);
