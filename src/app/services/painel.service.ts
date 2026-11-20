import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';
export interface Loja {
  id: number;
  nome: string;
  categoria: string;
}
export interface Gasto {
  estabelecimentoId: number;
  nome: string;
  categoria: string;
  compras: number;
  total: number;
}
export interface Pagina {
  resultados: Gasto[];
  pagina: number;
  tamanho: number;
  temProxima: boolean;
}
export interface Alerta {
  id: number;
  mensagem: string;
  projecao: number;
  criadoEm: string;
}
export interface Fatura {
  mesReferencia: string;
  valorProjetado: number;
}
export interface Selo {
  nome: string;
  criterioDias: number;
  concedidoEm: string;
}
export interface Relatorio {
  mes: string;
  texto: string;
  maioresVazamentos: { estabelecimento: string; total: number }[];
}
export interface Parametros {
  valorUnitarioMax: number | null;
  limiteAcumulado: number;
  janelaDias: number;
  qtdMinCompras: number;
}
export interface Regra {
  id: number | null;
  padrao: boolean;
  parametros: Parametros;
}
export interface Excecao {
  id: number;
  estabelecimentoId: number;
  motivo: string;
}
@Injectable({ providedIn: 'root' })
export class PainelService {
  private readonly http = inject(HttpClient);
  get<T>(rota: string) {
    return this.http.get<T>('/api' + rota).pipe(timeout(20000));
  }
  salvarRegra(p: Parametros, id: number | null) {
    return (
      id ? this.http.put<Regra>('/api/regras/' + id, p) : this.http.post<Regra>('/api/regras', p)
    ).pipe(timeout(20000));
  }
  excluir(rota: string, id: number) {
    return this.http.delete<void>('/api' + rota + '/' + id).pipe(timeout(20000));
  }
  salvarExcecao(p: { estabelecimentoId: number; motivo: string }, id: number | null) {
    return (
      id
        ? this.http.put<Excecao>('/api/lista-branca/' + id, p)
        : this.http.post<Excecao>('/api/lista-branca', p)
    ).pipe(timeout(20000));
  }
  exportar(formato: string) {
    return this.http
      .get('/api/relatorios/exportar/' + formato, { responseType: 'blob' })
      .pipe(timeout(30000));
  }
  saude() {
    return this.http
      .get<{ status: string; components?: Record<string, { status: string }> }>('/actuator/health')
      .pipe(timeout(20000));
  }
}
