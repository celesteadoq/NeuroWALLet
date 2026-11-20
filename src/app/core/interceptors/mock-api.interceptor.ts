import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, mergeMap, of, throwError, timer } from 'rxjs';
import { API } from '../config';

/**
 * BACK-END DE MENTIRA. Responde as chamadas /api/* sem servidor nenhum.
 * Só é registrado quando API.usarMock === true (veja app.config.ts).
 * Quando o back real existir: API.usarMock = false e este arquivo pode ser apagado.
 *
 * Como testar os erros:
 *   login: e-mail contendo "erro"      -> 401
 *   cadastro: e-mail contendo "existe" -> 409
 *   códigos de 6 dígitos: 000000       -> 400
 *   retorno do banco: /banco/retorno?code=erro&state=x -> tela de erro
 */

const CHAVE_SESSAO = 'mock-autenticado';

function lerSessao(): boolean {
  return typeof sessionStorage !== 'undefined' && sessionStorage.getItem(CHAVE_SESSAO) === '1';
}

function gravarSessao(valor: boolean): void {
  if (typeof sessionStorage === 'undefined') return;
  if (valor) sessionStorage.setItem(CHAVE_SESSAO, '1');
  else sessionStorage.removeItem(CHAVE_SESSAO);
}

function ok<T>(corpo: T, ms = 600) {
  return of(new HttpResponse<T>({ status: 200, body: corpo })).pipe(delay(ms));
}

function falha(status: number, codigo: string, mensagem: string, ms = 600) {
  return timer(ms).pipe(
    mergeMap(() =>
      throwError(() => new HttpErrorResponse({ status, error: { codigo, mensagem } })),
    ),
  );
}

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API.baseUrl)) return next(req);

  const rota = `${req.method} ${req.url.slice(API.baseUrl.length)}`;
  const corpo = (req.body ?? {}) as Record<string, string | undefined>;

  switch (rota) {
    case 'POST /auth/login':
      return corpo['email']?.includes('erro')
        ? falha(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha incorretos.')
        : ok({ proximo: 'verificar-2fa' });

    case 'POST /auth/cadastro':
      return corpo['email']?.includes('existe')
        ? falha(409, 'EMAIL_JA_CADASTRADO', 'Este e-mail já está cadastrado.')
        : ok({ proximo: 'verificar-email' });

    case 'POST /auth/email/verificar':
      return corpo['codigo'] === '000000'
        ? falha(400, 'CODIGO_INVALIDO', 'Código incorreto ou expirado.')
        : ok({ proximo: 'ativar-2fa' });

    case 'POST /auth/email/reenviar':
      return ok({});

    case 'POST /auth/2fa/iniciar':
      return ok({
        chave: 'JBSWY3DPEHPK3PXP',
        otpauthUrl: 'otpauth://totp/NeuroWALLet:exemplo?secret=JBSWY3DPEHPK3PXP&issuer=NeuroWALLet',
      });

    case 'POST /auth/2fa/verificar':
      if (corpo['codigo'] === '000000') {
        return falha(400, 'CODIGO_INVALIDO', 'Código incorreto ou expirado.');
      }
      gravarSessao(true);
      return ok({ proximo: 'conectar-banco' });

    case 'GET /auth/sessao':
      return ok({ autenticado: lerSessao() }, 200);

    case 'POST /auth/sair':
      gravarSessao(false);
      return ok({}, 200);

    case 'POST /banco/conexoes':
      // No back real, esta URL será a do banco (https://...). No mock, voltamos para a nossa tela.
      return ok({ urlAutorizacao: '/banco/retorno?code=mock&state=mock' });

    case 'POST /banco/conexoes/retorno':
      return corpo['code'] === 'erro'
        ? falha(400, 'AUTORIZACAO_RECUSADA', 'Autorização recusada.', 1500)
        : ok({ status: 'conectado' }, 2000);

    default:
      return falha(404, 'NAO_ENCONTRADO', `Rota de mock inexistente: ${rota}`, 200);
  }
};
