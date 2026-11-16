import React, { memo } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { H_PADDING } from '../constants/config';
import { theme } from '../constants/theme';
import { BottomTabs } from './BottomTabs';
import { EcoBackground } from './EcoBackground';
import type { BackgroundVariant } from './EcoBackground';
import type { TabKey } from '../types';

type Props = {
  variant: BackgroundVariant;
  header?: React.ReactNode;
  children: React.ReactNode;
  actionPanel?: React.ReactNode;
  tab?: TabKey;
  onSelectTab?: (key: TabKey) => void;
};

/**
 * Flex shell: background, header, bounded content, optional action panel,
 * optional tabs. Never a whole-screen ScrollView.
 */
function AppShellBase({
  variant,
  header,
  children,
  actionPanel,
  tab,
  onSelectTab,
}: Props) {
  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={variant === 'loader' ? 'light-content' : 'dark-content'}
      />
      <EcoBackground variant={variant} />
      {header}
      <View style={styles.content}>{children}</View>
      {actionPanel ? <View style={styles.panel}>{actionPanel}</View> : null}
      {tab && onSelectTab ? (
        <BottomTabs selected={tab} onSelect={onSelectTab} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg.primary },
  content: { flex: 1 },
  panel: {
    paddingHorizontal: H_PADDING,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    backgroundColor: 'rgba(250,250,250,0.94)',
    borderTopLeftRadius: theme.radius.hero,
    borderTopRightRadius: theme.radius.hero,
    borderTopWidth: 1,
    borderTopColor: theme.colors.ui.border,
    ...theme.shadows.raised,
  },
});

export const AppShell = memo(AppShellBase);
