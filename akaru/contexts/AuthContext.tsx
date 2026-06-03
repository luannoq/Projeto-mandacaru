/**
 * AuthContext — estado global de autenticação via Firebase Authentication.
 *
 * Escuta onAuthStateChanged e expõe ações de login, cadastro e logout.
 * A proteção de rotas vive em app/_layout.tsx, que consome `user` e `loading`.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth } from '../services/firebase';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signUp: (nome: string, email: string, senha: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async signIn(email, senha) {
        await signInWithEmailAndPassword(auth, email.trim(), senha);
      },
      async signUp(nome, email, senha) {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), senha);
        if (nome.trim()) {
          await updateProfile(cred.user, { displayName: nome.trim() });
          setUser({ ...cred.user });
        }
      },
      async signOut() {
        // Logout limpa completamente a sessão (Firebase + persistência AsyncStorage).
        await firebaseSignOut(auth);
      },
    }),
    [user, loading]
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
