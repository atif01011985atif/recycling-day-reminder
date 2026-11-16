import React, { useCallback, useMemo, useState } from 'react';
import { SectionList, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Copy, Send } from 'lucide-react-native';
import { AppShell } from '../components/AppShell';
import { BottomSheet } from '../components/BottomSheet';
import { BrandMark } from '../components/EcoBackground';
import { IconButton } from '../components/IconButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { SoftCard } from '../components/SoftCard';
import { APP_TITLE, APP_VERSION, H_PADDING, PACKAGE_ID } from '../constants/config';
import { theme } from '../constants/theme';

type Props = { onBack: () => void };

type Row = { key: string; body: string };
type Section = { title: string; data: Row[] };

const POLICY = [
  'Your bins, collection dates, reminder settings, and household sorting rules are stored on this device.',
  'The app does not create an account, use advertising or analytics, or automatically send this information to a server.',
  'Local notifications are managed on your device. You can remove the saved information using Delete local data in Settings.',
  'If you choose to share a support request, the message is handed to the app and recipient you select. The app does not read your contacts or send that message automatically.',
];

const CONTACT_MAX = 1000;

export function AboutScreen({ onBack }: Props) {
  const [contactOpen, setContactOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const supportDetails = useMemo(
    () => `${APP_TITLE} · version ${APP_VERSION} · ${PACKAGE_ID}`,
    [],
  );

  const sections = useMemo<Section[]>(
    () => [
      {
        title: 'App information',
        data: [
          {
            key: 'app-name',
            body: `${APP_TITLE}, version ${APP_VERSION}.`,
          },
          {
            key: 'app-desc',
            body: 'Household collection reminders and an offline sorting guide.',
          },
        ],
      },
      {
        title: 'Privacy policy',
        data: POLICY.map((body, index) => ({ key: `policy-${index}`, body })),
      },
      {
        title: 'Contact',
        data: [
          {
            key: 'contact',
            body: 'Write a support request and choose where to send it. Nothing leaves the device until you pick an app and recipient.',
          },
        ],
      },
    ],
    [],
  );

  const shareRequest = useCallback(() => {
    Share.share({
      message: `${message.trim()}\n\n${supportDetails}`,
    }).catch(() => {
      /* the chooser was dismissed or is unavailable */
    });
  }, [message, supportDetails]);

  const copyRequest = useCallback(() => {
    // No clipboard dependency is approved, so the text stays visible to copy.
    setCopied(true);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Row }) => (
      <SoftCard style={styles.card}>
        <Text style={styles.body}>{item.body}</Text>
      </SoftCard>
    ),
    [],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => (
      <Text style={styles.sectionTitle}>{section.title}</Text>
    ),
    [],
  );

  const keyExtractor = useCallback((item: Row) => item.key, []);

  const header = (
    <View style={styles.brandBlock}>
      <View style={styles.brandTile}>
        <BrandMark size={56} />
      </View>
      <Text style={styles.brandTitle}>{APP_TITLE}</Text>
      <Text style={styles.brandMeta}>{`Version ${APP_VERSION}`}</Text>
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      <PrimaryButton
        label="Contact support"
        Icon={Send}
        onPress={() => setContactOpen(true)}
      />
    </View>
  );

  return (
    <AppShell
      variant="about"
      header={
        <ScreenHeader
          title="About"
          subtitle="App information and privacy"
          leftSlot={
            <IconButton
              Icon={ArrowLeft}
              label="Back to Settings"
              onPress={onBack}
            />
          }
        />
      }>
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={keyExtractor}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <BottomSheet
        visible={contactOpen}
        title="Contact support"
        subtitle="Choose an app and recipient to send your request"
        onClose={() => setContactOpen(false)}>
        <TextInput
          value={message}
          onChangeText={text => {
            setCopied(false);
            setMessage(text);
          }}
          placeholder="What can we help with?"
          placeholderTextColor={theme.colors.text.muted}
          maxLength={CONTACT_MAX}
          multiline
          style={styles.contactInput}
          accessibilityLabel="Support message"
        />
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Included with your message</Text>
          <Text style={styles.previewText}>{supportDetails}</Text>
        </View>
        <PrimaryButton
          label="Share support request"
          Icon={Send}
          onPress={shareRequest}
          disabled={message.trim().length === 0}
        />
        <SecondaryButton
          label={copied ? 'Request shown above' : 'Copy request'}
          Icon={Copy}
          tone="quiet"
          onPress={copyRequest}
        />
      </BottomSheet>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: H_PADDING,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  brandBlock: { alignItems: 'center', marginBottom: theme.spacing.xl },
  brandTile: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: theme.colors.ui.surface,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.card,
  },
  brandTitle: {
    ...theme.typography.cardTitle,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  brandMeta: {
    ...theme.typography.helper,
    color: theme.colors.text.muted,
  },
  sectionTitle: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  card: { marginBottom: theme.spacing.sm },
  body: { ...theme.typography.body, color: theme.colors.text.secondary },
  footer: { marginTop: theme.spacing.xl },
  contactInput: {
    minHeight: 110,
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
  preview: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.bg.tertiary,
  },
  previewLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.muted,
  },
  previewText: {
    ...theme.typography.helper,
    color: theme.colors.text.primary,
    marginTop: 2,
  },
});
