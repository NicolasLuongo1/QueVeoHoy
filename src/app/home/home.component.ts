import { Component } from '@angular/core';
import { AuthService } from '../tmdb/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
<div>
  <h1>Bienvenido a QueVeoHoy?</h1>
  <p>Aquí irá el catálogo principal de películas (HU-3).</p>
  
  <button (click)="logout()">🚪 Cerrar Sesión</button>
  
  <hr>
  
  </div>
  `,
})
export class HomeComponent {

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); // O la ruta para el login
  }
}