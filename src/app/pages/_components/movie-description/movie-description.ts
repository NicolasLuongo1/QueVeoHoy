import { Component, input } from '@angular/core';

@Component({
  selector: 'app-movie-description',
  standalone: true,
  imports: [],
  templateUrl: './movie-description.html',
  styleUrl: './movie-description.css',
})
export class MovieDescription {
  overview = input.required<string>();
}

