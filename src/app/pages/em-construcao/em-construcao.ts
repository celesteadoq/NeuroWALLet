import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

/** Página provisória para Termos, Política e Recuperar senha. O título vem da rota (data). */
@Component({
  imports: [RouterLink],
  selector: 'app-em-construcao',
  styleUrls: ['../auth-base.css', './em-construcao.css'],
  templateUrl: './em-construcao.html',
})
export class EmConstrucao {
  protected readonly titulo: string =
    inject(ActivatedRoute).snapshot.data['titulo'] ?? 'Página em construção';
}
