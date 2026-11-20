import { Component, afterNextRender, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { API } from '../../core/config';
@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-recuperar-senha',
  styleUrls: ['../auth-base.css'],
  template: `<main>
    <section class="login-card">
      <h1>{{ redefinir ? 'Definir nova senha' : 'Recuperar senha' }}</h1>
      <form (ngSubmit)="enviar()">
        @if (redefinir) {
          <label
            >Nova senha<input
              name="senha"
              type="password"
              [(ngModel)]="senha"
              required
              minlength="12"
              maxlength="72"
              autocomplete="new-password"
          /></label>
        } @else {
          <label
            >E-mail<input
              name="email"
              type="email"
              [(ngModel)]="email"
              required
              autocomplete="email"
          /></label>
        }
        <button [disabled]="enviando()">Enviar</button>
      </form>
      @if (mensagem()) {
        <p role="status">{{ mensagem() }}</p>
      }
      <a routerLink="/login">Voltar ao login</a>
    </section>
  </main>`,
})
export class RecuperarSenha {
  private readonly http = inject(HttpClient);
  private token = '';
  protected readonly redefinir =
    typeof location !== 'undefined' && location.pathname === '/redefinir-senha';
  protected email = '';
  protected senha = '';
  protected readonly mensagem = signal('');
  protected readonly enviando = signal(false);
  constructor() {
    afterNextRender(() => {
      this.token = new URLSearchParams(location.hash.slice(1)).get('token') ?? '';
      if (this.redefinir) history.replaceState(null, '', location.pathname);
    });
  }
  protected enviar() {
    if (this.enviando()) return;
    if (
      this.redefinir &&
      (!this.token || this.senha.length < 12 || new TextEncoder().encode(this.senha).length > 72)
    ) {
      this.mensagem.set('Confira o link e use uma senha de 12 a 72 caracteres, com até 72 bytes.');
      return;
    }
    this.enviando.set(true);
    this.http
      .post<void>(
        API.baseUrl + '/auth/senha/' + (this.redefinir ? 'confirmar' : 'solicitar'),
        this.redefinir ? { token: this.token, senha: this.senha } : { email: this.email },
      )
      .subscribe({
        next: () => {
          this.mensagem.set(
            this.redefinir
              ? 'Senha alterada. Entre novamente.'
              : 'Se houver uma conta com esse e-mail, você receberá as instruções.',
          );
          this.enviando.set(false);
        },
        error: () => {
          this.mensagem.set(
            'Não foi possível concluir. Confira os dados ou solicite um novo link.',
          );
          this.enviando.set(false);
        },
      });
  }
}
