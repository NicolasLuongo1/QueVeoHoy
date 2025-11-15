import { Component, effect, signal, inject } from '@angular/core';
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

  constructor() {
    // Efecto: cuando cambia page → carga películas
    effect(() => {
      this.fetchPopularMovies();
    });
  }

  // =====================================================================
  // 🔥 Carga películas populares
  // =====================================================================
  fetchPopularMovies() {
    this.loading.set(true);

    this.tmdb.getPopularMovies(this.page()).subscribe({
      next: res => {
        if (this.page() === 1) {
          this.movies.set(res.results);
        } else {
          this.movies.update(prev => [...prev, ...res.results]);
        }

        this.totalPages.set(res.total_pages);
        this.loading.set(false);
      },
      error: err => {
        console.error('Error cargando películas populares:', err);
        this.loading.set(false);
      }
    });
  }

  // =====================================================================
  // 🔥 Paginación
  // =====================================================================
  loadMore() {
    this.page.update(p => p + 1);
  }

  // =====================================================================
  // 🔥 Reemplazar películas cuando gemini filtre
  // (lo usaremos luego en el siguiente paso)
  // =====================================================================
  setFilteredMovies(movies: any[]) {
    this.movies.set(movies);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
