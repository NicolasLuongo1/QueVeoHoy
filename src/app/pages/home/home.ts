import { Component, signal, inject, computed } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TmdbService } from '../../services/tmdb-service';
import { MovieCard } from '../../components/movie-card/movie-card/movie-card';
import { GeminiChat } from '../../gemini/gemini-chat/gemini-chat';
import { filter } from 'rxjs/operators';
import { EmptyState } from '../../components/empty-state/empty-state';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MovieCard, GeminiChat, EmptyState],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {

  private auth = inject(AuthService);
  private router = inject(Router);
  private tmdb = inject(TmdbService);

  // Signals
  loading = signal(true);
  movies = signal<any[]>([]);
  page = signal(1);
  totalPages = signal(0);
  noResults = signal(false);
  geminiFlag = signal(true); 

  // Filtros actuales
currentFilters = signal<{ genres: string[]; actors: string[]; onlyTitles?: boolean }>({
  genres: [],
  actors: [],
  onlyTitles: false
});
  popularTop10 = computed(() => {
    return this.movies().slice(0, 10);
  });
  gralMovies = computed(() => {
    return this.movies().slice(10);
  });

  // IDs de géneros y actores
  currentGenreIds: number[] = [];
  currentActorIds: string[] = [];

  constructor() {
    // Solo cargar populares si NO hay filtros
    if (this.currentFilters().genres.length === 0 && this.currentFilters().actors.length === 0) {
      this.fetchPopularMovies();
      this.geminiFlag.set(false);
    }
    // SI SE NAVEGA A /home (INCLUSO MISMA RUTA), RECARGA
  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      if (event.url === '/home') {
        this.refreshHome();
      }
    });
  }

  refreshHome() {
  this.currentFilters.set({ genres: [], actors: [], onlyTitles: false });
  this.page.set(1);
  this.movies.set([]);
  this.geminiFlag.set(false);
  this.fetchPopularMovies();
}

  fetchPopularMovies() {
    this.loading.set(true);

    this.tmdb.getPopularMovies(this.page()).subscribe({
      next: res => {
        this.movies.set(res.results);
        this.totalPages.set(res.total_pages);
        this.loading.set(false);
        this.noResults.set(res.results.length === 0);
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
        this.noResults.set(res.results.length === 0);
      },
      error: err => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

applyGeminiFilters(filters: { genres: string[]; actors: string[]; onlyTitles?: boolean }) {
   this.geminiFlag.set(true);
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
        this.noResults.set(res.results.length === 0); 
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
      this.noResults.set(res.results.length === 0);
      
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
