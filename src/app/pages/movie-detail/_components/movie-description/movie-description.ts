import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Video } from '../../../../models/detail/MovieVideosDTO';
import { WatchProvider } from '../../../../models/detail/MovieWatchProvidersDTO';

@Component({
  selector: 'app-movie-description',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-description.html',
  styleUrl: './movie-description.css',
})
export class MovieDescription {
  trailer = input<Video | null>(null);
  streamingPlatforms = input<WatchProvider[]>([]);
  getProviderLogoUrl = input.required<(logoPath: string) => string>();
  
  trailerClick = output<void>();
  
  onTrailerClick(): void {
    this.trailerClick.emit();
  }
}

