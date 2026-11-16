import React, { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import { DUR_BASE } from '../constants/config';
import { theme } from '../constants/theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

type Props = { message: string; size?: number };

/**
 * The mandatory save animation: a vector check reveal after a real write.
 * Opacity and scale only, so the native driver is safe.
 */
function SaveFeedbackBase({ message, size = 56 }: Props) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) {
      progress.setValue(1);
      return;
    }
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: DUR_BASE,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [reduced, progress]);

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.86, 1],
  });

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}
      style={[styles.wrap, { opacity: progress, transform: [{ scale }] }]}>
      <Animated.View
        style={[
          styles.disc,
          { width: size, height: size, borderRadius: size / 2 },
        ]}>
        <Check
          size={size * 0.5}
          color={theme.colors.text.primary}
          strokeWidth={2.6}
        />
      </Animated.View>
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: theme.spacing.md },
  disc: {
    backgroundColor: theme.colors.eco.paleGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.eco.olive,
  },
  message: {
    ...theme.typography.heading,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
});

export const SaveFeedback = memo(SaveFeedbackBase);
