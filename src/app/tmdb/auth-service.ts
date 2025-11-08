import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../enviroments/enviroment';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.tmdbBaseUrl;
  private apiKey = environment.tmdbApiKey;
  
  // Claves para localStorage
  private readonly SESSION_KEY = 'tmdb_session_id';
  private readonly ACCOUNT_KEY = 'tmdb_account_id'; 

  constructor(private http: HttpClient) {}

  // Guardamos el "session_id" en localStorage
  private saveSessionId(sessionId: string) {
    localStorage.setItem(this.SESSION_KEY, sessionId);
  }

  // Guardamos el "account_id" en localStorage
  private saveAccountId(accountId: string) {
    localStorage.setItem(this.ACCOUNT_KEY, accountId);
  }

  // Obtenemos el "session_id" de localStorage
  getSessionId(): string | null {
    return localStorage.getItem(this.SESSION_KEY);
  }

  // Obtenemos el "account_id" de localStorage
  getAccountId(): string | null {
    return localStorage.getItem(this.ACCOUNT_KEY);
  }

  // Logout para eliminar datos del localStorage
  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.ACCOUNT_KEY); 
  }

  // Creaamos el request token
  createRequestToken() {
    const url = `${this.baseUrl}/authentication/token/new?api_key=${this.apiKey}`;
    return this.http.get(url);
  }

  // Validar el token con las credenciales del usuario
  validateWithLogin(username: string, password: string, requestToken: string) {
    const url = `${this.baseUrl}/authentication/token/validate_with_login?api_key=${this.apiKey}`;
    return this.http.post(url, { username, password, request_token: requestToken });
  }

  // Modificado para crear sesión, obtener Account ID y guardar todo
  async createSession(requestToken: string): Promise<{ sessionId: string; accountId: number }> {
    const sessionUrl = `${this.baseUrl}/authentication/session/new?api_key=${this.apiKey}`;
    const sessionResp: any = await firstValueFrom(this.http.post(sessionUrl, { request_token: requestToken }));
    const sessionId = sessionResp.session_id;

    if (!sessionId) {
      throw new Error('No se pudo crear la sesión');
    }

    const accountResp: any = await firstValueFrom(this.getAccountDetails(sessionId));
    const accountId = accountResp.id;

    if (!accountId) {
      throw new Error('No se pudo obtener el ID de la cuenta');
    }

    this.saveSessionId(sessionId);
    this.saveAccountId(accountId.toString()); // Guardamos el ID de la cuenta

    return { sessionId, accountId };
  }

  getAccountDetails(sessionId: string) {
    const url = `${this.baseUrl}/account?api_key=${this.apiKey}&session_id=${sessionId}`;
    return this.http.get(url);
  }
  
}