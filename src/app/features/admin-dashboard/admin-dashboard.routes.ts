import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@core/layout/admin-shell.component').then(m => m.AdminShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'users' },
      { path: 'users', loadComponent: () => import('../users/users.page').then(m => m.UsersPage), data: { breadcrumb: 'Usuarios' } },
      { path: 'users/trash', loadComponent: () => import('../users/users-trash.page').then(m => m.UsersTrashPage), data: { breadcrumb: 'Papelera' } },
      { path: 'users/:id', loadComponent: () => import('../users/user-detail.page').then(m => m.UserDetailPage), data: { breadcrumb: 'Detalle' } },
    ]
  }
];

export default routes;
