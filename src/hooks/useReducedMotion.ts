import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Honours the system "remove animations" preference. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(value => {
        if (mounted.current) {
          setReduced(Boolean(value));
        }
      })
      .catch(() => {
        /* preference unavailable — keep the default motion */
      });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      value => {
        if (mounted.current) {
          setReduced(Boolean(value));
        }
      },
    );
    return () => {
      mounted.current = false;
      sub?.remove?.();
    };
  }, []);

  return reduced;
}
