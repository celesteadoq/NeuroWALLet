import { Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mensagemDeErro } from '../../core/erros';
import { AuthService } from '../../services/auth.service';

@Component({
  imports: [RouterLink],
  selector: 'app-verificacao-2-fatores-c2',
  styleUrl: './verificacao-2-fatores-c2.css',
  templateUrl: './verificacao-2-fatores-c2.html',
})
export class Verificacao2FatoresC2 {
  private readonly authService = inject(AuthService);

  // A chave é gerada pelo back-end; o front só mostra e copia.
  protected readonly qr = signal<string | null>(null);
  protected readonly chave = signal<string | null>(null);
  protected readonly erro = signal<string | null>(null);
  protected readonly copiado = signal(false);

  /** Exibe a chave em grupos de 4 letras (JBSW Y3DP ...), mas copia sem espaços. */
  protected readonly chaveFormatada = computed(
    () =>
      this.chave()
        ?.match(/.{1,4}/g)
        ?.join(' ') ?? '',
  );

  constructor() {
    // Só no navegador (o projeto tem SSR)
    afterNextRender(() => this.carregarChave());
  }

  protected carregarChave(): void {
    this.erro.set(null);
    this.authService.iniciar2fa().subscribe({
      next: ({ chave, qrPngBase64 }) => {
        this.chave.set(chave);
        this.qr.set(qrPngBase64 ?? null);
      },
      error: (erro) =>
        this.erro.set(mensagemDeErro(erro, 'Não foi possível gerar a chave. Tente novamente.')),
    });
  }

  protected async copiarChave(): Promise<void> {
    const chave = this.chave();
    if (!chave) return;

    try {
      await navigator.clipboard.writeText(chave);
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2000);
    } catch {
      this.erro.set('Não foi possível copiar. Selecione a chave e copie manualmente.');
    }
  }
}
