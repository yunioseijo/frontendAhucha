import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '@auth/services/auth.service';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { ThemeService } from '@core/layout/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, MatToolbar, MatButton, MatMenu, MatMenuItem, MatMenuTrigger, MatIcon],
  templateUrl: './app.html',
  styleUrl: './app.css'
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
