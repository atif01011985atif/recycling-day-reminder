import React, { useCallback, useMemo } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Bell, Home, Pencil, X } from 'lucide-react-native';
import { binSprites } from '../assets';
import { AppShell } from '../components/AppShell';
import { IconButton } from '../components/IconButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { ReminderStatusRow } from '../components/ReminderStatusRow';
import { SaveFeedback } from '../components/SaveFeedback';
import { SchedulePreview } from '../components/SchedulePreview';
import { ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { SoftCard } from '../components/SoftCard';
import { H_PADDING, PREVIEW_COUNT } from '../constants/config';
import { BIN_COLOURS, theme } from '../constants/theme';
import {
  nextDatesForBin,
  recurrenceSentence,
  reminderLabel,
  todayISO,
} from '../game/collectionLogic';
import { useFadeIn } from '../hooks/useFadeIn';
import { reminderStatusOf, useHousehold } from '../hooks/useHousehold';
import { useReducedMotion } from '../hooks/useReducedMotion';

type Props = {
  binId: string;
  onEditAgain: (binId: string) => void;
  onDone: () => void;
};

export function GameOverScreen({ binId, onEditAgain, onDone }: Props) {
  const { household, setReminders } = useHousehold();
  const { bins, rules, exceptions, reminders } = household;
  const reduced = useReducedMotion();
  const fade = useFadeIn(0, reduced);
  const today = useMemo(() => todayISO(), []);

  const bin = bins.find(b => b.id === binId);
  const rule = rules.find(r => r.binId === binId);

  const dates = useMemo(
    () => nextDatesForBin(rule, exceptions, today, PREVIEW_COUNT),
    [rule, exceptions, today],
  );

  const status = reminderStatusOf(reminders);
  const colourLabel =
    BIN_COLOURS.find(c => c.value === (bin ? bin.colour : ''))?.label ||
    'Custom';

  const handleEdit = useCallback(() => onEditAgain(binId), [onEditAgain, binId]);
  const enableReminders = useCallback(
    () => setReminders({ ...reminders, requested: true }),
    [setReminders, reminders],
  );

  return (
    <AppShell
      variant="saved"
      header={
        <ScreenHeader
          title="Schedule saved"
          subtitle={bin ? bin.name : undefined}
          rightSlot={
            <IconButton Icon={X} label="Close, back to This Week" onPress={onDone} />
          }
        />
      }
      actionPanel={
        <View style={styles.panel}>
          <Text style={styles.panelHint}>
            CHANGE THE DAYS OR GO BACK TO THIS WEEK
          </Text>
          <PrimaryButton
            label="EDIT AGAIN"
            Icon={Pencil}
            onPress={handleEdit}
            accessibilityLabel="Edit again, reopens this schedule"
          />
          <SecondaryButton
            label="Done"
            Icon={Home}
            onPress={onDone}
            accessibilityLabel="Done, opens This Week"
          />
        </View>
      }>
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}>
        <Animated.View style={fade} pointerEvents="box-none">
        <SoftCard radius={theme.radius.hero} style={styles.card}>
          <SaveFeedback message="Collection days saved" />
          <View style={styles.binRow}>
            <View style={[styles.swatch, { backgroundColor: bin ? bin.colour : theme.colors.bg.accent }]} />
            <Text style={styles.binText} numberOfLines={1}>
              {bin ? `${bin.name} · ${colourLabel}` : 'Bin removed'}
            </Text>
          </View>
          {bin && rule && dates.length > 0 ? (
            <View style={styles.preview}>
              <SchedulePreview
                sentence={recurrenceSentence(rule)}
                dates={dates}
                binName={bin.name}
                binColour={bin.colour}
              />
            </View>
          ) : null}
          <View style={styles.reminderBlock}>
            <ReminderStatusRow
              status={status}
              hour={reminders.hour}
              minute={reminders.minute}
              nextEvening={
                dates.length > 0
                  ? reminderLabel(dates[0], reminders.hour, reminders.minute)
                  : undefined
              }
            />
            {status === 'off' ? (
              <View style={styles.enable}>
                <Text style={styles.enableBody}>
                  Evening reminders tell you the night before a collection. You
                  can switch them off again at any time.
                </Text>
                <SecondaryButton
                  label="Enable evening reminders"
                  Icon={Bell}
                  onPress={enableReminders}
                />
              </View>
            ) : null}
          </View>
          {bin ? (
            <Image
              source={binSprites[bin.spriteIndex % binSprites.length]}
              style={styles.sprite}
            />
          ) : null}
        </SoftCard>
        </Animated.View>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  body: {
    flexGrow: 1,
    paddingHorizontal: H_PADDING,
    paddingVertical: theme.spacing.xl,
    justifyContent: 'center',
  },
  card: {
    maxWidth: 380,
    width: '100%',
    alignSelf: 'center',
    padding: theme.spacing.xl,
    overflow: 'hidden',
  },
  binRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.colors.ui.borderStrong,
  },
  binText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  preview: {
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.ui.border,
  },
  reminderBlock: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.ui.border,
  },
  enable: { gap: theme.spacing.md, marginTop: theme.spacing.md },
  enableBody: {
    ...theme.typography.helper,
    color: theme.colors.text.secondary,
  },
  sprite: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 56,
    height: 56,
    resizeMode: 'contain',
    opacity: 0.35,
  },
  panel: { gap: theme.spacing.md },
  panelHint: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
});
