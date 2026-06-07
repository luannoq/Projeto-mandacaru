/**
 * Tipos dos DTOs da API Java do Victor (FIAP GS 2026/1).
 *
 * Espelham o contrato dos 2 microserviços:
 *  - Catálogo (8081): culturas + auth
 *  - Recomendação (8082): recomendações + clima + auth
 */

// --- Auth ---
export interface AuthRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  tipo: string;
  email: string;
  expiracaoMs: number;
}

// --- Cultura (serviço de catálogo) ---
export interface CulturaResponse {
  id: number;
  nome: string;
  cicloDias: number;
  tempMin: number;
  tempMax: number;
  chuvaIdeal: number;
  tipoSolo: string;
}

// --- Clima ---
export interface ClimaResumoResponse {
  temperaturaMedia: number;
  precipitacaoPrevista: number;
  umidade: number;
}

// --- Localização ---
export interface LocalizacaoResponse {
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
}

// --- Resumo de cultura na recomendação ---
export interface CulturaResumoResponse {
  id: number;
  nome: string;
}

// --- Plano de plantio gerado pelo Gemini ---
export interface PlanoPlantioResponse {
  epocaIdeal: string;
  espacamento: string;
  irrigacao: string;
  alertasRisco: string;
  cuidadosCiclo: string;
}

// --- Recomendação completa ---
export interface RecomendacaoResponse {
  recomendacaoId: number;
  cultura: CulturaResumoResponse;
  localizacao: LocalizacaoResponse;
  clima: ClimaResumoResponse;
  scoreAptidao: number;
  classificacaoAptidao: string; // "ALTA" | "MÉDIA" | "BAIXA"
  planoPlantio: PlanoPlantioResponse;
  mensagemCompleta: string;
  detalhesUsuario?: string;
  notaPessoal?: string;
  criadoEm?: string; // formato ISO: "2026-06-07T14:32:00"
}

// --- Request para gerar recomendação ---
export interface RecomendacaoRequest {
  culturaId: number;
  latitude: number;
  longitude: number;
  cidade: string;
  estado: string;
  detalhes?: string;
}

// --- Request para atualizar recomendação ---
export interface AtualizarRecomendacaoRequest {
  detalhes?: string;
  notaPessoal?: string;
}
