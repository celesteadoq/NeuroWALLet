import { Component, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CodigoVerificacao } from '../../components/codigo-verificacao/codigo-verificacao';
import { mensagemDeErro } from '../../core/erros';
import { ROTA_POR_PASSO } from '../../core/rotas';
import { AuthService } from '../../services/auth.service';

@Component({
  imports: [RouterLink, CodigoVerificacao],
  selector: 'app-verificacao-2-fatores-l',
  styleUrl: './verificacao-2-fatores-l.css',
  templateUrl: './verificacao-2-fatores-l.html',
})
export class Verificacao2FatoresL {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly campoCodigo = viewChild.required(CodigoVerificacao);

  protected readonly codigoReserva = signal('');
  protected readonly recuperacao = signal<string[]>([]);
  protected readonly codigo = signal('');
  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected verificarCodigo(): void {
    if ((!this.codigoReserva().trim() && this.codigo().length !== 6) || this.enviando()) return;

    this.enviando.set(true);
    this.erro.set(null);

    this.authService.verificar2fa(this.codigoReserva().trim() || this.codigo()).subscribe({
      // Ativação e login passam por aqui: o back diz para onde ir em cada caso.
      next: ({ codigosRecuperacao }) => {
        if (codigosRecuperacao.length) this.recuperacao.set(codigosRecuperacao);
        else void this.router.navigateByUrl('/inicio');
      },
      error: (erro) => {
        this.enviando.set(false);
        this.erro.set(mensagemDeErro(erro, 'Código incorreto ou expirado. Tente novamente.'));
        this.campoCodigo().limpar();
      },
    });
  }
}
