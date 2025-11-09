import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  DiscoverMovieParams,
  DiscoverMovieResponse,
} from '../models/movie';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlMjA4MGVhN2VlODk0NmM5MGUyOGIyOTBkNzlkM2ZiZiIsIm5iZiI6MTYyNjM3NjI0Mi42NDksInN1YiI6IjYwZjA4ODMyNzQ2NDU3MDA0NjVmN2FiZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.A3fJ583trdgwhIXOVRc2ACT9K5mmy6Vk_86ZB9qs5Po';

@Injectable({
  providedIn: 'root'
})
export class TMDBClient {
  private readonly baseUrl: string;
  private readonly accessToken: string;
  private readonly defaultHeaders: HttpHeaders;

  constructor(private readonly http: HttpClient) {
    
    this.baseUrl =  TMDB_BASE_URL
    this.accessToken = TMDB_ACCESS_TOKEN
    this.defaultHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`
    });
  }

  // TODO: DENTRO DE ESTA CLASE IMPLEMENTAR SERVICIOS RELACIONADOS A LOS CRUD DE TMDB

  discoverMovies(params: DiscoverMovieParams = {}): Observable<DiscoverMovieResponse> {
    let httpParams = new HttpParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && `${value}`.length > 0) {
        httpParams = httpParams.set(key, `${value}`);
      }
    }
    
    const endpoint = `${this.baseUrl}/discover/movie`;
    return this.http.get<DiscoverMovieResponse>(endpoint, {
      headers: this.defaultHeaders,
      params: httpParams
    });
  }


}