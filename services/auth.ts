/**
 * Autenticação contra a API Java (serviço de Recomendação, porta 8082).
 *
 * Endpoints:
 *  - POST /api/auth/register → registrar(nome, email, senha)
 *  - POST /api/auth/login    → login(email, senha)
 *
 * Ambos retornam um AuthResponse com o JWT. A persistência do token/usuário
 * fica a cargo do AuthContext (próxima etapa).
 */

import { apiRecomendacao } from './api';
import type { AuthRequest, AuthResponse, RegisterRequest } from '../types/api';

/** POST /api/auth/register — cria a conta e retorna o JWT. */
export async function registrar(nome: string, email: string, senha: string): Promise<AuthResponse> {
  const body: RegisterRequest = { nome, email, senha };
  const { data } = await apiRecomendacao.post<AuthResponse>('/api/auth/register', body);
  return data;
}

/** POST /api/auth/login — autentica e retorna o JWT. */
export async function login(email: string, senha: string): Promise<AuthResponse> {
  const body: AuthRequest = { email, senha };
  const { data } = await apiRecomendacao.post<AuthResponse>('/api/auth/login', body);
  return data;
}
