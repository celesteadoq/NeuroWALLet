import { switchMap, tap, timeout } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API } from '../core/config';
export interface Conta {
  id: number;
  instituicao: string;
  ativa?: boolean;
}
@Injectable({ providedIn: 'root' })
export class BancoService {
  private readonly http = inject(HttpClient);
  listar(incluirDesconectadas = false) {
    return this.http.get<Conta[]>(API.baseUrl + '/contas' + (incluirDesconectadas ? '?incluirDesconectadas=true' : '')).pipe(timeout(20000));
  }
  remover(id: number, apagarHistorico: boolean) {
    return this.http.delete<void>(API.baseUrl + '/contas/' + id + '?apagarHistorico=' + apagarHistorico).pipe(timeout(60000));
  }
  ambiente() {
    return this.http.get<{ demonstracao: boolean; pluggyConfigurado: boolean }>(API.baseUrl + '/openfinance/ambiente').pipe(timeout(10000));
  }
  iniciarConexao(banco?: string) {
    return this.listar().pipe(
      tap((contas) =>
        sessionStorage.setItem('nw-contas-antes', JSON.stringify(contas.map((c) => c.id))),
      ),
      switchMap(() =>
        this.http.post<{ accessToken: string; expiraEm: string }>(
          API.baseUrl + '/openfinance/consentimentos' + (banco ? '?banco=' + encodeURIComponent(banco) : ''),
          {},
        ),
      ),
    );
  }
  sincronizar(id: number) {
    return this.http.post<{ novasTransacoes: number }>(
      API.baseUrl + '/contas/' + id + '/sincronizar',
      {},
    );
  }
}
