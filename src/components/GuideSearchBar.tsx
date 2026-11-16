import React, { memo } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { SEARCH_MAX_CHARS } from '../constants/config';
import { theme } from '../constants/theme';
import { IconButton } from './IconButton';

type Props = {
  value: string;
  onChange: (next: string) => void;
  onClear: () => void;
};

/** 56 dp search field with its own 48 dp clear control. */
function GuideSearchBarBase({ value, onChange, onClear }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <Search size={22} color={theme.colors.text.muted} strokeWidth={1.8} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Search an item"
          placeholderTextColor={theme.colors.text.muted}
          maxLength={SEARCH_MAX_CHARS}
          style={styles.input}
          accessibilityLabel="Search the sorting guide"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>
      {value.length > 0 ? (
        <IconButton Icon={X} label="Clear search" onPress={onClear} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  field: {
    flex: 1,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.ui.surface,
    borderWidth: 1,
    borderColor: theme.colors.ui.borderStrong,
    ...theme.shadows.card,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text.primary,
    padding: 0,
  },
});

export const GuideSearchBar = memo(GuideSearchBarBase);
