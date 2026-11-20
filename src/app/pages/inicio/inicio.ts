import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  imports: [],
  selector: 'app-inicio',
  styleUrls: ['../auth-base.css', './inicio.css'],
  templateUrl: './inicio.html',
})
export class Inicio {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected sair(): void {
    // Com sucesso ou com erro, o usuário volta para o login.
    this.authService.sair().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login'),
    });
  }
}
