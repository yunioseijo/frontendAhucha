import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { ThemeService } from '@core/layout/theme.service';
import { UserMenuComponent } from '@core/layout/user-menu.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    UserMenuComponent,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  title = 'ahucha';
  auth = inject(AuthService);
  theme = inject(ThemeService);
  private router = inject(Router);
  isAdmin = false;

  ngOnInit(): void {
    if (this.auth.accessToken && !this.auth.user()) {
      this.auth.loadMe().subscribe({ error: () => this.auth.clearTokens() });
    }
    // Determine if current route is under /admin to toggle global navbar
    const update = () => (this.isAdmin = this.router.url.startsWith('/admin'));
    update();
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) update();
    });
  }
}
