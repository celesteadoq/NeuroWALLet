import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';

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

  protected cadastrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.log(this.form.getRawValue());
  }
}