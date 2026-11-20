import { Component, DestroyRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CodigoVerificacao } from '../../components/codigo-verificacao/codigo-verificacao';
import { mensagemDeErro } from '../../core/erros';
import { ROTA_POR_PASSO } from '../../core/rotas';
import { AuthService } from '../../services/auth.service';

@Component({
  imports: [RouterLink, CodigoVerificacao],
  selector: 'app-verificacao-2-fatores-c',
  styleUrl: './verificacao-2-fatores-c.css',
  templateUrl: './verificacao-2-fatores-c.html',
})
export class Verificacao2FatoresC {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly campoCodigo = viewChild.required(CodigoVerificacao);
  private timer?: ReturnType<typeof setInterval>;

  protected readonly codigo = signal('');
  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly segundos = signal(0);

  constructor() {
    inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
    // O contador só roda no navegador (o projeto tem SSR)
    afterNextRender(() => this.iniciarContagem());
  }

  protected verificar(): void {
    if (this.codigo().length !== 6 || this.enviando()) return;

    this.enviando.set(true);
    this.erro.set(null);

    this.authService.verificarEmail(this.codigo()).subscribe({
      next: ({ proximo }) => this.router.navigateByUrl(ROTA_POR_PASSO[proximo]),
      error: (erro) => {
        this.enviando.set(false);
        this.erro.set(mensagemDeErro(erro, 'Código incorreto ou expirado. Tente novamente.'));
        this.campoCodigo().limpar();
      },
    });
  }

  protected reenviar(): void {
    this.erro.set(null);
    this.authService.reenviarEmail().subscribe({
      error: (erro) => this.erro.set(mensagemDeErro(erro, 'Não foi possível reenviar o código.')),
    });
    this.campoCodigo().limpar();
    this.iniciarContagem();
  }

  private iniciarContagem(): void {
    clearInterval(this.timer);
    this.segundos.set(30);
    this.timer = setInterval(() => {
      this.segundos.update((s) => s - 1);
      if (this.segundos() <= 0) clearInterval(this.timer);
    }, 1000);
  }
}
