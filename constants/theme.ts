/**
 * Design System do Akaru
 * Plantio inteligente, colheita certa — Global Solution 2026/1 FIAP
 *
 * Tokens centrais definidos na especificação da GS. Use SEMPRE estes valores
 * em vez de cores/medidas mágicas espalhadas pelo código.
 */

export const colors = {
  primary: '#1B4D1E',
  secondary: '#2E7D32',
  accent: '#C8E6C9',
  background: '#F5F2EC',
  surface: '#FFFFFF',
  text: '#212121',
  muted: '#757575',
  warningBg: '#FFFDE7',
  warningText: '#F57F17',
  warningIcon: '#F9A825',
  errorBg: '#FFEBEE',
  errorText: '#B71C1C',

  // Tokens derivados (apoio à UI, mantendo a identidade verde)
  border: '#E5E2DC',
  onPrimary: '#FFFFFF',
  infoBg: '#E3F2FD',
  infoText: '#1565C0',
  overlay: 'rgba(0,0,0,0.4)',
} as const;

/** Espaçamentos base da especificação. */
export const spacing = {
  screen: 16,
  gap: 12,
  stack: 8,
  // valores auxiliares
  section: 24,
  xs: 4,
  lg: 24,
  xl: 32,
} as const;

/** Raios de canto. */
export const radius = {
  card: 12,
  button: 12,
  input: 12,
  pill: 9999,
} as const;

export const buttonHeight = 48;
export const inputHeight = 48;

/** Famílias de fonte (carregadas em app/_layout.tsx via @expo-google-fonts/poppins). */
export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

/** Escala tipográfica. */
export const typography = {
  h1: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30 },
  h2: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26 },
  h3: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  overline: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1 },
} as const;

/** Sombra padrão dos cards (cross-platform). */
export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
} as const;

/**
 * Mapa de status de recomendação → cores do "chip".
 * Usado em Home, Histórico e Resultado.
 */
export const statusStyles = {
  Ideal: { bg: colors.accent, text: colors.primary },
  Atenção: { bg: colors.warningBg, text: colors.warningText },
  Risco: { bg: colors.errorBg, text: colors.errorText },
} as const;

export type StatusRecomendacao = keyof typeof statusStyles;

/**
 * Mapa de classificação de aptidão (API Java) → cores do badge.
 * Usado em Resultado, Histórico e Home.
 */
export const aptidaoStyles = {
  ALTA: { bg: colors.accent, text: colors.primary },
  MÉDIA: { bg: colors.warningBg, text: colors.warningText },
  BAIXA: { bg: colors.errorBg, text: colors.errorText },
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  buttonHeight,
  inputHeight,
  fonts,
  typography,
  shadow,
  statusStyles,
};

export default theme;
