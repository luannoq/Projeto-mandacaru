/**
 * Service do assistente IAkaru — chat com IA generativa (Gemini) via API Java
 * (apiRecomendacao, 8082). POST /api/iakaru/chat.
 */
import { apiRecomendacao } from './api';
import type { ChatRequest, ChatResponse } from '../types/api';
import { mensagemInicialIAkaru, type MensagemChat } from './mocks';

/** Saudação inicial estática exibida ao abrir o chat. */
export function mensagemInicial(): MensagemChat {
  return mensagemInicialIAkaru;
}

/** POST /api/iakaru/chat → envia a pergunta ao Gemini e retorna a resposta. */
export async function enviarMensagem(mensagem: string, contexto?: string): Promise<string> {
  const body: ChatRequest = { mensagem, contexto };
  const { data } = await apiRecomendacao.post<ChatResponse>('/api/iakaru/chat', body);
  return data.resposta;
}
