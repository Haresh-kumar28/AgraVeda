// Semantic Color Tokens
export const TOKENS = {
  colors: {
    // Foundation
    background: '#FAFAF8',
    paper: '#FFFFFF',
    surfaceMuted: '#F5F3F0',
    carbon: '#1A1A1A',        // primary text
    graphite: '#6B6B6B',      // secondary text
    ash: '#B6B6B6',           // subdued placeholder / icon
    stone: '#F8F9FA',         // quiet section surface / app background
    surfaceElevated: '#FFFFFF',
    smoke: '#E8E4DF',         // hairline dividers & borders
    smokeDark: '#DCDCDC',

    // Healthcare Blue
    primary: '#1B74E4',       // accessible healthcare blue (4.5:1+ contrast against light surfaces)
    primaryHover: '#1558B0',
    primaryWash: '#EAF4FF',
    primarySubtle: '#F0F7FF',

    // Gold Accent (secondary, used sparingly)
    gold: '#B8860B',
    goldLight: '#D4A84B',

    // Semantic States (Dual coded with icons/labels, accessible contrast)
    success: '#0E7A4E',
    successBg: '#ECFDF3',
    successBorder: '#A6F4C5',

    warning: '#B54708',
    warningBg: '#FFFAEB',
    warningBorder: '#FEDF89',

    critical: '#B42318',
    criticalBg: '#FEF3F2',
    criticalBorder: '#FECDCA',

    info: '#175CD3',
    infoBg: '#EFF8FF',
    infoBorder: '#B2DDFF',
  },
  radius: {
    none: '0px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
    section: '80px',
    sectionMobile: '48px',
  },
  fonts: {
    sans: '"Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    serif: '"Playfair Display", Georgia, Cambria, "Times New Roman", Times, serif',
    mono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 2px 8px rgba(0, 0, 0, 0.06)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.08)',
    hero: '0 8px 32px rgba(0, 0, 0, 0.10)',
  },
  container: {
    maxWidth: '1200px',
    paddingX: '24px',
    paddingXMobile: '16px',
  },
};
