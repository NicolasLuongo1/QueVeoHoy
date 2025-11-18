import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { DiscoverMovieParams, DiscoverMovieDTO, MovieDTO } from '../models/movieDTO';
import { CategoriesDTO } from '../models/CategoriesDTO';
import { environment } from '../enviroments/enviroment';
import { MovieDetailDTO } from '../models/detail/MovieDetailDTO';
import { MovieCreditsDTO } from '../models/detail/MovieCreditsDTO';
import { forkJoin, map, switchMap, tap  } from 'rxjs';
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

  // Signal con categorías cargadas desde TMDB
readonly categories = signal<{ id: number; name: string }[]>([]);

  constructor() {
    this.loadCategories();
  }

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

  getPopularMovies(page: number = 1): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/popular`, {
      headers: this.defaultHeaders,
      params: new HttpParams().set('page', page)
    });
  }

  getMovieDetail(movieId: number): Observable<MovieDetailDTO> {
    return this.http.get<MovieDetailDTO>(`${this.baseUrl}/movie/${movieId}`, {
      headers: this.defaultHeaders
    });
  }

  getMovieCredits(movieId: number): Observable<MovieCreditsDTO> {
    return this.http.get<MovieCreditsDTO>(`${this.baseUrl}/movie/${movieId}/credits`, {
      headers: this.defaultHeaders
    });
  }

  getMovieVideos(movieId: number): Observable<MovieVideosDTO> {
    return this.http.get<MovieVideosDTO>(`${this.baseUrl}/movie/${movieId}/videos`, {
      headers: this.defaultHeaders
    });
  }

  getMovieWatchProviders(movieId: number): Observable<MovieWatchProvidersDTO> {
    return this.http.get<MovieWatchProvidersDTO>(`${this.baseUrl}/movie/${movieId}/watch/providers`, {
      headers: this.defaultHeaders
    });
  }

 
getCategories(): Observable<CategoriesDTO> {
  return this.http.get<CategoriesDTO>(`${this.baseUrl}/genre/movie/list`, {
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

searchMoviesWithFilters(
  filters: { genres: string[]; actors: string[]; text?: string; onlyTitles?: boolean },
  page: number = 1
): Observable<{ results: MovieDTO[]; total_pages: number }> {

  const { genres, actors, text } = filters;

  // 🔥 PRIORIDAD: si hay texto → usar búsqueda libre
  if (text && text.trim().length > 0) {
    const params = new HttpParams()
      .set('language', 'es-ES')
      .set('query', text)
      .set('page', page);

    return this.http.get<{ results: MovieDTO[]; total_pages: number }>(
      `${this.baseUrl}/search/movie`,
      { headers: this.defaultHeaders, params }
    );
  }

  // Normalización
  const normalizedGenres = genres.map(g => g.toLowerCase().trim());
  const normalizedActors = actors.map(a => a.toLowerCase().trim());

  // ----- Géneros -----
  const genreMap = new Map(
    this.categories().map(cat => [cat.name.toLowerCase().trim(), cat.id])
  );

  const genreIds = normalizedGenres
    .map(g => genreMap.get(g))
    .filter((id): id is number => !!id);


  // ===============================
  //    BÚSQUEDA CORREGIDA DE ACTORES
  //     Devuelve: [{ name: string, id: number | null }]
  // ===============================

  const searchActorsByName = (names: string[]) => {
    if (!names.length) return of<{ name: string; id: number | null }[]>([]);

    const reqs = names.map(n =>
      this.http.get<{ results: any[] }>(`${this.baseUrl}/search/person`, {
        headers: this.defaultHeaders,
        params: new HttpParams().set('query', n)
      })
    );

    return forkJoin(reqs).pipe(
      map(responses =>
        responses.map((res, i) => {
          const originalName = names[i];
          const target = originalName.toLowerCase().trim();

          if (!res.results?.length) return { name: originalName, id: null };

          // exact
          const exact = res.results.find(p => p.name.toLowerCase() === target);
          if (exact) return { name: originalName, id: exact.id };

          // strong
          const strong = res.results.find(p =>
            p.name.toLowerCase().includes(target)
          );
          if (strong) return { name: originalName, id: strong.id };

          // popular fallback
          const sorted = [...res.results].sort(
            (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)
          );
          return { name: originalName, id: sorted[0]?.id ?? null };
        })
      )
    );
  };


  // ----- Discover por géneros -----
  const discoverByGenres = (ids: number[]) => {
    if (!ids.length) return of({ results: [], total_pages: 1 });

    const params = new HttpParams()
      .set('language', 'es-ES')
      .set('page', page)
      .set('with_genres', ids.join(','));

    return this.http.get<{ results: MovieDTO[]; total_pages: number }>(
      `${this.baseUrl}/discover/movie`,
      { headers: this.defaultHeaders, params }
    );
  };

  // ----- Discover por actores -----
  const discoverByActors = (actorIds: number[]) => {
    if (!actorIds.length) return of({ results: [], total_pages: 1 });

    const params = new HttpParams()
      .set('language', 'es-ES')
      .set('page', page)
      .set('with_people', actorIds.join(','));

    return this.http.get<{ results: MovieDTO[]; total_pages: number }>(
      `${this.baseUrl}/discover/movie`,
      { headers: this.defaultHeaders, params }
    );
  };

  // ----- Búsqueda por títulos cuando no encontramos actores -----
  const searchMovieTitles = (titles: string[]) => {
    if (!titles.length) return of<MovieDTO[]>([]);

    const reqs = titles.map(t =>
      this.http.get<{ results: MovieDTO[] }>(`${this.baseUrl}/search/movie`, {
        headers: this.defaultHeaders,
        params: new HttpParams()
          .set('language', 'es-ES')
          .set('query', t)
          .set('page', page)
      })
    );

    return forkJoin(reqs).pipe(map(arr => arr.flatMap(x => x.results)));
  };


  // ===============================
  //   ✔ LÓGICA PRINCIPAL
  // ===============================

  return searchActorsByName(normalizedActors).pipe(
    switchMap(actorSearchResults => {

      const actorIds = actorSearchResults
        .filter(r => r.id !== null)
        .map(r => r.id!) as number[];

      const missingActors = actorSearchResults
        .filter(r => r.id === null)
        .map(r => r.name);

      const byGenres$ = discoverByGenres(genreIds);
      const byActors$ = discoverByActors(actorIds);
      const byTitles$ = searchMovieTitles(missingActors);

      return forkJoin([byGenres$, byActors$, byTitles$]).pipe(
        map(([genreRes, actorRes, titleRes]) => {

          // union
          const combined = [
            ...genreRes.results,
            ...actorRes.results,
            ...titleRes
          ];

          // únicos
          const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());

          const total = Math.max(genreRes.total_pages, actorRes.total_pages);

          return { results: unique, total_pages: total };
        })
      );
    })
  );
}




}
