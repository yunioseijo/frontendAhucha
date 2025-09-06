import { Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', loadComponent: () => import('./login/login.page').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./register/register.page').then(m => m.RegisterPage) },
  { path: 'forgot-password', loadComponent: () => import('./forgot/forgot.page').then(m => m.ForgotPage) },
  { path: 'reset-password', loadComponent: () => import('./reset/reset.page').then(m => m.ResetPage) },
  { path: 'verify-email', loadComponent: () => import('./verify-email/verify-email.page').then(m => m.VerifyEmailPage) },
];

export default routes;

