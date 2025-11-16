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

searchMoviesWithFilters(
  filters: { genres: string[]; actors: string[] },
  page: number = 1
): Observable<{ results: Movie[]; total_pages: number }> {
  console.log("🔍 Filtros recibidos desde Gemini:", filters);

  const genreMap = new Map(
    this.categories().map(cat => [cat.name.toLowerCase().trim(), cat.id])
  );
  const genreIds: number[] = filters.genres
    .map(g => genreMap.get(g.toLowerCase().trim()))
    .filter((id): id is number => !!id);
  console.log("🎯 IDs de géneros detectados:", genreIds);

  const normalizedActors: string[] = filters.actors.map(a => a.toLowerCase().trim());
  console.log("🧑‍🎤 Actores/personajes normalizados:", normalizedActors);

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
      console.log("🧑‍🎤 IDs de actores encontrados:", actorIds);
      console.log("🎭 Personajes sin actorId:", missingActors);

      // Determinar si ignoramos categorías
      const ignoreGenres = actorIds.length > 0 || missingActors.length > 0;

      // 1️⃣ Discover solo si NO hay actores/personajes
      let discover$: Observable<{ results: Movie[]; total_pages: number }> = of({ results: [], total_pages: 1 });
      if (!ignoreGenres && genreIds.length > 0) {
        const discoverParams = new HttpParams()
          .set('language', 'es-ES')
          .set('page', page)
          .set('with_genres', genreIds.join(','));

        discover$ = this.http.get<{ results: Movie[]; total_pages: number }>(
          `${this.baseUrl}/discover/movie`,
          { headers: this.defaultHeaders, params: discoverParams }
        );
      }

      // 2️⃣ Buscar actorIds en discover y filtrar por credits
      let actorDiscover$: Observable<{ results: Movie[]; total_pages: number }> = of({ results: [], total_pages: 1 });
      if (actorIds.length > 0) {
        const discoverParams = new HttpParams()
          .set('language', 'es-ES')
          .set('page', page)
          .set('with_people', actorIds.join(','));

        actorDiscover$ = this.http.get<{ results: Movie[]; total_pages: number }>(
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

      // 3️⃣ Búsqueda por personajes sin actorId
      let searchMovies$: Observable<Movie[]> = of([]);
      if (missingActors.length) {
        const searchObservables = missingActors.map(name =>
          this.http.get<{ results: Movie[] }>(`${this.baseUrl}/search/movie`, {
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

      // 4️⃣ Combinar resultados
      return forkJoin([discover$, actorDiscover$, searchMovies$]).pipe(
        map(([discoverRes, actorRes, searchRes]) => {
          const allMovies = [
            ...(discoverRes.results || []),
            ...(actorRes.results || []),
            ...(searchRes || [])
          ];
          const uniqueMovies = Array.from(new Map(allMovies.map(m => [m.id, m])).values());
          console.log("🎬 Resultado final filtrado:", uniqueMovies);

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
