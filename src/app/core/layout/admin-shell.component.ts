import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-shell">
      <aside class="sidebar">
        <div class="brand">Ahucha Admin</div>
        <nav>
          <a routerLink="/admin/users" routerLinkActive="active">Usuarios</a>
        </nav>
      </aside>
      <div class="main">
        <header class="topbar">
          <div class="title">
            <nav class="breadcrumbs">
              <a routerLink="/admin">Admin</a>
              <ng-container *ngFor="let bc of breadcrumbs(); let last = last">
                <span class="sep">/</span>
                <a *ngIf="!last" [routerLink]="bc.url">{{ bc.label }}</a>
                <span *ngIf="last">{{ bc.label }}</span>
              </ng-container>
            </nav>
          </div>
          <div class="spacer"></div>
          <div class="user" *ngIf="auth.user() as u">
            {{ u.fullName }} ({{ u.email }})
          </div>
          <button class="logout" (click)="logout()">Cerrar sesión</button>
        </header>
        <section class="content">
          <router-outlet />
        </section>
      </div>
    </div>
  `,
  styles: [
    `
    .admin-shell { display: grid; grid-template-columns: 220px 1fr; height: 100vh; }
    .sidebar { background:#0f172a; color:#e2e8f0; padding: 16px; display: flex; flex-direction: column; gap: 16px; }
    .brand { font-weight: 700; font-size: 18px; }
    .sidebar nav { display:flex; flex-direction: column; gap: 8px; }
    .sidebar a { color:#cbd5e1; text-decoration:none; padding:6px 8px; border-radius:6px; }
    .sidebar a.active, .sidebar a:hover { background:#1e293b; color:#fff; }
    .main { display:flex; flex-direction: column; min-width: 0; }
    .topbar { height: 56px; display:flex; align-items:center; padding: 0 16px; border-bottom: 1px solid #e5e7eb; gap: 12px; }
    .topbar .title { font-weight: 600; }
    .topbar .spacer { flex: 1; }
    .content { padding: 16px; overflow: auto; height: calc(100vh - 56px); }
    .breadcrumbs { display:flex; align-items:center; gap:6px; font-weight:500; }
    .breadcrumbs a { color:#111827; text-decoration:none; }
    .breadcrumbs .sep { color:#9ca3af; }
    .logout { margin-left: 12px; border: 1px solid #e5e7eb; background: white; padding: 6px 10px; border-radius: 6px; cursor: pointer; }
    .logout:hover { background: #f9fafb; }
    `
  ]
})
export class AdminShellComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sub?: Subscription;

  // breadcrumb signal
  breadcrumbs = signal<{ label: string; url: string }[]>([]);

  ngOnInit() {
    this.sub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.buildBreadcrumbs());
    // initial build
    this.buildBreadcrumbs();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  logout() {
    this.auth.logoutAll().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login'])
    });
  }

  private buildBreadcrumbs() {
    const crumbs: { label: string; url: string }[] = [];
    let current = this.route.root;
    let url = '';

    while (current.firstChild) {
      current = current.firstChild;
      const routeConfig = current.routeConfig;
      if (!routeConfig) continue;
      const segment = routeConfig.path ?? '';
      if (!segment) continue;
      // accumulate
      url += '/' + segment.replace(':id', (current.snapshot.params['id'] ?? ':id'));
      const label = (routeConfig.data && routeConfig.data['breadcrumb']) || this.titleCase(segment.replace(':id', 'Detalle'));
      crumbs.push({ label, url: '/admin' + url.replace(/^\/+admin\/?/, '/') });
    }
    this.breadcrumbs.set(crumbs);
  }

  private titleCase(s: string) {
    return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
