import { Component, afterNextRender, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BancoService, Conta } from '../../services/banco.service';
import { finalize } from 'rxjs';
import { API } from '../../core/config';
@Component({
  imports: [RouterLink, CurrencyPipe, DatePipe],
  selector: 'app-inicio',
  styleUrls: ['./inicio.css'],
  templateUrl: './inicio.html',
})
export class Inicio {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly banco = inject(BancoService);
  private readonly http = inject(HttpClient);
  protected readonly aba = signal('visao');
  protected readonly sincronizando = signal<number | null>(null);
  protected readonly menu = [
    { id: 'visao', nome: 'Visão geral', icone: '◈' },
    { id: 'contas', nome: 'Minhas contas', icone: '▣' },
    { id: '/painel/ralos', nome: 'Meus gastos', icone: '↗' },
    { id: '/alertas', nome: 'Alertas', icone: '◉' },
    { id: '/faturas/projecao', nome: 'Faturas', icone: '▤' },
    { id: '/gamificacao/selos', nome: 'Conquistas', icone: '✧' },
    { id: '/relatorios', nome: 'Relatórios', icone: '▥' },
  ];
  protected titulo() {
    return this.menu.find((i) => i.id === this.aba())?.nome ?? 'Visão geral';
  }
  protected total() {
    return (this.dados()['/painel/ralos']?.resultados ?? []).reduce(
      (s: number, l: { total: number }) => s + Number(l.total),
      0,
    );
  }
  protected readonly contas = signal<Conta[]>([]);
  protected readonly aviso = signal('');
  protected readonly secoes = [
    { titulo: 'Painel mensal', rota: '/painel/ralos' },
    { titulo: 'Alertas', rota: '/alertas' },
    { titulo: 'Faturas projetadas', rota: '/faturas/projecao' },
    { titulo: 'Selos conquistados', rota: '/gamificacao/selos' },
    { titulo: 'Relatórios', rota: '/relatorios' },
  ];
  protected readonly dados = signal<Record<string, any>>({});
  protected readonly erros = signal<Record<string, string>>({});
  constructor() {
    afterNextRender(() => this.carregar());
  }
  protected carregar() {
    this.erros.set({});
    this.banco.listar().subscribe({
      next: (r) => this.contas.set(r),
      error: () => this.aviso.set('Não foi possível carregar as contas.'),
    });
    for (const s of this.secoes)
      this.http.get(API.baseUrl + s.rota).subscribe({
        next: (r) => this.dados.update((v) => ({ ...v, [s.rota]: r })),
        error: () =>
          this.erros.update((v) => ({
            ...v,
            [s.rota]: 'Não foi possível carregar. Tente atualizar.',
          })),
      });
  }
  protected sincronizar(id: number) {
    if (this.sincronizando() !== null) return;
    this.sincronizando.set(id);
    this.aviso.set('Importando transações...');
    this.banco
      .sincronizar(id)
      .pipe(finalize(() => this.sincronizando.set(null)))
      .subscribe({
        next: (r) => {
          this.aviso.set(
            r.novasTransacoes +
              ' novas transações importadas. A análise pode levar alguns instantes.',
          );
          this.carregar();
        },
        error: () =>
          this.aviso.set('Não foi possível importar. Confira a conexão e o limite diário.'),
      });
  }
  protected sair() {
    this.auth.sair().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login'),
    });
  }
}
