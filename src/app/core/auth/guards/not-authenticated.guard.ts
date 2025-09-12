import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const notAuthenticatedGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // Permitir acceso a /auth cuando NO hay token o cuando aún no hay usuario resuelto.
  // Así evitamos bloquear el login por tokens inválidos en localStorage.
  if (!auth.accessToken || !auth.user()) return true;
  return router.parseUrl('/');
};
