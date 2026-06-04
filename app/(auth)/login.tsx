/**
 * Tela de Login — conversão fiel do design do Akaru (Google Stitch).
 * Logo circular, inputs com ícone, toggle de senha, botões "Entrar" e
 * "Criar conta", divisor "ou" e link de recuperação de senha.
 */
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, fonts } from '../../constants/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    const emailLimpo = email.trim();
    if (!emailLimpo || !senha) {
      Alert.alert('Atenção', 'Preencha o e-mail e a senha para continuar.');
      return;
    }
    if (!emailLimpo.includes('@')) {
      Alert.alert('E-mail inválido', 'Digite um e-mail válido.');
      return;
    }
    try {
      setCarregando(true);
      await signIn(emailLimpo, senha);
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Erro ao entrar', e?.message ?? 'Verifique seus dados e tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Cabeçalho com logo */}
          <View style={styles.header}>
            <View style={styles.logo}>
              <Ionicons name="leaf" size={56} color={colors.onPrimary} />
            </View>
            <Text style={styles.titulo}>Bem-vindo de volta</Text>
            <Text style={styles.subtitulo}>Entre na sua conta</Text>
          </View>

          {/* Formulário */}
          <View style={styles.form}>
            <TextField
              icon="mail-outline"
              placeholder="E-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
            />
            <TextField
              icon="lock-closed-outline"
              placeholder="Senha"
              senha
              value={senha}
              onChangeText={setSenha}
              returnKeyType="done"
              onSubmitEditing={entrar}
            />

            <Button titulo="Entrar" onPress={entrar} carregando={carregando} style={styles.botaoEntrar} />

            {/* Divisor "ou" */}
            <View style={styles.divisor}>
              <View style={styles.linha} />
              <Text style={styles.ou}>OU</Text>
              <View style={styles.linha} />
            </View>

            <Button
              titulo="Criar conta"
              variant="outline"
              onPress={() => router.push('/cadastro')}
            />
          </View>

          {/* Rodapé */}
          <View style={styles.footer}>
            <Pressable
              hitSlop={8}
              onPress={() => Alert.alert('Recuperar senha', 'Em breve você poderá redefinir sua senha por aqui.')}
            >
              <Text style={styles.linkSenha}>Esqueceu sua senha?</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.xl,
  },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.surface,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  titulo: { fontFamily: fonts.bold, fontSize: 24, color: colors.primary, marginBottom: spacing.xs },
  subtitulo: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  form: { width: '100%', gap: spacing.gap },
  botaoEntrar: { marginTop: spacing.xs },
  divisor: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.gap },
  linha: { flex: 1, height: 1, backgroundColor: colors.border },
  ou: { marginHorizontal: spacing.screen, fontFamily: fonts.semibold, fontSize: 12, color: colors.muted, letterSpacing: 1 },
  footer: { alignItems: 'center', marginTop: spacing.xl },
  linkSenha: { fontFamily: fonts.medium, fontSize: 14, color: colors.primary, textDecorationLine: 'underline' },
});
