import { Component, ElementRef, afterNextRender, computed, input, output, viewChildren } from '@angular/core';

/** Campo de código com uma casa por dígito. Avisa a página por eventos. */
@Component({
  imports: [],
  selector: 'app-codigo-verificacao',
  styleUrl: './codigo-verificacao.css',
  templateUrl: './codigo-verificacao.html',
})
export class CodigoVerificacao {
  readonly tamanho = input(6);
  readonly invalido = input(false);

  /** A cada alteração, com o que foi digitado até agora. */
  readonly alterado = output<string>();
  /** Quando todas as casas ficam preenchidas. */
  readonly completo = output<string>();

  private readonly campos = viewChildren<ElementRef<HTMLInputElement>>('campo');
  private digitos: string[] = [];

  protected readonly posicoes = computed(() =>
    Array.from({ length: this.tamanho() }, (_, i) => i),
  );

  constructor() {
    // Foco na primeira casa ao abrir a tela (só no navegador)
    afterNextRender(() => this.focar(0));
  }

  protected aoDigitar(indice: number, evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const digito = campo.value.replace(/\D/g, '').slice(-1);
    campo.value = digito;
    this.digitos[indice] = digito;
    this.notificar();
    if (digito) this.focar(indice + 1);
  }

  protected aoPressionar(indice: number, evento: KeyboardEvent): void {
    if (evento.key === 'Backspace' && !this.digitos[indice]) this.focar(indice - 1);
    if (evento.key === 'ArrowLeft') this.focar(indice - 1);
    if (evento.key === 'ArrowRight') this.focar(indice + 1);
  }

  protected aoColar(evento: ClipboardEvent): void {
    evento.preventDefault();
    const texto = (evento.clipboardData?.getData('text') ?? '')
      .replace(/\D/g, '')
      .slice(0, this.tamanho());
    this.campos().forEach((c, i) => (c.nativeElement.value = texto[i] ?? ''));
    this.digitos = texto.split('');
    this.focar(Math.min(texto.length, this.tamanho() - 1));
    this.notificar();
  }

  /** Limpa as casas (ex.: depois de um código errado). */
  limpar(): void {
    this.digitos = [];
    this.campos().forEach((c) => (c.nativeElement.value = ''));
    this.focar(0);
    this.notificar();
  }

  private notificar(): void {
    const codigo = Array.from({ length: this.tamanho() }, (_, i) => this.digitos[i] ?? '').join('');
    this.alterado.emit(codigo);
    if (codigo.length === this.tamanho()) this.completo.emit(codigo);
  }

  private focar(indice: number): void {
    const campo = this.campos()[indice]?.nativeElement;
    campo?.focus();
    campo?.select();
  }
}
