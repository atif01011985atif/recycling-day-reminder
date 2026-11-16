import React, { memo, useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';
import { DUR_BASE, H_PADDING } from '../constants/config';
import { theme } from '../constants/theme';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { IconButton } from './IconButton';

type Props = {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
};

/** Shared sheet surface: 12 dp travel and opacity over 180 ms. */
function BottomSheetBase({
  visible,
  title,
  subtitle,
  onClose,
  children,
}: Props) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      progress.setValue(0);
      return;
    }
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
  }, [visible, reduced, progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.root}>
        <Pressable
          accessibilityLabel="Close"
          accessibilityRole="button"
          style={styles.scrim}
          onPress={onClose}
        />
        <Animated.View
          pointerEvents="box-none"
          style={[styles.sheet, { opacity: progress, transform: [{ translateY }] }]}>
          <View style={styles.grabber} />
          <View style={styles.head}>
            <View style={styles.headText}>
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
              {subtitle ? (
                <Text style={styles.subtitle} numberOfLines={2}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
            <IconButton Icon={X} label="Close" onPress={onClose} tone="ghost" />
          </View>
          <View style={styles.body}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.colors.ui.overlay },
  sheet: {
    backgroundColor: theme.colors.ui.surface,
    borderTopLeftRadius: theme.radius.hero,
    borderTopRightRadius: theme.radius.hero,
    paddingHorizontal: H_PADDING,
    paddingBottom: theme.spacing.xxl,
    paddingTop: theme.spacing.md,
    maxHeight: '86%',
    ...theme.shadows.raised,
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.bg.accent,
    marginBottom: theme.spacing.md,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  headText: { flex: 1 },
  title: { ...theme.typography.cardTitle, color: theme.colors.text.primary },
  subtitle: {
    ...theme.typography.helper,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  body: { gap: theme.spacing.lg },
});

export const BottomSheet = memo(BottomSheetBase);
