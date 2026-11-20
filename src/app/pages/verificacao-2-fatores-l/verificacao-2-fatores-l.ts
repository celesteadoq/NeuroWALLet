import { Component, inject, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CodigoVerificacao } from '../../components/codigo-verificacao/codigo-verificacao';
import { AuthService } from '../../services/auth.service';
import { SessaoService } from '../../services/sessao.service';
@Component({
  imports: [RouterLink, CodigoVerificacao],
  selector: 'app-verificacao-2-fatores-l',
  styleUrl: './verificacao-2-fatores-l.css',
  templateUrl: './verificacao-2-fatores-l.html',
})
export class Verificacao2FatoresL {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly sessao = inject(SessaoService);
  private readonly campoCodigo = viewChild(CodigoVerificacao);
  protected readonly configurar = this.sessao.configurar;
  protected readonly modoReserva = signal(false);
  protected readonly codigoReserva = signal('');
  protected readonly recuperacao = signal<string[]>([]);
  protected readonly codigo = signal('');
  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly expirada = signal(false);
  protected alternar() {
    this.modoReserva.update((v) => !v);
    this.codigoReserva.set('');
    this.codigo.set('');
    this.campoCodigo()?.limpar();
    this.erro.set(null);
  }
  protected verificarCodigo() {
    const valor = this.modoReserva() ? this.codigoReserva().trim() : this.codigo();
    if (!valor || (!this.modoReserva() && valor.length !== 6) || this.enviando() || this.expirada())
      return;
    this.enviando.set(true);
    this.erro.set(null);
    this.auth
      .verificar2fa(valor)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (r) => {
          if (r.codigosRecuperacao.length) this.recuperacao.set(r.codigosRecuperacao);
          else void this.router.navigateByUrl('/inicio');
        },
        error: (e) => {
          const status = e instanceof HttpErrorResponse ? e.status : 0;
          // Um 401 também pode indicar código incorreto; não apagar o desafio válido.
          this.erro.set(
            status === 429
              ? 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.'
              : status === 403
                ? 'Sua verificação expirou. Volte ao login para começar novamente.'
                : status === 0
                  ? 'Não foi possível conectar. Verifique sua conexão e tente novamente.'
                  : 'Código incorreto ou expirado. Confira o aplicativo e tente novamente.',
          );
          if (status === 403) this.expirada.set(true);
          this.codigoReserva.set('');
          this.campoCodigo()?.limpar();
        },
      });
  }
}
