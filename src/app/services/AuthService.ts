import { Injectable } from "@angular/core";
import { delay, Observable, of } from "rxjs";

interface LoginResposta {
  proximo: 'verificar-2fa';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  login(email: string, senha: string): Observable<LoginResposta> {
    return of({ proximo: 'verificar-2fa' as const }).pipe(delay(600)); // mock
    // Depois só o corpo muda: return this.http.post<LoginResposta>('/api/auth/login', { email, senha });
  }
}