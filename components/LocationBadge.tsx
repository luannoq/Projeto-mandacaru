/**
 * Exibe a localização atual (ícone + "Cidade, Estado").
 * Mostra um indicador enquanto carrega e cai no `fallback` quando não há
 * localização (ex.: permissão negada). Reutilizado na Home, no Resultado e
 * onde mais for preciso mostrar a localização do usuário.
 */
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing } from '../constants/theme';

type Props = {
  cidade?: string | null;
  estado?: string | null;
  /** Mostra o indicador de carregamento no lugar do texto. */
  loading?: boolean;
  /** Texto exibido quando não há cidade (ex.: permissão negada). */
  fallback?: string;
  /** Cor do ícone e do texto. */
  color?: string;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export default function LocationBadge({
  cidade,
  estado,
  loading = false,
  fallback = 'Localização indisponível',
  color = colors.muted,
  iconSize = 16,
  style,
  textStyle,
}: Props) {
  const texto = cidade ? (estado ? `${cidade}, ${estado}` : cidade) : fallback;

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="text"
      accessibilityLabel={`Localização: ${loading ? 'localizando' : texto}`}
    >
      <Ionicons name="location-outline" size={iconSize} color={color} />
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Text style={[styles.texto, { color }, textStyle]} numberOfLines={1}>
          {texto}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  texto: { fontFamily: fonts.medium, fontSize: 14 },
});
