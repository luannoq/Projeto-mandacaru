/**
 * Estilos para o react-native-markdown-display, seguindo o design system do Akaru.
 *
 * As respostas do Gemini (IAkaru e planoPlantio do Resultado) podem vir em
 * Markdown. `markdownStyles(corBase)` permite reaproveitar a base ajustando a
 * cor do texto conforme o contexto (ex.: cards de alerta no Resultado).
 */
import { StyleSheet } from 'react-native';
import { colors, fonts } from './theme';

export function markdownStyles(corBase: string = colors.text) {
  return StyleSheet.create({
    body: { color: corBase, fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 },
    paragraph: { marginTop: 0, marginBottom: 8 },
    heading1: { color: colors.primary, fontFamily: fonts.bold, fontSize: 18, marginBottom: 4 },
    heading2: { color: colors.primary, fontFamily: fonts.bold, fontSize: 16, marginBottom: 4 },
    heading3: { color: colors.primary, fontFamily: fonts.semibold, fontSize: 15, marginBottom: 2 },
    strong: { color: corBase, fontFamily: fonts.bold },
    em: { fontStyle: 'italic' },
    bullet_list: { marginVertical: 2 },
    ordered_list: { marginVertical: 2 },
    list_item: { color: corBase, fontFamily: fonts.regular },
    link: { color: colors.primary, textDecorationLine: 'underline' },
    code_inline: {
      fontFamily: 'monospace',
      backgroundColor: colors.background,
      color: colors.text,
      borderRadius: 4,
    },
    fence: {
      fontFamily: 'monospace',
      backgroundColor: colors.background,
      color: colors.text,
      borderColor: colors.border,
      borderRadius: 8,
    },
    code_block: {
      fontFamily: 'monospace',
      backgroundColor: colors.background,
      color: colors.text,
      borderRadius: 8,
    },
  });
}
