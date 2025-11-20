import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TmdbService } from './services/tmdb-service';
import { Header } from "./components/header/header";
import { AuthService } from './services/auth-service';
import { Footer } from "./components/footer/footer";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  
  onLogout() {
  this.auth.logout();
  this.router.navigate(['/']); 
}
}
