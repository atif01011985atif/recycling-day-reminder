import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Apple, Newspaper, Recycle, Trash2, Wine, Zap } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { onSwatch, theme } from '../constants/theme';
import type { MaterialCategory } from '../types';

export const CATEGORY_ICONS: Record<MaterialCategory, LucideIcon> = {
  paper: Newspaper,
  recycling: Recycle,
  food: Apple,
  glass: Wine,
  general: Trash2,
  special: Zap,
};

type Props = {
  category: MaterialCategory;
  colour: string;
  size?: 40 | 44 | 56;
};

/**
 * Vector bin marker. The bin name is always rendered next to it,
 * so colour alone never carries the meaning.
 */
function BinBadgeBase({ category, colour, size = 44 }: Props) {
  const Icon = CATEGORY_ICONS[category];
  const iconSize = size === 56 ? 28 : 22;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 3.2,
          backgroundColor: colour,
          borderColor: theme.colors.ui.borderStrong,
        },
      ]}>
      <Icon size={iconSize} color={onSwatch(colour)} strokeWidth={1.8} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

export const BinBadge = memo(BinBadgeBase);
