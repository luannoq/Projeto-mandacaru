/**
 * Dados mockados do Akaru.
 *
 * Toda a camada de services consome estes mocks por enquanto.
 * // TODO: integrar com API real (backend Java/.NET + Gemini) na fase de integração.
 */

import { StatusRecomendacao } from '../constants/theme';

export type Cultura = {
  id: string;
  nome: string;
  emoji: string;
};

export type Clima = {
  cidade: string;
  uf: string;
  condicao: string;
  temperatura: number;
  umidade: number;
  chuvaMm: number;
};

export type DetalheRecomendacao = {
  tipo: 'epoca' | 'espacamento' | 'irrigacao' | 'alerta';
  titulo: string;
  descricao: string;
};

export type Recomendacao = {
  culturaId: string;
  nome: string;
  emoji: string;
  cidade: string;
  uf: string;
  status: StatusRecomendacao;
  resumoStatus: string;
  detalhes: DetalheRecomendacao[];
};

export type ItemHistorico = {
  id: string;
  culturaId: string;
  emoji: string;
  nome: string;
  data: string;
  status: StatusRecomendacao;
};

export type MensagemChat = {
  id: string;
  autor: 'usuario' | 'iakaru';
  texto: string;
};

// --- Clima atual (Home) ---
export const mockClima: Clima = {
  cidade: 'São Paulo',
  uf: 'SP',
  condicao: 'Parcialmente nublado',
  temperatura: 24,
  umidade: 68,
  chuvaMm: 12,
};

// --- Culturas disponíveis (Nova Análise) ---
export const mockCulturas: Cultura[] = [
  { id: 'milho', nome: 'Milho', emoji: '🌽' },
  { id: 'feijao', nome: 'Feijão', emoji: '🫘' },
  { id: 'mandioca', nome: 'Mandioca', emoji: '🥔' },
  { id: 'tomate', nome: 'Tomate', emoji: '🍅' },
  { id: 'arroz', nome: 'Arroz', emoji: '🌾' },
  { id: 'soja', nome: 'Soja', emoji: '🌱' },
  { id: 'cafe', nome: 'Café', emoji: '☕' },
  { id: 'batata', nome: 'Batata', emoji: '🥔' },
  { id: 'alface', nome: 'Alface', emoji: '🥬' },
  { id: 'cebola', nome: 'Cebola', emoji: '🧅' },
  { id: 'pimentao', nome: 'Pimentão', emoji: '🫑' },
  { id: 'melancia', nome: 'Melancia', emoji: '🍉' },
];

// --- Recomendações por cultura (Resultado) ---
const detalhesMilho: DetalheRecomendacao[] = [
  { tipo: 'epoca', titulo: 'Época ideal', descricao: 'Plantio recomendado entre outubro e dezembro' },
  { tipo: 'espacamento', titulo: 'Espaçamento', descricao: '80cm entre linhas, 20cm entre plantas' },
  { tipo: 'irrigacao', titulo: 'Irrigação', descricao: 'Necessita irrigação moderada, 500mm por ciclo' },
  { tipo: 'alerta', titulo: 'Alertas de risco', descricao: 'Risco de seca em janeiro — monitore a previsão' },
];

export const mockRecomendacoes: Record<string, Recomendacao> = {
  milho: {
    culturaId: 'milho',
    nome: 'Milho',
    emoji: '🌽',
    cidade: 'São Paulo',
    uf: 'SP',
    status: 'Ideal',
    resumoStatus: 'Condições ideais',
    detalhes: detalhesMilho,
  },
  cafe: {
    culturaId: 'cafe',
    nome: 'Café',
    emoji: '☕',
    cidade: 'São Paulo',
    uf: 'SP',
    status: 'Atenção',
    resumoStatus: 'Requer atenção',
    detalhes: [
      {
        tipo: 'epoca',
        titulo: 'Época ideal',
        descricao: 'Plantio recomendado entre setembro e março (período chuvoso)',
      },
      { tipo: 'espacamento', titulo: 'Espaçamento', descricao: '3,5m entre linhas, 0,7m entre plantas' },
      {
        tipo: 'irrigacao',
        titulo: 'Irrigação',
        descricao: 'Sensível a déficit hídrico na florada — 1200mm/ano',
      },
      {
        tipo: 'alerta',
        titulo: 'Alertas de risco',
        descricao: 'Umidade abaixo do ideal para a florada — acompanhe a previsão',
      },
    ],
  },
};

/** Recomendação padrão quando a cultura não tem mock específico. */
export function recomendacaoPadrao(cultura: Cultura): Recomendacao {
  return {
    culturaId: cultura.id,
    nome: cultura.nome,
    emoji: cultura.emoji,
    cidade: mockClima.cidade,
    uf: mockClima.uf,
    status: 'Ideal',
    resumoStatus: 'Condições ideais',
    detalhes: detalhesMilho,
  };
}

// --- Histórico de consultas ---
export const mockHistorico: ItemHistorico[] = [
  { id: 'h1', culturaId: 'milho', emoji: '🌽', nome: 'Milho', data: 'Hoje 14h32', status: 'Ideal' },
  { id: 'h2', culturaId: 'cafe', emoji: '☕', nome: 'Café', data: 'Ontem 09h15', status: 'Atenção' },
  { id: 'h3', culturaId: 'feijao', emoji: '🫘', nome: 'Feijão', data: '24/05 16h40', status: 'Ideal' },
  { id: 'h4', culturaId: 'tomate', emoji: '🍅', nome: 'Tomate', data: '22/05 11h20', status: 'Risco' },
];

// --- Sobre o App (Perfil) ---
export const mockSobreApp = {
  nome: 'Akaru',
  slogan: 'Plantio inteligente, colheita certa',
  versao: '1.0.0',
  desenvolvidoPor: 'Turma ADS — FIAP',
  commit: '#a3f2c1',
};

// --- Chat IAkaru ---
export const mensagemInicialIAkaru: MensagemChat = {
  id: 'm0',
  autor: 'iakaru',
  texto:
    'Olá! Sou o IAkaru, seu assistente de plantio. Me pergunte qualquer coisa sobre suas culturas, clima ou como cuidar da sua lavoura.',
};

/** Respostas mockadas do IAkaru (round-robin) até a integração com o Gemini. */
export const respostasMockIAkaru: string[] = [
  'Boa pergunta! Com base no clima atual de São Paulo (24°C, 68% de umidade), a janela de plantio está favorável para culturas de ciclo curto. // resposta mockada',
  'Recomendo monitorar a previsão de chuva antes de irrigar. Acúmulos acima de 10mm já suprem boa parte da necessidade hídrica da semana. // resposta mockada',
  'Para solos argilosos, capriche na drenagem e evite o plantio logo após chuvas intensas para não compactar o solo. // resposta mockada',
];
