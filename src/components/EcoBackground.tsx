import React, { memo } from 'react';
import { Image, ImageBackground, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { assets } from '../assets';
import { theme } from '../constants/theme';

export type BackgroundVariant =
  | 'loader'
  | 'menu'
  | 'bins'
  | 'schedule'
  | 'saved'
  | 'guide'
  | 'settings'
  | 'about';

type Stops = { colors: string[]; start: { x: number; y: number }; end: { x: number; y: number }; artworkOpacity: number };

const VARIANTS: Record<BackgroundVariant, Stops> = {
  loader: { colors: theme.gradients.loader, start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 }, artworkOpacity: 0.1 },
  menu: { colors: theme.gradients.menu, start: { x: 0, y: 0 }, end: { x: 1, y: 1 }, artworkOpacity: 0.16 },
  bins: { colors: theme.gradients.bins, start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 }, artworkOpacity: 0.13 },
  schedule: { colors: theme.gradients.schedule, start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 }, artworkOpacity: 0.12 },
  saved: { colors: theme.gradients.saved, start: { x: 0.2, y: 0 }, end: { x: 0.8, y: 1 }, artworkOpacity: 0.14 },
  guide: { colors: theme.gradients.guide, start: { x: 0, y: 0 }, end: { x: 1, y: 1 }, artworkOpacity: 0.12 },
  settings: { colors: theme.gradients.settings, start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 }, artworkOpacity: 0.11 },
  about: { colors: theme.gradients.about, start: { x: 0, y: 0 }, end: { x: 1, y: 1 }, artworkOpacity: 0.11 },
};

/** Quiet leaf outline used as the single decorative motif across the app. */
function Leaf({ size, colour, opacity }: { size: number; colour: string; opacity: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" opacity={opacity}>
      <Path
        d="M86 14C52 10 20 28 16 60c-2 16 6 26 6 26s12-30 38-44c-18 14-28 30-32 46 24 6 48-8 56-30 6-18 2-44 2-44z"
        fill="none"
        stroke={colour}
        strokeWidth={3}
      />
      <Path d="M22 86C34 66 54 46 80 30" fill="none" stroke={colour} strokeWidth={2.5} />
    </Svg>
  );
}

/**
 * Shared background: artwork plate, screen gradient, then the leaf decoration.
 * The whole stack is non-interactive and hidden from screen readers.
 */
function EcoBackgroundBase({ variant }: { variant: BackgroundVariant }) {
  const spec = VARIANTS[variant];
  const dark = variant === 'loader';
  const leafColour = dark ? '#F6F6ED' : theme.colors.eco.olive;

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <ImageBackground
        source={assets.bgGame}
        style={StyleSheet.absoluteFill}
        imageStyle={{ opacity: 1 }}
        resizeMode="cover">
        <LinearGradient
          colors={spec.colors}
          start={spec.start}
          end={spec.end}
          style={[StyleSheet.absoluteFill, { opacity: dark ? 0.93 : 0.88 }]}
        />
      </ImageBackground>
      {dark ? (
        <View style={[StyleSheet.absoluteFill, styles.loaderVeil]} />
      ) : null}
      <View style={styles.topLeaf}>
        <Leaf size={190} colour={leafColour} opacity={dark ? 0.1 : 0.09} />
      </View>
      <View style={styles.bottomLeaf}>
        <Leaf size={230} colour={leafColour} opacity={dark ? 0.08 : 0.07} />
      </View>
      {dark ? (
        <View style={styles.midLeaf}>
          <Leaf size={140} colour="#C5DDB0" opacity={0.08} />
        </View>
      ) : null}
    </View>
  );
}

/** Small transparent brand plate, reused on the loader and first-use card. */
export const BrandMark = memo(function BrandMark({ size }: { size: number }) {
  return (
    <Image
      source={assets.logo}
      style={{ width: size, height: size, resizeMode: 'contain' }}
      accessibilityIgnoresInvertColors
    />
  );
});

const styles = StyleSheet.create({
  loaderVeil: { backgroundColor: 'rgba(16,16,28,0.5)' },
  topLeaf: { position: 'absolute', top: -30, right: -40 },
  bottomLeaf: { position: 'absolute', bottom: -60, left: -60 },
  midLeaf: { position: 'absolute', top: '42%', right: 16 },
});

export const EcoBackground = memo(EcoBackgroundBase);
