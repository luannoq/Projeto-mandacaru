/**
 * Service de culturas — serviço de Catálogo da API Java (apiCatalogo, 8081).
 */
import { apiCatalogo } from './api';
import type { CulturaResponse } from '../types/api';
import { mockClima, type Clima } from './mocks';

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

// TODO: migrar para services/clima.ts (GET /api/clima) na etapa de clima.
// Mantido mockado por enquanto para não quebrar a Home.
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function obterClimaAtual(): Promise<Clima> {
  await delay(300);
  return mockClima;
}
