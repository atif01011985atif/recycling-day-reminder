import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { BrandMark } from '../components/EcoBackground';
import { AppShell } from '../components/AppShell';
import { APP_TITLE, DUR_BASE, LOADER_DURATION_MS } from '../constants/config';
import { theme } from '../constants/theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

type Props = { onDone: () => void };

const TRACK_W = 160;

/**
 * Dark branded splash. Deliberately unlike every product screen:
 * no cards, no chips, no actions — only the brand tile and a progress bar.
 */
export function LoaderScreen({ onDone }: Props) {
  const reduced = useReducedMotion();
  const entry = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (reduced) {
      entry.setValue(1);
    } else {
      Animated.timing(entry, {
        toValue: 1,
        duration: DUR_BASE,
        useNativeDriver: true,
      }).start();
    }
    // Width cannot run on the native driver — this one stays on the JS driver.
    const bar = Animated.timing(progress, {
      toValue: 1,
      duration: LOADER_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    bar.start();
    const timer = setTimeout(() => done.current(), LOADER_DURATION_MS);
    return () => {
      clearTimeout(timer);
      bar.stop();
    };
  }, [entry, progress, reduced]);

  const scale = entry.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });
  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TRACK_W],
  });

  return (
    <AppShell variant="loader">
      <View style={styles.center}>
        <Animated.View
          pointerEvents="none"
          style={[styles.tile, { opacity: entry, transform: [{ scale }] }]}>
          <BrandMark size={88} />
        </Animated.View>
        <Animated.Text style={[styles.brand, { opacity: entry }]}>
          {APP_TITLE}
        </Animated.Text>
        <Text style={styles.tagline}>A little nudge for a greener home.</Text>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { width: fillWidth }]} />
        </View>
        <Text style={styles.loading}>Loading your bins</Text>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  tile: {
    width: 112,
    height: 112,
    borderRadius: 28,
    backgroundColor: theme.colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: theme.spacing.xxl,
  },
  brand: {
    ...theme.typography.brand,
    color: theme.colors.text.inverse,
    textAlign: 'center',
  },
  tagline: {
    ...theme.typography.body,
    color: theme.colors.eco.paleGreen,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  track: {
    width: TRACK_W,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(246,246,237,0.2)',
    marginTop: 44,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.eco.paleGreen,
  },
  loading: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 1.2,
    fontWeight: '600',
    color: 'rgba(246,246,237,0.75)',
    marginTop: theme.spacing.lg,
  },
});
