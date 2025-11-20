import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../tmdb/auth-service';

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

 
  if (authService.isLoggedIn()) {
    console.warn('Usuario ya autenticado. Redirigiendo a /home...');
    router.navigate(['/home']);
    return false;
  }

  return true;
};