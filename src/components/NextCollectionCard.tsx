import React, { memo, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { binSprites } from '../assets';
import { HIT_SLOP, PRESS_SPRING } from '../constants/config';
import { theme } from '../constants/theme';
import { formatFull, relativeLabel } from '../game/collectionLogic';
import type { Bin } from '../types';

type Props = {
  date: string;
  today: string;
  bins: Bin[];
  extraCount: number;
  onOpen: () => void;
};

/** Olive hero card for the nearest real collection. Dark text on olive. */
function NextCollectionCardBase({
  date,
  today,
  bins,
  extraCount,
  onOpen,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const leadSprite = binSprites[bins[0] ? bins[0].spriteIndex % 5 : 0];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Next collection ${relativeLabel(
        date,
        today,
      )}, ${formatFull(date)}`}
      hitSlop={HIT_SLOP}
      onPress={onOpen}
      onPressIn={() =>
        Animated.spring(scale, {
          toValue: 0.985,
          ...PRESS_SPRING,
          useNativeDriver: true,
        }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, {
          toValue: 1,
          ...PRESS_SPRING,
          useNativeDriver: true,
        }).start()
      }
      style={styles.press}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.scaler, { transform: [{ scale }] }]}>
        <LinearGradient
          colors={theme.gradients.oliveCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}>
          <Text style={styles.eyebrow}>NEXT COLLECTION</Text>
          <Text style={styles.day} numberOfLines={1}>
            {relativeLabel(date, today)}
          </Text>
          <Text style={styles.full} numberOfLines={1}>
            {formatFull(date)}
          </Text>
          <View style={styles.badges}>
            {bins.slice(0, 2).map(bin => (
              <View key={bin.id} style={styles.badge}>
                <View style={[styles.dot, { backgroundColor: bin.colour }]} />
                <Text style={styles.badgeText} numberOfLines={1}>
                  {bin.name}
                </Text>
              </View>
            ))}
            {extraCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{`+${extraCount} more`}</Text>
              </View>
            ) : null}
          </View>
          <Image source={leadSprite} style={styles.sprite} />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%' },
  scaler: {
    width: '100%',
    borderRadius: theme.radius.hero,
    overflow: 'hidden',
    ...theme.shadows.raised,
  },
  fill: {
    width: '100%',
    minHeight: 164,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  eyebrow: {
    ...theme.typography.eyebrow,
    color: theme.colors.text.onOlive,
    opacity: 0.8,
  },
  day: {
    ...theme.typography.hero,
    color: theme.colors.text.onOlive,
    marginTop: 2,
  },
  full: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingRight: 86,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    height: 30,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(246,246,237,0.8)',
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  badgeText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    maxWidth: 120,
  },
  sprite: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 76,
    height: 76,
    resizeMode: 'contain',
    opacity: 0.95,
  },
});

export const NextCollectionCard = memo(NextCollectionCardBase);
