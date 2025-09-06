import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const isAdminGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = auth.roles();
  const ok = roles.includes('admin') || roles.includes('super-user');
  if (ok) return true;
  router.navigate(['/']);
  return false;
};
