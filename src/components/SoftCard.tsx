import React, { memo } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { theme } from '../constants/theme';

type Props = {
  children: React.ReactNode;
  tint?: string;
  borderColour?: string;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** Raised light surface — the one card treatment used everywhere. */
function SoftCardBase({
  children,
  tint,
  borderColour,
  radius = theme.radius.card,
  style,
  accessibilityLabel,
}: Props) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.card,
        {
          backgroundColor: tint || theme.colors.ui.surface,
          borderColor: borderColour || theme.colors.ui.border,
          borderRadius: radius,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    borderWidth: 1,
    ...theme.shadows.card,
  },
});

export const SoftCard = memo(SoftCardBase);
