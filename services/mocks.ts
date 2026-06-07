/**
 * Tipos e dados estáticos de UI do Akaru.
 *
 * Os dados de domínio (culturas, clima, recomendações, histórico, chat) vêm da
 * API real (ver services/*). Aqui ficam apenas metadados do app e a saudação
 * inicial do IAkaru — conteúdo de UI, não dado de domínio.
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

// --- Sobre o App (Perfil) ---
// O hash do commit não fica aqui: vem de constants/commit.ts (gerado a partir do Git).
export const mockSobreApp = {
  nome: 'Akaru',
  slogan: 'Plantio inteligente, colheita certa',
  versao: '1.0.0',
  desenvolvidoPor: 'Turma ADS — FIAP',
};

// --- Chat IAkaru (saudação inicial estática) ---
export const mensagemInicialIAkaru: MensagemChat = {
  id: 'm0',
  autor: 'iakaru',
  texto:
    'Olá! Sou o IAkaru, seu assistente de plantio. Me pergunte qualquer coisa sobre suas culturas, clima ou como cuidar da sua lavoura.',
};
