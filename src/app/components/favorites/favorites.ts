import { Component, signal, OnInit } from '@angular/core';
import { TMDBClient } from '../../services/tmbdClient';
import { MovieCard } from "../movie-card/movie-card/movie-card";
import { GeminiChat } from "../../gemini/gemini-chat/gemini-chat";

@Component({
  selector: 'app-favorites',
  imports: [MovieCard, GeminiChat],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css'],
})
export class Favorites {

favoriteMovies = signal<any[]>([]);
loading = signal(false);
  
constructor(private tmdb: TMDBClient) {}

ngOnInit(): void {
    this.loadFavoriteMovies();
    console.log('resultado de peliculas favoritas'+ this.favoriteMovies());
}


loadFavoriteMovies(page: number = 1) {
      this.loading.set(true);

    this.tmdb.getFavoriteMovies(page).subscribe({
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
