/**
 * Badge de aptidão climática da recomendação (API Java).
 *
 *  - ALTA  → verde
 *  - MÉDIA → amarelo
 *  - BAIXA → vermelho
 *
 * Com `score`, exibe "85/100 — ALTA"; sem score, exibe só a classificação.
 */
import { View, Text, StyleSheet } from 'react-native';
import { aptidaoStyles, fonts, radius } from '../constants/theme';

/** Normaliza a classificação da API (remove acentos/caixa) para escolher a cor. */
function estiloDaAptidao(classificacao: string) {
  const chave = classificacao.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
  if (chave === 'ALTA') return aptidaoStyles.ALTA;
  if (chave === 'BAIXA') return aptidaoStyles.BAIXA;
  return aptidaoStyles['MÉDIA'];
}

type Props = {
  classificacao: string;
  /** Quando informado, exibe "score/100 — classificação". */
  score?: number;
};

export default function AptidaoBadge({ classificacao, score }: Props) {
  const estilo = estiloDaAptidao(classificacao);
  const texto = score != null ? `${score}/100 — ${classificacao}` : classificacao;
  return (
    <View style={[styles.badge, { backgroundColor: estilo.bg }]}>
      <Text style={[styles.texto, { color: estilo.text }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  texto: { fontFamily: fonts.bold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
});
