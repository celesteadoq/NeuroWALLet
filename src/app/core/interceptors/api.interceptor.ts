import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, shareReplay, switchMap, tap, throwError, Observable } from 'rxjs';
import { API } from '../config';
import { SessaoService } from '../../services/sessao.service';
type Tokens = { accessToken: string; refreshToken: string };
const renovacoes = new WeakMap<SessaoService, Observable<Tokens>>();
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API.baseUrl + '/')) return next(req);
  const sessao = inject(SessaoService),
    http = inject(HttpClient),
    router = inject(Router);
  const auth = req.url.startsWith(API.baseUrl + '/auth/');
  const token = req.url.startsWith(API.baseUrl + '/auth/2fa/')
    ? sessao.preToken
    : !auth
      ? sessao.accessToken
      : null;
  const enviar = (t: string | null) =>
    next(t ? req.clone({ setHeaders: { Authorization: 'Bearer ' + t } }) : req);
  return enviar(token).pipe(
    catchError((erro: unknown) => {
      if (!(erro instanceof HttpErrorResponse) || erro.status !== 401 || auth)
        return throwError(() => erro);
      const encerrar = (e: unknown) => {
        sessao.limpar();
        void router.navigateByUrl('/login');
        return throwError(() => e);
      };
      if (!sessao.refreshToken) return encerrar(erro);
      let renovar = renovacoes.get(sessao);
      if (!renovar) {
        renovar = http
          .post<Tokens>(API.baseUrl + '/auth/refresh', { refreshToken: sessao.refreshToken })
          .pipe(
            tap((t) => sessao.salvar(t)),
            finalize(() => renovacoes.delete(sessao)),
            shareReplay({ bufferSize: 1, refCount: false }),
          );
        renovacoes.set(sessao, renovar);
      }
      return renovar.pipe(
        catchError(encerrar),
        switchMap((t) => enviar(t.accessToken)),
      );
    }),
  );
};
