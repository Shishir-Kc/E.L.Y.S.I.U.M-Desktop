/**
 * Color tokens lifted directly from the Flutter source.
 *
 * All hex values in the original Dart code used 0xAARRGGBB form; in RN/web we
 * use #RRGGBB (with optional alpha via rgba()). This module re-exports each
 * color as a hex string for use in StyleSheet + Markdown styles, plus a small
 * helper for alpha overlays.
 */

export const colors = {
  // Surfaces (from chat_screen / sidebar)
  bgPrimary: '#111111',
  bgSidebar: '#111111',
  bgSurface: '#141414',
  bgSurfaceContainerHighest: '#1F1F1F',
  bgSurfaceVariant: '#1A1A1A',
  bgUserBubble: '#2D2D2D',
  bgTool: '#1E1E1E',
  bgToolHover: '#2D2D2D',

  // Border / divider
  borderFaint: 'rgba(255,255,255,0.04)',
  borderSoft: 'rgba(255,255,255,0.06)',
  borderMed: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.10)',
  borderWhite10: 'rgba(255,255,255,0.10)',
  divider: '#1F1F1F',

  // Text
  text_primary: '#FFFFFF',
  text_highEmphasis: '#F5F5F5',
  text_medEmphasis: 'rgba(255,255,255,0.70)',
  text_lowEmphasis: 'rgba(255,255,255,0.54)',
  text_disabled: 'rgba(255,255,255,0.38)',
  text_faint: 'rgba(255,255,255,0.24)',

  // Accent / status
  accentPrimary: '#6B4DFF',
  green: '#22C55E',
  greenAccent: '#A3E635',
  amber: '#F59E0B',
  red: '#EF4444',
  redAccent: '#F87171',
  gray: '#6B7280',
  blue: '#3B82F6',
  blueAccent: '#60A5FA',

  // Code block
  codeBg: '#000000',
  codeBorder: 'rgba(255,255,255,0.08)',
} as const;

export function rgba(hex: string, alpha: number): string {
  if (hex.startsWith('rgba')) return hex;
  if (!hex.startsWith('#')) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Typography tokens.
 * Mirrors the Flutter google_fonts usage: Outfit for display, Inter for body,
 * JetBrains Mono for logs and code.
 */
export const fonts = {
  display: 'Outfit',
  body: 'Inter',
  mono: 'JetBrainsMono',
} as const;

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

/**
 * Spacing scale matching the Flutter intergrations (mostly 4/8/12/16/24).
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 20,
  bubble: 24,
} as const;

/**
 * Layout breakpoints — when the sidebar switches from drawer to visible rail.
 */
export const layout = {
  sidebarCollapsedWidth: 64,
  sidebarExpandedWidth: 220,
  drawerBreakpoint: 768,
} as const;
