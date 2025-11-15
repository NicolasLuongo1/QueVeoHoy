import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movie-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-banner.html',
  styleUrl: './movie-banner.css',
})
export class MovieBanner {
  backdropUrl = input.required<string>();
  title = input.required<string>();
  overview = input<string | undefined>(undefined);
}

