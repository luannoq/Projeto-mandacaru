/**
 * Service de histórico de recomendações.
 *
 * A API Java não tem endpoint dedicado de histórico. Estratégia: guardamos
 * localmente os IDs das recomendações geradas (AsyncStorage, chave
 * `akaru_historico_ids`, array de números, mais recente primeiro) e, ao listar,
 * buscamos cada recomendação na API.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { buscarRecomendacao, removerRecomendacao } from './recomendacao';
import type { RecomendacaoResponse } from '../types/api';

const HISTORICO_IDS_KEY = 'akaru_historico_ids';

/** Lê o array de IDs salvos (mais recente primeiro). */
async function lerIds(): Promise<number[]> {
  const raw = await AsyncStorage.getItem(HISTORICO_IDS_KEY);
  if (!raw) return [];
  try {
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

async function gravarIds(ids: number[]): Promise<void> {
  await AsyncStorage.setItem(HISTORICO_IDS_KEY, JSON.stringify(ids));
}

/** Salva o ID de uma recomendação recém-gerada (sem duplicar, no topo da lista). */
export async function salvarNoHistorico(recomendacaoId: number): Promise<void> {
  const ids = await lerIds();
  const semDuplicata = ids.filter((id) => id !== recomendacaoId);
  await gravarIds([recomendacaoId, ...semDuplicata]);
}

/** Lista as recomendações salvas, buscando cada uma na API (mais recente primeiro). */
export async function listarHistorico(): Promise<RecomendacaoResponse[]> {
  const ids = await lerIds();
  if (ids.length === 0) return [];
  return Promise.all(ids.map((id) => buscarRecomendacao(id)));
}

/** Remove a recomendação na API e tira o ID do histórico local. */
export async function removerDoHistorico(id: number): Promise<void> {
  await removerRecomendacao(id);
  const ids = await lerIds();
  await gravarIds(ids.filter((item) => item !== id));
}
