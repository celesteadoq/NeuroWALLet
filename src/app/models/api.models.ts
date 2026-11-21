export type ProximoPasso =
  'verificar-email' | 'ativar-2fa' | 'verificar-2fa' | 'conectar-banco' | 'inicio';

export interface PassoResposta {
  proximo: ProximoPasso;
}

export interface LoginPedido {
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
  chave: string;
  otpauthUrl: string;
  qrPngBase64?: string;
}

export interface SessaoResposta {
  autenticado: boolean;
}

export interface IniciarConexaoResposta {
  urlAutorizacao: string;
}

export interface ConcluirConexaoResposta {
  status: 'conectado';
}

export interface ErroApi {
  codigo: string;
  mensagem: string;
}
