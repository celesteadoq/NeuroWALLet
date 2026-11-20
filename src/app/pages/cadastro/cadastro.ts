import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { mensagemDeErro } from '../../core/erros';
import { ROTA_POR_PASSO } from '../../core/rotas';
import { AuthService } from '../../services/auth.service';

// Valida se a senha e a confirmação são iguais
const senhasIguais: ValidatorFn = (control: AbstractControl) => {
  const senha = control.get('senha')?.value;
  const confirmar = control.get('confirmar')?.value;

  if (!senha || !confirmar) {
    return null;
  }

  return senha === confirmar ? null : { senhasDiferentes: true };
};

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-cadastro',
  styleUrl: './cadastro.css',
  templateUrl: './cadastro.html',
})
export class Cadastro {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group(
    {
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      confirmar: ['', Validators.required],
      termos: [false, Validators.requiredTrue],
      senha: ['', [Validators.required, Validators.minLength(8)]],
    },
    {
      validators: senhasIguais,
    }
  );

  protected campoInvalido(nome: 'nome' | 'email' | 'senha' | 'confirmar'): boolean {
    const campo = this.form.controls[nome];
    return campo.invalid && (campo.touched || campo.dirty);
  }

  protected cadastrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.enviando()) return;

    this.enviando.set(true);
    this.erro.set(null);

    // Só os campos que o back precisa: a confirmação e os termos ficam no front.
    const { nome, email, senha } = this.form.getRawValue();

    this.authService.cadastrar({ nome, email, senha }).subscribe({
      next: ({ proximo }) => this.router.navigateByUrl(ROTA_POR_PASSO[proximo]),
      error: (erro) => {
        this.enviando.set(false);
        // Aqui a mensagem do servidor é segura ("e-mail já cadastrado").
        this.erro.set(mensagemDeErro(erro, 'Não foi possível criar a conta. Tente novamente.', true));
      },
    });
  }
}
