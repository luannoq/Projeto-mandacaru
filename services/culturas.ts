/**
 * Service de culturas — serviço de Catálogo da API Java (apiCatalogo, 8081).
 */
import { apiCatalogo } from './api';
import type { CulturaResponse } from '../types/api';

/** GET /api/culturas → lista todas as culturas disponíveis. */
export async function listarCulturas(): Promise<CulturaResponse[]> {
  const { data } = await apiCatalogo.get<CulturaResponse[]>('/api/culturas');
  return data;
}

/** GET /api/culturas/{id} → detalhe de uma cultura. */
export async function buscarCultura(id: number): Promise<CulturaResponse> {
  const { data } = await apiCatalogo.get<CulturaResponse>(`/api/culturas/${id}`);
  return data;
}
