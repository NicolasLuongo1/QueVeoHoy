import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TMDBClient } from '../../../../services/tmbdClient';

@Component({
  selector: 'app-movie-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-banner.html',
  styleUrl: './movie-banner.css',
})
export class MovieBanner {
  backdropUrl = input.required<string>();
  title = input.required<string>();
  overview = input<string | undefined>(undefined);

  movieId = input.required<number>();
  isFavorite = signal(false);  

  constructor(private tmdbClient: TMDBClient) { }

 ngOnInit() {
    this.checkIfFavorite();
  }

   checkIfFavorite() {
    this.tmdbClient.getFavoriteMovies().subscribe({
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
    this.tmdbClient.markAsFavorite(this.movieId(), false)
      .subscribe({
        next: () => this.isFavorite.set(false),
        error: (err) => console.error('Error removiendo favorito', err)
      });
  }
}

  addToFavorites() {
    const id = this.movieId();

    this.tmdbClient.markAsFavorite(id, true).subscribe({
      next: (res) => {
        console.log('Agregado a favoritos', res);
      },
      error: (err) => {
        console.error('Error agregando favorito', err);
      },
    });
  }



}






