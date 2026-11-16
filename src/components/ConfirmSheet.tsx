import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { BottomSheet } from './BottomSheet';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  ConfirmIcon?: LucideIcon;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Explicit delete / discard / schedule-change decision. */
function ConfirmSheetBase({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Keep editing',
  ConfirmIcon,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <BottomSheet visible={visible} title={title} onClose={onCancel}>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.actions}>
        <PrimaryButton
          label={confirmLabel}
          Icon={ConfirmIcon}
          onPress={onConfirm}
        />
        <SecondaryButton label={cancelLabel} onPress={onCancel} tone="quiet" />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  message: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  actions: { gap: theme.spacing.md },
});

export const ConfirmSheet = memo(ConfirmSheetBase);
