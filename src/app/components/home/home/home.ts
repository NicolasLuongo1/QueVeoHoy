import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../tmdb/auth-service';
import { TMDBClient } from '../../../services/tmbdClient';
import { MovieCard } from '../../movie-card/movie-card/movie-card';
import { GeminiChat } from '../../../gemini/gemini-chat/gemini-chat';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MovieCard, GeminiChat],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {

  private auth = inject(AuthService);
  private router = inject(Router);
  private tmdb = inject(TMDBClient);

  // Signals
  loading = signal(true);
  movies = signal<any[]>([]);
  page = signal(1);
  totalPages = signal(0);

  // Filtros actuales
currentFilters = signal<{ genres: string[]; actors: string[]; onlyTitles?: boolean }>({
  genres: [],
  actors: [],
  onlyTitles: false
});

  // IDs de géneros y actores
  currentGenreIds: number[] = [];
  currentActorIds: string[] = [];

  constructor() {
    // Solo cargar populares si NO hay filtros
    if (this.currentFilters().genres.length === 0 && this.currentFilters().actors.length === 0) {
      this.fetchPopularMovies();
    }
  }

  fetchPopularMovies() {
    this.loading.set(true);

    this.tmdb.getPopularMovies(this.page()).subscribe({
      next: res => {
        this.movies.set(res.results);
        this.totalPages.set(res.total_pages);
        this.loading.set(false);
      },
      error: err => {
        console.error('Error cargando películas populares:', err);
        this.loading.set(false);
      }
    });
  }

  loadMore() {
    const nextPage = this.page() + 1;
    this.loading.set(true);

    const filters = this.currentFilters();

    // Si hay filtros, usar Gemini
    const request$ = (filters.genres.length || filters.actors.length)
      ? this.tmdb.searchMoviesWithFilters(filters, nextPage)
      : this.tmdb.getPopularMovies(nextPage);

    request$.subscribe({
      next: res => {
        const newMovies = 'results' in res ? res.results : res;
        this.movies.update(prev => [...prev, ...newMovies]);
        this.page.set(nextPage);
        this.totalPages.set('total_pages' in res ? res.total_pages : this.totalPages());
        this.loading.set(false);
      },
      error: err => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

applyGeminiFilters(filters: { genres: string[]; actors: string[]; onlyTitles?: boolean }) {
  this.loading.set(true);
  this.page.set(1);
  this.movies.set([]);
  this.currentFilters.set(filters);

  // Si el usuario quiere SOLO títulos → texto = lo que escribió en el input
  if (filters.onlyTitles) {
    const freeText = filters.actors.join(" ").trim(); 
    this.tmdb.searchMoviesWithFilters(
      {
        genres: [],
        actors: [],
        text: freeText
      },
      1
    ).subscribe({
      next: res => {
        this.movies.set(res.results);
        this.totalPages.set(res.total_pages);
        this.loading.set(false);
      },
      error: err => {
        console.error(err);
        this.loading.set(false);
      }
    });

    return;
  }

  const freeText = filters.actors.join(" ").trim();

  this.tmdb.searchMoviesWithFilters(
    {
      genres: filters.genres,
      actors: filters.actors,
      text: freeText
    },
    1
  ).subscribe({
    next: res => {
      this.movies.set(res.results);
      this.totalPages.set(res.total_pages);
      this.loading.set(false);
    },
    error: err => {
      console.error(err);
      this.loading.set(false);
    }
  });
}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
