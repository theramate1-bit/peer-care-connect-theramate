/**
 * Theramate Design Tokens - Soft Cream Theme
 * Inspired by KokonutUI, Magic UI, and Aceternity UI
 */

export const Colors = {
  // Primary - Soft Cream
  cream: {
    50: '#FFFDF8',   // Background
    100: '#FFF9EB',  // Card backgrounds
    200: '#FFF3D6',  // Subtle highlights
    300: '#FFE9B8',  // Borders
    400: '#FFD98C',  // Interactive states
  },

  // Accent - Sage Green (Primary actions)
  sage: {
    400: '#9BC19F',
    500: '#7A9E7E',  // Primary action (booking buttons)
    600: '#5C7F61',  // Pressed states
    700: '#446349',
  },

  // Accent - Terracotta (Secondary)
  terracotta: {
    400: '#D9A08E',
    500: '#C9826D',  // Secondary accent
    600: '#A66B59',  // Pressed states
    700: '#845548',
  },

  // Neutrals - Charcoal
  charcoal: {
    50: '#F5F3F0',
    100: '#E8E4DF',  // Dividers
    200: '#D4CFC8',
    300: '#A09A94',  // Placeholders
    400: '#8A847E',
    500: '#6B6660',  // Tertiary text
    600: '#5A5550',
    700: '#4A4641',  // Secondary text
    800: '#3A3733',
    900: '#2D2A26',  // Primary text
  },

  // Semantic Colors
  success: '#6B9B6B',
  successLight: '#E8F5E8',
  warning: '#E8A952',
  warningLight: '#FFF8E8',
  error: '#C75D5D',
  errorLight: '#FDEAEA',
  info: '#6B8FAD',
  infoLight: '#E8F0F8',

  // Special
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Gradients (for backgrounds)
  gradients: {
    warmCream: ['#FFFDF8', '#FFF9EB'],
    sage: ['#9BC19F', '#7A9E7E'],
    terracotta: ['#D9A08E', '#C9826D'],
    subtle: ['#FFFDF8', '#FFF3D6'],
  },
} as const;

// Light theme (default)
export const LightTheme = {
  background: Colors.cream[50],
  surface: Colors.white,
  surfaceSecondary: Colors.cream[100],
  primary: Colors.sage[500],
  primaryPressed: Colors.sage[600],
  secondary: Colors.terracotta[500],
  secondaryPressed: Colors.terracotta[600],
  text: Colors.charcoal[900],
  textSecondary: Colors.charcoal[700],
  textTertiary: Colors.charcoal[500],
  textPlaceholder: Colors.charcoal[300],
  border: Colors.cream[300],
  borderLight: Colors.cream[200],
  divider: Colors.charcoal[100],
  success: Colors.success,
  warning: Colors.warning,
  error: Colors.error,
  info: Colors.info,
};

// Dark theme (optional future support)
export const DarkTheme = {
  background: Colors.charcoal[900],
  surface: Colors.charcoal[800],
  surfaceSecondary: Colors.charcoal[700],
  primary: Colors.sage[400],
  primaryPressed: Colors.sage[500],
  secondary: Colors.terracotta[400],
  secondaryPressed: Colors.terracotta[500],
  text: Colors.cream[50],
  textSecondary: Colors.charcoal[200],
  textTertiary: Colors.charcoal[300],
  textPlaceholder: Colors.charcoal[500],
  border: Colors.charcoal[600],
  borderLight: Colors.charcoal[700],
  divider: Colors.charcoal[600],
  success: Colors.success,
  warning: Colors.warning,
  error: Colors.error,
  info: Colors.info,
};

export type Theme = typeof LightTheme;

