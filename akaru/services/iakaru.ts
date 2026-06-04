/**
 * Service do assistente IAkaru (chat com IA generativa).
 */
import { respostasMockIAkaru, mensagemInicialIAkaru, MensagemChat } from './mocks';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let contadorResposta = 0;

export function mensagemInicial(): MensagemChat {
  return mensagemInicialIAkaru;
}

export async function enviarPergunta(_pergunta: string): Promise<string> {
  // TODO: integrar com API real — POST /iakaru (Gemini via backend Java/.NET)
  await delay(1500); // simula o processamento da IA
  const resposta = respostasMockIAkaru[contadorResposta % respostasMockIAkaru.length];
  contadorResposta += 1;
  return resposta;
}
