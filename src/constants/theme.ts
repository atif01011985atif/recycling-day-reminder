/**
 * Visual theme — preset NORDIC_MINIMAL with the brief's eco palette overrides.
 * The `name` field must stay exactly as the preset value.
 */
export const theme = {
  name: 'nordic-minimal',
  colors: {
    bg: {
      primary: '#F6F6ED',
      secondary: '#FAFAFA',
      tertiary: '#F2F2F4',
      accent: '#DDDDE2',
    },
    eco: {
      olive: '#A4AB2A',
      paleGreen: '#C5DDB0',
      mint: '#7FE8C5',
      blue: '#4A90E2',
      ink: '#242418',
    },
    action: {
      primary: '#3228E0',
      primaryDeep: '#2A20C4',
      onPrimary: '#F6F6ED',
    },
    text: {
      primary: '#242418',
      secondary: '#242418C2',
      muted: '#242418A3',
      onOlive: '#242418',
      inverse: '#F6F6ED',
    },
    ui: {
      surface: '#FAFAFA',
      border: '#24241814',
      borderStrong: '#24241824',
      divider: '#DDDDE2',
      overlay: 'rgba(36, 36, 24, 0.44)',
      tint: '#C5DDB066',
    },
  },
  gradients: {
    loader: ['#242418', '#2A2A50', '#3228E0'] as string[],
    menu: ['#F6F6ED', '#FAFAFA', '#C5DDB0'] as string[],
    bins: ['#FAFAFA', '#F6F6ED', '#EFF2E2'] as string[],
    schedule: ['#F6F6ED', '#E7EFDC', '#C5DDB0'] as string[],
    saved: ['#C5DDB0', '#F6F6ED', '#FAFAFA'] as string[],
    guide: ['#FAFAFA', '#F3F6EC', '#F6F6ED'] as string[],
    settings: ['#F6F6ED', '#FAFAFA', '#F2F4EA'] as string[],
    about: ['#FAFAFA', '#F6F6ED', '#E9F0E0'] as string[],
    primaryButton: ['#3228E0', '#2A20C4'] as string[],
    oliveCard: ['#B4BB36', '#A4AB2A'] as string[],
  },
  typography: {
    brand: { fontSize: 36, lineHeight: 42, fontWeight: '800' as const, letterSpacing: -0.5 },
    hero: { fontSize: 32, lineHeight: 38, fontWeight: '800' as const, letterSpacing: -0.5 },
    heading: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const, letterSpacing: -0.3 },
    cardTitle: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const },
    body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
    button: { fontSize: 16, lineHeight: 24, fontWeight: '700' as const, letterSpacing: 0.4 },
    helper: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.6 },
    eyebrow: { fontSize: 11, lineHeight: 15, fontWeight: '700' as const, letterSpacing: 1.4 },
  },
  radius: { control: 14, card: 16, hero: 18, pill: 999, sm: 8 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 },
  shadows: {
    card: {
      shadowColor: '#242418',
      shadowOpacity: 0.06,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 10,
      elevation: 2,
    },
    raised: {
      shadowColor: '#242418',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 16,
      elevation: 4,
    },
    action: {
      shadowColor: '#3228E0',
      shadowOpacity: 0.22,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 12,
      elevation: 3,
    },
  },
} as const;

export type Theme = typeof theme;

/** The seven user-selectable bin colours. */
export const BIN_COLOURS = [
  { value: '#4A90E2', label: 'Paper blue' },
  { value: '#A4AB2A', label: 'Olive' },
  { value: '#C5DDB0', label: 'Pale green' },
  { value: '#7FE8C5', label: 'Mint' },
  { value: '#3228E0', label: 'Violet' },
  { value: '#242418', label: 'Charcoal' },
  { value: '#DDDDE2', label: 'Neutral' },
] as const;

/** Dark ink reads better on these pale swatches. */
export function onSwatch(colour: string): string {
  return ['#C5DDB0', '#7FE8C5', '#DDDDE2', '#A4AB2A'].includes(colour)
    ? theme.colors.text.primary
    : theme.colors.text.inverse;
}
