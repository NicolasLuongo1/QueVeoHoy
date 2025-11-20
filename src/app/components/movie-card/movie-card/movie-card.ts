import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TmdbService } from '../../../services/tmdb-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.css'
})
export class MovieCard {

  @Input() movie: any;

  protected readonly router = inject(Router)

  private tmdb = inject(TmdbService);

  // Devuelve URL del póster o un placeholder si no hay
  getPosterUrl(): string {
    if (!this.movie?.poster_path) {
      return '/no-image.png';
    }
    return this.tmdb.getImageUrl(this.movie.poster_path);
  }

  onImgError(event: Event) {
  (event.target as HTMLImageElement).src = '/no-image.png';
}

  // Redondea a 1 decimal
  getRating(): number {
    const rating = this.movie?.vote_average ?? 0;
    return Math.round(rating * 10) / 10;
  }

  navigateToDetail(id:number) {
    this.router.navigateByUrl(`/detail/${id}`)
  }
}
