/**
 * Converte um erro (geralmente do Axios) em uma mensagem amigável para a UI.
 *
 * Uso nas telas:
 *   Alert.alert('Erro', handleApiError(error));
 */
import { isAxiosError } from 'axios';

const EMAIL_DUPLICADO = 'Este e-mail já está cadastrado. Faça login ou use outro e-mail.';

/** Extrai um texto pesquisável do corpo de erro da API (string ou objeto). */
function textoDoErro(data: unknown): string {
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const campo = [obj.message, obj.error, obj.detail, obj.mensagem].find((c) => typeof c === 'string');
    if (typeof campo === 'string') return campo;
    try {
      return JSON.stringify(data);
    } catch {
      return '';
    }
  }
  return '';
}

/** Heurística: o erro indica e-mail já cadastrado? */
function ehEmailDuplicado(data: unknown): boolean {
  const msg = textoDoErro(data).toLowerCase();
  if (!msg.includes('mail')) return false;
  return ['exist', 'cadastr', 'duplic', 'já', 'uso', 'registr', 'use'].some((t) => msg.includes(t));
}

export function handleApiError(error: unknown): string {
  if (isAxiosError(error)) {
    // Sem response = falha de conexão/timeout (não chegou ao servidor).
    if (!error.response) {
      return 'Verifique sua conexão com a internet';
    }

    switch (error.response.status) {
      case 400:
        return ehEmailDuplicado(error.response.data) ? EMAIL_DUPLICADO : 'Verifique os dados informados';
      case 401:
        return 'Sessão expirada, faça login novamente';
      case 403:
        return 'Você não tem permissão para esta ação';
      case 404:
        return 'Recurso não encontrado';
      case 409:
        return EMAIL_DUPLICADO;
      case 503:
        return 'Serviço temporariamente indisponível';
      default:
        return 'Erro inesperado. Tente novamente.';
    }
  }

  return 'Erro inesperado. Tente novamente.';
}
