import { Component, afterNextRender, inject, signal, DestroyRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer, switchMap, take } from 'rxjs';
import { BancoService } from '../../services/banco.service';
@Component({
  imports: [RouterLink],
  selector: 'app-banco-retorno',
  styleUrls: ['../auth-base.css'],
  template:
    '<main><section class="login-card"><h1>Confirmando conexão</h1><p>{{mensagem()}}</p><button (click)="verificar()" [disabled]="consultando()">Consultar novamente</button><a routerLink="/inicio">Voltar ao início</a></section></main>',
})
export class BancoRetorno {
  private readonly banco = inject(BancoService);
  private readonly router = inject(Router);
  private readonly destroy = inject(DestroyRef);
  protected readonly mensagem = signal('Aguardando confirmação da instituição.');
  protected readonly consultando = signal(false);
  constructor() {
    afterNextRender(() => this.verificar());
  }
  protected verificar() {
    if (this.consultando()) return;
    this.consultando.set(true);
    timer(0, 2000)
      .pipe(
        take(10),
        switchMap(() => this.banco.listar()),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe({
        next: (contas) => {
          if (
            contas.some(
              (c) =>
                !(
                  JSON.parse(sessionStorage.getItem('nw-contas-antes') ?? '[]') as number[]
                ).includes(c.id),
            )
          )
            void this.router.navigateByUrl('/banco/conectado');
        },
        complete: () => {
          this.consultando.set(false);
          this.mensagem.set('Se a conta ainda não aparecer, aguarde e consulte novamente.');
        },
        error: () => {
          this.consultando.set(false);
          this.mensagem.set('Não foi possível consultar a conexão. Tente novamente.');
        },
      });
  }
}
