import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../tmdb/auth-service'; //
import { TmdbService } from '../../../services/tmdb.service';
import { CommonModule } from '@angular/common';
import { MovieCard } from '../../movie-card/movie-card/movie-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MovieCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {

  public loading = signal(true);
  public popularMovies = signal<any[]>([]);

  public currentPage = signal(1);
  public totalPages = signal(0);

  constructor(
    private authService: AuthService, 
    private router: Router,
    private tmdbService: TmdbService
  ) {}

  ngOnInit() {
    this.loadPopularMovies(); 
  }

   // Carga películas. Si 'isLoadMore' es true, añade las películas.
  loadPopularMovies(isLoadMore = false) {
    this.loading.set(true);
    const pageToLoad = this.currentPage();

    this.tmdbService.getPopularMovies(pageToLoad).subscribe({
      next: (response) => {
        
        // Actualiza la lista de películas
        if (isLoadMore) {
          // Añade las nuevas películas a la lista existente
          this.popularMovies.update(currentMovies => 
            [...currentMovies, ...response.results]
          );
        } else {
          // Reemplaza la lista (solo en la primera carga)
          this.popularMovies.set(response.results);
        }
        
        this.totalPages.set(response.total_pages);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar películas populares', err);
        this.loading.set(false);
      }
    });
  }

  //Nueva función para el botón "Cargar Más"
   
  loadMoreMovies() {
    // Incrementa el contador de página
    this.currentPage.update(page => page + 1);
    // Llama a cargar, especificando que es "load more"
    this.loadPopularMovies(true);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); 
  }
}