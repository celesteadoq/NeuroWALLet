import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

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
