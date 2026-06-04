/**
 * Mapa de nome do estado brasileiro → sigla (UF).
 *
 * O reverse geocoding do expo-location costuma retornar o nome completo do
 * estado (ex.: "São Paulo", às vezes "State of São Paulo"). Usamos este mapa
 * para exibir a sigla de 2 letras (ex.: "SP"), com fallback para o nome
 * original quando não houver correspondência.
 */

const NOME_PARA_UF: Record<string, string> = {
  acre: 'AC',
  alagoas: 'AL',
  amapa: 'AP',
  amazonas: 'AM',
  bahia: 'BA',
  ceara: 'CE',
  'distrito federal': 'DF',
  'espirito santo': 'ES',
  goias: 'GO',
  maranhao: 'MA',
  'mato grosso': 'MT',
  'mato grosso do sul': 'MS',
  'minas gerais': 'MG',
  para: 'PA',
  paraiba: 'PB',
  parana: 'PR',
  pernambuco: 'PE',
  piaui: 'PI',
  'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN',
  'rio grande do sul': 'RS',
  rondonia: 'RO',
  roraima: 'RR',
  'santa catarina': 'SC',
  'sao paulo': 'SP',
  sergipe: 'SE',
  tocantins: 'TO',
};

/** Lista de siglas válidas, para reconhecer quando o input já é uma UF. */
const SIGLAS = new Set(Object.values(NOME_PARA_UF));

/**
 * Normaliza um texto para comparação: minúsculas, sem acentos e sem prefixos
 * comuns retornados pelo geocoder ("State of", "Estado de/do").
 */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos (combining diacritical marks)
    .toLowerCase()
    .trim()
    .replace(/^(state of|estado d[eo])\s+/, '');
}

/**
 * Converte o nome de um estado para a sigla UF de 2 letras.
 * Retorna o valor original se não encontrar correspondência (ou null/undefined
 * se a entrada for vazia).
 */
export function nomeParaUF(estado?: string | null): string | undefined {
  if (!estado) return undefined;

  const chave = normalizar(estado);

  // Já é uma sigla (ex.: "SP", "sp").
  if (chave.length === 2 && SIGLAS.has(chave.toUpperCase())) {
    return chave.toUpperCase();
  }

  return NOME_PARA_UF[chave] ?? estado;
}
