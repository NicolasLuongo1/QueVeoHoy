/**
 * Parámetros para la consulta discover/movie de TMDB
 */
export interface DiscoverMovieParams {
  /** Número de página (por defecto 1) */
  page?: number;
  /**
   * IDs de actores, separados por comas para AND, o por | para OR
   * Ejemplo: "123,456" (ambos actores) o "123|456" (cualquiera de los dos)
   */
  with_cast?: string;
  /**
   * IDs de géneros, separados por comas para AND, o por | para OR
   * Ejemplo: "28,35" (acción y comedia) o "28|35" (acción o comedia)
   */
  with_genres?: string;
  /**
   * Ordenar por: popularity.desc, popularity.asc, release_date.desc, etc.
   * Por defecto: popularity.desc
   */
  sort_by?: string;
}

/**
 * Respuesta de la API de TMDB para discover/movie
 */
export interface DiscoverMovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

/**
 * Modelo de película de TMDB
 */
export interface Movie {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}
