/**
 * Chip de status da recomendação (Ideal / Atenção / Risco).
 * Cores vêm de statusStyles no design system.
 */
import { View, Text, StyleSheet } from 'react-native';
import { statusStyles, fonts, radius, type StatusRecomendacao } from '../constants/theme';

export default function StatusChip({ status }: { status: StatusRecomendacao }) {
  const estilo = statusStyles[status];
  return (
    <View style={[styles.chip, { backgroundColor: estilo.bg }]}>
      <Text style={[styles.texto, { color: estilo.text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  texto: { fontFamily: fonts.bold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
});
