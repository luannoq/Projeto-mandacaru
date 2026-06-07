/**
 * Sobre o App / Perfil — conversão fiel do design do Akaru.
 * Avatar, nome + slogan, badge de versão, infos do build, links e logout real.
 */
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../contexts/AuthContext';
import { mockSobreApp } from '../../services/mocks';
import { GIT_COMMIT_HASH } from '../../constants/commit';
import { colors, spacing, radius, fonts, shadow } from '../../constants/theme';

type Info = { icone: keyof typeof Ionicons.glyphMap; label: string; valor: string; mono?: boolean };

type Documento = { titulo: string; texto: string };

const POLITICA_PRIVACIDADE: Documento = {
  titulo: 'Política de privacidade',
  texto:
    'O Akaru leva a sério a proteção dos dados dos agricultores. Coletamos apenas as informações ' +
    'necessárias — e-mail, localização aproximada e suas consultas de cultivo — para gerar ' +
    'recomendações de plantio mais precisas para a sua região.\n\n' +
    'Seus dados não são vendidos nem compartilhados com terceiros e são usados exclusivamente para ' +
    'melhorar sua experiência no aplicativo.',
};

const TERMOS_USO: Documento = {
  titulo: 'Termos de uso',
  texto:
    'Ao usar o Akaru, você concorda em utilizar as recomendações de plantio como apoio à decisão, ' +
    'e não como garantia de resultado.\n\n' +
    'As recomendações são geradas a partir de dados climáticos e de Inteligência Artificial, podendo ' +
    'variar conforme as condições reais da sua lavoura. Use o aplicativo de forma responsável.',
};

export default function PerfilScreen() {
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [saindo, setSaindo] = useState(false);
  const [documento, setDocumento] = useState<Documento | null>(null);

  const infos: Info[] = [
    { icone: 'person-outline', label: 'Desenvolvido por', valor: mockSobreApp.desenvolvidoPor },
    { icone: 'code-slash-outline', label: 'Versão do build', valor: mockSobreApp.versao },
    { icone: 'git-commit-outline', label: 'Commit', valor: `#${GIT_COMMIT_HASH}`, mono: true },
  ];

  function confirmarSaida() {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: sair },
    ]);
  }

  async function sair() {
    try {
      setSaindo(true);
      await signOut(); // proteção de rotas redireciona para /login automaticamente
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível sair.');
      setSaindo(false);
    }
  }

  return (
    <View style={styles.tela}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.gap }]}>
        <Text style={styles.headerTitulo}>Sobre o app</Text>
      </View>

      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        {/* Identidade */}
        <View style={styles.identidade}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>A</Text>
          </View>
          <Text style={styles.nome}>{mockSobreApp.nome}</Text>
          <Text style={styles.slogan}>{mockSobreApp.slogan}</Text>
          <View style={styles.versaoBadge}>
            <Text style={styles.versaoTexto}>v{mockSobreApp.versao}</Text>
          </View>
        </View>

        {/* Infos do build */}
        <View style={styles.card}>
          {infos.map((info, i) => (
            <View key={info.label} style={[styles.linha, i > 0 && styles.linhaBorda]}>
              <View style={styles.linhaEsq}>
                <Ionicons name={info.icone} size={20} color={colors.primary} />
                <Text style={styles.linhaLabel}>{info.label}</Text>
              </View>
              <Text style={[styles.linhaValor, info.mono && styles.mono]}>{info.valor}</Text>
            </View>
          ))}
        </View>

        {/* Links */}
        <View style={styles.card}>
          <Pressable
            style={styles.linha}
            accessibilityRole="button"
            accessibilityLabel="Política de privacidade"
            onPress={() => setDocumento(POLITICA_PRIVACIDADE)}
          >
            <View style={styles.linhaEsq}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
              <Text style={styles.linhaLabel}>Política de privacidade</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
          <Pressable
            style={[styles.linha, styles.linhaBorda]}
            accessibilityRole="button"
            accessibilityLabel="Termos de uso"
            onPress={() => setDocumento(TERMOS_USO)}
          >
            <View style={styles.linhaEsq}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              <Text style={styles.linhaLabel}>Termos de uso</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        </View>

        {/* Sair */}
        <Pressable style={styles.sair} onPress={confirmarSaida} disabled={saindo}>
          {saindo ? (
            <ActivityIndicator color={colors.errorText} />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color={colors.errorText} />
              <Text style={styles.sairTexto}>Sair da conta</Text>
            </>
          )}
        </Pressable>

        <Text style={styles.rodape}>Global Solution 2026/1 — FIAP</Text>
      </ScrollView>

      {/* Modal de Política de privacidade / Termos de uso */}
      <Modal
        visible={documento !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDocumento(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>{documento?.titulo}</Text>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTexto}>{documento?.texto}</Text>
            </ScrollView>
            <Pressable
              style={styles.modalBotao}
              onPress={() => setDocumento(null)}
              accessibilityRole="button"
              accessibilityLabel="Entendi"
            >
              <Text style={styles.modalBotaoTexto}>Entendi</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.screen,
  },
  headerTitulo: { fontFamily: fonts.bold, fontSize: 18, color: colors.onPrimary },

  conteudo: { padding: spacing.screen, gap: spacing.section, paddingBottom: spacing.xl },

  identidade: { alignItems: 'center', gap: spacing.stack, marginTop: spacing.stack },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.surface,
    ...shadow.card,
  },
  avatarTexto: { fontFamily: fonts.bold, fontSize: 32, color: colors.onPrimary },
  nome: { fontFamily: fonts.bold, fontSize: 24, color: colors.primary },
  slogan: { fontFamily: fonts.regular, fontStyle: 'italic', fontSize: 13, color: colors.muted },
  versaoBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.screen,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  versaoTexto: { fontFamily: fonts.bold, fontSize: 12, color: colors.primary },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    overflow: 'hidden',
    ...shadow.card,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.screen,
  },
  linhaBorda: { borderTopWidth: 1, borderTopColor: colors.border },
  linhaEsq: { flexDirection: 'row', alignItems: 'center', gap: spacing.gap, flexShrink: 0 },
  linhaLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  linhaValor: {
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: spacing.gap,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  mono: {
    fontFamily: 'monospace',
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },

  sair: {
    flexDirection: 'row',
    gap: spacing.stack,
    height: 52,
    borderWidth: 2,
    borderColor: colors.errorText,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sairTexto: { fontFamily: fonts.bold, fontSize: 15, color: colors.errorText },

  rodape: {
    textAlign: 'center',
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.6,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.section,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.section,
    gap: spacing.gap,
    ...shadow.card,
  },
  modalTitulo: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary },
  modalScroll: { flexGrow: 0 },
  modalTexto: { fontFamily: fonts.regular, fontSize: 14, color: colors.text, lineHeight: 21 },
  modalBotao: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBotaoTexto: { fontFamily: fonts.bold, fontSize: 15, color: colors.onPrimary },
});
