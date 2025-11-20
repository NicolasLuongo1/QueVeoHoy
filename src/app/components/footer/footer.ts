import { Component, EventEmitter, inject, Output } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
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
