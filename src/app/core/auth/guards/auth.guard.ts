import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable, catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (): boolean | UrlTree | Observable<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // No token → a login
  if (!auth.accessToken) return router.parseUrl('/auth/login');

  // Already have user loaded
  if (auth.user()) return true;

  // Try to load the current user; if it fails, clear tokens and redirect
  return auth.loadMe().pipe(
    map(() => true),
    catchError(() => {
      auth.clearTokens();
      return of(router.parseUrl('/auth/login'));
    })
  );
};
