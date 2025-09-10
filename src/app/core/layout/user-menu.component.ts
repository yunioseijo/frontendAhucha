import { Component, ChangeDetectionStrategy, HostListener, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [
    RouterLink,
  ],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenuComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  open = false;

  toggle() { this.open = !this.open; }
  close() { this.open = false; }

  logout() {
    this.auth.logoutAll().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login']),
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent) {
    const target = ev.target as HTMLElement | null;
    if (!target) return;
    if (!target.closest('.usermenu')) this.close();
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.close(); }

}
