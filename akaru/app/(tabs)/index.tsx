/**
 * Home — conversão fiel do design do Akaru.
 * Header verde com saudação/avatar e sino, card de clima, botão "Nova análise"
 * e lista "Últimas consultas". Dados vêm dos services (mocks por enquanto).
 */
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import StatusChip from '../../components/StatusChip';
import { useAuth } from '../../contexts/AuthContext';
import { obterClimaAtual } from '../../services/culturas';
import { listarHistorico } from '../../services/historico';
import { Clima, ItemHistorico } from '../../services/mocks';
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

  const [clima, setClima] = useState<Clima | null>(null);
  const [consultas, setConsultas] = useState<ItemHistorico[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const [c, h] = await Promise.all([obterClimaAtual(), listarHistorico()]);
        if (ativo) {
          setClima(c);
          setConsultas(h.slice(0, 2));
        }
      } catch (e: any) {
        Alert.alert('Erro', e?.message ?? 'Não foi possível carregar os dados.');
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const primeiroNome = user?.displayName?.trim().split(/\s+/)[0] ?? 'Produtor';

  return (
    <View style={styles.tela}>
      {/* Header verde */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.gap }]}>
        <View style={styles.headerEsq}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{iniciais(user?.displayName)}</Text>
          </View>
          <Text style={styles.saudacao}>Olá, {primeiroNome}</Text>
        </View>
        <Pressable hitSlop={8} onPress={() => Alert.alert('Notificações', 'Você não tem novas notificações.')}>
          <Ionicons name="notifications-outline" size={24} color={colors.onPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        {carregando ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : (
          <>
            {/* Card de clima */}
            {clima && (
              <View style={[styles.card, styles.cardClima]}>
                <View style={styles.climaTopo}>
                  <View>
                    <Text style={styles.climaCidade}>
                      {clima.cidade}, {clima.uf}
                    </Text>
                    <Text style={styles.climaCondicao}>{clima.condicao}</Text>
                  </View>
                  <Text style={styles.climaTemp}>{clima.temperatura}°C</Text>
                </View>
                <View style={styles.climaInfos}>
                  <View style={styles.climaInfo}>
                    <Ionicons name="cloud-outline" size={20} color={colors.muted} />
                    <View>
                      <Text style={styles.climaLabel}>UMIDADE</Text>
                      <Text style={styles.climaValor}>{clima.umidade}%</Text>
                    </View>
                  </View>
                  <View style={styles.climaInfo}>
                    <Ionicons name="water-outline" size={20} color={colors.muted} />
                    <View>
                      <Text style={styles.climaLabel}>CHUVA</Text>
                      <Text style={styles.climaValor}>{clima.chuvaMm}mm</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Nova análise */}
            <View style={styles.secao}>
              <Text style={styles.secaoTitulo}>O que plantar hoje?</Text>
              <Pressable style={styles.botaoAnalise} onPress={() => router.push('/analise')}>
                <Ionicons name="leaf-outline" size={20} color={colors.onPrimary} />
                <Text style={styles.botaoAnaliseTexto}>Nova análise</Text>
              </Pressable>
            </View>

            {/* Últimas consultas */}
            <View style={styles.secao}>
              <View style={styles.secaoHeader}>
                <Text style={styles.secaoTitulo}>Últimas consultas</Text>
                <Pressable hitSlop={8} onPress={() => router.push('/historico')}>
                  <Text style={styles.verTudo}>Ver tudo</Text>
                </Pressable>
              </View>

              {consultas.length === 0 ? (
                <Text style={styles.vazio}>Nenhuma consulta ainda.</Text>
              ) : (
                <View style={{ gap: spacing.stack }}>
                  {consultas.map((item) => (
                    <Pressable
                      key={item.id}
                      style={styles.consulta}
                      onPress={() => router.push(`/resultado?culturaId=${item.culturaId}`)}
                    >
                      <View style={styles.consultaEsq}>
                        <Text style={styles.consultaEmoji}>{item.emoji}</Text>
                        <View>
                          <Text style={styles.consultaNome}>{item.nome}</Text>
                          <Text style={styles.consultaData}>{item.data}</Text>
                        </View>
                      </View>
                      <StatusChip status={item.status} />
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
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
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { fontFamily: fonts.bold, color: colors.primary, fontSize: 15 },
  saudacao: { fontFamily: fonts.bold, fontSize: 18, color: colors.onPrimary },

  conteudo: { padding: spacing.screen, gap: spacing.section, paddingBottom: spacing.xl },

  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, ...shadow.card },
  cardClima: { padding: 20, gap: spacing.screen },
  climaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  climaCidade: { fontFamily: fonts.bold, fontSize: 20, color: colors.primary },
  climaCondicao: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 2 },
  climaTemp: { fontFamily: fonts.bold, fontSize: 30, color: colors.primary },
  climaInfos: { flexDirection: 'row', gap: spacing.section, paddingTop: spacing.screen, borderTopWidth: 1, borderTopColor: colors.border },
  climaInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.stack },
  climaLabel: { fontFamily: fonts.bold, fontSize: 10, color: colors.muted, letterSpacing: 0.5 },
  climaValor: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },

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
  consultaData: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, textTransform: 'uppercase', marginTop: 2 },
  vazio: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
});
