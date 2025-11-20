import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TmdbService } from '../../../../services/tmdb-service';
import { MovieFavoriteService } from '../../../../services/movie-favorite-service';

@Component({
  selector: 'app-movie-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-banner.html',
  styleUrl: './movie-banner.css',
})
export class MovieBanner {
  readonly backdropUrl = input.required<string>();
  readonly title = input.required<string>();
  readonly overview = input<string | undefined>(undefined);

  readonly movieId = input.required<number>();
  protected readonly isFavorite = signal(false); 
  protected readonly favoriteClient = inject(MovieFavoriteService);

  constructor() {
    this.checkIfFavorite();
   }

   checkIfFavorite() {
    this.favoriteClient.getFavoriteMovies().subscribe({
      next: (res) => {
        const exists = res.results?.some((m: any) => m.id === this.movieId());
        this.isFavorite.set(!!exists);
      },
      error: (err) => {
        console.error('Error cargando favoritos', err);
      },
    });
  }

toggleFavorite() {
  if (!this.isFavorite()) {
    this.addToFavorites();
    this.isFavorite.set(true);
  } else {
    this.favoriteClient.markAsFavorite(this.movieId(), false)
      .subscribe({
        next: () => this.isFavorite.set(false),
        error: (err) => console.error('Error removiendo favorito', err)
      });
  }
}

  addToFavorites() {
    const id = this.movieId();

    this.favoriteClient.markAsFavorite(id, true).subscribe({
      error: (err) => {
        console.error('Error agregando favorito', err);
      },
    });
  }



}






