/**
 * Clientes Axios do Akaru — API Java do Victor (2 microserviços).
 *
 *  - apiCatalogo      → serviço de Catálogo (culturas + auth), porta 8081
 *  - apiRecomendacao  → serviço de Recomendação (recomendações + clima + auth), porta 8082
 *
 * Ambas as instâncias compartilham:
 *  - Interceptor de REQUEST: injeta o JWT (akaru_auth_token) salvo no AsyncStorage.
 *  - Interceptor de RESPONSE: ao receber 401, limpa a sessão e volta para o login.
 */

import axios, { type AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

/** Chaves de armazenamento da sessão (reutilizadas pelo AuthContext). */
export const STORAGE_TOKEN_KEY = 'akaru_auth_token';
export const STORAGE_USER_KEY = 'akaru_user';

const catalogoURL = process.env.EXPO_PUBLIC_API_CATALOGO_URL ?? 'http://localhost:8081';
const recomendacaoURL = process.env.EXPO_PUBLIC_API_RECOMENDACAO_URL ?? 'http://localhost:8082';

/** Aplica os interceptors de autenticação (request) e de sessão expirada (response). */
function configurarInterceptors(instancia: AxiosInstance): AxiosInstance {
  // REQUEST: anexa o JWT do AsyncStorage, se houver.
  instancia.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem(STORAGE_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // RESPONSE: em 401, limpa a sessão e redireciona para o login.
  instancia.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error?.response?.status === 401) {
        await AsyncStorage.multiRemove([STORAGE_TOKEN_KEY, STORAGE_USER_KEY]);
        router.replace('/login');
      }
      return Promise.reject(error);
    },
  );

  return instancia;
}

export const apiCatalogo = configurarInterceptors(
  axios.create({
    baseURL: catalogoURL,
    // 25s: cobre o cold start do App Service no Azure (planos básicos "dormem").
    timeout: 25000,
    headers: { 'Content-Type': 'application/json' },
  }),
);

export const apiRecomendacao = configurarInterceptors(
  axios.create({
    baseURL: recomendacaoURL,
    // 60s: este serviço chama o Gemini, que pode demorar mais que os 15s padrão.
    timeout: 60000,
    headers: { 'Content-Type': 'application/json' },
  }),
);
