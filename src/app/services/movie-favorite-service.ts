import { inject, Injectable } from '@angular/core';
import { environment } from '../enviroments/enviroment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MovieFavoriteService {
  private readonly baseUrl = environment.tmdbBaseUrl;;
  private readonly client = inject(HttpClient);
  private readonly apiKey = environment.tmdbApiKey;
  markAsFavorite(movieId: number, favorite: boolean = true) {

    const sessionId = localStorage.getItem('session_id');
    const accountId = localStorage.getItem('account_id');

    const url = `${this.baseUrl}/account/` + accountId + `/favorite`;

    const params = new HttpParams()
      .set('session_id', sessionId || '')
      .set('api_key', this.apiKey);

    const body = {
      media_type: 'movie',
      media_id: movieId,
      favorite: favorite
    };

    return this.client.post(url, body, { params });
  }

  getFavoriteMovies(page: number = 1): Observable<any> {
    const sessionId = localStorage.getItem('session_id');
    const accountId = localStorage.getItem('account_id');

    if (!sessionId || !accountId) {
      return throwError(() => new Error('Usuario no loggeado.'));
    }
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('session_id', sessionId!)
      .set('language', 'es-ES')
      .set('sort_by', 'created_at.desc')
      .set('page', page.toString());

    return this.client.get(
      `${this.baseUrl}/account/${accountId}/favorite/movies`,
      { params }
    );
  }


}
