import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatButton } from '@angular/material/button';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [NgIf, RouterLink, MatMenu, MatMenuItem, MatMenuTrigger, MatIcon, MatDivider, MatButton],
  templateUrl: './user-menu.component.html'
})
export class UserMenuComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.auth.logoutAll().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login'])
    });
  }
}

