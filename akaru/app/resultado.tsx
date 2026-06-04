/**
 * Resultado da Recomendação — conversão fiel do design do Akaru.
 * Card de cabeçalho (emoji, nome, localização, badge de status), cards de
 * detalhes (época, espaçamento, irrigação, alertas) e ações.
 * Lê o culturaId da rota e busca via obterRecomendacao().
 */
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Button from '../components/Button';
import { obterRecomendacao } from '../services/recomendacao';
import { salvarNoHistorico } from '../services/historico';
import { Recomendacao, DetalheRecomendacao } from '../services/mocks';
import { colors, spacing, radius, fonts, shadow, statusStyles } from '../constants/theme';

type EstiloDetalhe = {
  icone: keyof typeof Ionicons.glyphMap;
  bg: string;
  cor: string;
  textoCor: string;
};

function estiloDetalhe(tipo: DetalheRecomendacao['tipo']): EstiloDetalhe {
  switch (tipo) {
    case 'epoca':
      return { icone: 'calendar-outline', bg: colors.accent, cor: colors.primary, textoCor: colors.muted };
    case 'espacamento':
      return { icone: 'resize-outline', bg: colors.accent, cor: colors.primary, textoCor: colors.muted };
    case 'irrigacao':
      return { icone: 'water-outline', bg: colors.infoBg, cor: colors.infoText, textoCor: colors.muted };
    case 'alerta':
      return { icone: 'warning-outline', bg: colors.warningBg, cor: colors.warningIcon, textoCor: colors.warningText };
  }
}

export default function ResultadoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ culturaId?: string }>();
  const culturaId = Array.isArray(params.culturaId) ? params.culturaId[0] : params.culturaId ?? 'milho';

  const [rec, setRec] = useState<Recomendacao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const r = await obterRecomendacao(culturaId);
        if (ativo) setRec(r);
      } catch (e: any) {
        Alert.alert('Erro', e?.message ?? 'Não foi possível gerar a recomendação.');
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [culturaId]);

  async function compartilhar() {
    if (!rec) return;
    try {
      await Share.share({
        message: `Recomendação Akaru — ${rec.nome} (${rec.cidade}, ${rec.uf}): ${rec.resumoStatus}.\n${rec.detalhes
          .map((d) => `• ${d.titulo}: ${d.descricao}`)
          .join('\n')}`,
      });
    } catch {
      // usuário cancelou o compartilhamento
    }
  }

  async function salvar() {
    if (!rec) return;
    try {
      setSalvando(true);
      await salvarNoHistorico({
        id: `h${Date.now()}`,
        culturaId: rec.culturaId,
        emoji: rec.emoji,
        nome: rec.nome,
        data: 'Agora',
        status: rec.status,
      });
      Alert.alert('Salvo!', 'A recomendação foi salva no seu histórico.');
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  const badge = rec ? statusStyles[rec.status] : statusStyles.Ideal;

  return (
    <View style={styles.tela}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.gap }]}>
        <Pressable hitSlop={8} onPress={() => router.back()} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={24} color={colors.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitulo}>Recomendação</Text>
        <Pressable hitSlop={8} onPress={compartilhar} accessibilityLabel="Compartilhar">
          <Ionicons name="share-outline" size={22} color={colors.onPrimary} />
        </Pressable>
      </View>

      {carregando || !rec ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
          {/* Card de cabeçalho */}
          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>{rec.emoji}</Text>
            <Text style={styles.heroNome}>{rec.nome}</Text>
            <View style={styles.heroLocal}>
              <Ionicons name="location-outline" size={16} color={colors.muted} />
              <Text style={styles.heroLocalTexto}>
                {rec.cidade}, {rec.uf}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeTexto, { color: badge.text }]}>✓ {rec.resumoStatus}</Text>
            </View>
          </View>

          {/* Detalhes */}
          <View style={{ gap: spacing.gap }}>
            {rec.detalhes.map((d, i) => {
              const est = estiloDetalhe(d.tipo);
              return (
                <View key={i} style={styles.detalhe}>
                  <View style={[styles.detalheIcone, { backgroundColor: est.bg }]}>
                    <Ionicons name={est.icone} size={20} color={est.cor} />
                  </View>
                  <View style={styles.detalheTexto}>
                    <Text style={styles.detalheTitulo}>{d.titulo}</Text>
                    <Text style={[styles.detalheDesc, { color: est.textoCor }]}>{d.descricao}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Ações */}
          <View style={styles.acoes}>
            <Button titulo="Salvar no histórico" onPress={salvar} carregando={salvando} />
            <Button titulo="Nova análise" variant="outline" onPress={() => router.replace('/analise')} />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.screen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitulo: { fontFamily: fonts.semibold, fontSize: 18, color: colors.onPrimary },

  conteudo: { padding: spacing.screen, gap: spacing.screen, paddingBottom: spacing.xl },

  hero: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.screen,
    ...shadow.card,
  },
  heroEmoji: { fontSize: 64, marginBottom: spacing.stack },
  heroNome: { fontFamily: fonts.bold, fontSize: 24, color: colors.primary, marginBottom: spacing.stack },
  heroLocal: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.gap },
  heroLocalTexto: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted },
  badge: { paddingHorizontal: spacing.screen, paddingVertical: 6, borderRadius: radius.pill },
  badgeTexto: { fontFamily: fonts.bold, fontSize: 12 },

  detalhe: {
    flexDirection: 'row',
    gap: spacing.gap,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.screen,
    ...shadow.card,
  },
  detalheIcone: { width: 40, height: 40, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  detalheTexto: { flex: 1, gap: 2 },
  detalheTitulo: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  detalheDesc: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 19 },

  acoes: { gap: spacing.gap, marginTop: spacing.stack },
});
