import { Routes } from '@angular/router';
import { authGuard } from '@auth/guards/auth.guard';

const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home.page').then(m => m.HomePage) },
  { path: 'account', canActivate: [authGuard], loadComponent: () => import('./account/account.page').then(m => m.AccountPage) },
  { path: '**', redirectTo: '' }
];

export default routes;
