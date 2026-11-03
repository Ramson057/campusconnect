/**
 * Centralized University of San Carlos theme tokens.
 * Matches CSS variables declared in src/index.css so colors are never hardcoded in UI components.
 */

export const USC_THEME = {
  colors: {
    primary: 'var(--usc-green)',
    primaryDark: 'var(--usc-green-dark)',
    primaryLight: 'var(--usc-green-light)',
    secondary: 'var(--usc-blue)',
    secondaryDark: 'var(--usc-blue-dark)',
    secondaryLight: 'var(--usc-blue-light)',
    accent: 'var(--usc-red)',
    accentDark: 'var(--usc-red-dark)',
    accentLight: 'var(--usc-red-light)',
    highlight: 'var(--usc-gold)',
    highlightDark: 'var(--usc-gold-dark)',
    highlightLight: 'var(--usc-gold-light)',
    surfaceWhite: 'var(--surface-white)',
    surfaceGray: 'var(--surface-gray)',
    surfaceBorder: 'var(--surface-border)',
    textPrimary: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    textMuted: 'var(--text-muted)',
  },
  motto: 'Scientia • Virtus • Devotio',
  universityName: 'University of San Carlos',
  platformName: 'CampusConnect',
} as const;
