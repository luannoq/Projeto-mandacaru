/**
 * Service de histórico de consultas.
 */
import { mockHistorico, ItemHistorico } from './mocks';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function listarHistorico(): Promise<ItemHistorico[]> {
  // TODO: integrar com API real — GET /historico
  await delay(400);
  return mockHistorico;
}

export async function salvarNoHistorico(item: ItemHistorico): Promise<void> {
  // TODO: integrar com API real — POST /historico
  await delay(300);
  mockHistorico.unshift(item);
}
