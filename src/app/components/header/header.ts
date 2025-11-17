import { Component, EventEmitter, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../tmdb/auth-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  private auth = inject(AuthService);
  
  @Output() logoutEvent = new EventEmitter<void>();

  // 👇 señal expuesta correctamente al template
  readonly isLoggedIn = this.auth.isLoggedIn;

  logout() {
    this.auth.logout();
    this.logoutEvent.emit();
  }
}
