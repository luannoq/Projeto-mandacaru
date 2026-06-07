/**
 * Service de clima — serviço de Recomendação da API Java (apiRecomendacao, 8082).
 */
import { apiRecomendacao } from './api';
import type { ClimaResumoResponse } from '../types/api';

/** GET /api/clima?lat={lat}&lon={lon} → resumo climático da localização. */
export async function consultarClima(lat: number, lon: number): Promise<ClimaResumoResponse> {
  const { data } = await apiRecomendacao.get<ClimaResumoResponse>('/api/clima', {
    params: { lat, lon },
  });
  return data;
}
