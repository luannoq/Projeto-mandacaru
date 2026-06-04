/**
 * Service de culturas disponíveis para análise.
 */
import { mockCulturas, mockClima, Cultura, Clima } from './mocks';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function listarCulturas(): Promise<Cultura[]> {
  // TODO: integrar com API real — GET /culturas
  await delay(300);
  return mockCulturas;
}

export async function obterClimaAtual(): Promise<Clima> {
  // TODO: integrar com API real — GET /clima (dados de satélite)
  await delay(300);
  return mockClima;
}
