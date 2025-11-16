import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { DiscoverMovieParams, DiscoverMovieResponse, Movie } from '../models/movie';
import { Categories } from '../models/Categories';
import { environment } from '../enviroments/enviroment';
import { MovieDetailDTO } from '../models/detail/MovieDetailDTO';
import { MovieCreditsDTO } from '../models/detail/MovieCreditsDTO';
import { forkJoin, map, switchMap, tap  } from 'rxjs';

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
readonly categories = signal<{ id: number; name: string }[]>([]);

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
  // 🔥 CATEGORY LIST
  // =====================================================================================
getCategories(): Observable<Categories> {
  return this.http.get<Categories>(`${this.baseUrl}/genre/movie/list`, {
    headers: this.defaultHeaders,
    params: new HttpParams().set('language', 'es-ES')
  });
}

  // Guarda categorías en el signal automático
private loadCategories() {
  this.getCategories().subscribe({
    next: (res) => {
      this.categories.set(res.genres); // ✔ ahora sí matchea el tipo
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
  //  GEMINI SERVICE
  // ====================================================================================

searchMoviesWithFilters(filters: { genres: string[]; actors: string[] }) {

  // 🔹 LOG 1 — Qué devolvió Gemini
  console.log("🔍 Filtros recibidos desde Gemini:", filters);

  // 🔹 LOG 2 — Categorías ya cargadas de TMDB
  console.log("🎭 Categorías cargadas desde TMDB:", this.categories());

  // 🔹 LOG 3 — Géneros detectados por Gemini
  console.log("🎭 Géneros pedidos por Gemini:", filters.genres);

  // 1) Mapeo de géneros nombre → id
  const genreMap = new Map(
    this.categories().map(cat => [cat.name.toLowerCase().trim(), cat.id])
  );

  // Normalizamos también los géneros que devuelve Gemini
  const normalizedGenres = filters.genres.map(g => g.toLowerCase().trim());
  const genreIds = normalizedGenres
    .map(g => genreMap.get(g))
    .filter(id => id !== undefined);

  // 🔹 LOG 4 — IDs de géneros encontrados
  console.log("🎯 IDs de géneros detectados:", genreIds);

  // Normalizamos actores
  const normalizedActors = filters.actors.map(a => a.toLowerCase().trim());
  // 🔹 LOG 5 — Actores normalizados
  console.log("🧑‍🎤 Actores normalizados:", normalizedActors);

  // 2) Preparar búsqueda de actores
const actorRequests = filters.actors.length
  ? filters.actors.map(actor => this.http.get<any>(`${this.baseUrl}/search/person`, {
      headers: this.defaultHeaders,
      params: new HttpParams().set('query', actor)
    }))
  : [];

return (actorRequests.length ? forkJoin(actorRequests) : of([])).pipe(
  map(actorResponses => {
    const actorIds = actorResponses
      .map((r: any) => r.results?.[0]?.id)
      .filter((id: any) => id);
    console.log("🧑‍🎤 IDs de actores encontrados en TMDB:", actorIds);
    return { genreIds, actorIds };
  }),
  switchMap(({ genreIds, actorIds }) => {
    let params = new HttpParams()
      .set('language', 'es-ES')
      .set('page', 1);

    if (genreIds.length > 0) params = params.set('with_genres', genreIds.join(','));
    if (actorIds.length > 0) params = params.set('with_people', actorIds.join(','));

    console.log("📡 Parámetros enviados a TMDB Discover:", params.toString());

    return this.http.get<{ results: any[]; total_pages: number }>(
      `${this.baseUrl}/discover/movie`,
      { headers: this.defaultHeaders, params }
    );
  })
);
}





}
