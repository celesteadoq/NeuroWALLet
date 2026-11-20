import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  imports: [RouterLink],
  selector: 'app-verificacao-2-fatores-c',
  template:
    '<main><p>Entre para configurar seu autenticador.</p><a routerLink="/login">Ir para login</a></main>',
})
export class Verificacao2FatoresC {}
