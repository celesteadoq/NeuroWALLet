import { Component, afterNextRender, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BancoService, Conta } from '../../services/banco.service';
import { API } from '../../core/config';
@Component({
  imports: [RouterLink, CurrencyPipe, DatePipe],
  selector: 'app-inicio',
  styleUrls: ['../auth-base.css', './inicio.css'],
  templateUrl: './inicio.html',
})
export class Inicio {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly banco = inject(BancoService);
  private readonly http = inject(HttpClient);
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
    this.aviso.set('Importando transações...');
    this.banco.sincronizar(id).subscribe({
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
