/**
 * Inicialização do Firebase (JS SDK) para Expo / React Native.
 *
 * Usamos o Firebase JS SDK (e NÃO @react-native-firebase) porque ele roda no
 * Expo Go e em dev builds sem configuração nativa (google-services.json).
 *
 * As credenciais vêm de variáveis de ambiente EXPO_PUBLIC_* (arquivo .env).
 * Veja .env.example — copie para .env e preencha com os dados do seu projeto
 * no console do Firebase. Sem isso o app abre normalmente, mas login/cadastro
 * falham com mensagem de erro.
 */

import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  // @ts-ignore — getReactNativePersistence existe em runtime no firebase/auth,
  // mas em algumas versões não está nos tipos exportados.
  getReactNativePersistence,
  type Auth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'PLACEHOLDER_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'placeholder.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'placeholder',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'placeholder.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '000000000000',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:000000000000:web:placeholder',
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * initializeAuth com persistência em AsyncStorage mantém a sessão entre aberturas
 * do app. Se já tiver sido inicializado (hot reload), caímos no getAuth.
 */
let auth: Auth;
try {
  auth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(firebaseApp);
}

export { auth };
