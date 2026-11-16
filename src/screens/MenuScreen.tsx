import React, { useCallback, useMemo, useState } from 'react';
import {
  Animated,
  Image,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Search,
  Trash2,
} from 'lucide-react-native';
import { assets } from '../assets';
import { AppShell } from '../components/AppShell';
import { CollectionRow } from '../components/CollectionRow';
import { EmptyState } from '../components/EmptyState';
import { IconButton } from '../components/IconButton';
import { NextCollectionCard } from '../components/NextCollectionCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ReminderStatusRow } from '../components/ReminderStatusRow';
import { ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { SoftCard } from '../components/SoftCard';
import { SummaryTile } from '../components/SummaryTile';
import { H_PADDING } from '../constants/config';
import { theme } from '../constants/theme';
import { BIN_SUGGESTIONS } from '../data/binSuggestions';
import { SORTING_GUIDE } from '../data/sortingGuide';
import {
  addDaysISO,
  formatFull,
  groupOccurrences,
  groupsInWeek,
  relativeLabel,
  reminderLabel,
  startOfWeek,
  todayISO,
  upcomingOccurrences,
  weekRangeLabel,
} from '../game/collectionLogic';
import { useFadeIn } from '../hooks/useFadeIn';
import { reminderStatusOf, useHousehold } from '../hooks/useHousehold';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { Bin, TabKey } from '../types';

type Props = {
  onStartPlanning: () => void;
  onEditBin: (binId: string) => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onSelectTab: (tab: TabKey) => void;
};

type Section = {
  title: string;
  subtitle: string;
  date: string;
  data: Bin[];
};

export function MenuScreen({
  onStartPlanning,
  onEditBin,
  onOpenGuide,
  onOpenSettings,
  onSelectTab,
}: Props) {
  const { household } = useHousehold();
  const { bins, rules, exceptions, reminders } = household;
  const reduced = useReducedMotion();
  const fade = useFadeIn(0, reduced);
  const [weekOffset, setWeekOffset] = useState(0);

  const today = useMemo(() => todayISO(), []);
  const monday = useMemo(
    () => addDaysISO(startOfWeek(today), weekOffset * 7),
    [today, weekOffset],
  );

  const groups = useMemo(() => {
    const occurrences = upcomingOccurrences(bins, rules, exceptions, today, 8);
    return groupOccurrences(occurrences);
  }, [bins, rules, exceptions, today]);

  const weekGroups = useMemo(
    () => groupsInWeek(groups, monday),
    [groups, monday],
  );

  const binById = useMemo(() => {
    const map = new Map<string, Bin>();
    bins.forEach(b => map.set(b.id, b));
    return map;
  }, [bins]);

  const sections = useMemo<Section[]>(
    () =>
      weekGroups.map(group => ({
        title: relativeLabel(group.date, today),
        subtitle: formatFull(group.date),
        date: group.date,
        data: group.binIds
          .map(id => binById.get(id))
          .filter((b): b is Bin => Boolean(b))
          .sort((a, b) => a.name.localeCompare(b.name)),
      })),
    [weekGroups, binById, today],
  );

  const nextGroup = groups.length > 0 ? groups[0] : null;
  const nextBins = useMemo(
    () =>
      nextGroup
        ? nextGroup.binIds
            .map(id => binById.get(id))
            .filter((b): b is Bin => Boolean(b))
        : [],
    [nextGroup, binById],
  );

  const activeCount = useMemo(
    () => bins.filter(b => b.enabled && rules.some(r => r.binId === b.id)).length,
    [bins, rules],
  );

  const status = reminderStatusOf(reminders);
  const nextEvening = nextGroup
    ? reminderLabel(nextGroup.date, reminders.hour, reminders.minute)
    : undefined;

  const handleEdit = useCallback(
    (binId: string) => onEditBin(binId),
    [onEditBin],
  );

  const openNext = useCallback(() => {
    if (nextBins.length > 0) {
      onEditBin(nextBins[0].id);
    } else {
      onStartPlanning();
    }
  }, [nextBins, onEditBin, onStartPlanning]);

  const renderItem = useCallback(
    ({
      item,
      index,
      section,
    }: {
      item: Bin;
      index: number;
      section: Section;
    }) => (
      <View style={index === 0 ? undefined : styles.rowGap}>
        <CollectionRow
          bin={item}
          date={section.date}
          today={today}
          onEdit={handleEdit}
        />
      </View>
    ),
    [today, handleEdit],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback((item: Bin) => item.id, []);

  const header = (
    <Animated.View style={[styles.bento, fade]} pointerEvents="box-none">
      {weekOffset !== 0 ? (
        <View style={styles.todayAction}>
          <SecondaryButton
            label="Back to this week"
            Icon={CalendarDays}
            onPress={() => setWeekOffset(0)}
          />
        </View>
      ) : null}

      {nextGroup ? (
        <NextCollectionCard
          date={nextGroup.date}
          today={today}
          bins={nextBins}
          extraCount={Math.max(0, nextBins.length - 2)}
          onOpen={openNext}
        />
      ) : (
        <SoftCard
          tint={theme.colors.eco.olive}
          borderColour={theme.colors.eco.olive}
          radius={theme.radius.hero}
          style={styles.firstUse}>
          <Text style={styles.firstUseEyebrow}>GET STARTED</Text>
          <Text style={styles.firstUseTitle}>Make your first bin plan</Text>
          <Text style={styles.firstUseBody}>
            Choose a bin and its next collection day. Nothing is scheduled until
            you save it.
          </Text>
          <View style={styles.exampleTag}>
            <Leaf size={16} color={theme.colors.text.primary} strokeWidth={2} />
            <Text style={styles.exampleTagText}>Example</Text>
          </View>
          <Image source={assets.sprite1} style={styles.firstUseSprite} />
        </SoftCard>
      )}

      <View style={styles.tileRow}>
        <SummaryTile
          Icon={Trash2}
          title={bins.length > 0 ? 'Active bins' : 'Starter bins'}
          value={String(bins.length > 0 ? activeCount : BIN_SUGGESTIONS.length)}
          caption={
            bins.length > 0 ? 'Enabled and scheduled' : 'Suggestions ready to use'
          }
          valueColour={theme.colors.eco.olive}
          onPress={onStartPlanning}
        />
        <SummaryTile
          Icon={Search}
          title="Sort an item"
          value={String(SORTING_GUIDE.length)}
          caption="Offline guide entries"
          valueColour={theme.colors.action.primary}
          onPress={onOpenGuide}
        />
      </View>

      <SoftCard style={styles.reminderCard}>
        <ReminderStatusRow
          status={status}
          hour={reminders.hour}
          minute={reminders.minute}
          nextEvening={nextEvening}
          onPress={onOpenSettings}
        />
      </SoftCard>

      {sections.length === 0 ? (
        <EmptyState
          Icon={CalendarDays}
          title={
            bins.length === 0
              ? 'Add your bins to see collection days here'
              : 'No collections this week'
          }
          body={
            bins.length === 0
              ? 'Five starter bin types are ready on the Bins screen. Pick one and set its collection day.'
              : nextGroup
              ? `The next collection is ${formatFull(nextGroup.date)}.`
              : 'Set a collection day for a bin to fill this week.'
          }
          showSprites={bins.length === 0}
          spriteCaption="PAPER · MIXED · FOOD · GLASS · GENERAL"
        />
      ) : null}
    </Animated.View>
  );

  return (
    <AppShell
      variant="menu"
      tab="menu"
      onSelectTab={onSelectTab}
      header={
        <ScreenHeader
          title="This Week"
          subtitle={weekRangeLabel(monday)}
          rightSlot={
            <View style={styles.weekNav}>
              <IconButton
                Icon={ChevronLeft}
                label="Previous week"
                onPress={() => setWeekOffset(v => v - 1)}
              />
              <IconButton
                Icon={ChevronRight}
                label="Next week"
                onPress={() => setWeekOffset(v => v + 1)}
              />
            </View>
          }
        />
      }
      actionPanel={
        <View>
          <Text style={styles.hint}>
            PLAN COLLECTIONS · SET EVENING REMINDERS
          </Text>
          <PrimaryButton
            label="START PLANNING"
            Icon={CalendarDays}
            onPress={onStartPlanning}
            accessibilityLabel="Start planning, opens Bins"
          />
        </View>
      }>
      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={header}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        windowSize={7}
      />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: H_PADDING,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  bento: { gap: theme.spacing.md },
  todayAction: { marginBottom: theme.spacing.xs },
  tileRow: { flexDirection: 'row', gap: theme.spacing.md },
  reminderCard: { paddingVertical: theme.spacing.md },
  firstUse: { paddingBottom: theme.spacing.xl, overflow: 'hidden' },
  firstUseEyebrow: {
    ...theme.typography.eyebrow,
    color: theme.colors.text.onOlive,
    opacity: 0.8,
  },
  firstUseTitle: {
    ...theme.typography.hero,
    fontSize: 28,
    lineHeight: 34,
    color: theme.colors.text.onOlive,
    marginTop: 2,
    paddingRight: 72,
  },
  firstUseBody: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    paddingRight: 86,
  },
  exampleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    height: 28,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(246,246,237,0.82)',
  },
  exampleTagText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: theme.colors.text.primary,
  },
  firstUseSprite: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 72,
    height: 72,
    resizeMode: 'contain',
  },
  sectionHeader: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.cardTitle,
    color: theme.colors.text.primary,
  },
  sectionSubtitle: {
    ...theme.typography.helper,
    color: theme.colors.text.muted,
  },
  rowGap: { marginTop: theme.spacing.md },
  weekNav: { flexDirection: 'row', gap: theme.spacing.sm },
  hint: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
});
