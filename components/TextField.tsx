/**
 * Campo de texto do Akaru: borda arredondada, ícone à esquerda e, para senhas,
 * botão de mostrar/ocultar à direita. Segue o design system.
 */
import { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, inputHeight, fonts, spacing } from '../constants/theme';

type Props = Omit<TextInputProps, 'style'> & {
  icon: keyof typeof Ionicons.glyphMap;
  /** Quando true, exibe o toggle de visibilidade e mascara o texto. */
  senha?: boolean;
  /** Estilo aplicado ao container do campo. */
  style?: StyleProp<ViewStyle>;
};

export default function TextField({ icon, senha = false, style, accessibilityLabel, ...props }: Props) {
  const [focado, setFocado] = useState(false);
  const [oculto, setOculto] = useState(true);

  // Sem label explícito, leitores de tela anunciam o placeholder do campo.
  const label = accessibilityLabel ?? (typeof props.placeholder === 'string' ? props.placeholder : undefined);

  return (
    <View style={[styles.container, focado && styles.containerFocado, style]}>
      <Ionicons
        name={icon}
        size={20}
        color={focado ? colors.primary : colors.muted}
        style={styles.iconeEsq}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.muted}
        secureTextEntry={senha && oculto}
        accessibilityLabel={label}
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
        {...props}
      />
      {senha && (
        <Pressable
          onPress={() => setOculto((v) => !v)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={oculto ? 'Mostrar senha' : 'Ocultar senha'}
        >
          <Ionicons name={oculto ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.muted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: inputHeight,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: spacing.screen,
  },
  containerFocado: {
    borderColor: colors.primary,
  },
  iconeEsq: { marginRight: spacing.gap },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    padding: 0,
  },
});
