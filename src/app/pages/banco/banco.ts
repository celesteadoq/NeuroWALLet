import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BancoService } from '../../services/banco.service';
import { mensagemDeErro } from '../../core/erros';
interface Widget {
  init(): void;
}
declare global {
  interface Window {
    PluggyConnect: new (options: {
      connectToken: string;
      includeSandbox: boolean;
      onSuccess: () => void;
      onError: () => void;
      onClose: () => void;
    }) => Widget;
  }
}
let carregamento: Promise<void> | undefined;
function carregar(): Promise<void> {
  if (window.PluggyConnect) return Promise.resolve();
  return (carregamento ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.pluggy.ai/pluggy-connect/v2.8.2/pluggy-connect.js';
    const timer = setTimeout(() => {
      carregamento = undefined;
      script.remove();
      reject(new Error('Tempo excedido'));
    }, 15000);
    script.onload = () => {
      clearTimeout(timer);
      resolve();
    };
    script.onerror = () => {
      clearTimeout(timer);
      carregamento = undefined;
      script.remove();
      reject(new Error('Falha ao carregar Pluggy'));
    };
    document.head.appendChild(script);
  }));
}
@Component({
  imports: [RouterLink],
  selector: 'app-banco',
  styleUrl: './banco.css',
  templateUrl: './banco.html',
})
export class Banco {
  private readonly banco = inject(BancoService);
  private readonly router = inject(Router);
  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly demonstracao = signal(false);
  protected readonly ambienteCarregado = signal(false);
  constructor() {
    this.banco.ambiente().subscribe({
      next: (r) => { this.demonstracao.set(r.demonstracao); this.ambienteCarregado.set(true); },
      error: () => this.erro.set('Não foi possível consultar o ambiente. Atualize a página.'),
    });
  }
  protected continuar(instituicao?: string) {
    if (this.enviando()) return;
    this.enviando.set(true);
    this.erro.set(null);
    this.banco.iniciarConexao(instituicao).subscribe({
      next: async (r) => {
        if (this.demonstracao()) {
          void this.router.navigateByUrl('/banco/retorno');
          return;
        }
        try {
          await carregar();
          new window.PluggyConnect({
            connectToken: r.accessToken,
            includeSandbox: ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname),
            onSuccess: () => {
              void this.router.navigateByUrl('/banco/retorno');
            },
            onError: () => {
              this.erro.set('Não foi possível conectar. Tente novamente.');
              this.enviando.set(false);
            },
            onClose: () => this.enviando.set(false),
          }).init();
        } catch {
          this.erro.set('Não foi possível abrir a conexão bancária. Tente novamente.');
          this.enviando.set(false);
        }
      },
      error: (e) => {
        this.erro.set(
          mensagemDeErro(
            e,
            'Não foi possível iniciar a conexão agora. Tente novamente em instantes.',
          ),
        );
        this.enviando.set(false);
      },
    });
  }
}
