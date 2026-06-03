import { useState } from 'react';
import { Pressable, Text, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Placeholder from '../../components/Placeholder';
import { useAuth } from '../../contexts/AuthContext';
import { colors, radius, spacing, fonts, buttonHeight } from '../../constants/theme';

export default function PerfilScreen() {
  const { signOut } = useAuth();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    try {
      setSaindo(true);
      await signOut(); // a proteção de rotas redireciona para /login automaticamente
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível sair.');
      setSaindo(false);
    }
  }

  return (
    <Placeholder titulo="Sobre o App" icone="person-outline">
      <Pressable style={styles.botao} onPress={sair} disabled={saindo}>
        {saindo ? (
          <ActivityIndicator color={colors.errorText} />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={20} color={colors.errorText} />
            <Text style={styles.botaoTexto}>Sair da conta</Text>
          </>
        )}
      </Pressable>
    </Placeholder>
  );
}

const styles = StyleSheet.create({
  botao: {
    flexDirection: 'row',
    gap: spacing.stack,
    height: buttonHeight,
    borderWidth: 2,
    borderColor: colors.errorText,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.section,
    marginTop: spacing.gap,
  },
  botaoTexto: { color: colors.errorText, fontFamily: fonts.bold },
});
