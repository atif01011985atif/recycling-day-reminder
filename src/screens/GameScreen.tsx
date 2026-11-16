import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  CalendarCheck,
  CalendarDays,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { AppShell } from '../components/AppShell';
import { BinCard } from '../components/BinCard';
import { BottomSheet } from '../components/BottomSheet';
import { CategoryChips } from '../components/CategoryChips';
import { ColourPicker } from '../components/ColourPicker';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { IconButton } from '../components/IconButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { BIN_NAME_MAX, H_PADDING, MAX_BINS } from '../constants/config';
import { theme } from '../constants/theme';
import { BIN_SUGGESTIONS } from '../data/binSuggestions';
import { nextDatesForBin, todayISO } from '../game/collectionLogic';
import { validateBinName } from '../game/validation';
import { useHousehold } from '../hooks/useHousehold';
import type { MaterialCategory, TabKey } from '../types';

type Props = {
  onSchedule: (binId: string) => void;
  onOpenResult: (binId: string) => void;
  onSelectTab: (tab: TabKey) => void;
};

type Row = {
  key: string;
  id: string;
  name: string;
  category: MaterialCategory;
  colour: string;
  nextDate: string | null;
  enabled: boolean;
  suggestion: boolean;
};

const DEFAULT_DRAFT = {
  name: '',
  category: 'recycling' as MaterialCategory,
  colour: '#3228E0',
  spriteIndex: 1,
};

