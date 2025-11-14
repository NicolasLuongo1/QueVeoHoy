import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/enviroment'; //

@Injectable({
  providedIn: 'root'
})
export class TmdbService {

  private baseUrl = environment.tmdbBaseUrl; //
  private apiKey = environment.tmdbApiKey; //
  private imgBaseUrl = 'https://image.tmdb.org/t/p/';

  constructor(private http: HttpClient) { }

   // Obtiene una página específica de películas populares.
  getPopularMovies(page: number = 1): Observable<any> { 
    const url = `${this.baseUrl}/movie/popular`;
    return this.http.get(url, {
      params: {
        api_key: this.apiKey,
        page: page.toString() 
      }
    });
  }

   // Ayuda para construir la URL completa del póster.
  getImageUrl(posterPath: string, size: string = 'w500'): string {
    return `${this.imgBaseUrl}${size}${posterPath}`;
  }
}