import { HttpErrorResponse } from '@angular/common/http';
import { ErroApi } from '../models/api.models';

export const SEM_CONEXAO =
  'Não foi possível falar com o servidor. Verifique sua conexão e tente de novo.';

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
  // Exibe a mensagem da API somente em fluxos que podem revelar detalhes do erro.
  if (usarMensagemDoServidor) {
    const corpo = erro.error as Partial<ErroApi> | null;
    return corpo?.mensagem ?? (erro.error?.detail as string | undefined) ?? padrao;
  }
  return padrao;
}
