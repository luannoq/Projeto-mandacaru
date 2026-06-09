/**
 * Resultado da Recomendação — conversão fiel do design do Akaru.
 *
 * Dois caminhos:
 *  - vindo da Nova Análise → gerarRecomendacao(request) com culturaId + GPS
 *  - vindo da Home/Histórico → buscarRecomendacao(id) por recomendacaoId
 *
 * Exibe hero (emoji, nome, localização, badge de aptidão), os 4 cards do
 * plano de plantio (Gemini) e ações.
 */
import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';

import Button from '../components/Button';
import LocationBadge from '../components/LocationBadge';
import AptidaoBadge from '../components/AptidaoBadge';
import { gerarRecomendacao, buscarRecomendacao } from '../services/recomendacao';
import { salvarNoHistorico } from '../services/historico';
import { getEmojiForCultura } from '../constants/culturas';
import { handleApiError } from '../utils/handleApiError';
import { markdownStyles } from '../constants/markdown';
import type { RecomendacaoResponse } from '../types/api';
import { colors, spacing, radius, fonts, shadow } from '../constants/theme';

type TipoDetalhe = 'epoca' | 'espacamento' | 'irrigacao' | 'alerta';

function estiloDetalhe(tipo: TipoDetalhe) {
  switch (tipo) {
    case 'epoca':
      return {
        icone: 'calendar-outline' as const,
        bg: colors.accent,
        cor: colors.primary,
        textoCor: colors.muted,
      };
    case 'espacamento':
      return {
        icone: 'resize-outline' as const,
        bg: colors.accent,
        cor: colors.primary,
        textoCor: colors.muted,
      };
    case 'irrigacao':
      return {
        icone: 'water-outline' as const,
        bg: colors.infoBg,
        cor: colors.infoText,
        textoCor: colors.muted,
      };
    case 'alerta':
      return {
        icone: 'warning-outline' as const,
        bg: colors.warningBg,
        cor: colors.warningIcon,
        textoCor: colors.warningText,
      };
  }
}

function umParam(valor?: string | string[]): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

