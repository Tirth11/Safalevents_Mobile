// Shared design tokens — mirrors the SafalEvents web app palette.
export const colors = {
  primary: '#F2541B',
  primaryHover: '#d8440f',
  primaryTint: 'rgba(242,84,27,0.10)',
  accent: '#00A63E',
  accentTint: 'rgba(0,200,83,0.12)',
  amber: '#ca8a04',
  amberTint: 'rgba(245,158,11,0.12)',
  red: '#dc2626',
  redTint: 'rgba(239,68,68,0.12)',
  purple: '#7c3aed',
  purpleTint: 'rgba(124,58,237,0.12)',
  blue: '#0ea5e9',
  blueTint: 'rgba(14,165,233,0.12)',

  bg: '#F6F6F8',
  surface: '#FFFFFF',
  surfaceHover: '#F2F2F5',
  text: '#15151B',
  textMuted: '#6B7280',
  border: '#E6E6EC',
  white: '#FFFFFF',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 8, md: 12, lg: 18, full: 999 };

export const font = {
  h1: { fontSize: 26, fontWeight: '800', color: colors.text },
  h2: { fontSize: 20, fontWeight: '800', color: colors.text },
  h3: { fontSize: 16, fontWeight: '700', color: colors.text },
  body: { fontSize: 14, color: colors.text },
  small: { fontSize: 12, color: colors.textMuted },
  tiny: { fontSize: 11, color: colors.textMuted },
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
