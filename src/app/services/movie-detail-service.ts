import { inject, Injectable } from '@angular/core';
import { environment } from '../enviroments/enviroment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MovieDetailDTO } from '../models/detail/MovieDetailDTO';
import { Observable } from 'rxjs';
import { MovieCreditsDTO } from '../models/detail/MovieCreditsDTO';
import { MovieVideosDTO } from '../models/detail/MovieVideosDTO';
import { MovieWatchProvidersDTO } from '../models/detail/MovieWatchProvidersDTO';

@Injectable({
  providedIn: 'root',
})
export class MovieDetailService {
  private readonly baseUrl = environment.tmdbBaseUrl;
  private readonly client = inject(HttpClient);
  private readonly accessToken = environment.tmdbAccessToken;
  private readonly imgBaseUrl = 'https://image.tmdb.org/t/p/';

  private readonly defaultHeaders = new HttpHeaders({
    Authorization: `Bearer ${this.accessToken}`
  });

  getMovieDetail(movieId: number): Observable<MovieDetailDTO> {
    return this.client.get<MovieDetailDTO>(`${this.baseUrl}/movie/${movieId}`, {
      headers: this.defaultHeaders
    });
  }

  getMovieCredits(movieId: number): Observable<MovieCreditsDTO> {
    return this.client.get<MovieCreditsDTO>(`${this.baseUrl}/movie/${movieId}/credits`, {
      headers: this.defaultHeaders
    });
  }

  getMovieVideos(movieId: number): Observable<MovieVideosDTO> {
    return this.client.get<MovieVideosDTO>(`${this.baseUrl}/movie/${movieId}/videos`, {
      headers: this.defaultHeaders
    });
  }

  getMovieWatchProviders(movieId: number): Observable<MovieWatchProvidersDTO> {
    return this.client.get<MovieWatchProvidersDTO>(`${this.baseUrl}/movie/${movieId}/watch/providers`, {
      headers: this.defaultHeaders
    });
  }

 
  getImageUrl(posterPath: string | null | undefined, size: string = 'w500'): string {
    if (!posterPath) return 'assets/no-image.png';
    return `${this.imgBaseUrl}${size}${posterPath}`;
  }

  getBackdropUrl(backdropPath: string | null | undefined, size: string = 'w1280'): string {
    if (!backdropPath) return '/no-image.png';
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
}
