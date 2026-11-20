import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
@Component({
  imports: [RouterLink],
  selector: 'app-legal',
  templateUrl: './legal.html',
  styleUrl: './legal.css',
})
export class Legal {
  protected readonly privacidade =
    inject(ActivatedRoute).snapshot.routeConfig?.path === 'politica-de-privacidade';
}
