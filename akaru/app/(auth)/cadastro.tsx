/**
 * Tela de Cadastro — conversão fiel do design do Akaru (Google Stitch).
 * Campos Nome/E-mail/Senha/Confirmar senha, card de localização com "Usar GPS",
 * aviso de segurança e link "Já tem uma conta? Entrar".
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, radius, fonts } from '../../constants/theme';
import { mockClima } from '../../services/mocks';

export default function CadastroScreen() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [localizacao, setLocalizacao] = useState<string | null>(null);
  const [buscandoGps, setBuscandoGps] = useState(false);
  const [carregando, setCarregando] = useState(false);

  function usarGps() {
    // TODO: integrar com expo-location para obter a posição real do dispositivo.
    setBuscandoGps(true);
    setTimeout(() => {
      setLocalizacao(`${mockClima.cidade}, ${mockClima.uf}`);
      setBuscandoGps(false);
    }, 800);
  }

  async function cadastrar() {
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim();

    if (!nomeLimpo || !emailLimpo || !senha || !confirmar) {
      Alert.alert('Atenção', 'Preencha todos os campos para continuar.');
      return;
    }
    if (!emailLimpo.includes('@')) {
      Alert.alert('E-mail inválido', 'Digite um e-mail válido.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Senha curta', 'A senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (senha !== confirmar) {
      Alert.alert('Senhas diferentes', 'A confirmação não corresponde à senha.');
      return;
    }
    try {
      setCarregando(true);
      await signUp(nomeLimpo, emailLimpo, senha);
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Erro ao criar conta', e?.message ?? 'Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Voltar */}
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.voltar} accessibilityLabel="Voltar">
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>

          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={styles.titulo}>Criar conta</Text>
            <Text style={styles.subtitulo}>Preencha seus dados para começar</Text>
          </View>

          {/* Formulário */}
          <View style={styles.form}>
            <TextField icon="person-outline" placeholder="Nome completo" value={nome} onChangeText={setNome} />
            <TextField
              icon="mail-outline"
              placeholder="E-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
            <TextField icon="lock-closed-outline" placeholder="Senha" senha value={senha} onChangeText={setSenha} />
            <TextField
              icon="lock-closed-outline"
              placeholder="Confirmar senha"
              senha
              value={confirmar}
              onChangeText={setConfirmar}
            />

            {/* Card de localização */}
            <View style={styles.cardLocal}>
              <View style={styles.localEsq}>
                <Ionicons name="location-outline" size={22} color={colors.primary} />
                <Text style={styles.localTexto}>{localizacao ?? 'Sua localização'}</Text>
              </View>
              <Pressable style={styles.gpsBtn} onPress={usarGps} disabled={buscandoGps}>
                {buscandoGps ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={styles.gpsTexto}>Usar GPS</Text>
                )}
              </Pressable>
            </View>

            {/* Aviso de segurança */}
            <View style={styles.aviso}>
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
              <Text style={styles.avisoTexto}>
                Seus dados estão seguros e não serão compartilhados com terceiros.
              </Text>
            </View>
          </View>

          <Button titulo="Criar conta" onPress={cadastrar} carregando={carregando} style={styles.botaoCriar} />

          <View style={styles.footer}>
            <Text style={styles.footerTexto}>Já tem uma conta?</Text>
            <Pressable hitSlop={8} onPress={() => router.replace('/login')}>
              <Text style={styles.footerLink}>Entrar</Text>
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
  scroll: { flexGrow: 1, paddingHorizontal: spacing.screen, paddingBottom: spacing.lg },
  voltar: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center', marginLeft: -8, marginTop: spacing.stack },
  header: { marginTop: spacing.stack, marginBottom: spacing.xl },
  titulo: { fontFamily: fonts.bold, fontSize: 24, color: colors.primary, marginBottom: spacing.xs },
  subtitulo: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  form: { gap: spacing.gap },
  cardLocal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.screen,
    marginTop: spacing.xs,
  },
  localEsq: { flexDirection: 'row', alignItems: 'center', gap: spacing.gap, flex: 1 },
  localTexto: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  gpsBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.gap, paddingVertical: spacing.stack, borderRadius: radius.button },
  gpsTexto: { fontFamily: fonts.bold, fontSize: 12, color: colors.primary },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap,
    backgroundColor: colors.accent,
    borderRadius: radius.card,
    padding: spacing.screen,
  },
  avisoTexto: { flex: 1, fontFamily: fonts.medium, fontSize: 12, color: colors.primary, lineHeight: 17 },
  botaoCriar: { marginTop: spacing.lg },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs, marginTop: spacing.lg },
  footerTexto: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  footerLink: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
});
