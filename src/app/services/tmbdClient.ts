import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DiscoverMovieParams, DiscoverMovieDTO, MovieDTO } from '../models/movieDTO';
import { CategoriesDTO } from '../models/CategoriesDTO';
import { environment } from '../enviroments/enviroment';
import { MovieDetailDTO } from '../models/detail/MovieDetailDTO';
import { MovieCreditsDTO } from '../models/detail/MovieCreditsDTO';
import { MovieVideosDTO } from '../models/detail/MovieVideosDTO';
import { MovieWatchProvidersDTO } from '../models/detail/MovieWatchProvidersDTO';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

@Injectable({
  providedIn: 'root'
})
export class TMDBClient {

  private readonly http = inject(HttpClient);

  private readonly baseUrl = TMDB_BASE_URL;
  private readonly accessToken = environment.tmdbAccessToken;
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
  discoverMovies(params: DiscoverMovieParams = {}): Observable<DiscoverMovieDTO> {
    let httpParams = new HttpParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && `${value}`.length > 0) {
        httpParams = httpParams.set(key, `${value}`);
      }
    }

    return this.http.get<DiscoverMovieDTO>(`${this.baseUrl}/discover/movie`, {
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
  getMovieDetail(movieId: number): Observable<MovieDetailDTO> {
    return this.http.get<MovieDetailDTO>(`${this.baseUrl}/movie/${movieId}`, {
      headers: this.defaultHeaders
    });
  }

  // =====================================================================================
  // 🔥 MOVIE CREDITS (CAST & CREW)
  // =====================================================================================
  getMovieCredits(movieId: number): Observable<MovieCreditsDTO> {
    return this.http.get<MovieCreditsDTO>(`${this.baseUrl}/movie/${movieId}/credits`, {
      headers: this.defaultHeaders
    });
  }

  // =====================================================================================
  // 🔥 MOVIE VIDEOS (TRAILERS)
  // =====================================================================================
  getMovieVideos(movieId: number): Observable<MovieVideosDTO> {
    return this.http.get<MovieVideosDTO>(`${this.baseUrl}/movie/${movieId}/videos`, {
      headers: this.defaultHeaders
    });
  }

  // =====================================================================================
  // 🔥 MOVIE WATCH PROVIDERS (STREAMING PLATFORMS)
  // =====================================================================================
  getMovieWatchProviders(movieId: number): Observable<MovieWatchProvidersDTO> {
    return this.http.get<MovieWatchProvidersDTO>(`${this.baseUrl}/movie/${movieId}/watch/providers`, {
      headers: this.defaultHeaders
    });
  }

  // =====================================================================================
  // 🔥 CATEGORY LIST
  // =====================================================================================
  getCategories(): Observable<CategoriesDTO> {
    return this.http.get<CategoriesDTO>(`${this.baseUrl}/genre/movie/list`, {
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
  getImageUrl(posterPath: string | null | undefined, size: string = 'w500'): string {
    if (!posterPath) return 'assets/no-image.png';
    return `${this.imgBaseUrl}${size}${posterPath}`;
  }

  getBackdropUrl(backdropPath: string | null | undefined, size: string = 'w1280'): string {
    if (!backdropPath) return 'assets/no-image.png';
    return `${this.imgBaseUrl}${size}${backdropPath}`;
  }

  getProfileUrl(profilePath: string | null | undefined, size: string = 'w185'): string {
    if (!profilePath) return 'assets/no-image.png';
    return `${this.imgBaseUrl}${size}${profilePath}`;
  }

  // =====================================================================================
  // 🔥 VIDEO HELPER METHODS
  // =====================================================================================
  getTrailerUrl(videoKey: string): string {
    return `https://www.youtube.com/watch?v=${videoKey}`;
  }

  getTrailerEmbedUrl(videoKey: string): string {
    return `https://www.youtube.com/embed/${videoKey}`;
  }

  getProviderLogoUrl(logoPath: string): string {
    if (!logoPath) return 'assets/no-image.png';
    return `${this.imgBaseUrl}w92${logoPath}`;
  }

  // =====================================================================================
  //  GEMINI SERVICE
  // ====================================================================================

  searchMoviesWithFilters(filters: { genres: string[]; actors: string[] }) {

  const params: any = {
    api_key: environment.tmdbApiKey,
    language: 'es-ES',
    query: filters.actors?.[0] ?? filters.genres?.[0] ?? '', // fallback
  };

  return this.http.get<{ results: any[]; total_pages: number }>(
    `https://api.themoviedb.org/3/search/movie`,
    { params }
  );
}
}
