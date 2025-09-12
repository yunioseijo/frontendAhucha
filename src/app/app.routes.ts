import { Routes } from '@angular/router';
import { notAuthenticatedGuard } from '@auth/guards/not-authenticated.guard';
import { isAdminGuard } from '@auth/guards/is-admin.guard';

export const routes: Routes = [
  // Public aliases so email links like /reset-password?token=... work
  { path: 'reset-password', redirectTo: 'auth/reset-password' },
  { path: 'password/reset', redirectTo: 'auth/reset-password' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes'),
    canMatch: [notAuthenticatedGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin-dashboard/admin-dashboard.routes'),
    canMatch: [
      // Require authentication first to avoid loading admin children while logged out
      () => import('@auth/guards/authenticated.guard').then(m => m.authenticatedGuard),
      isAdminGuard,
    ]
  },
  {
    path: '',
    loadChildren: () => import('./pages/pages.routes')
  }
];
