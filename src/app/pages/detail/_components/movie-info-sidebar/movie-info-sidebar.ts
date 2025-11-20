import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieDetailDTO } from '../../../../models/detail/MovieDetailDTO';

@Component({
  selector: 'app-movie-info-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-info-sidebar.html',
  styleUrl: './movie-info-sidebar.css',
})
export class MovieInfoSidebar {
  movie = input.required<MovieDetailDTO | null>();
  releaseYear = input.required<string>();
  rating = input.required<number>();
  director = input<string | undefined>(undefined);
  musicComposer = input<string | undefined>(undefined);
}

