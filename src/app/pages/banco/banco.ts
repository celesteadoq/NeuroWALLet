import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-banco',
  styleUrl: './banco.css',
  templateUrl: './banco.html',
})
export class Banco {
  protected readonly form = inject(FormBuilder).nonNullable.group({
    instituicao: ['', Validators.required],
  });

  protected continuar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.log(this.form.getRawValue());
  }
}