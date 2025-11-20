import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TmdbService } from './services/tmdb-service';
import { Header } from "./components/header/header";
import { AuthService } from './tmdb/auth-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly tmdbClient = inject(TmdbService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.loadSampleMovies();
    this.loadCategories();
   }

  private loadSampleMovies(): void {
    this.tmdbClient.discoverMovies({
      page: 1,
      with_cast: '1100',
      with_genres: '28'
    }).subscribe({
      error: (error) => {
        console.error('Error al consultar TMDB:', error);
      }
    });
  }

  private loadCategories(){
    this.tmdbClient.getCategories().subscribe({
      error:(msj)=>{
        console.error('Fallo consultar las categorias', msj)
      }
    })
  }

  onLogout() {
  this.auth.logout();
  this.router.navigate(['/']); // o /login
}

  protected readonly title = signal('QueVeoHoy');
}
