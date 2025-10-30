import { Component, signal } from '@angular/core';
import { TmdbService } from '../tmdb-service';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'tmdb-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tmdb-login.html',
  styleUrl: './tmdb-login.css',
})
export class TmdbLogin {
  username = signal('');
  password = signal('');
  message = signal('');
  loading = signal(false);

  constructor(private tmdbService: TmdbService) {}

  onUsernameChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.username.set(input.value);
  }

  onPasswordChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.password.set(input.value);
  }

 async login() {
  this.loading.set(true);
  this.message.set('');

  try {
    // 1️⃣ Crear token
    const tokenResp: any = await firstValueFrom(this.tmdbService.createRequestToken());
    const token = tokenResp.request_token;

    // 2️⃣ Validar login
    await firstValueFrom(
      this.tmdbService.validateWithLogin(this.username(), this.password(), token)
    );

    // 3️⃣ Crear sesión
    const sessionId = await this.tmdbService.createSession(token); // ✅ ya devuelve Promise<string>

    this.message.set(`✅ Sesión iniciada correctamente. Session ID: ${sessionId}`);
  } catch (error) {
    console.error(error);
    this.message.set('❌ Error en el inicio de sesión.');
  } finally {
    this.loading.set(false);
  }
}

}
