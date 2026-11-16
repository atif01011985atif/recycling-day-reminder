import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Info, Minus, Plus, Save, Trash2 } from 'lucide-react-native';
import { AppShell } from '../components/AppShell';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { IconButton } from '../components/IconButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { ReminderStatusRow } from '../components/ReminderStatusRow';
import { SaveFeedback } from '../components/SaveFeedback';
import { ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { SoftCard } from '../components/SoftCard';
import {
  H_PADDING,
  HIT_SLOP,
  REMINDER_HOUR_MAX,
  REMINDER_HOUR_MIN,
  REMINDER_MINUTE_CHOICES,
  TOUCH_MIN,
} from '../constants/config';
import { theme } from '../constants/theme';
import { formatTime } from '../game/collectionLogic';
import { reminderStatusOf, useHousehold } from '../hooks/useHousehold';
import type { TabKey } from '../types';

type Props = {
  onOpenAbout: () => void;
  onDeleted: () => void;
  onSelectTab: (tab: TabKey) => void;
};

type SectionId = 'reminders' | 'time' | 'save' | 'other';

const SECTIONS: SectionId[] = ['reminders', 'time', 'save', 'other'];

export function SettingsScreen({ onOpenAbout, onDeleted, onSelectTab }: Props) {
  const { household, setReminders, resetAll } = useHousehold();
  const { reminders } = household;

  const [draft, setDraft] = useState(reminders);
  const [saved, setSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const dirty = useMemo(
    () =>
      draft.requested !== reminders.requested ||
      draft.hour !== reminders.hour ||
      draft.minute !== reminders.minute,
    [draft, reminders],
  );

  const handleSave = useCallback(() => {
    setReminders(draft);
    setSaved(true);
  }, [setReminders, draft]);

  const confirmDelete = useCallback(() => {
    resetAll();
    setDraft({ requested: false, hour: 19, minute: 0 });
    setDeleteOpen(false);
    onDeleted();
  }, [resetAll, onDeleted]);

  const renderItem = useCallback(
    ({ item }: { item: SectionId }) => {
      switch (item) {
        case 'reminders':
          return (
            <SoftCard>
              <View style={styles.rowBetween}>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>Evening reminders</Text>
                  <Text style={styles.rowBody}>
                    A nudge the evening before each collection.
                  </Text>
                </View>
                <View style={styles.switchWrap}>
                  <Switch
                    value={draft.requested}
                    onValueChange={value => {
                      setSaved(false);
                      setDraft(d => ({ ...d, requested: value }));
                    }}
                    thumbColor={
                      draft.requested ? theme.colors.action.primary : '#FAFAFA'
                    }
                    trackColor={{
                      false: theme.colors.bg.accent,
                      true: theme.colors.eco.paleGreen,
                    }}
                  />
                </View>
              </View>
              <View style={styles.statusBlock}>
                <ReminderStatusRow
                  status={reminderStatusOf(reminders)}
                  hour={reminders.hour}
                  minute={reminders.minute}
                />
              </View>
            </SoftCard>
          );
        case 'time':
          return (
            <SoftCard>
              <Text style={styles.rowTitle}>Reminder time</Text>
              <Text style={styles.rowBody}>
                Evening times from 16:00 through 23:45 are supported.
              </Text>
              <View style={styles.hourRow}>
                <IconButton
                  Icon={Minus}
                  label="Earlier hour"
                  disabled={draft.hour <= REMINDER_HOUR_MIN}
                  onPress={() => {
                    setSaved(false);
                    setDraft(d => ({
                      ...d,
                      hour: Math.max(REMINDER_HOUR_MIN, d.hour - 1),
                    }));
                  }}
                />
                <Text style={styles.time}>
                  {formatTime(draft.hour, draft.minute)}
                </Text>
                <IconButton
                  Icon={Plus}
                  label="Later hour"
                  disabled={draft.hour >= REMINDER_HOUR_MAX}
                  onPress={() => {
                    setSaved(false);
                    setDraft(d => ({
                      ...d,
                      hour: Math.min(REMINDER_HOUR_MAX, d.hour + 1),
                    }));
                  }}
                />
              </View>
              <View style={styles.minuteRow}>
                {REMINDER_MINUTE_CHOICES.map(minute => {
                  const selected = minute === draft.minute;
                  return (
                    <Pressable
                      key={minute}
                      accessibilityRole="button"
                      accessibilityLabel={`${minute} minutes past the hour`}
                      accessibilityState={{ selected }}
                      hitSlop={HIT_SLOP}
                      onPress={() => {
                        setSaved(false);
                        setDraft(d => ({ ...d, minute }));
                      }}
                      style={[
                        styles.minuteChip,
                        selected ? styles.minuteChipSelected : null,
                      ]}>
                      <Text
                        style={[
                          styles.minuteText,
                          selected ? styles.minuteTextSelected : null,
                        ]}>
                        {minute === 0 ? '00' : String(minute)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </SoftCard>
          );
        case 'save':
          return (
            <SoftCard>
              {saved && !dirty ? (
                <View style={styles.savedBlock}>
                  <SaveFeedback message="Preferences saved" size={44} />
                </View>
              ) : (
                <Text style={styles.rowBody}>
                  Changes stay a draft until you save them.
                </Text>
              )}
              <View style={styles.saveAction}>
                <PrimaryButton
                  label="Save settings"
                  Icon={Save}
                  onPress={handleSave}
                  disabled={!dirty}
                />
              </View>
            </SoftCard>
          );
        case 'other':
        default:
          return (
            <SoftCard>
              <Text style={styles.rowTitle}>App</Text>
              <View style={styles.otherActions}>
                <SecondaryButton
                  label="About this app"
                  Icon={Info}
                  onPress={onOpenAbout}
                />
                <SecondaryButton
                  label="Delete local data"
                  Icon={Trash2}
                  tone="quiet"
                  onPress={() => setDeleteOpen(true)}
                />
              </View>
            </SoftCard>
          );
      }
    },
    [draft, reminders, saved, dirty, handleSave, onOpenAbout],
  );

  const keyExtractor = useCallback((item: SectionId) => item, []);

  return (
    <AppShell
      variant="settings"
      tab="settings"
      onSelectTab={onSelectTab}
      header={
        <ScreenHeader
          title="Settings"
          subtitle="Reminders and local data"
          rightSlot={
            <IconButton
              Icon={Info}
              label="About this app"
              onPress={onOpenAbout}
            />
          }
        />
      }>
      <FlatList
        data={SECTIONS}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <ConfirmSheet
        visible={deleteOpen}
        title="Delete local data"
        message="Bins, collection days, reminder preferences and household sorting rules will be removed from this device."
        confirmLabel="Delete data"
        cancelLabel="Keep my data"
        ConfirmIcon={Trash2}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </AppShell>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: H_PADDING,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  separator: { height: theme.spacing.md },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    minHeight: 56,
  },
  rowText: { flex: 1 },
  rowTitle: {
    ...theme.typography.cardTitle,
    color: theme.colors.text.primary,
  },
  rowBody: {
    ...theme.typography.helper,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  switchWrap: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBlock: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.ui.border,
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  time: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: theme.colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  minuteRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  minuteChip: {
    flex: 1,
    height: TOUCH_MIN,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.bg.primary,
    borderWidth: 1,
    borderColor: theme.colors.ui.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minuteChipSelected: {
    backgroundColor: theme.colors.eco.paleGreen,
    borderColor: theme.colors.action.primary,
    borderWidth: 2,
  },
  minuteText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    fontVariant: ['tabular-nums'],
  },
  minuteTextSelected: { color: theme.colors.text.primary },
  savedBlock: { alignItems: 'center', paddingVertical: theme.spacing.sm },
  saveAction: { marginTop: theme.spacing.lg },
  otherActions: { gap: theme.spacing.md, marginTop: theme.spacing.lg },
});
