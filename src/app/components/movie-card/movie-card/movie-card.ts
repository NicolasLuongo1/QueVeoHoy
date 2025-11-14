import { Component, Input } from '@angular/core';
import { TmdbService } from '../../../services/tmdb.service';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, DecimalPipe], 
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.css'
})
export class MovieCard {
  
  // Recibe la película como un Input
  @Input() movie: any; 

  constructor(private tmdbService: TmdbService) {}

  // Obtiene la URL completa del póster usando el servicio.
  getPosterUrl(posterPath: string): string {
    return this.tmdbService.getImageUrl(posterPath);
  }
  
  
  // Formatea la puntuación para que sea de un solo decimal.
  getRating(rating: number): number {
    return Math.round(rating * 10) / 10;
  }
}