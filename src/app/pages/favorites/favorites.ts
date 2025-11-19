import { Component, signal, OnInit, inject } from '@angular/core';
import { TmdbService } from '../../services/tmdb-service';
import { MovieCard } from '../../components/movie-card/movie-card/movie-card';
import { MovieFavoriteService } from '../../services/movie-favorite-service';


@Component({
  selector: 'app-favorites',
  imports: [MovieCard],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css'],
})
export class Favorites {

protected readonly favoriteMovies = signal<any[]>([]);
protected readonly loading = signal(false);
protected readonly client = inject(MovieFavoriteService);

constructor(){
  this.loadFavoriteMovies();
}

loadFavoriteMovies(page: number = 1) {
      this.loading.set(true);

    this.client.getFavoriteMovies(page).subscribe({
      next: (res) => {
        this.favoriteMovies.set(res.results);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al traer favoritos', err);
        this.loading.set(false);
      }
    });
  }
}
