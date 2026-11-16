import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CalendarDays, Search, Settings, Trash2 } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { HIT_SLOP, TAB_BAR_HEIGHT, TOUCH_MIN } from '../constants/config';
import { theme } from '../constants/theme';
import type { TabKey } from '../types';

type TabSpec = { key: TabKey; label: string; Icon: LucideIcon };

const TABS: TabSpec[] = [
  { key: 'menu', label: 'This Week', Icon: CalendarDays },
  { key: 'game', label: 'Bins', Icon: Trash2 },
  { key: 'sortGuide', label: 'Sort Guide', Icon: Search },
  { key: 'settings', label: 'Settings', Icon: Settings },
];

type ItemProps = {
  spec: TabSpec;
  selected: boolean;
  onSelect: (key: TabKey) => void;
};

const TabItem = memo(function TabItem({ spec, selected, onSelect }: ItemProps) {
  const { Icon, label, key } = spec;
  const handlePress = useCallback(() => onSelect(key), [onSelect, key]);
  const tint = selected ? theme.colors.action.primary : theme.colors.text.muted;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      hitSlop={HIT_SLOP}
      onPress={handlePress}
      style={styles.item}>
      <View
        style={[
          styles.iconWrap,
          selected ? styles.iconWrapSelected : null,
        ]}>
        <Icon size={24} color={tint} strokeWidth={selected ? 2 : 1.5} />
      </View>
      <Text style={[styles.label, { color: tint }]} numberOfLines={1}>
        {label}
      </Text>
      {selected ? <View style={styles.marker} /> : null}
    </Pressable>
  );
});

type Props = { selected: TabKey; onSelect: (key: TabKey) => void };

function BottomTabsBase({ selected, onSelect }: Props) {
  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {TABS.map(spec => (
        <TabItem
          key={spec.key}
          spec={spec}
          selected={spec.key === selected}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.ui.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.ui.divider,
    paddingHorizontal: theme.spacing.sm,
  },
  item: {
    flex: 1,
    minWidth: TOUCH_MIN,
    height: TAB_BAR_HEIGHT - 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconWrap: {
    width: 44,
    height: 28,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapSelected: { backgroundColor: theme.colors.eco.paleGreen },
  label: { ...theme.typography.caption },
  marker: {
    position: 'absolute',
    bottom: 2,
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: theme.colors.action.primary,
  },
});

export const BottomTabs = memo(BottomTabsBase);
