import { Component, signal } from '@angular/core';
import { AuthService } from '../auth-service';
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

  constructor(private authService: AuthService) {}

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
    const tokenResp: any = await firstValueFrom(this.authService.createRequestToken());
    const token = tokenResp.request_token;

    // 2️⃣ Validar login
    await firstValueFrom(
      this.authService.validateWithLogin(this.username(), this.password(), token)
    );

    // 3️⃣ Crear sesión
    const sessionId = await this.authService.createSession(token); // ✅ ya devuelve Promise<string>
    //console.log(`Sesión iniciada correctamente. Session ID: ${sessionId}`);
    console.log(`Sesión iniciada correctamente. Session ID: ${token}`);
    // window.location.href = '/home';

  } catch (error) {
    console.log('Credenciales inválidas o error en el proceso de login.', error);
  } finally {
    this.loading.set(false);
  }
}

  register() {
    window.open('https://www.themoviedb.org/signup', '_blank');
  }

}
