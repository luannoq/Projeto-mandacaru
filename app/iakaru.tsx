/**
 * IAkaru — chat com o assistente agrícola (IA Generativa).
 * Disciplina Disruptive IA da GS. Respostas reais do Gemini via API Java.
 *
 * Header verde com avatar, bolhas (usuário à direita / IA à esquerda),
 * indicador "digitando..." animado e input fixo com KeyboardAvoidingView.
 */
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { mensagemInicial, enviarMensagem } from '../services/iakaru';
import { MensagemChat } from '../services/mocks';
import { handleApiError } from '../utils/handleApiError';
import { colors, spacing, radius, fonts, shadow } from '../constants/theme';

/** Mensagem do chat, com flag de erro para estilizar a bolha. */
type Mensagem = MensagemChat & { erro?: boolean };

/** Tempo máximo de espera local pela resposta do assistente. */
const TIMEOUT_IAKARU_MS = 65000;

/** Avatar circular do IAkaru (folha em fundo verde claro). */
function AvatarIAkaru({ size = 32 }: { size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="leaf" size={size * 0.55} color={colors.primary} />
    </View>
  );
}

/** Três pontinhos animados ("digitando..."). */
function TypingDots() {
  const dots = useRef([new Animated.Value(0.3), new Animated.Value(0.3), new Animated.Value(0.3)]).current;

  useEffect(() => {
    const animacoes = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 320, useNativeDriver: true }),
        ]),
      ),
    );
    animacoes.forEach((a) => a.start());
    return () => animacoes.forEach((a) => a.stop());
  }, [dots]);

  return (
    <View style={styles.linhaIA}>
      <AvatarIAkaru />
      <View style={[styles.bolha, styles.bolhaIA, styles.bolhaDigitando]}>
        {dots.map((dot, i) => (
          <Animated.View key={i} style={[styles.ponto, { opacity: dot }]} />
        ))}
      </View>
    </View>
  );
}

export default function IAkaruScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ culturaId?: string; culturaNome?: string }>();
  const culturaNomeRaw = Array.isArray(params.culturaNome) ? params.culturaNome[0] : params.culturaNome;
  const culturaNome = culturaNomeRaw ? decodeURIComponent(culturaNomeRaw) : undefined;

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState('');
  const [digitando, setDigitando] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const idRef = useRef(1);
  const proximoId = () => `m${idRef.current++}`;

  // Mensagens iniciais (saudação + contexto da cultura, se houver)
  useEffect(() => {
    const iniciais: MensagemChat[] = [mensagemInicial()];
    if (culturaNome) {
      iniciais.push({
        id: proximoId(),
        autor: 'iakaru',
        texto: `Vi que você consultou sobre ${culturaNome}. Como posso te ajudar?`,
      });
    }
    setMensagens(iniciais);
  }, [culturaNome]);

  // Auto-scroll ao final quando chega mensagem nova ou aparece "digitando"
  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [mensagens, digitando]);

  async function enviar() {
    const pergunta = texto.trim();
    if (!pergunta || digitando) return;

    setMensagens((prev) => [...prev, { id: proximoId(), autor: 'usuario', texto: pergunta }]);
    setTexto('');
    setDigitando(true);

    try {
      const contexto = culturaNome ? `Agricultor consultando sobre ${culturaNome}` : undefined;
      // Timeout local de segurança: se a API não responder, não fica carregando para sempre.
      const resposta = await Promise.race([
        enviarMensagem(pergunta, contexto),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout-local')), TIMEOUT_IAKARU_MS),
        ),
      ]);
      setMensagens((prev) => [...prev, { id: proximoId(), autor: 'iakaru', texto: resposta }]);
    } catch (e) {
      const mensagemErro =
        e instanceof Error && e.message === 'timeout-local'
          ? 'O assistente está demorando para responder. Tente novamente em instantes.'
          : handleApiError(e);
      setMensagens((prev) => [
        ...prev,
        { id: proximoId(), autor: 'iakaru', texto: mensagemErro, erro: true },
      ]);
    } finally {
      setDigitando(false);
    }
  }

  return (
    <View style={styles.tela}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.gap }]}>
        <Pressable hitSlop={8} onPress={() => router.back()} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={24} color={colors.onPrimary} />
        </Pressable>
        <AvatarIAkaru size={36} />
        <View style={styles.headerTextos}>
          <Text style={styles.headerTitulo}>IAkaru</Text>
          <Text style={styles.headerSubtitulo}>Assistente agrícola</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 56 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.mensagens}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {mensagens.map((m) =>
            m.autor === 'usuario' ? (
              <View key={m.id} style={[styles.bolha, styles.bolhaUsuario]}>
                <Text style={styles.textoUsuario}>{m.texto}</Text>
              </View>
            ) : (
              <View key={m.id} style={styles.linhaIA}>
                <AvatarIAkaru />
                <View style={[styles.bolha, styles.bolhaIA, m.erro && styles.bolhaErro]}>
                  <Text style={[styles.textoIA, m.erro && styles.textoErro]}>{m.texto}</Text>
                </View>
              </View>
            ),
          )}
          {digitando && <TypingDots />}
        </ScrollView>

        {/* Input fixo */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, spacing.gap) }]}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua pergunta..."
            placeholderTextColor={colors.muted}
            value={texto}
            onChangeText={setTexto}
            multiline
            onSubmitEditing={enviar}
            returnKeyType="send"
          />
          <Pressable
            style={[styles.enviar, (!texto.trim() || digitando) && styles.enviarDesativado]}
            onPress={enviar}
            disabled={!texto.trim() || digitando}
            accessibilityLabel="Enviar pergunta"
          >
            <Ionicons name="send" size={20} color={colors.onPrimary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },

  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.screen,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gap,
  },
  headerTextos: { justifyContent: 'center' },
  headerTitulo: { fontFamily: fonts.bold, fontSize: 18, color: colors.onPrimary },
  headerSubtitulo: { fontFamily: fonts.regular, fontSize: 12, color: colors.onPrimary, opacity: 0.8 },

  avatar: { backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },

  mensagens: { padding: spacing.screen, gap: spacing.gap },

  linhaIA: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.stack, maxWidth: '85%' },

  bolha: {
    maxWidth: '75%',
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.gap,
    borderRadius: 16,
  },
  bolhaUsuario: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bolhaIA: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  textoUsuario: { fontFamily: fonts.regular, fontSize: 15, color: colors.onPrimary, lineHeight: 21 },
  textoIA: { fontFamily: fonts.regular, fontSize: 15, color: colors.text, lineHeight: 21 },
  bolhaErro: { backgroundColor: colors.errorBg, borderColor: colors.errorText },
  textoErro: { color: colors.errorText },

  bolhaDigitando: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 14 },
  ponto: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.muted },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.stack,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.gap,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: spacing.screen,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  enviar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enviarDesativado: { opacity: 0.5 },
});
