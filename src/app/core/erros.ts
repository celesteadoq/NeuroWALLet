import { HttpErrorResponse } from '@angular/common/http';
import { ErroApi } from '../models/api.models';

export const SEM_CONEXAO =
  'Não foi possível falar com o servidor. Verifique sua conexão e tente de novo.';

/**
 * Transforma um erro de HTTP em texto para mostrar na tela.
 * Por padrão mostra a mensagem `padrao` (genérica). Só use a mensagem do servidor
 * quando ela for segura de exibir (ex.: "e-mail já cadastrado"), nunca no login.
 */
export function mensagemDeErro(
  erro: unknown,
  padrao: string,
  usarMensagemDoServidor = false,
): string {
  if (!(erro instanceof HttpErrorResponse)) return padrao;
  if (erro.status === 429) return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  if (erro.status >= 500)
    return 'O serviço está indisponível no momento. Tente novamente em instantes.';
  if (erro.status === 0) return SEM_CONEXAO;
  if (usarMensagemDoServidor) {
    const corpo = erro.error as Partial<ErroApi> | null;
    return corpo?.mensagem ?? (erro.error?.detail as string | undefined) ?? padrao;
  }
  return padrao;
}
