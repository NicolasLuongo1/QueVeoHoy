import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  private auth = inject(AuthService);
  private router = inject(Router);
  
  @Output() logoutEvent = new EventEmitter<void>();

  // 👇 señal expuesta correctamente al template
  readonly isLoggedIn = this.auth.isLoggedIn;


goHome() {
  this.router.navigate(['/home']);
}

  logout() {
    this.auth.logout();
    this.logoutEvent.emit();
  }
}
