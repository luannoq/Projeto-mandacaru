/**
 * Service de recomendação agrícola.
 */
import { mockRecomendacoes, mockCulturas, recomendacaoPadrao, Recomendacao } from './mocks';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type AnaliseInput = {
  culturaId: string;
  detalhes?: string;
};

export async function gerarRecomendacao(input: AnaliseInput): Promise<Recomendacao> {
  // TODO: integrar com API real — POST /recomendacoes (clima de satélite + IA Gemini)
  await delay(600);
  const existente = mockRecomendacoes[input.culturaId];
  if (existente) return existente;

  const cultura = mockCulturas.find((c) => c.id === input.culturaId);
  if (cultura) return recomendacaoPadrao(cultura);

  return mockRecomendacoes.milho;
}

export async function obterRecomendacao(culturaId: string): Promise<Recomendacao> {
  // TODO: integrar com API real — GET /recomendacoes/:culturaId
  return gerarRecomendacao({ culturaId });
}
