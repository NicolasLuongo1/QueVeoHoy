import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DiscoverMovieParams, DiscoverMovieResponse } from '../models/movie';
import { Categories } from '../models/Categories';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// 🔥 Mantiene EXACTAMENTE tu token actual (autenticación intacta)
const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlMjA4MGVhN2VlODk0NmM5MGUyOGIyOTBkNzlkM2ZiZiIsIm5iZiI6MTYyNjM3NjI0Mi42NDksInN1YiI6IjYwZjA4ODMyNzQ2NDU3MDA0NjVmN2FiZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.A3fJ583trdgwhIXOVRc2ACT9K5mmy6Vk_86ZB9qs5Po';

@Injectable({
  providedIn: 'root'
})
export class TMDBClient {

  private readonly http = inject(HttpClient);

  private readonly baseUrl = TMDB_BASE_URL;
  private readonly accessToken = TMDB_ACCESS_TOKEN;
  private readonly imgBaseUrl = 'https://image.tmdb.org/t/p/';

  private readonly defaultHeaders = new HttpHeaders({
    Authorization: `Bearer ${this.accessToken}`
  });

  // 🟩 Signal con categorías cargadas desde TMDB
  readonly categories = signal<string[]>([]);

  constructor() {
    this.loadCategories();
  }

  // =====================================================================================
  // 🔥 DISCOVER MOVIES (Filtrado por categorías, actores, etc)
  // =====================================================================================
  discoverMovies(params: DiscoverMovieParams = {}): Observable<DiscoverMovieResponse> {
    let httpParams = new HttpParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && `${value}`.length > 0) {
        httpParams = httpParams.set(key, `${value}`);
      }
    }

    return this.http.get<DiscoverMovieResponse>(`${this.baseUrl}/discover/movie`, {
      headers: this.defaultHeaders,
      params: httpParams
    });
  }

  // =====================================================================================
  // 🔥 POPULAR MOVIES
  // =====================================================================================
  getPopularMovies(page: number = 1): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/popular`, {
      headers: this.defaultHeaders,
      params: new HttpParams().set('page', page)
    });
  }

  // =====================================================================================
  // 🔥 MOVIE DETAILS
  // =====================================================================================
  getMovieDetails(movieId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/${movieId}`, {
      headers: this.defaultHeaders
    });
  }

  // =====================================================================================
  // 🔥 CATEGORY LIST
  // =====================================================================================
  getCategories(): Observable<Categories> {
    return this.http.get<Categories>(`${this.baseUrl}/genre/movie/list`, {
      headers: this.defaultHeaders
    });
  }

  // Guarda categorías en el signal automático
  private loadCategories() {
    this.getCategories().subscribe({
      next: (res) => {
        const genreNames = res.genres.map(g => g.name);
        this.categories.set(genreNames);
        console.log('TMDB categorías cargadas:', genreNames);
      },
      error: (e) => console.error('Error cargando categorías TMDB', e)
    });
  }

  // =====================================================================================
  // 🔥 IMAGE HELPER
  // =====================================================================================
  getImageUrl(posterPath: string, size: string = 'w500'): string {
    return `${this.imgBaseUrl}${size}${posterPath}`;
  }
}
