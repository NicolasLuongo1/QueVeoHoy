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

  readonly isLoggedIn = this.auth.isLoggedIn;



}
