import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, tap, finalize, of, timeout } from 'rxjs';
import { API } from '../core/config';
import {
  CadastroPedido,
  Iniciar2faResposta,
  LoginPedido,
  PassoResposta,
  SessaoResposta,
} from '../models/api.models';
import { SessaoService } from './sessao.service';
export interface Tokens {
  accessToken: string;
  refreshToken: string;
  codigosRecuperacao: string[];
}
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly local = inject(SessaoService);
  private readonly base = API.baseUrl + '/auth';
  login(pedido: LoginPedido): Observable<PassoResposta> {
    return this.http
      .post<{ tokenPre2fa: string; configurarTotp: boolean }>(this.base + '/login', {
        email: pedido.email,
        senha: pedido.senha,
      })
      .pipe(
        timeout(20000),
        tap((r) => this.local.desafio(r.tokenPre2fa, r.configurarTotp, pedido.lembrar)),
        map((r) => ({ proximo: r.configurarTotp ? 'ativar-2fa' : 'verificar-2fa' })),
      );
  }
  cadastrar(pedido: CadastroPedido): Observable<void> {
    return this.http.post<void>(this.base + '/cadastro', pedido).pipe(timeout(20000));
  }
  iniciar2fa(): Observable<Iniciar2faResposta> {
    return this.http
      .post<{ segredo: string; qrPngBase64: string }>(this.base + '/2fa/ativar', {})
      .pipe(
        timeout(20000),
        map((r) => ({ chave: r.segredo, otpauthUrl: '', qrPngBase64: r.qrPngBase64 })),
      );
  }
  verificar2fa(codigo: string): Observable<Tokens> {
    return this.http
      .post<Tokens>(this.base + '/2fa/' + (this.local.configurar ? 'confirmar' : 'verificar'), {
        codigo,
      })
      .pipe(
        timeout(20000),
        tap((r) => this.local.salvar(r)),
      );
  }
  sessao(): Observable<SessaoResposta> {
    return this.local.accessToken
      ? this.http.get(API.baseUrl + '/usuario/me').pipe(map(() => ({ autenticado: true })))
      : of({ autenticado: false });
  }
  sair(): Observable<void> {
    return this.http
      .post<void>(this.base + '/logout', { refreshToken: this.local.refreshToken })
      .pipe(
        timeout(20000),
        finalize(() => this.local.limpar()),
      );
  }
}
