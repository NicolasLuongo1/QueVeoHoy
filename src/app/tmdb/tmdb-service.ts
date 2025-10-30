import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../enviroments/enviroment';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private baseUrl = environment.tmdbBaseUrl;
  private apiKey = environment.tmdbApiKey;
  private readonly SESSION_KEY = 'tmdb_session_id'; // 🔑 clave para localStorage

  constructor(private http: HttpClient) {}

  // Guardar session_id en localStorage
  private saveSessionId(sessionId: string) {
    localStorage.setItem(this.SESSION_KEY, sessionId);
  }

  // Obtener session_id de localStorage
  getSessionId(): string | null {
    return localStorage.getItem(this.SESSION_KEY);
  }

  // Logout: eliminar session_id
  logout() {
    localStorage.removeItem(this.SESSION_KEY);
  }

  // Paso 1: Crear request token
  createRequestToken() {
    const url = `${this.baseUrl}/authentication/token/new?api_key=${this.apiKey}`;
    return this.http.get(url);
  }

  // Paso 2: Validar el token con las credenciales del usuario
  validateWithLogin(username: string, password: string, requestToken: string) {
    const url = `${this.baseUrl}/authentication/token/validate_with_login?api_key=${this.apiKey}`;
    return this.http.post(url, { username, password, request_token: requestToken });
  }

  // Paso 3: Crear sesión si el token fue validado
  async createSession(requestToken: string): Promise<string> {
    const url = `${this.baseUrl}/authentication/session/new?api_key=${this.apiKey}`;
    const sessionResp: any = await firstValueFrom(this.http.post(url, { request_token: requestToken }));
    const sessionId = sessionResp.session_id;
    this.saveSessionId(sessionId); // 🔑 guardamos la sesión
    return sessionId;
  }

  // (Opcional) Obtener datos del usuario logueado
  getAccountDetails(sessionId: string) {
    const url = `${this.baseUrl}/account?api_key=${this.apiKey}&session_id=${sessionId}`;
    return this.http.get(url);
  }
}
