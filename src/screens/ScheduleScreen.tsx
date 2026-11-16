import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ArrowLeft,
  CalendarCheck,
  CalendarX,
  RotateCcw,
  Save,
} from 'lucide-react-native';
import { AppShell } from '../components/AppShell';
import { BinBadge } from '../components/BinBadge';
import { DayPickerRow } from '../components/DayPickerRow';
import { IconButton } from '../components/IconButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { ReminderStatusRow } from '../components/ReminderStatusRow';
import { SchedulePreview } from '../components/SchedulePreview';
import { ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { SoftCard } from '../components/SoftCard';
import {
  EXCEPTION_PICKER_COUNT,
  H_PADDING,
  HIT_SLOP,
  INTERVAL_DEFAULT,
  PREVIEW_COUNT,
} from '../constants/config';
import { theme } from '../constants/theme';
import { CATEGORY_LABELS } from '../data/sortingGuide';
import {
  addDaysISO,
  compareISO,
  diffDays,
  formatFull,
  formatShort,
  nextDatesForBin,
  originalOccurrences,
  recurrenceSentence,
  reminderLabel,
  todayISO,
} from '../game/collectionLogic';
import { validateAnchorDate, validateInterval } from '../game/validation';
import { reminderStatusOf, useHousehold } from '../hooks/useHousehold';
import { WeekStepper } from '../components/WeekStepper';
import type { CollectionException } from '../types';

type Props = {
  binId: string;
  onBack: () => void;
  onSaved: (binId: string) => void;
};

type SectionId = 'identity' | 'date' | 'interval' | 'preview' | 'exception';

const SECTIONS: SectionId[] = [
  'identity',
  'date',
  'interval',
  'preview',
  'exception',
];

export function ScheduleScreen({ binId, onBack, onSaved }: Props) {
  const { household, saveSchedule } = useHousehold();
  const { bins, rules, exceptions, reminders } = household;
  const today = useMemo(() => todayISO(), []);

  const bin = bins.find(b => b.id === binId);
  const existingRule = rules.find(r => r.binId === binId);

  const [anchorDate, setAnchorDate] = useState(
    existingRule ? existingRule.anchorDate : addDaysISO(today, 1),
  );
  const [intervalWeeks, setIntervalWeeks] = useState(
    existingRule ? existingRule.intervalWeeks : INTERVAL_DEFAULT,
  );
  const [draftExceptions, setDraftExceptions] = useState<CollectionException[]>(
    () => exceptions.filter(e => e.binId === binId),
  );
  const [pickedOriginal, setPickedOriginal] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dateError = validateAnchorDate(anchorDate).message;
  const intervalError = validateInterval(intervalWeeks).message;
  const valid = Boolean(bin) && !dateError && !intervalError;

  const draftRule = useMemo(
    () => ({ binId, anchorDate, intervalWeeks }),
    [binId, anchorDate, intervalWeeks],
  );

  const previewDates = useMemo(
    () => nextDatesForBin(draftRule, draftExceptions, today, PREVIEW_COUNT),
    [draftRule, draftExceptions, today],
  );

  const originals = useMemo(
    () => originalOccurrences(draftRule, today, EXCEPTION_PICKER_COUNT),
    [draftRule, today],
  );

  const activeException = pickedOriginal
    ? draftExceptions.find(e => e.originalDate === pickedOriginal)
    : undefined;

  const applySkip = useCallback(() => {
    if (!pickedOriginal) {
      return;
    }
    setDraftExceptions(prev => [
      ...prev.filter(e => e.originalDate !== pickedOriginal),
      { binId, originalDate: pickedOriginal, kind: 'skip' },
    ]);
  }, [pickedOriginal, binId]);

  const applyMove = useCallback(() => {
    if (!pickedOriginal) {
      return;
    }
    setDraftExceptions(prev => {
      const current = prev.find(e => e.originalDate === pickedOriginal);
      const base =
        current && current.kind === 'move' && current.replacementDate
          ? current.replacementDate
          : pickedOriginal;
      const shifted = addDaysISO(base, 1);
      // Stay within 7 days of the original and never land in the past.
      if (
        diffDays(pickedOriginal, shifted) > 7 ||
        compareISO(shifted, today) < 0
      ) {
        return prev;
      }
      return [
        ...prev.filter(e => e.originalDate !== pickedOriginal),
        {
          binId,
          originalDate: pickedOriginal,
          kind: 'move',
          replacementDate: shifted,
        },
      ];
    });
  }, [pickedOriginal, binId, today]);

  const clearException = useCallback(() => {
    if (!pickedOriginal) {
      return;
    }
    setDraftExceptions(prev =>
      prev.filter(e => e.originalDate !== pickedOriginal),
    );
  }, [pickedOriginal]);

  const handleSave = useCallback(() => {
    if (!valid || saving) {
      return;
    }
    setSaving(true);
    saveSchedule(binId, anchorDate, intervalWeeks, draftExceptions);
    setSaving(false);
    onSaved(binId);
  }, [
    valid,
    saving,
    saveSchedule,
    binId,
    anchorDate,
    intervalWeeks,
    draftExceptions,
    onSaved,
  ]);

  const renderItem = useCallback(
    ({ item }: { item: SectionId }) => {
      if (!bin) {
        return null;
      }
      switch (item) {
        case 'identity':
          return (
            <SoftCard>
              <View style={styles.identity}>
                <BinBadge
                  category={bin.category}
                  colour={bin.colour}
                  size={56}
                />
                <View style={styles.identityText}>
                  <Text style={styles.binName} numberOfLines={1}>
                    {bin.name}
                  </Text>
                  <Text style={styles.binMeta} numberOfLines={1}>
                    {CATEGORY_LABELS[bin.category]}
                  </Text>
                </View>
              </View>
            </SoftCard>
          );
        case 'date':
          return (
            <SoftCard>
              <DayPickerRow
                value={anchorDate}
                onChange={setAnchorDate}
                error={dateError}
              />
            </SoftCard>
          );
        case 'interval':
          return (
            <SoftCard>
              <WeekStepper value={intervalWeeks} onChange={setIntervalWeeks} />
              {intervalError ? (
                <Text style={styles.error}>{intervalError}</Text>
              ) : null}
            </SoftCard>
          );
        case 'preview':
          return (
            <SoftCard>
              <SchedulePreview
                sentence={recurrenceSentence(draftRule)}
                dates={previewDates}
                binName={bin.name}
                binColour={bin.colour}
              />
              <View style={styles.reminderBlock}>
                <ReminderStatusRow
                  status={reminderStatusOf(reminders)}
                  hour={reminders.hour}
                  minute={reminders.minute}
                  nextEvening={
                    previewDates.length > 0
                      ? reminderLabel(
                          previewDates[0],
                          reminders.hour,
                          reminders.minute,
                        )
                      : undefined
                  }
                />
              </View>
            </SoftCard>
          );
        case 'exception':
        default:
          return (
            <SoftCard>
              <Text style={styles.sectionTitle}>One-off change</Text>
              <Text style={styles.sectionBody}>
                Pick an upcoming collection, then skip it or move it by up to
                seven days.
              </Text>
              <View style={styles.chipWrap}>
                {originals.slice(0, 6).map(iso => {
                  const picked = iso === pickedOriginal;
                  const changed = draftExceptions.some(
                    e => e.originalDate === iso,
                  );
                  return (
                    <Pressable
                      key={iso}
                      accessibilityRole="button"
                      accessibilityLabel={formatFull(iso)}
                      accessibilityState={{ selected: picked }}
                      hitSlop={HIT_SLOP}
                      onPress={() => setPickedOriginal(iso)}
                      style={[
                        styles.dateChip,
                        picked ? styles.dateChipPicked : null,
                        changed ? styles.dateChipChanged : null,
                      ]}>
                      <Text
                        style={[
                          styles.dateChipText,
                          picked ? styles.dateChipTextPicked : null,
                        ]}
                        numberOfLines={1}>
                        {formatShort(iso)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {pickedOriginal ? (
                <View style={styles.exceptionActions}>
                  <Text style={styles.exceptionState} numberOfLines={2}>
                    {activeException
                      ? activeException.kind === 'skip'
                        ? `Original ${formatShort(pickedOriginal)} · skipped`
                        : `Original ${formatShort(
                            pickedOriginal,
                          )} · new date ${formatShort(
                            activeException.replacementDate || pickedOriginal,
                          )}`
                      : `Original ${formatShort(pickedOriginal)} · unchanged`}
                  </Text>
                  <SecondaryButton
                    label="Skip this collection"
                    Icon={CalendarX}
                    onPress={applySkip}
                  />
                  <SecondaryButton
                    label="Move one day later"
                    Icon={CalendarCheck}
                    onPress={applyMove}
                  />
                  {activeException ? (
                    <SecondaryButton
                      label="Remove this change"
                      Icon={RotateCcw}
                      tone="quiet"
                      onPress={clearException}
                    />
                  ) : null}
                </View>
              ) : null}
            </SoftCard>
          );
      }
    },
    [
      bin,
      anchorDate,
      dateError,
      intervalWeeks,
      intervalError,
      draftRule,
      previewDates,
      reminders,
      originals,
      pickedOriginal,
      draftExceptions,
      activeException,
      applySkip,
      applyMove,
      clearException,
    ],
  );

  const keyExtractor = useCallback((item: SectionId) => item, []);

  return (
    <AppShell
      variant="schedule"
      header={
        <ScreenHeader
          title="Schedule"
          subtitle={bin ? bin.name : 'Select a bin'}
          leftSlot={
            <IconButton Icon={ArrowLeft} label="Back to Bins" onPress={onBack} />
          }
        />
      }
      actionPanel={
        <View style={styles.panel}>
          <Text style={styles.panelSummary} numberOfLines={2}>
            {valid && previewDates.length > 0
              ? `${recurrenceSentence(draftRule)} · next ${formatShort(
                  previewDates[0],
                )}`
              : 'Choose a collection day to continue'}
          </Text>
          <PrimaryButton
            label="SAVE SCHEDULE"
            Icon={Save}
            onPress={handleSave}
            disabled={!valid}
            busy={saving}
          />
        </View>
      }>
      <FlatList
        data={SECTIONS}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  identityText: { flex: 1 },
  binName: { ...theme.typography.cardTitle, color: theme.colors.text.primary },
  binMeta: {
    ...theme.typography.helper,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  sectionTitle: {
    ...theme.typography.cardTitle,
    color: theme.colors.text.primary,
  },
  sectionBody: {
    ...theme.typography.helper,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  dateChip: {
    height: 48,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.bg.primary,
    borderWidth: 1,
    borderColor: theme.colors.ui.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateChipPicked: {
    backgroundColor: theme.colors.eco.paleGreen,
    borderColor: theme.colors.action.primary,
    borderWidth: 2,
  },
  dateChipChanged: { borderStyle: 'dashed' },
  dateChipText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: theme.colors.text.secondary,
  },
  dateChipTextPicked: { color: theme.colors.text.primary },
  exceptionActions: { gap: theme.spacing.md, marginTop: theme.spacing.lg },
  exceptionState: {
    ...theme.typography.helper,
    color: theme.colors.text.primary,
    fontWeight: '700',
  },
  reminderBlock: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.ui.border,
  },
  error: {
    ...theme.typography.helper,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.sm,
  },
  panel: { gap: theme.spacing.md },
  panelSummary: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
});
