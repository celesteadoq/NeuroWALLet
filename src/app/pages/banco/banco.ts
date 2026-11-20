import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { mensagemDeErro } from '../../core/erros';
import { BancoService } from '../../services/banco.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-banco',
  styleUrl: './banco.css',
  templateUrl: './banco.html',
})
export class Banco {
  private readonly router = inject(Router);
  private readonly bancoService = inject(BancoService);

  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    instituicao: ['', Validators.required],
  });

  protected instituicaoInvalida(): boolean {
    const campo = this.form.controls.instituicao;
    return campo.invalid && campo.touched;
  }

  protected continuar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.enviando()) return;

    this.enviando.set(true);
    this.erro.set(null);

    this.bancoService.iniciarConexao(this.form.controls.instituicao.value).subscribe({
      next: ({ urlAutorizacao }) => this.irParaAutorizacao(urlAutorizacao),
      error: (erro) => {
        this.enviando.set(false);
        this.erro.set(mensagemDeErro(erro, 'Não foi possível iniciar a conexão. Tente novamente.'));
      },
    });
  }

  /** Leva o usuário para onde o back mandou, com uma checagem de segurança. */
  private irParaAutorizacao(urlAutorizacao: string): void {
    try {
      const url = new URL(urlAutorizacao, window.location.origin);

      if (url.origin === window.location.origin) {
        // Mock: a "autorização" é uma rota nossa.
        this.router.navigateByUrl(url.pathname + url.search);
      } else if (url.protocol === 'https:') {
        // Back real: sai do app e vai ao ambiente do banco.
        window.location.assign(url.href);
      } else {
        throw new Error('protocolo inválido');
      }
    } catch {
      this.enviando.set(false);
      this.erro.set('Endereço de autorização inválido. Tente novamente.');
    }
  }
}
