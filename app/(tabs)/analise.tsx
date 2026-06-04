/**
 * Nova Análise — conversão fiel do design do Akaru.
 * Busca de cultura, grid 3 colunas com seleção destacada, detalhes opcionais
 * e botão "Analisar" fixo no rodapé. Culturas vêm de listarCulturas().
 */
import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Button from '../../components/Button';
import { listarCulturas } from '../../services/culturas';
import { Cultura } from '../../services/mocks';
import { colors, spacing, radius, fonts, shadow } from '../../constants/theme';

export default function AnaliseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [culturas, setCulturas] = useState<Cultura[]>([]);
  const [busca, setBusca] = useState('');
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [detalhes, setDetalhes] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const lista = await listarCulturas();
        if (ativo) setCulturas(lista);
      } catch (e: any) {
        Alert.alert('Erro', e?.message ?? 'Não foi possível carregar as culturas.');
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return culturas;
    return culturas.filter((c) => c.nome.toLowerCase().includes(termo));
  }, [busca, culturas]);

  // 3 colunas quadradas
  const itemSize = (width - spacing.screen * 2 - spacing.gap * 2) / 3;

  function analisar() {
    if (!selecionada) {
      Alert.alert('Selecione uma cultura', 'Escolha uma cultura para gerar a recomendação.');
      return;
    }
    router.push({
      pathname: '/resultado',
      params: detalhes.trim() ? { culturaId: selecionada, detalhes: detalhes.trim() } : { culturaId: selecionada },
    });
  }

  return (
    <View style={styles.tela}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.gap }]}>
        <Text style={styles.headerTitulo}>Nova análise</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Busca */}
        <View style={styles.busca}>
          <Ionicons name="search-outline" size={20} color={colors.muted} />
          <TextInput
            style={styles.buscaInput}
            placeholder="Buscar cultura..."
            placeholderTextColor={colors.muted}
            value={busca}
            onChangeText={setBusca}
            autoCorrect={false}
          />
        </View>

        {/* Grid */}
        <Text style={styles.label}>CULTURAS DISPONÍVEIS</Text>
        {carregando ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
        ) : filtradas.length === 0 ? (
          <Text style={styles.vazio}>Nenhuma cultura encontrada.</Text>
        ) : (
          <View style={styles.grid}>
            {filtradas.map((cultura) => {
              const ativa = selecionada === cultura.id;
              return (
                <Pressable
                  key={cultura.id}
                  onPress={() => setSelecionada(cultura.id)}
                  style={[
                    styles.celula,
                    { width: itemSize, height: itemSize },
                    ativa ? styles.celulaAtiva : styles.celulaInativa,
                  ]}
                >
                  <Text style={styles.celulaEmoji}>{cultura.emoji}</Text>
                  <Text style={styles.celulaNome}>{cultura.nome}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Detalhes */}
        <View style={styles.detalhesBox}>
          <Text style={styles.detalhesLabel}>Detalhes adicionais (opcional)</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Ex: meu solo é argiloso, não tenho irrigação..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={detalhes}
            onChangeText={setDetalhes}
          />
        </View>
      </ScrollView>

      {/* Rodapé fixo */}
      <View style={[styles.footer, { paddingBottom: spacing.gap }]}>
        <Button titulo="Analisar" onPress={analisar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingHorizontal: spacing.screen, paddingBottom: spacing.screen },
  headerTitulo: { fontFamily: fonts.bold, fontSize: 18, color: colors.onPrimary },

  conteudo: { padding: spacing.screen, gap: spacing.section, paddingBottom: spacing.section },

  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stack,
    height: 52,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: spacing.screen,
    ...shadow.card,
  },
  buscaInput: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.text, padding: 0 },

  label: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1, color: colors.muted, textTransform: 'uppercase' },
  vazio: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: spacing.stack },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.gap },
  celula: { borderRadius: radius.card, alignItems: 'center', justifyContent: 'center', gap: spacing.stack, ...shadow.card },
  celulaInativa: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  celulaAtiva: { backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.primary },
  celulaEmoji: { fontSize: 30 },
  celulaNome: { fontFamily: fonts.bold, fontSize: 12, color: colors.primary },

  detalhesBox: { gap: spacing.stack },
  detalhesLabel: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  textarea: {
    minHeight: 88,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    padding: spacing.screen,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    ...shadow.card,
  },

  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.gap,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
