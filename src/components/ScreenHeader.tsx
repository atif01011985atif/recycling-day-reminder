import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { H_PADDING, HEADER_HEIGHT, HEADER_TOP_INSET } from '../constants/config';
import { theme } from '../constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

/**
 * The one header used by every screen. Screens differ only through
 * leftSlot / title / subtitle / rightSlot, never through their own markup.
 */
function ScreenHeaderBase({ title, subtitle, leftSlot, rightSlot }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {leftSlot ? <View style={styles.side}>{leftSlot}</View> : null}
        <View style={styles.titles}>
          <Text
            accessibilityRole="header"
            style={styles.title}
            numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightSlot ? <View style={styles.side}>{rightSlot}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: HEADER_TOP_INSET,
    paddingHorizontal: H_PADDING,
    backgroundColor: 'rgba(246,246,237,0.72)',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.ui.border,
  },
  row: {
    minHeight: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  side: { justifyContent: 'center' },
  titles: { flex: 1, justifyContent: 'center' },
  title: {
    ...theme.typography.heading,
    color: theme.colors.text.primary,
  },
  subtitle: {
    ...theme.typography.helper,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
});

export const ScreenHeader = memo(ScreenHeaderBase);
