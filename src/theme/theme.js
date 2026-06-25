// Shared design tokens — mirrors the SafalEvents web app palette.
export const colors = {
  primary: '#1F3A63', // Logo navy
  primaryHover: '#16304F',
  primaryTint: 'rgba(31,58,99,0.06)',
  accent: '#00A152', // Success green
  accentTint: 'rgba(0,161,82,0.10)',
  amber: '#C28C32', // Gold
  amberTint: 'rgba(194,140,50,0.12)',
  red: '#E03131', // Urgent red
  redTint: 'rgba(224,49,49,0.12)',
  purple: '#7c3aed',
  purpleTint: 'rgba(124,58,237,0.12)',
  blue: '#0ea5e9',
  blueTint: 'rgba(14,165,233,0.12)',

  bg: '#ffffff', // Pure white Apple-style canvas
  surface: '#ffffff',
  surfaceHover: '#f5f5f7', // Cool light gray
  text: '#1d1d1f', // Near-black ink
  textMuted: '#6e6e73', // Secondary gray
  border: '#e5e5ea',
  white: '#FFFFFF',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 8, md: 12, lg: 18, full: 999 };

export const font = {
  h1: { fontFamily: 'Inter_800ExtraBold', fontSize: 26, color: colors.text },
  h2: { fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: colors.text },
  h3: { fontFamily: 'Inter_700Bold', fontSize: 16, color: colors.text },
  body: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.text },
  small: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textMuted },
  tiny: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textMuted },
};

export const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

// Deterministic avatar/cover helpers (remote, no bundled assets needed).
export const avatarUrl = (seed) =>
  `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(seed || 'Guest')}&backgroundType=gradientLinear`;
