import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const login = inject(Router).createUrlTree(['/login']);

  return inject(AuthService)
    .sessao()
    .pipe(
      map((sessao) => sessao.autenticado || login),
      catchError(() => of(login)),
    );
};
