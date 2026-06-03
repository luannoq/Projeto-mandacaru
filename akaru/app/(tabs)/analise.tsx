import { Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Placeholder from '../../components/Placeholder';
import { colors, radius, spacing, fonts, buttonHeight } from '../../constants/theme';

export default function AnaliseScreen() {
  const router = useRouter();
  return (
    <Placeholder titulo="Nova Análise" icone="analytics-outline">
      <Pressable style={styles.botao} onPress={() => router.push('/resultado?culturaId=milho')}>
        <Text style={styles.botaoTexto}>Ver resultado (exemplo)</Text>
      </Pressable>
    </Placeholder>
  );
}

const styles = StyleSheet.create({
  botao: { height: buttonHeight, backgroundColor: colors.primary, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.section, marginTop: spacing.gap },
  botaoTexto: { color: colors.onPrimary, fontFamily: fonts.bold },
});
