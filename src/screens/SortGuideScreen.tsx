import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Plus, RotateCcw, Save, Search, Trash2 } from 'lucide-react-native';
import { AppShell } from '../components/AppShell';
import { BottomSheet } from '../components/BottomSheet';
import { CategoryChips } from '../components/CategoryChips';
import type { ChipValue } from '../components/CategoryChips';
import { EmptyState } from '../components/EmptyState';
import { GuideItemCard } from '../components/GuideItemCard';
import { GuideSearchBar } from '../components/GuideSearchBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { GUIDE_NOTE_MAX, H_PADDING, HIT_SLOP } from '../constants/config';
import { onSwatch, theme } from '../constants/theme';
import { CATEGORY_LABELS, SORTING_GUIDE } from '../data/sortingGuide';
import { useGuideSearch } from '../hooks/useGuideSearch';
import { useHousehold } from '../hooks/useHousehold';
import type { GuideEntry, TabKey } from '../types';

type Props = {
  onSetUpBin: () => void;
  onSelectTab: (tab: TabKey) => void;
};

const SPECIAL = 'special';

export function SortGuideScreen({ onSetUpBin, onSelectTab }: Props) {
  const { household, saveOverride, removeOverride } = useHousehold();
  const { bins, overrides } = household;

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ChipValue>('all');
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [destination, setDestination] = useState<string>('');

  const results = useGuideSearch(query, category);

  const overrideByKey = useMemo(() => {
    const map = new Map<string, string>();
    overrides.forEach(o => map.set(o.entryKey, o.destination));
    return map;
  }, [overrides]);

  /** One enabled bin of the matching category becomes the suggested destination. */
  const resolveDestination = useCallback(
    (entry: GuideEntry): { label: string | null; colour: string | null; overridden: boolean } => {
      const override = overrides.find(o => o.entryKey === entry.key);
      if (override) {
        if (override.destination === SPECIAL) {
          return { label: 'Special disposal', colour: theme.colors.eco.paleGreen, overridden: true };
        }
        const bin = bins.find(b => b.id === override.destination);
        return bin
          ? { label: bin.name, colour: bin.colour, overridden: true }
          : { label: 'Choose a bin', colour: null, overridden: true };
      }
      if (entry.category === 'special') {
        return {
          label: 'Check your local collection service',
          colour: null,
          overridden: false,
        };
      }
      const matches = bins.filter(b => b.enabled && b.category === entry.category);
      if (matches.length === 1) {
        return { label: matches[0].name, colour: matches[0].colour, overridden: false };
      }
      return { label: null, colour: null, overridden: false };
    },
    [bins, overrides],
  );

  const openEntry = useCallback(
    (key: string) => {
      const existing = overrides.find(o => o.entryKey === key);
      setNote(existing ? existing.note : '');
      setDestination(existing ? existing.destination : '');
      setOpenKey(key);
    },
    [overrides],
  );

  const closeEntry = useCallback(() => setOpenKey(null), []);

  const openEntryData = openKey
    ? SORTING_GUIDE.find(e => e.key === openKey) || null
    : null;

  const saveRule = useCallback(() => {
    if (!openKey || !destination) {
      return;
    }
    saveOverride({ entryKey: openKey, destination, note: note.trim() });
    setOpenKey(null);
  }, [openKey, destination, note, saveOverride]);

  const restoreSuggestion = useCallback(() => {
    if (openKey) {
      removeOverride(openKey);
    }
    setOpenKey(null);
  }, [openKey, removeOverride]);

  const renderItem = useCallback(
    ({ item, index }: { item: GuideEntry; index: number }) => {
      const resolved = resolveDestination(item);
      return (
        <View style={index === 0 ? undefined : styles.gap}>
          <GuideItemCard
            entry={item}
            destinationLabel={resolved.label}
            destinationColour={resolved.colour}
            overridden={resolved.overridden}
            onOpen={openEntry}
          />
        </View>
      );
    },
    [resolveDestination, openEntry],
  );

  const keyExtractor = useCallback((item: GuideEntry) => item.key, []);

  const empty = (
    <EmptyState
      Icon={Search}
      title="No match in the guide"
      body={`Nothing here matches "${query}". You can save a local rule for it once you have a bin set up.`}
      action={
        <SecondaryButton
          label="Set up a bin"
          Icon={Plus}
          onPress={onSetUpBin}
        />
      }
    />
  );

  const destinationOptions = useMemo(
    () => [
      ...bins.map(b => ({ id: b.id, label: b.name, colour: b.colour })),
      { id: SPECIAL, label: 'Special disposal', colour: theme.colors.eco.paleGreen },
    ],
    [bins],
  );

  return (
    <AppShell
      variant="guide"
      tab="sortGuide"
      onSelectTab={onSelectTab}
      header={
        <ScreenHeader
          title="Sort Guide"
          subtitle="Find a place for everyday items"
        />
      }>
      <View style={styles.controls}>
        <GuideSearchBar
          value={query}
          onChange={setQuery}
          onClear={() => setQuery('')}
        />
        <View style={styles.chips}>
          <CategoryChips value={category} onChange={setCategory} />
        </View>
      </View>

      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={empty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        windowSize={7}
        keyboardShouldPersistTaps="handled"
      />

      <BottomSheet
        visible={Boolean(openEntryData)}
        title={openEntryData ? openEntryData.name : ''}
        subtitle={
          openEntryData
            ? `Suggested category: ${CATEGORY_LABELS[openEntryData.category]}`
            : undefined
        }
        onClose={closeEntry}>
        {openEntryData ? (
          <View style={styles.sheetBody}>
            <Text style={styles.sheetHint}>{openEntryData.hint}</Text>
            <Text style={styles.sheetNotice}>
              Note that local collection rules can differ.
            </Text>

            <Text style={styles.fieldLabel}>Your household bin</Text>
            {destinationOptions.length > 1 ? (
              <View style={styles.optionWrap}>
                {destinationOptions.map(option => {
                  const selected = option.id === destination;
                  return (
                    <Pressable
                      key={option.id}
                      accessibilityRole="button"
                      accessibilityLabel={option.label}
                      accessibilityState={{ selected }}
                      hitSlop={HIT_SLOP}
                      onPress={() => setDestination(option.id)}
                      style={[
                        styles.option,
                        selected
                          ? {
                              backgroundColor: option.colour,
                              borderColor: theme.colors.action.primary,
                              borderWidth: 2,
                            }
                          : null,
                      ]}>
                      <Text
                        style={[
                          styles.optionText,
                          selected ? { color: onSwatch(option.colour) } : null,
                        ]}
                        numberOfLines={1}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.sheetHint}>
                Add a bin first and it will appear here as a destination.
              </Text>
            )}

            <Text style={styles.fieldLabel}>Household note</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="How your collection handles this item"
              placeholderTextColor={theme.colors.text.muted}
              maxLength={GUIDE_NOTE_MAX}
              multiline
              style={styles.noteInput}
              accessibilityLabel="Household note"
            />

            <PrimaryButton
              label="Save local rule"
              Icon={Save}
              onPress={saveRule}
              disabled={!destination}
            />
            {overrideByKey.has(openEntryData.key) ? (
              <SecondaryButton
                label="Restore suggestion"
                Icon={RotateCcw}
                tone="quiet"
                onPress={restoreSuggestion}
              />
            ) : (
              <SecondaryButton
                label="Set up a bin"
                Icon={Trash2}
                tone="quiet"
                onPress={() => {
                  closeEntry();
                  onSetUpBin();
                }}
              />
            )}
          </View>
        ) : null}
      </BottomSheet>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  controls: {
    paddingHorizontal: H_PADDING,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  chips: { marginHorizontal: -H_PADDING, paddingLeft: H_PADDING },
  listContent: {
    paddingHorizontal: H_PADDING,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  gap: { marginTop: theme.spacing.md },
  sheetBody: { gap: theme.spacing.md },
  sheetHint: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  sheetNotice: {
    ...theme.typography.helper,
    color: theme.colors.text.muted,
    fontStyle: 'italic',
  },
  fieldLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
  },
  optionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  option: {
    height: 48,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.bg.primary,
    borderWidth: 1,
    borderColor: theme.colors.ui.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: theme.colors.text.secondary,
  },
  noteInput: {
    minHeight: 80,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.bg.primary,
    borderWidth: 1,
    borderColor: theme.colors.ui.borderStrong,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    textAlignVertical: 'top',
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
});
