/**
 * Modal explicativo de permissão de localização.
 *
 * Aparece quando o usuário negou o GPS. Oferece abrir as Configurações do
 * dispositivo (para conceder a permissão) ou continuar com a localização padrão
 * (São Paulo) como fallback.
 */
import { Modal, View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fonts, shadow } from '../constants/theme';

type Props = {
  visible: boolean;
  /** Continua com a localização padrão (São Paulo) e fecha o modal. */
  onUsarPadrao: () => void;
};

export default function LocationPermissionModal({ visible, onUsarPadrao }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onUsarPadrao}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconeWrap}>
            <Ionicons name="location" size={32} color={colors.primary} />
          </View>

          <Text style={styles.titulo}>Precisamos da sua localização</Text>
          <Text style={styles.texto}>
            O Akaru usa sua localização para buscar dados climáticos da sua região e gerar recomendações
            precisas de plantio.
          </Text>

          <Pressable
            style={styles.btnPrimario}
            onPress={() => Linking.openSettings()}
            accessibilityRole="button"
            accessibilityLabel="Abrir Configurações"
          >
            <Text style={styles.btnPrimarioTexto}>Abrir Configurações</Text>
          </Pressable>

          <Pressable
            style={styles.btnSecundario}
            onPress={onUsarPadrao}
            accessibilityRole="button"
            accessibilityLabel="Usar São Paulo como padrão"
          >
            <Text style={styles.btnSecundarioTexto}>Usar São Paulo como padrão</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.section,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.section,
    alignItems: 'center',
    gap: spacing.gap,
    ...shadow.card,
  },
  iconeWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  titulo: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary, textAlign: 'center' },
  texto: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  btnPrimario: {
    width: '100%',
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimarioTexto: { fontFamily: fonts.bold, fontSize: 15, color: colors.onPrimary },
  btnSecundario: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecundarioTexto: { fontFamily: fonts.bold, fontSize: 14, color: colors.muted },
});
