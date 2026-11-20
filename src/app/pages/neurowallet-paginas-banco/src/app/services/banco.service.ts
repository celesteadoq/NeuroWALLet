import { Injectable } from '@angular/core';
import { ParamMap } from '@angular/router';
import { delay, mergeMap, Observable, of, throwError, timer } from 'rxjs';

export interface IniciarConexaoResposta {
  urlAutorizacao: string;
}

export interface ConcluirConexaoResposta {
  status: 'conectado';
}

@Injectable({ providedIn: 'root' })
export class BancoService {
  /** Pede ao back-end a URL do banco onde o usuário vai autorizar o acesso. */
  iniciarConexao(bancoId: string): Observable<IniciarConexaoResposta> {
    // MOCK: "volta" direto para a nossa tela de retorno
    return of({ urlAutorizacao: `/banco/retorno?code=mock&state=mock&banco=${bancoId}` }).pipe(
      delay(600),
    );
    // REAL: return this.http.post<IniciarConexaoResposta>('/api/banco/conexoes', { bancoId });
  }

  /** Entrega ao back-end o que o banco devolveu, para ele concluir a conexão. */
  concluirConexao(parametros: ParamMap): Observable<ConcluirConexaoResposta> {
    // MOCK: abra /banco/retorno?simular=erro para ver a tela de erro
    if (parametros.get('simular') === 'erro') {
      return timer(1500).pipe(mergeMap(() => throwError(() => new Error('mock: conexão recusada'))));
    }
    return of({ status: 'conectado' as const }).pipe(delay(2000));
    // REAL: return this.http.post<ConcluirConexaoResposta>('/api/banco/conexoes/retorno', {
    //   code: parametros.get('code'),
    //   state: parametros.get('state'),
    // });
  }
}
