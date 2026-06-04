/**
 * Histórico — conversão fiel do design do Akaru.
 * Busca, lista "Consultas Recentes" com avatar/emoji, status e chevron, e
 * card vazio pontilhado. Dados de listarHistorico().
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import StatusChip from '../../components/StatusChip';
import { listarHistorico } from '../../services/historico';
import { ItemHistorico } from '../../services/mocks';
import { colors, spacing, radius, fonts, shadow } from '../../constants/theme';

export default function HistoricoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [itens, setItens] = useState<ItemHistorico[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const lista = await listarHistorico();
        if (ativo) setItens(lista);
      } catch (e: any) {
        Alert.alert('Erro', e?.message ?? 'Não foi possível carregar o histórico.');
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return itens;
    return itens.filter((i) => i.nome.toLowerCase().includes(termo));
  }, [busca, itens]);

  return (
    <View style={styles.tela}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.gap }]}>
        <Text style={styles.headerTitulo}>Histórico</Text>
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
                  key={item.id}
                  style={styles.item}
                  onPress={() => router.push(`/resultado?culturaId=${item.culturaId}`)}
                >
                  <View style={styles.itemEsq}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarEmoji}>{item.emoji}</Text>
                    </View>
                    <View>
                      <Text style={styles.itemNome}>{item.nome}</Text>
                      <Text style={styles.itemData}>{item.data}</Text>
                    </View>
                  </View>
                  <View style={styles.itemDir}>
                    <StatusChip status={item.status} />
                    <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Card vazio pontilhado */}
            <View style={styles.cardVazio}>
              <Ionicons name="leaf-outline" size={36} color={colors.secondary} />
              <Text style={styles.cardVazioTexto}>Suas próximas análises aparecerão aqui.</Text>
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
  itemDir: { flexDirection: 'row', alignItems: 'center', gap: spacing.stack },

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
