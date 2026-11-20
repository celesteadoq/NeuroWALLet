import { Component, DestroyRef, afterNextRender, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { BancoService } from '../../services/banco.service';

@Component({
  imports: [],
  selector: 'app-banco-retorno',
  styleUrls: ['../auth-base.css', './banco-retorno.css'],
  templateUrl: './banco-retorno.html',
})
export class BancoRetorno {
  private readonly router = inject(Router);
  private readonly rota = inject(ActivatedRoute);
  private readonly bancoService = inject(BancoService);
  private readonly destroyRef = inject(DestroyRef);

  // Provisório: depois virá do back-end ou da query string
  protected readonly nomeBanco = 'Banco Exemplo';

  constructor() {
    // Só roda no navegador (o projeto tem SSR)
    afterNextRender(() => this.concluirConexao());
  }

  private concluirConexao(): void {
    // O banco devolve o usuário para cá com ?code=...&state=...
    const parametros = this.rota.snapshot.queryParamMap;

    this.bancoService
      .concluirConexao(parametros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        // replaceUrl: o código do banco só vale uma vez; o botão "voltar" não pode reutilizá-lo
        next: () => this.router.navigate(['/banco/conectado'], { replaceUrl: true }),
        error: () => this.router.navigate(['/banco/erro'], { replaceUrl: true }),
      });
  }
}
