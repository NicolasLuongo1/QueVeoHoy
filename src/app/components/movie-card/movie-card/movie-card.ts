import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TMDBClient } from '../../../services/tmbdClient';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.css'
})
export class MovieCard {

  @Input() movie: any;

  private tmdb = inject(TMDBClient);

  // Devuelve URL del póster o un placeholder si no hay
  getPosterUrl(): string {
    if (!this.movie?.poster_path) {
      return 'assets/no-image.png';
    }
    return this.tmdb.getImageUrl(this.movie.poster_path);
  }

  // Redondea a 1 decimal
  getRating(): number {
    const rating = this.movie?.vote_average ?? 0;
    return Math.round(rating * 10) / 10;
  }
}
