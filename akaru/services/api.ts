/**
 * Cliente Axios central do Akaru.
 *
 * Interceptor obrigatório (GS): toda requisição anexa o ID Token do Firebase
 * no header Authorization. Como usamos o Firebase JS SDK, obtemos o token via
 * `auth.currentUser?.getIdToken()` (equivalente ao `auth().currentUser` do
 * @react-native-firebase pedido na especificação).
 */

import axios from 'axios';
import { auth } from './firebase';

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await auth.currentUser?.getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normaliza erros para um shape previsível na UI.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const mensagem =
      error?.response?.data?.message ??
      error?.message ??
      'Não foi possível conectar ao servidor.';
    return Promise.reject(new Error(mensagem));
  }
);

export default api;
