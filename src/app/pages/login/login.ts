import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { mensagemDeErro } from '../../core/erros';
import { ROTA_POR_PASSO } from '../../core/rotas';
import { AuthService } from '../../services/auth.service';

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
    lembrar: [false],
  });

  protected campoInvalido(nome: 'email' | 'senha'): boolean {
    const campo = this.form.controls[nome];
    return campo.invalid && (campo.touched || campo.dirty);
  }

  protected entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.enviando()) return;

    this.enviando.set(true);
    this.erro.set(null);

    this.authService.login(this.form.getRawValue()).subscribe({
      // O back-end diz qual é o próximo passo; aqui só traduzimos em rota.
      next: ({ proximo }) => this.router.navigateByUrl(ROTA_POR_PASSO[proximo]),
      error: (erro) => {
        this.enviando.set(false);
        // Mensagem genérica de propósito: não revelar se o e-mail existe.
        this.erro.set(mensagemDeErro(erro, 'E-mail ou senha incorretos.'));
      },
    });
  }
}
