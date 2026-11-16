import React, { memo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { HIT_SLOP, PRESS_SPRING } from '../constants/config';
import { theme } from '../constants/theme';

type Props = {
  Icon: LucideIcon;
  title: string;
  value: string;
  caption: string;
  valueColour?: string;
  onPress?: () => void;
  minHeight?: number;
};

/**
 * Bento summary tile. Every tile in a row shares this one component,
 * so geometry stays identical and only the colour and text differ.
 * Callers render nothing at all rather than an empty tile.
 */
function SummaryTileBase({
  Icon,
  title,
  value,
  caption,
  valueColour = theme.colors.action.primary,
  onPress,
  minHeight = 96,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
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

  const body = (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.card,
        { minHeight, transform: [{ scale: onPress ? scale : 1 }] },
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: valueColour + '1A' }]}>
        <Icon size={22} color={valueColour} strokeWidth={1.8} />
      </View>
      <Text style={[styles.value, { color: valueColour }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.caption} numberOfLines={2}>
        {caption}
      </Text>
    </Animated.View>
  );

  if (!onPress) {
    return <View style={styles.slot}>{body}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${value}. ${caption}`}
      hitSlop={HIT_SLOP}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={styles.slot}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1 },
  card: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.ui.surface,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    ...theme.shadows.card,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  value: { fontSize: 22, lineHeight: 28, fontWeight: '800' },
  title: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    marginTop: 2,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.text.muted,
    marginTop: 2,
  },
});

export const SummaryTile = memo(SummaryTileBase);
