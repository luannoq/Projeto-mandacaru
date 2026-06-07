/**
 * Home — conversão fiel do design do Akaru.
 * Header verde com saudação/avatar e sino, card de clima (API real),
 * botão "Nova análise" e "Últimas consultas" (histórico local por IDs).
 */
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import AptidaoBadge from '../../components/AptidaoBadge';
import LocationBadge from '../../components/LocationBadge';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../hooks/useLocation';
import { consultarClima } from '../../services/clima';
import { listarHistorico } from '../../services/historico';
import { getEmojiForCultura } from '../../constants/culturas';
import { handleApiError } from '../../utils/handleApiError';
import type { ClimaResumoResponse, RecomendacaoResponse } from '../../types/api';
import { colors, spacing, radius, fonts, shadow } from '../../constants/theme';

function iniciais(nome: string | null | undefined): string {
  if (!nome) return 'P';
  const partes = nome.trim().split(/\s+/);
  const ini = (partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '');
  return ini.toUpperCase() || 'P';
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { location, loading: localizando, permissionDenied, requestLocation } = useLocation();

  const [clima, setClima] = useState<ClimaResumoResponse | null>(null);
  const [climaIndisponivel, setClimaIndisponivel] = useState(false);
  const [consultas, setConsultas] = useState<RecomendacaoResponse[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Localização ao abrir a Home.
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Re-checa a permissão ao voltar das Configurações (some o banner se concedida).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') requestLocation();
    });
    return () => sub.remove();
  }, [requestLocation]);

  // Clima real assim que houver localização (falha de clima não bloqueia a tela).
  useEffect(() => {
    if (!location) return;
    let ativo = true;
    (async () => {
      try {
        const c = await consultarClima(location.latitude, location.longitude);
        if (ativo) {
          setClima(c);
          setClimaIndisponivel(false);
        }
      } catch {
        // Sem fallback: dados devem vir da API. Marca o card como indisponível.
        if (ativo) {
          setClima(null);
          setClimaIndisponivel(true);
        }
      }
    })();
    return () => {
      ativo = false;
    };
  }, [location]);

  // Últimas consultas (2 primeiras do histórico local) — recarrega ao focar a aba.
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);
      (async () => {
        try {
          const lista = await listarHistorico();
          if (ativo) setConsultas(lista.slice(0, 2));
        } catch (e) {
          if (ativo) Alert.alert('Erro', handleApiError(e));
        } finally {
          if (ativo) setCarregando(false);
        }
      })();
      return () => {
        ativo = false;
      };
    }, []),
  );

  const primeiroNome = user?.nome?.trim().split(/\s+/)[0] ?? 'Produtor';

  return (
    <View style={styles.tela}>
      {/* Header verde */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.gap }]}>
        <View style={styles.headerEsq}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{iniciais(user?.nome)}</Text>
          </View>
          <Text style={styles.saudacao}>Olá, {primeiroNome}</Text>
        </View>
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Notificações"
          onPress={() => Alert.alert('Notificações', 'Você não tem novas notificações.')}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.onPrimary} />
        </Pressable>
      </View>

      {/* Banner de localização desativada */}
      {permissionDenied && (
        <Pressable
          style={styles.banner}
          onPress={() => Linking.openSettings()}
          accessibilityRole="button"
          accessibilityLabel="Localização desativada, toque para ativar nas configurações"
        >
          <Text style={styles.bannerTexto}>📍 Localização desativada — toque para ativar</Text>
        </Pressable>
      )}

      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        {/* Card de clima */}
        <View style={[styles.card, styles.cardClima]}>
          <View style={styles.climaTopo}>
            <View style={styles.climaEsq}>
              <LocationBadge
                cidade={location?.cidade}
                estado={location?.estado}
                loading={localizando}
                color={colors.primary}
                iconSize={18}
                textStyle={styles.climaCidade}
              />
              <Text style={styles.climaCondicao}>Clima atual da sua região</Text>
            </View>
            {clima && <Text style={styles.climaTemp}>{Math.round(clima.temperaturaMedia)}°C</Text>}
          </View>
          {climaIndisponivel ? (
            <View style={styles.climaInfos}>
              <Text style={styles.climaIndisponivel}>Clima indisponível no momento</Text>
            </View>
          ) : (
            <View style={styles.climaInfos}>
              <View style={styles.climaInfo}>
                <Ionicons name="cloud-outline" size={20} color={colors.muted} />
                <View>
                  <Text style={styles.climaLabel}>UMIDADE</Text>
                  <Text style={styles.climaValor}>{clima ? `${Math.round(clima.umidade)}%` : '—'}</Text>
                </View>
              </View>
              <View style={styles.climaInfo}>
                <Ionicons name="water-outline" size={20} color={colors.muted} />
                <View>
                  <Text style={styles.climaLabel}>CHUVA</Text>
                  <Text style={styles.climaValor}>
                    {clima ? `${Math.round(clima.precipitacaoPrevista)}mm` : '—'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Nova análise */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>O que plantar hoje?</Text>
          <Pressable
            style={styles.botaoAnalise}
            onPress={() => router.push('/analise')}
            accessibilityRole="button"
            accessibilityLabel="Nova análise"
          >
            <Ionicons name="leaf-outline" size={20} color={colors.onPrimary} />
            <Text style={styles.botaoAnaliseTexto}>Nova análise</Text>
          </Pressable>
        </View>

        {/* Últimas consultas */}
        <View style={styles.secao}>
          <View style={styles.secaoHeader}>
            <Text style={styles.secaoTitulo}>Últimas consultas</Text>
            <Pressable
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Ver todas as consultas"
              onPress={() => router.push('/historico')}
            >
              <Text style={styles.verTudo}>Ver tudo</Text>
            </Pressable>
          </View>

          {carregando ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.gap }} />
          ) : consultas.length === 0 ? (
            <Text style={styles.vazio}>Nenhuma consulta ainda.</Text>
          ) : (
            <View style={{ gap: spacing.stack }}>
              {consultas.map((item) => (
                <Pressable
                  key={item.recomendacaoId}
                  style={styles.consulta}
                  accessibilityRole="button"
                  accessibilityLabel={`Consulta de ${item.cultura.nome}, aptidão ${item.classificacaoAptidao}`}
                  onPress={() => router.push(`/resultado?id=${item.recomendacaoId}`)}
                >
                  <View style={styles.consultaEsq}>
                    <Text style={styles.consultaEmoji}>{getEmojiForCultura(item.cultura.nome)}</Text>
                    <View>
                      <Text style={styles.consultaNome}>{item.cultura.nome}</Text>
                      <Text style={styles.consultaData}>Aptidão {item.scoreAptidao}/100</Text>
                    </View>
                  </View>
                  <AptidaoBadge classificacao={item.classificacaoAptidao} />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB do IAkaru */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/iakaru')}
        accessibilityRole="button"
        accessibilityLabel="Abrir IAkaru, assistente de plantio"
      >
        <Ionicons name="chatbubbles" size={26} color={colors.onPrimary} />
      </Pressable>
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
  headerEsq: { flexDirection: 'row', alignItems: 'center', gap: spacing.gap },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { fontFamily: fonts.bold, color: colors.primary, fontSize: 15 },
  saudacao: { fontFamily: fonts.bold, fontSize: 18, color: colors.onPrimary },

  banner: {
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.stack,
    alignItems: 'center',
  },
  bannerTexto: { fontFamily: fonts.medium, fontSize: 13, color: colors.warningText },

  conteudo: { padding: spacing.screen, gap: spacing.section, paddingBottom: spacing.xl },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    ...shadow.card,
  },
  cardClima: { padding: 20, gap: spacing.screen },
  climaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  climaEsq: { flex: 1, gap: 2 },
  climaCidade: { fontFamily: fonts.bold, fontSize: 20, color: colors.primary },
  climaCondicao: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 2 },
  climaTemp: { fontFamily: fonts.bold, fontSize: 30, color: colors.primary },
  climaInfos: {
    flexDirection: 'row',
    gap: spacing.section,
    paddingTop: spacing.screen,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  climaInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.stack },
  climaLabel: { fontFamily: fonts.bold, fontSize: 10, color: colors.muted, letterSpacing: 0.5 },
  climaValor: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
  climaIndisponivel: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },

  secao: { gap: spacing.gap },
  secaoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  secaoTitulo: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary },
  verTudo: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },

  botaoAnalise: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.stack,
    ...shadow.card,
  },
  botaoAnaliseTexto: { fontFamily: fonts.bold, fontSize: 16, color: colors.onPrimary },

  consulta: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.screen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  consultaEsq: { flexDirection: 'row', alignItems: 'center', gap: spacing.gap },
  consultaEmoji: { fontSize: 24 },
  consultaNome: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  consultaData: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 2 },
  vazio: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },

  fab: {
    position: 'absolute',
    right: spacing.screen,
    bottom: spacing.screen,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
});