export default function ResultadoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string;
    culturaId?: string;
    latitude?: string;
    longitude?: string;
    cidade?: string;
    estado?: string;
    detalhes?: string;
  }>();

  const id = umParam(params.id);
  const culturaId = umParam(params.culturaId);
  const latitude = umParam(params.latitude);
  const longitude = umParam(params.longitude);
  const cidade = umParam(params.cidade);
  const estado = umParam(params.estado);
  const detalhes = umParam(params.detalhes);

  const [rec, setRec] = useState<RecomendacaoResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [msgErro, setMsgErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(false);
    try {
      let resultado: RecomendacaoResponse;
      if (id) {
        resultado = await buscarRecomendacao(Number(id));
      } else {
        resultado = await gerarRecomendacao({
          culturaId: Number(culturaId),
          latitude: Number(latitude),
          longitude: Number(longitude),
          cidade: cidade ?? '',
          estado: estado ?? '',
          ...(detalhes ? { detalhes } : {}),
        });
      }
      setRec(resultado);
    } catch (e) {
      // Não navega de volta: mostra a tela de erro inline com retry e o motivo real.
      setMsgErro(handleApiError(e));
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }, [id, culturaId, latitude, longitude, cidade, estado, detalhes]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function compartilhar() {
    if (!rec) return;
    try {
      const p = rec.planoPlantio;
      await Share.share({
        message:
          `Recomendação Akaru — ${rec.cultura.nome} (${rec.localizacao.cidade}, ${rec.localizacao.estado}): ` +
          `aptidão ${rec.scoreAptidao}/100 (${rec.classificacaoAptidao}).\n` +
          `• Época ideal: ${p.epocaIdeal}\n• Espaçamento: ${p.espacamento}\n` +
          `• Irrigação: ${p.irrigacao}\n• Alertas: ${p.alertasRisco}`,
      });
    } catch {
      // usuário cancelou o compartilhamento
    }
  }

  async function salvar() {
    if (!rec) return;
    try {
      setSalvando(true);
      await salvarNoHistorico(rec.recomendacaoId);
      // Sucesso: a própria navegação para a Home é o feedback (sem Alert).
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Erro', handleApiError(e));
      setSalvando(false);
    }
  }

  const cards = rec
    ? [
        { tipo: 'epoca' as const, titulo: 'Época ideal', descricao: rec.planoPlantio.epocaIdeal },
        { tipo: 'espacamento' as const, titulo: 'Espaçamento', descricao: rec.planoPlantio.espacamento },
        { tipo: 'irrigacao' as const, titulo: 'Irrigação', descricao: rec.planoPlantio.irrigacao },
        { tipo: 'alerta' as const, titulo: 'Alertas de risco', descricao: rec.planoPlantio.alertasRisco },
      ]
    : [];

  return (
    <View style={styles.tela}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.gap }]}>
        <Pressable
          hitSlop={8}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={24} color={colors.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitulo}>Recomendação</Text>
        <Pressable
          hitSlop={8}
          onPress={compartilhar}
          accessibilityRole="button"
          accessibilityLabel="Compartilhar"
        >
          <Ionicons name="share-outline" size={22} color={colors.onPrimary} />
        </Pressable>
      </View>

      {carregando ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : erro || !rec ? (
        <View style={styles.erroBox}>
          <Ionicons name="warning-outline" size={48} color={colors.warningIcon} />
          <Text style={styles.erroTitulo}>Não foi possível gerar a recomendação</Text>
          <Text style={styles.erroTexto}>{msgErro || 'Tente novamente em alguns segundos.'}</Text>
          <View style={styles.erroAcoes}>
            <Button titulo="Tentar novamente" onPress={carregar} />
            <Button titulo="Voltar" variant="outline" onPress={() => router.back()} />
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
          {/* Card de cabeçalho */}
          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>{getEmojiForCultura(rec.cultura.nome)}</Text>
            <Text style={styles.heroNome}>{rec.cultura.nome}</Text>
            <LocationBadge
              cidade={rec.localizacao.cidade}
              estado={rec.localizacao.estado}
              style={styles.heroLocal}
              textStyle={styles.heroLocalTexto}
            />
            <AptidaoBadge classificacao={rec.classificacaoAptidao} score={rec.scoreAptidao} />
          </View>

          {/* Plano de plantio (4 cards do Gemini) */}
          <View style={{ gap: spacing.gap }}>
            {cards.map((d) => {
              const est = estiloDetalhe(d.tipo);
              return (
                <View key={d.tipo} style={styles.detalhe}>
                  <View style={[styles.detalheIcone, { backgroundColor: est.bg }]}>
                    <Ionicons name={est.icone} size={20} color={est.cor} />
                  </View>
                  <View style={styles.detalheTexto}>
                    <Text style={styles.detalheTitulo}>{d.titulo}</Text>
                    <Markdown style={markdownStyles(est.textoCor)}>{d.descricao}</Markdown>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Resumo do agrônomo (mensagem completa do Gemini) */}
          {rec.mensagemCompleta ? (
            <View style={styles.resumo}>
              <View style={styles.resumoHeader}>
                <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                <Text style={styles.resumoTitulo}>Resumo do agrônomo</Text>
              </View>
              <Markdown style={markdownStyles()}>{rec.mensagemCompleta}</Markdown>
            </View>
          ) : null}

          {/* Perguntar ao IAkaru */}
          <Pressable
            style={styles.cardIAkaru}
            accessibilityRole="button"
            accessibilityLabel={`Perguntar ao IAkaru sobre ${rec.cultura.nome}`}
            onPress={() =>
              router.push(
                `/iakaru?culturaId=${rec.cultura.id}&culturaNome=${encodeURIComponent(rec.cultura.nome)}`,
              )
            }
          >
            <View style={styles.iakaruIcone}>
              <Ionicons name="chatbubbles-outline" size={20} color={colors.onPrimary} />
            </View>
            <Text style={styles.iakaruTexto}>Perguntar ao IAkaru sobre {rec.cultura.nome}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>

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

  erroBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.section,
    gap: spacing.gap,
  },
  erroTitulo: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  erroTexto: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  erroAcoes: { width: '100%', gap: spacing.gap, marginTop: spacing.gap },

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
  heroLocal: { marginBottom: spacing.gap },
  heroLocalTexto: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted },

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
  detalheIcone: {
    width: 40,
    height: 40,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detalheTexto: { flex: 1, gap: 2 },
  detalheTitulo: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },

  resumo: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.screen,
    gap: spacing.stack,
    ...shadow.card,
  },
  resumoHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.stack },
  resumoTitulo: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },

  cardIAkaru: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: radius.card,
    padding: spacing.screen,
    ...shadow.card,
  },
  iakaruIcone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iakaruTexto: { flex: 1, fontFamily: fonts.bold, fontSize: 14, color: colors.primary },

  acoes: { gap: spacing.gap, marginTop: spacing.stack },
});
