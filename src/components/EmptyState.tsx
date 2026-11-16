import React, { memo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { binSprites } from '../assets';
import { theme } from '../constants/theme';
import { SoftCard } from './SoftCard';

type Props = {
  Icon: LucideIcon;
  title: string;
  body: string;
  showSprites?: boolean;
  spriteCaption?: string;
  action?: React.ReactNode;
};

/** Useful first-use / empty-week / no-match explanation, never a blank box. */
function EmptyStateBase({
  Icon,
  title,
  body,
  showSprites = false,
  spriteCaption,
  action,
}: Props) {
  return (
    <SoftCard tint={theme.colors.ui.surface}>
      <View style={styles.head}>
        <View style={styles.iconWrap}>
          <Icon size={22} color={theme.colors.eco.olive} strokeWidth={1.8} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.body}>{body}</Text>
      {showSprites ? (
        <View style={styles.spriteStrip}>
          {binSprites.map((sprite, index) => (
            <View key={index} style={styles.spriteSlot}>
              <Image source={sprite} style={styles.sprite} />
            </View>
          ))}
        </View>
      ) : null}
      {showSprites && spriteCaption ? (
        <Text style={styles.spriteCaption}>{spriteCaption}</Text>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </SoftCard>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.eco.olive + '1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.cardTitle,
    color: theme.colors.text.primary,
    flex: 1,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  spriteStrip: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  spriteSlot: {
    flex: 1,
    height: 62,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sprite: { width: 46, height: 46, resizeMode: 'contain' },
  spriteCaption: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  action: { marginTop: theme.spacing.lg },
});

export const EmptyState = memo(EmptyStateBase);
