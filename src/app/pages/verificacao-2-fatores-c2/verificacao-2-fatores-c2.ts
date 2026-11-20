import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-verificacao-2-fatores-c2',
  styleUrl: './verificacao-2-fatores-c2.css',
  templateUrl: './verificacao-2-fatores-c2.html',
})
export class Verificacao2FatoresC2 {

  protected readonly chave = 'JBSW Y3DP EHPK 3PXP'; // depois virá do back-end
protected readonly copiado = signal(false);
protected async copiarChave(): Promise<void> {
  await navigator.clipboard.writeText(this.chave.replaceAll(' ', ''));
  this.copiado.set(true);
}

}
