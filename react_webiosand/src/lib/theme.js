// PlantBuddy design tokens — single source of truth for all screens.
// Fonts: Fraunces (display) + Bricolage Grotesque (body) via expo-google-fonts.
// applyFonts() is called from App.js once useFonts resolves; until then
// T/shared objects use system fallbacks so screens render immediately.

// Mutable font registry — filled by applyFonts() after load
const _f = {
  display: 'serif',
  displayBlack: 'serif',
  displayRegular: 'serif',
  body: 'sans-serif',
  bodyMedium: 'sans-serif',
  bodyLight: 'sans-serif',
};

export function applyFonts(names) {
  Object.assign(_f, names);
  // Patch type scale in place so any component re-render picks up real fonts
  T.hero.fontFamily    = _f.displayBlack;
  T.h1.fontFamily      = _f.display;
  T.h2.fontFamily      = _f.display;
  T.h3.fontFamily      = _f.bodyMedium;
  T.body.fontFamily    = _f.body;
  T.label.fontFamily   = _f.bodyMedium;
  T.caption.fontFamily = _f.body;
  T.badge.fontFamily   = _f.bodyMedium;
  shared.primaryButtonText.fontFamily = _f.bodyMedium;
  shared.ghostLink.fontFamily         = _f.body;
  shared.sectionLabel.fontFamily      = _f.bodyMedium;
}

export const C = {
  // Greens
  forest:       '#1b3a2d',
  leaf:         '#3d6b4f',
  moss:         '#6b9e7a',
  sage:         '#a8c5a0',
  mist:         '#e8f0e9',

  // Warm neutrals
  cream:        '#faf7f2',
  parchment:    '#f0ebe1',
  white:        '#ffffff',

  // Amber accent
  amber:        '#d4804a',
  amberLight:   '#f5d5be',
  clay:         '#8b4513',

  // Destructive
  terracotta:   '#b85c38',
  roseLight:    '#f5e0dc',

  // Text
  ink:          '#1a1a1a',
  slate:        '#4a5568',
  stone:        '#9a9a8a',

  // Status
  statusPendingBg:    '#fff8e1',
  statusPendingText:  '#b45309',
  statusPendingBorder:'#fbbf24',
  statusAcceptedBg:   '#e8f0e9',
  statusAcceptedText: '#3d6b4f',
  statusAcceptedBorder:'#a8c5a0',
  statusDeclinedBg:   '#f5e0dc',
  statusDeclinedText: '#b85c38',
  statusDeclinedBorder:'#f4a492',
  statusOpenBg:       '#e8f0e9',
  statusOpenText:     '#6b9e7a',
};

export const T = {
  hero:    { fontSize: 40, fontFamily: _f.displayBlack, color: C.forest, lineHeight: 46 },
  h1:      { fontSize: 30, fontFamily: _f.display,      color: C.forest, lineHeight: 36 },
  h2:      { fontSize: 22, fontFamily: _f.display,      color: C.forest, lineHeight: 28 },
  h3:      { fontSize: 18, fontFamily: _f.bodyMedium,   color: C.ink,    lineHeight: 24 },
  body:    { fontSize: 15, fontFamily: _f.body,         color: C.ink,    lineHeight: 22 },
  label:   { fontSize: 13, fontFamily: _f.bodyMedium,   color: C.slate,  lineHeight: 18 },
  caption: { fontSize: 11, fontFamily: _f.body,         color: C.stone,  lineHeight: 16 },
  badge:   { fontSize: 10, fontFamily: _f.bodyMedium,   letterSpacing: 0.5, textTransform: 'uppercase' },
};

export const S = {
  // Spacing
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,

  // Radius
  card: 16,
  button: 12,
  input: 10,
  chip: 999,
  fab: 999,

  // Shadows
  cardShadow: {
    shadowColor: '#1b3a2d',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardShadowElevated: {
    shadowColor: '#1b3a2d',
    shadowOpacity: 0.13,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};

// Reusable style fragments
export const shared = {
  screen: {
    flex: 1,
    backgroundColor: C.cream,
  },
  input: {
    backgroundColor: C.white,
    borderRadius: S.input,
    paddingHorizontal: S.base,
    paddingVertical: S.md,
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: C.sage,
    color: C.ink,
    marginBottom: S.sm,
  },
  inputFocused: {
    borderColor: C.leaf,
  },
  primaryButton: {
    backgroundColor: C.amber,
    borderRadius: S.button,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryButtonText: {
    color: C.white,
    fontSize: 16,
    fontFamily: _f.bodyMedium,
  },
  ghostLink: {
    color: C.stone,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: _f.body,
    marginTop: S.base,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: S.card,
    padding: S.base,
    ...S.cardShadow,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: _f.bodyMedium,
    color: C.moss,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: S.sm,
    marginTop: S.base,
  },
  accentBar: {
    borderLeftWidth: 4,
    borderLeftColor: C.amber,
    paddingLeft: S.md,
  },
};
