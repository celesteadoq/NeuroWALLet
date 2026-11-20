import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-verificacao-2-fatores-l',
  styleUrl: './verificacao-2-fatores-l.css',
  templateUrl: './verificacao-2-fatores-l.html',
})
export class Verificacao2FatoresL {

  private readonly router = inject(Router);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    digito1: ['', Validators.required],
    digito2: ['', Validators.required],
    digito3: ['', Validators.required],
    digito4: ['', Validators.required],
    digito5: ['', Validators.required],
    digito6: ['', Validators.required],
  });

  protected verificarCodigo(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.log(this.form.getRawValue());

    this.router.navigate(['/banco']);
  }
}