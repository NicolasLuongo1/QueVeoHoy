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
  filters: { genres: string[]; actors: string[] },
  page: number = 1
): Observable<{ results: MovieDTO[]; total_pages: number }> {

  const genreMap = new Map(
    this.categories().map(cat => [cat.name.toLowerCase().trim(), cat.id])
  );
  const genreIds: number[] = filters.genres
    .map(g => genreMap.get(g.toLowerCase().trim()))
    .filter((id): id is number => !!id);

  const normalizedActors: string[] = filters.actors.map(a => a.toLowerCase().trim());

  const actorRequests = normalizedActors.length
    ? normalizedActors.map(actor =>
        this.http.get<{ results: { id: number }[] }>(`${this.baseUrl}/search/person`, {
          headers: this.defaultHeaders,
          params: new HttpParams().set('query', actor)
        })
      )
    : [];

  return (actorRequests.length ? forkJoin(actorRequests) : of([])).pipe(
    switchMap(actorResponses => {
      const actorIds: number[] = actorResponses
        .map(res => res.results?.[0]?.id)
        .filter((id): id is number => !!id);

      const missingActors = normalizedActors.filter((_, i) => !actorIds[i]);

      // Determinar si ignoramos categorías
      const ignoreGenres = actorIds.length > 0 || missingActors.length > 0;

      let discover$: Observable<{ results: MovieDTO[]; total_pages: number }> = of({ results: [], total_pages: 1 });
      if (!ignoreGenres && genreIds.length > 0) {
        const discoverParams = new HttpParams()
          .set('language', 'es-ES')
          .set('page', page)
          .set('with_genres', genreIds.join(','));

        discover$ = this.http.get<{ results: MovieDTO[]; total_pages: number }>(
          `${this.baseUrl}/discover/movie`,
          { headers: this.defaultHeaders, params: discoverParams }
        );
      }

      let actorDiscover$: Observable<{ results: MovieDTO[]; total_pages: number }> = of({ results: [], total_pages: 1 });
      if (actorIds.length > 0) {
        const discoverParams = new HttpParams()
          .set('language', 'es-ES')
          .set('page', page)
          .set('with_people', actorIds.join(','));

        actorDiscover$ = this.http.get<{ results: MovieDTO[]; total_pages: number }>(
          `${this.baseUrl}/discover/movie`,
          { headers: this.defaultHeaders, params: discoverParams }
        ).pipe(
          switchMap(discoverRes => {
            const creditRequests = discoverRes.results.map(movie =>
              this.http.get<{ cast: { id: number }[] }>(`${this.baseUrl}/movie/${movie.id}/credits`, {
                headers: this.defaultHeaders
              }).pipe(
                map(credits => ({ movie, hasActor: credits.cast.some(c => actorIds.includes(c.id)) }))
              )
            );
            return forkJoin(creditRequests).pipe(
              map(results => ({
                results: results.filter(r => r.hasActor).map(r => r.movie),
                total_pages: discoverRes.total_pages
              }))
            );
          })
        );
      }

      let searchMovies$: Observable<MovieDTO[]> = of([]);
      if (missingActors.length) {
        const searchObservables = missingActors.map(name =>
          this.http.get<{ results: MovieDTO[] }>(`${this.baseUrl}/search/movie`, {
            headers: this.defaultHeaders,
            params: new HttpParams()
              .set('language', 'es-ES')
              .set('query', name)
              .set('page', page)
          })
        );

        searchMovies$ = forkJoin(searchObservables).pipe(
          map(results => results.flatMap(r => r.results))
        );
      }

      return forkJoin([discover$, actorDiscover$, searchMovies$]).pipe(
        map(([discoverRes, actorRes, searchRes]) => {
          const allMovies = [
            ...(discoverRes.results || []),
            ...(actorRes.results || []),
            ...(searchRes || [])
          ];
          const uniqueMovies = Array.from(new Map(allMovies.map(m => [m.id, m])).values());

          return {
            results: uniqueMovies,
            total_pages: Math.max(discoverRes.total_pages, actorRes.total_pages)
          };
        })
      );
    })
  );
}

}
