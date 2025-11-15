import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cast } from '../../../../models/detail/MovieCreditsDTO';

@Component({
  selector: 'app-movie-cast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-cast.html',
  styleUrl: './movie-cast.css',
})
export class MovieCast {
  cast = input.required<Cast[]>();
  getProfileUrl = input.required<(profilePath: string | null | undefined) => string>();
  
  scrollLeft = output<void>();
  scrollRight = output<void>();

  onScrollLeft(): void {
    this.scrollLeft.emit();
  }

  onScrollRight(): void {
    this.scrollRight.emit();
  }
}

