import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API } from '../config';

/**
 * Passa por TODAS as chamadas ao back-end:
 * 1) envia os cookies de sessão (withCredentials);
 * 2) se o back responder 401 (sessão expirada), leva o usuário ao login.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API.baseUrl)) return next(req);

  const router = inject(Router);

  return next(req.clone({ withCredentials: true })).pipe(
    catchError((erro: unknown) => {
      const sessaoExpirada = erro instanceof HttpErrorResponse && erro.status === 401;
      const ehChamadaDeAuth = req.url.startsWith(`${API.baseUrl}/auth/`);
      // Em /auth/* o 401 é "senha errada" ou "código errado", e a tela trata isso.
      if (sessaoExpirada && !ehChamadaDeAuth) router.navigateByUrl('/login');
      return throwError(() => erro);
    }),
  );
};
