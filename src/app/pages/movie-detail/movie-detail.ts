import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TMDBClient } from '../../services/tmbdClient';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieDetailDTO } from '../../models/detail/MovieDetailDTO';
import { MovieCreditsDTO, Cast } from '../../models/detail/MovieCreditsDTO';
import { MovieHeader } from '../_components/movie-header/movie-header';
import { MovieBanner } from '../_components/movie-banner/movie-banner';
import { MovieDescription } from '../_components/movie-description/movie-description';
import { MovieCast } from '../_components/movie-cast/movie-cast';
import { MovieReviews } from '../_components/movie-reviews/movie-reviews';
import { MovieInfoSidebar } from '../_components/movie-info-sidebar/movie-info-sidebar';

@Component({
  selector: 'app-movie-detail',
  imports: [
    CommonModule,
    MovieHeader,
    MovieBanner,
    MovieDescription,
    MovieCast,
    MovieReviews,
    MovieInfoSidebar
  ],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.css',
})
export class MovieDetail {
  protected readonly client = inject(TMDBClient)
  protected readonly route = inject(ActivatedRoute)
  protected readonly router = inject(Router)
  protected movie = signal<MovieDetailDTO | null>(null)
  protected credits = signal<MovieCreditsDTO | null>(null)

  constructor(){
    const id = this.route.snapshot.paramMap.get('id');
    if(id){
      const movieId = Number(id);
      
      this.client.getMovieDetail(movieId).subscribe({
        next:(resp)=>{
          this.movie.set(resp)
          console.log('Pelicula cargada', resp)
        },
        error:(erro)=>{          
          console.error('Fallo al cargar la pelicula', erro) 
          alert('Fallo al cargar la pelicula')
          this.router.navigate(['/home'])
        }
      })

      this.client.getMovieCredits(movieId).subscribe({
        next:(resp)=>{
          this.credits.set(resp)
          console.log('Creditos cargados', resp)
        },
        error:(erro)=>{          
          console.error('Fallo al cargar los creditos', erro) 
        }
      })
    }
  }

  // Helpers para obtener URLs de imágenes (delegan al servicio que ya maneja null)
  getBackdropUrl(backdropPath: string | null | undefined): string {
    return this.client.getBackdropUrl(backdropPath);
  }

  getPosterUrl(posterPath: string | null | undefined): string {
    return this.client.getImageUrl(posterPath, 'w500');
  }

  getProfileUrl(profilePath: string | null | undefined): string {
    return this.client.getProfileUrl(profilePath, 'w185');
  }

  getReleaseYear(): string {
    const movie = this.movie();
    if (!movie?.release_date) return '';
    const releaseDate = movie.release_date instanceof Date 
      ? movie.release_date 
      : new Date(movie.release_date);
    return releaseDate.getFullYear().toString();
  }

  getRating(): number {
    const movie = this.movie();
    if (!movie?.vote_average) return 0;
    return Math.round((movie.vote_average / 2) * 10) / 10;
  }

  // Obtener rating original (0-10) para mostrar
  getRatingValue(): number {
    const movie = this.movie();
    if (!movie?.vote_average) return 0;
    return Math.round(movie.vote_average * 10) / 10;
  }

  getDirector(): string {
    const credits = this.credits();
    if (!credits?.crew || !Array.isArray(credits.crew)) return '';
    const director = credits.crew.find((member: Cast) => member.job === 'Director');
    return director?.name || '';
  }

  getDirectorInfo(): { name: string; profilePath: string | null } | null {
    const credits = this.credits();
    if (!credits?.crew || !Array.isArray(credits.crew)) return null;
    const director = credits.crew.find((member: Cast) => member.job === 'Director');
    if (!director) return null;
    return {
      name: director.name,
      profilePath: director.profile_path
    };
  }

  getMusicComposer(): string {
    const credits = this.credits();
    if (!credits?.crew || !Array.isArray(credits.crew)) return '';
    const composer = credits.crew.find((member: Cast) => 
      member.job === 'Original Music Composer' || member.job === 'Music'
    );
    return composer?.name || '';
  }

  getMusicComposerInfo(): { name: string; profilePath: string | null } | null {
    const credits = this.credits();
    if (!credits?.crew || !Array.isArray(credits.crew)) return null;
    const composer = credits.crew.find((member: Cast) => 
      member.job === 'Original Music Composer' || member.job === 'Music'
    );
    if (!composer) return null;
    return {
      name: composer.name,
      profilePath: composer.profile_path
    };
  }

  getCast(): Cast[] {
    const credits = this.credits();
    if (!credits?.cast || !Array.isArray(credits.cast)) return [];
    return credits.cast.slice(0, 8);
  }

  getAllCast(): Cast[] {
    const credits = this.credits();
    if (!credits?.cast || !Array.isArray(credits.cast)) return [];
    return credits.cast;
  }

  scrollCast(direction: 'left' | 'right'): void {
    setTimeout(() => {
      const castContainer = document.querySelector('.cast-container');
      if (castContainer) {
        const scrollAmount = 300;
        const currentScroll = castContainer.scrollLeft;
        castContainer.scrollTo({
          left: currentScroll + (direction === 'right' ? scrollAmount : -scrollAmount),
          behavior: 'smooth'
        });
      }
    }, 0);
  }
}
