/**
 * Formatos trocados com o back-end.
 * Combine estes contratos com quem faz a API: se o back mudar um campo, só este arquivo muda.
 */

/** O back-end decide qual é o próximo passo do usuário; o front só traduz isso em rota. */
export type ProximoPasso =
  'verificar-email' | 'ativar-2fa' | 'verificar-2fa' | 'conectar-banco' | 'inicio';

export interface PassoResposta {
  proximo: ProximoPasso;
}

export interface LoginPedido {
  administrativo?: boolean;
  email: string;
  senha: string;
  lembrar: boolean;
}

export interface CadastroPedido {
  nome: string;
  email: string;
  senha: string;
  consentimentoLgpd: boolean;
}

export interface Iniciar2faResposta {
  /** Chave secreta do autenticador (gerada SEMPRE pelo back-end). */
  chave: string;
  /** Endereço otpauth:// para montar o QR code (opcional). */
  otpauthUrl: string;
  qrPngBase64?: string;
}

export interface SessaoResposta {
  autenticado: boolean;
}

export interface IniciarConexaoResposta {
  /** Para onde levar o usuário para ele autorizar o acesso no banco. */
  urlAutorizacao: string;
}

export interface ConcluirConexaoResposta {
  status: 'conectado';
}

/** Formato dos erros devolvidos pelo back-end. */
export interface ErroApi {
  codigo: string;
  mensagem: string;
}
