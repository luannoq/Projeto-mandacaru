/**
 * AuthContext — estado global de autenticação via JWT da API Java.
 *
 * Substitui o Firebase Authentication: login/cadastro chamam os endpoints
 * /api/auth/login e /api/auth/register (services/auth.ts) e o JWT fica
 * persistido no AsyncStorage. A proteção de rotas vive em app/_layout.tsx,
 * que consome `user` e `loading`.
 *
 * O Firebase continua instalado no projeto, mas NÃO é mais usado para auth
 * (será usado apenas para App Distribution).
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { login as loginApi, registrar as registrarApi } from '../services/auth';
import { STORAGE_TOKEN_KEY, STORAGE_USER_KEY } from '../services/api';

/** Usuário autenticado (derivado do AuthResponse + persistido no AsyncStorage). */
export type AuthUser = {
  email: string;
  nome: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signUp: (nome: string, email: string, senha: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Persiste token + usuário e atualiza o estado. */
async function persistirSessao(token: string, usuario: AuthUser): Promise<void> {
  await AsyncStorage.multiSet([
    [STORAGE_TOKEN_KEY, token],
    [STORAGE_USER_KEY, JSON.stringify(usuario)],
  ]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Inicialização: lê o token do AsyncStorage e considera autenticado sem revalidar.
  useEffect(() => {
    (async () => {
      try {
        const [token, usuarioRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_TOKEN_KEY),
          AsyncStorage.getItem(STORAGE_USER_KEY),
        ]);
        if (token && usuarioRaw) {
          setUser(JSON.parse(usuarioRaw) as AuthUser);
        }
      } catch {
        // Falha ao ler a sessão — começa deslogado.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async signIn(email, senha) {
        const resp = await loginApi(email.trim(), senha);
        // A API não retorna o nome no login. Se já houver um nome salvo para
        // este e-mail (cadastro anterior neste device), preserva-o; senão,
        // usa o prefixo do e-mail como fallback.
        let nome = resp.email.split('@')[0];
        try {
          const raw = await AsyncStorage.getItem(STORAGE_USER_KEY);
          if (raw) {
            const anterior = JSON.parse(raw) as AuthUser;
            if (anterior.email === resp.email && anterior.nome) {
              nome = anterior.nome;
            }
          }
        } catch {
          // Ignora: usa o fallback do prefixo do e-mail.
        }
        const usuario: AuthUser = { email: resp.email, nome };
        await persistirSessao(resp.token, usuario);
        setUser(usuario);
      },
      async signUp(nome, email, senha) {
        const resp = await registrarApi(nome.trim(), email.trim(), senha);
        const usuario: AuthUser = {
          email: resp.email,
          nome: nome.trim() || resp.email.split('@')[0],
        };
        await persistirSessao(resp.token, usuario);
        setUser(usuario);
      },
      async signOut() {
        await AsyncStorage.multiRemove([STORAGE_TOKEN_KEY, STORAGE_USER_KEY]);
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  }
  return ctx;
}
