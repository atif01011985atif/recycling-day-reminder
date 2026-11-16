import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { DUR_BASE } from '../constants/config';

/**
 * Entrance fade + small vertical travel.
 * Opacity and transform only, so the native driver is safe.
 */
export function useFadeIn(delay = 0, reduced = false) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    if (reduced) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
    const anim = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: DUR_BASE,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: DUR_BASE,
        delay,
        useNativeDriver: true,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [delay, reduced, opacity, translateY]);

  return { opacity, transform: [{ translateY }] };
}