export function GameScreen({ onSchedule, onOpenResult, onSelectTab }: Props) {
  const { household, addBin, toggleBin, deleteBin } = useHousehold();
  const { bins, rules, exceptions } = household;
  const today = useMemo(() => todayISO(), []);

  const [selected, setSelected] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_DRAFT);

  const rows = useMemo<Row[]>(() => {
    const saved: Row[] = bins.map(bin => ({
      key: bin.id,
      id: bin.id,
      name: bin.name,
      category: bin.category,
      colour: bin.colour,
      nextDate:
        nextDatesForBin(
          rules.find(r => r.binId === bin.id),
          exceptions,
          today,
          1,
        )[0] || null,
      enabled: bin.enabled,
      suggestion: false,
    }));
    const takenNames = new Set(bins.map(b => b.name.trim().toLowerCase()));
    const suggestions: Row[] = BIN_SUGGESTIONS.filter(
      s => !takenNames.has(s.name.toLowerCase()),
    ).map(s => ({
      key: s.key,
      id: s.key,
      name: s.name,
      category: s.category,
      colour: s.colour,
      nextDate: null,
      enabled: true,
      suggestion: true,
    }));
    return [...saved, ...suggestions];
  }, [bins, rules, exceptions, today]);

  const activeKey = selected && rows.some(r => r.key === selected)
    ? selected
    : rows.length > 0
    ? rows[0].key
    : null;

  const activeRow = rows.find(r => r.key === activeKey) || null;
  const scheduledCount = rules.length;
  const atLimit = bins.length >= MAX_BINS;

  const nameCheck = validateBinName(draft.name, bins);

  const handleSelect = useCallback((key: string) => setSelected(key), []);

  /** A suggestion becomes a real bin only at the moment it is scheduled. */
  const materialise = useCallback((): string | null => {
    if (!activeRow) {
      return null;
    }
    if (!activeRow.suggestion) {
      return activeRow.id;
    }
    const spec = BIN_SUGGESTIONS.find(s => s.key === activeRow.key);
    if (!spec) {
      return null;
    }
    const id = addBin({
      name: spec.name,
      category: spec.category,
      colour: spec.colour,
      spriteIndex: spec.spriteIndex,
    });
    if (id) {
      setSelected(id);
    }
    return id;
  }, [activeRow, addBin]);

  const startScheduling = useCallback(() => {
    const id = materialise();
    if (id) {
      onSchedule(id);
    }
  }, [materialise, onSchedule]);

  const openSavedSchedule = useCallback(() => {
    if (activeRow && !activeRow.suggestion) {
      onOpenResult(activeRow.id);
    }
  }, [activeRow, onOpenResult]);

  const saveCustomBin = useCallback(() => {
    if (!nameCheck.ok) {
      return;
    }
    const id = addBin(draft);
    setEditorOpen(false);
    setDraft(DEFAULT_DRAFT);
    if (id) {
      setSelected(id);
    }
  }, [nameCheck.ok, addBin, draft]);

  const confirmDelete = useCallback(() => {
    if (activeRow && !activeRow.suggestion) {
      deleteBin(activeRow.id);
      setSelected(null);
    }
    setDeleteOpen(false);
  }, [activeRow, deleteBin]);

  const renderItem = useCallback(
    ({ item, index }: { item: Row; index: number }) => (
      <View style={index === 0 ? undefined : styles.gap}>
        <BinCard
          id={item.key}
          name={item.name}
          category={item.category}
          colour={item.colour}
          nextDate={item.nextDate}
          enabled={item.enabled}
          suggestion={item.suggestion}
          selected={item.key === activeKey}
          onSelect={handleSelect}
          onToggle={toggleBin}
        />
      </View>
    ),
    [activeKey, handleSelect, toggleBin],
  );

  const keyExtractor = useCallback((item: Row) => item.key, []);

  const listHeader = (
    <View style={styles.listHead}>
      <Text style={styles.listHeadTitle}>
        {bins.length > 0 ? 'Your bins' : 'Suggestions'}
      </Text>
      <Text style={styles.listHeadBody}>
        {bins.length > 0
          ? `${scheduledCount} of ${bins.length} bins have collection days saved.`
          : 'Pick a starter bin or add your own. Nothing is saved until you set its collection days.'}
      </Text>
      {atLimit ? (
        <Text style={styles.limit}>
          Manage an existing bin to add another. The limit is 8 bins.
        </Text>
      ) : null}
    </View>
  );

  return (
    <AppShell
      variant="bins"
      tab="game"
      onSelectTab={onSelectTab}
      header={
        <ScreenHeader
          title="Bins"
          subtitle="Your household bin types"
          rightSlot={
            <IconButton
              Icon={Plus}
              label="Add bin"
              tone="accent"
              onPress={() => setEditorOpen(true)}
              disabled={atLimit}
            />
          }
        />
      }
      actionPanel={
        <View style={styles.panel}>
          <Text style={styles.panelSummary} numberOfLines={2}>
            {activeRow
              ? `Selected: ${activeRow.name}`
              : 'Select a bin above to continue'}
          </Text>
          <PrimaryButton
            label="START SCHEDULING"
            Icon={CalendarDays}
            onPress={startScheduling}
            disabled={!activeRow}
            accessibilityLabel="Start scheduling collection days for the selected bin"
          />
          {activeRow && !activeRow.suggestion && activeRow.nextDate ? (
            <SecondaryButton
              label="View saved schedule"
              Icon={CalendarCheck}
              onPress={openSavedSchedule}
            />
          ) : (
            <SecondaryButton
              label="Add a custom bin"
              Icon={Plus}
              onPress={() => setEditorOpen(true)}
              disabled={atLimit}
            />
          )}
        </View>
      }>
      <FlatList
        data={rows}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        windowSize={7}
      />

      <BottomSheet
        visible={editorOpen}
        title="Add a bin"
        subtitle="Name it the way your household says it."
        onClose={() => setEditorOpen(false)}>
        <View>
          <Text style={styles.fieldLabel}>Bin name</Text>
          <TextInput
            value={draft.name}
            onChangeText={text => setDraft(d => ({ ...d, name: text }))}
            placeholder="Garden waste"
            placeholderTextColor={theme.colors.text.muted}
            maxLength={BIN_NAME_MAX}
            style={styles.input}
            accessibilityLabel="Bin name"
          />
          {draft.name.length > 0 && !nameCheck.ok ? (
            <Text style={styles.error}>{nameCheck.message}</Text>
          ) : null}
        </View>
        <View>
          <Text style={styles.fieldLabel}>Material category</Text>
          <CategoryChips
            value={draft.category}
            includeAll={false}
            onChange={value => {
              if (value !== 'all') {
                setDraft(d => ({ ...d, category: value }));
              }
            }}
          />
        </View>
        <ColourPicker
          value={draft.colour}
          onChange={colour => setDraft(d => ({ ...d, colour }))}
        />
        <PrimaryButton
          label="Save bin"
          Icon={Plus}
          onPress={saveCustomBin}
          disabled={!nameCheck.ok}
        />
        {activeRow && !activeRow.suggestion ? (
          <SecondaryButton
            label={`Delete ${activeRow.name}`}
            Icon={Trash2}
            tone="quiet"
            onPress={() => {
              setEditorOpen(false);
              setDeleteOpen(true);
            }}
          />
        ) : null}
      </BottomSheet>

      <ConfirmSheet
        visible={deleteOpen}
        title="Delete this bin"
        message={
          activeRow
            ? `${activeRow.name} will be removed together with its collection days and any reminders built from them.`
            : ''
        }
        confirmLabel="Delete bin"
        cancelLabel="Keep bin"
        ConfirmIcon={Trash2}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteOpen(false)}
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
  listHead: { marginBottom: theme.spacing.lg },
  listHeadTitle: {
    ...theme.typography.cardTitle,
    color: theme.colors.text.primary,
  },
  listHeadBody: {
    ...theme.typography.helper,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  limit: {
    ...theme.typography.helper,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.sm,
  },
  gap: { marginTop: theme.spacing.md },
  panel: { gap: theme.spacing.md },
  panelSummary: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
  fieldLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
    marginBottom: theme.spacing.sm,
  },
  input: {
    height: 56,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.bg.primary,
    borderWidth: 1,
    borderColor: theme.colors.ui.borderStrong,
    paddingHorizontal: theme.spacing.lg,
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  error: {
    ...theme.typography.helper,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.sm,
  },
});
