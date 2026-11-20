import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../core/config';
import { ConcluirConexaoResposta, IniciarConexaoResposta } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class BancoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API.baseUrl}/banco`;

  /** Pede ao back a URL do banco onde o usuário vai autorizar o acesso. */
  iniciarConexao(bancoId: string): Observable<IniciarConexaoResposta> {
    return this.http.post<IniciarConexaoResposta>(`${this.base}/conexoes`, { bancoId });
  }

  /** Entrega ao back o que o banco devolveu (code e state) para ele concluir a conexão. */
  concluirConexao(code: string | null, state: string | null): Observable<ConcluirConexaoResposta> {
    return this.http.post<ConcluirConexaoResposta>(`${this.base}/conexoes/retorno`, { code, state });
  }
}
