/**
 * Hash do commit de referência exibido na tela "Sobre o App".
 *
 * O valor padrão vem de commit.json (gerado por `npm run commit-hash`).
 * Pode ser sobrescrito em build via EXPO_PUBLIC_GIT_COMMIT_HASH.
 */
import commit from './commit.json';

export const GIT_COMMIT_HASH: string = process.env.EXPO_PUBLIC_GIT_COMMIT_HASH ?? commit.hash ?? 'dev';
export const GIT_COMMIT_DATE: string = commit.date ?? '';
