import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../core/config';
import {
  CadastroPedido,
  Iniciar2faResposta,
  LoginPedido,
  PassoResposta,
  SessaoResposta,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API.baseUrl}/auth`;

  login(pedido: LoginPedido): Observable<PassoResposta> {
    return this.http.post<PassoResposta>(`${this.base}/login`, pedido);
  }

  cadastrar(pedido: CadastroPedido): Observable<PassoResposta> {
    return this.http.post<PassoResposta>(`${this.base}/cadastro`, pedido);
  }

  verificarEmail(codigo: string): Observable<PassoResposta> {
    return this.http.post<PassoResposta>(`${this.base}/email/verificar`, { codigo });
  }

  reenviarEmail(): Observable<void> {
    return this.http.post<void>(`${this.base}/email/reenviar`, {});
  }

  iniciar2fa(): Observable<Iniciar2faResposta> {
    return this.http.post<Iniciar2faResposta>(`${this.base}/2fa/iniciar`, {});
  }

  verificar2fa(codigo: string): Observable<PassoResposta> {
    return this.http.post<PassoResposta>(`${this.base}/2fa/verificar`, { codigo });
  }

  sessao(): Observable<SessaoResposta> {
    return this.http.get<SessaoResposta>(`${this.base}/sessao`);
  }

  sair(): Observable<void> {
    return this.http.post<void>(`${this.base}/sair`, {});
  }
}
