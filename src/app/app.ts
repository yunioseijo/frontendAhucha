import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
  styleUrl: './app.css',
})
export class App implements OnInit {
  title = 'ahucha';
  auth = inject(AuthService);
  theme = inject(ThemeService);

  ngOnInit(): void {
    if (this.auth.accessToken && !this.auth.user()) {
      this.auth.loadMe().subscribe({ error: () => this.auth.clearTokens() });
    }
  }
}
