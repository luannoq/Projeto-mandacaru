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
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import AptidaoBadge from '../../components/AptidaoBadge';
import { listarHistorico, removerDoHistorico, limparHistorico } from '../../services/historico';
import { atualizarRecomendacao } from '../../services/recomendacao';
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

  // Edição de nota/detalhes (Update — PUT /api/recomendacao/{id}).
  const [editando, setEditando] = useState<RecomendacaoResponse | null>(null);
  const [notaPessoal, setNotaPessoal] = useState('');
  const [detalhesEdicao, setDetalhesEdicao] = useState('');
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

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

  function abrirEdicao(item: RecomendacaoResponse) {
    setEditando(item);
    setNotaPessoal(item.notaPessoal ?? '');
    setDetalhesEdicao(item.detalhesUsuario ?? '');
  }

  async function salvarEdicao() {
    if (!editando) return;
    try {
      setSalvandoEdicao(true);
      const atualizada = await atualizarRecomendacao(editando.recomendacaoId, {
        notaPessoal: notaPessoal.trim(),
        detalhes: detalhesEdicao.trim(),
      });
      // Atualiza só o card editado, sem recarregar a lista toda.
      setItens((prev) => prev.map((i) => (i.recomendacaoId === atualizada.recomendacaoId ? atualizada : i)));
      setEditando(null);
    } catch (e) {
      Alert.alert('Erro', handleApiError(e));
    } finally {
      setSalvandoEdicao(false);
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
                    <View style={styles.itemTextos}>
                      <Text style={styles.itemNome}>{item.cultura.nome}</Text>
                      <Text style={styles.itemData}>
                        {item.criadoEm ? formatarData(item.criadoEm) : `Aptidão ${item.scoreAptidao}/100`}
                      </Text>
                      {item.notaPessoal ? (
                        <Text style={styles.itemNota} numberOfLines={1}>
                          📝 {item.notaPessoal}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.itemDir}>
                    <AptidaoBadge classificacao={item.classificacaoAptidao} />
                    <Pressable
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Editar nota de ${item.cultura.nome}`}
                      onPress={() => abrirEdicao(item)}
                    >
                      <Ionicons name="pencil-outline" size={19} color={colors.primary} />
                    </Pressable>
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

      {/* Modal de edição de nota (Update) */}
      <Modal
        visible={editando !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditando(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Editar nota — {editando?.cultura.nome}</Text>

            <Text style={styles.modalLabel}>Nota pessoal</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Lembrar de irrigar às manhãs"
              placeholderTextColor={colors.muted}
              value={notaPessoal}
              onChangeText={setNotaPessoal}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Nota pessoal"
            />

            <Text style={styles.modalLabel}>Detalhes (opcional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: solo argiloso, sem irrigação"
              placeholderTextColor={colors.muted}
              value={detalhesEdicao}
              onChangeText={setDetalhesEdicao}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Detalhes"
            />

            <Pressable
              style={styles.modalSalvar}
              onPress={salvarEdicao}
              disabled={salvandoEdicao}
              accessibilityRole="button"
              accessibilityLabel="Salvar"
            >
              {salvandoEdicao ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.modalSalvarTexto}>Salvar</Text>
              )}
            </Pressable>
            <Pressable
              style={styles.modalCancelar}
              onPress={() => setEditando(null)}
              disabled={salvandoEdicao}
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
            >
              <Text style={styles.modalCancelarTexto}>Cancelar</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
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
  itemEsq: { flexDirection: 'row', alignItems: 'center', gap: spacing.gap, flex: 1 },
  itemTextos: { flex: 1 },
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
  itemNota: { fontFamily: fonts.regular, fontSize: 12, color: colors.primary, marginTop: 2 },
  itemDir: { flexDirection: 'row', alignItems: 'center', gap: spacing.stack },

  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.section,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.section,
    gap: spacing.stack,
    ...shadow.card,
  },
  modalTitulo: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  modalLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.text, marginTop: spacing.xs },
  modalInput: {
    minHeight: 64,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    padding: spacing.gap,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  modalSalvar: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.gap,
  },
  modalSalvarTexto: { fontFamily: fonts.bold, fontSize: 15, color: colors.onPrimary },
  modalCancelar: { height: 44, alignItems: 'center', justifyContent: 'center' },
  modalCancelarTexto: { fontFamily: fonts.bold, fontSize: 14, color: colors.muted },

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
