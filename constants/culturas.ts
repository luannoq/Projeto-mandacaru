/**
 * Mapa de emojis das culturas.
 *
 * O CulturaResponse da API Java não traz emoji, então mantemos a associação
 * nome → emoji no cliente. Fallback para 🌿 quando a cultura não está no mapa.
 */

export const CULTURA_EMOJIS: Record<string, string> = {
  milho: '🌽',
  feijão: '🫘',
  mandioca: '🥔',
  tomate: '🍅',
  arroz: '🌾',
  soja: '🌱',
  café: '☕',
  batata: '🥔',
  alface: '🥬',
  cebola: '🧅',
  pimentão: '🫑',
  melancia: '🍉',
};

export function getEmojiForCultura(nome: string): string {
  return CULTURA_EMOJIS[nome.toLowerCase()] ?? '🌿';
}
