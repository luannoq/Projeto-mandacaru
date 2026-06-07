/**
 * Service de recomendação — serviço de Recomendação da API Java
 * (apiRecomendacao, 8082). A recomendação é gerada pelo Gemini no backend.
 */
import { apiRecomendacao } from './api';
import type { RecomendacaoRequest, RecomendacaoResponse, AtualizarRecomendacaoRequest } from '../types/api';

/** POST /api/recomendacao → gera uma nova recomendação (201). */
export async function gerarRecomendacao(request: RecomendacaoRequest): Promise<RecomendacaoResponse> {
  const { data } = await apiRecomendacao.post<RecomendacaoResponse>('/api/recomendacao', request);
  return data;
}

/** GET /api/recomendacao/{id} → busca uma recomendação salva. */
export async function buscarRecomendacao(id: number): Promise<RecomendacaoResponse> {
  const { data } = await apiRecomendacao.get<RecomendacaoResponse>(`/api/recomendacao/${id}`);
  return data;
}

/** PUT /api/recomendacao/{id} → edita detalhes/nota pessoal da recomendação. */
export async function atualizarRecomendacao(
  id: number,
  dados: AtualizarRecomendacaoRequest,
): Promise<RecomendacaoResponse> {
  const { data } = await apiRecomendacao.put<RecomendacaoResponse>(`/api/recomendacao/${id}`, dados);
  return data;
}

/** DELETE /api/recomendacao/{id} → remove a recomendação (204). */
export async function removerRecomendacao(id: number): Promise<void> {
  await apiRecomendacao.delete(`/api/recomendacao/${id}`);
}
