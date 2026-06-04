/**
 * Botão padrão do Akaru.
 *  - variant "filled"  → fundo verde, texto branco (ação primária)
 *  - variant "outline" → borda verde, texto verde (ação secundária)
 * Mostra ActivityIndicator quando `carregando`.
 */
import { Pressable, Text, ActivityIndicator, StyleSheet, type PressableProps } from 'react-native';
import { colors, radius, buttonHeight, fonts, spacing } from '../constants/theme';

type Props = PressableProps & {
  titulo: string;
  variant?: 'filled' | 'outline';
  carregando?: boolean;
};

export default function Button({
  titulo,
  variant = 'filled',
  carregando = false,
  disabled,
  style,
  ...props
}: Props) {
  const outline = variant === 'outline';
  return (
    <Pressable
      disabled={disabled || carregando}
      style={({ pressed }) => [
        styles.base,
        outline ? styles.outline : styles.filled,
        pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
        (disabled || carregando) && { opacity: 0.6 },
        typeof style === 'function' ? undefined : style,
      ]}
      {...props}
    >
      {carregando ? (
        <ActivityIndicator color={outline ? colors.primary : colors.onPrimary} />
      ) : (
        <Text style={[styles.texto, outline ? styles.textoOutline : styles.textoFilled]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: buttonHeight,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.section,
  },
  filled: { backgroundColor: colors.primary },
  outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary },
  texto: { fontFamily: fonts.bold, fontSize: 16 },
  textoFilled: { color: colors.onPrimary },
  textoOutline: { color: colors.primary },
});
