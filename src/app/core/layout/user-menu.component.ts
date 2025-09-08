import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [
    RouterLink,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatIcon,
    MatDivider,
  ],
  templateUrl: './user-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenuComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.auth.logoutAll().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login']),
    });
  }
}
