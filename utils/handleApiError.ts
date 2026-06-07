/**
 * Converte um erro (geralmente do Axios) em uma mensagem amigável para a UI.
 *
 * Uso nas telas:
 *   Alert.alert('Erro', handleApiError(error));
 */
import { isAxiosError } from 'axios';

export function handleApiError(error: unknown): string {
  if (isAxiosError(error)) {
    // Sem response = falha de conexão/timeout (não chegou ao servidor).
    if (!error.response) {
      return 'Verifique sua conexão com a internet';
    }

    switch (error.response.status) {
      case 400:
        return 'Verifique os dados informados';
      case 401:
        return 'Sessão expirada, faça login novamente';
      case 403:
        return 'Você não tem permissão para esta ação';
      case 404:
        return 'Recurso não encontrado';
      case 503:
        return 'Serviço temporariamente indisponível';
      default:
        return 'Erro inesperado. Tente novamente.';
    }
  }

  return 'Erro inesperado. Tente novamente.';
}
