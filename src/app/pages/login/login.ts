import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
    lembrar: [false],
  });

  protected entrar(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  console.log(this.form.getRawValue());
}

}