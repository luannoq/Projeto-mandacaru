/**
 * Histórico — conversão fiel do design do Akaru.
 * Busca, lista "Consultas Recentes" com emoji/nome/aptidão e botão de excluir,
 * e card vazio pontilhado. Dados de listarHistorico() (IDs locais → API).
 */
import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import AptidaoBadge from '../../components/AptidaoBadge';
import { listarHistorico, removerDoHistorico, limparHistorico } from '../../services/historico';
import { getEmojiForCultura } from '../../constants/culturas';
import { handleApiError } from '../../utils/handleApiError';
import type { RecomendacaoResponse } from '../../types/api';
import { colors, spacing, radius, fonts, shadow } from '../../constants/theme';

/** Formata uma data ISO em "dd/MM HH:mm" (ex.: "07/06 14:32"). */
function formatarData(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dia}/${mes} ${hora}:${min}`;
}

export default function HistoricoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [itens, setItens] = useState<RecomendacaoResponse[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Recarrega sempre que a aba ganha foco (pega análises salvas após a montagem).
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);
      (async () => {
        try {
          const lista = await listarHistorico();
          if (ativo) setItens(lista);
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

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return itens;
    return itens.filter((i) => i.cultura.nome.toLowerCase().includes(termo));
  }, [busca, itens]);

  function confirmarLimpeza() {
    Alert.alert('Limpar histórico?', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar',
        style: 'destructive',
        onPress: async () => {
          await limparHistorico();
          setItens([]);
        },
      },
    ]);
  }

  function confirmarExclusao(item: RecomendacaoResponse) {
    Alert.alert('Remover do histórico', `Remover a recomendação de ${item.cultura.nome}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => excluir(item.recomendacaoId) },
    ]);
  }

  async function excluir(id: number) {
    try {
      await removerDoHistorico(id);
      setItens((prev) => prev.filter((i) => i.recomendacaoId !== id));
    } catch (e) {
      Alert.alert('Erro', handleApiError(e));
    }
  }

  return (
    <View style={styles.tela}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.gap }]}>
        <Text style={styles.headerTitulo}>Histórico</Text>
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Limpar histórico"
          onPress={confirmarLimpeza}
        >
          <Ionicons name="trash-outline" size={20} color={colors.onPrimary} />
        </Pressable>
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
            placeholder="Buscar no histórico..."
            placeholderTextColor={colors.muted}
            value={busca}
            onChangeText={setBusca}
            autoCorrect={false}
            accessibilityLabel="Buscar no histórico"
          />
        </View>

        <Text style={styles.label}>CONSULTAS RECENTES</Text>

        {carregando ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
        ) : (
          <>
            <View style={{ gap: spacing.stack }}>
              {filtrados.map((item) => (
                <Pressable
                  key={item.recomendacaoId}
                  style={styles.item}
                  accessibilityRole="button"
                  accessibilityLabel={`Recomendação de ${item.cultura.nome}, aptidão ${item.classificacaoAptidao}`}
                  onPress={() => router.push(`/resultado?id=${item.recomendacaoId}`)}
                >
                  <View style={styles.itemEsq}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarEmoji}>{getEmojiForCultura(item.cultura.nome)}</Text>
                    </View>
                    <View>
                      <Text style={styles.itemNome}>{item.cultura.nome}</Text>
                      <Text style={styles.itemData}>
                        {item.criadoEm ? formatarData(item.criadoEm) : `Aptidão ${item.scoreAptidao}/100`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.itemDir}>
                    <AptidaoBadge classificacao={item.classificacaoAptidao} />
                    <Pressable
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Remover ${item.cultura.nome} do histórico`}
                      onPress={() => confirmarExclusao(item)}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.errorText} />
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Card vazio pontilhado */}
            {filtrados.length === 0 && (
              <View style={styles.cardVazio}>
                <Ionicons name="leaf-outline" size={36} color={colors.secondary} />
                <Text style={styles.cardVazioTexto}>Suas próximas análises aparecerão aqui.</Text>
              </View>
            )}
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
  headerTitulo: { fontFamily: fonts.bold, fontSize: 18, color: colors.onPrimary },

  conteudo: { padding: spacing.screen, gap: spacing.section, paddingBottom: spacing.xl },

  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stack,
    height: 48,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: spacing.screen,
    ...shadow.card,
  },
  buscaInput: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text, padding: 0 },

  label: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.muted,
    textTransform: 'uppercase',
  },

  item: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.gap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow.card,
  },
  itemEsq: { flexDirection: 'row', alignItems: 'center', gap: spacing.gap },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.button,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 22 },
  itemNome: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  itemData: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 2 },
  itemDir: { flexDirection: 'row', alignItems: 'center', gap: spacing.gap },

  cardVazio: {
    marginTop: spacing.gap,
    borderWidth: 2,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.screen,
    gap: spacing.stack,
  },
  cardVazioTexto: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted, textAlign: 'center' },
});
