/**
 * Tela-esqueleto temporária. Cada uma será substituída pela conversão fiel
 * do design (HTML do Stitch) na fase de conversão tela a tela.
 */
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts } from '../constants/theme';

type Props = {
  titulo: string;
  icone?: keyof typeof Ionicons.glyphMap;
  children?: React.ReactNode;
};

export default function Placeholder({ titulo, icone = 'leaf-outline', children }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Ionicons name={icone} size={48} color={colors.primary} />
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.nota}>Tela em construção — design será convertido em seguida.</Text>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.screen, gap: spacing.gap },
  titulo: { fontFamily: fonts.bold, fontSize: 22, color: colors.primary },
  nota: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, textAlign: 'center' },
});
