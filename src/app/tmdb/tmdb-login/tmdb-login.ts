import { Component, signal } from '@angular/core';
import { AuthService } from '../auth-service';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router'; // ✅ Importar Router

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

  // ✅ Inyectar Router
  constructor(private authService: AuthService, private router: Router) {}

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
      // Crear token
      const tokenResp: any = await firstValueFrom(this.authService.createRequestToken());
      const token = tokenResp.request_token;

      // Validar login
      await firstValueFrom(
        this.authService.validateWithLogin(this.username(), this.password(), token)
      );

      //  Crear sesión y obtener datos
      //  createSession para devolver el accountId y el sessionId 
      await this.authService.createSession(token);
      
      this.message.set('¡Login exitoso! Redirigiendo...');

      this.router.navigate(['/home']);

    } catch (error) {
      this.message.set('Credenciales inválidas o error en el proceso.');
      console.error('Error en el proceso de login.', error); 
    } finally {
      this.loading.set(false);
    }
  }

  register() {
    window.open('https://www.themoviedb.org/signup', '_blank');
  }
}