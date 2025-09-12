// ...existing code...
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import {
  BreadcrumbsComponent,
  BreadcrumbItemDirective,
  BreadcrumbSeparatorDirective,
} from '@shared/components/breadcrumbs/breadcrumbs';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserMenuComponent } from '@core/layout/user-menu.component';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    BreadcrumbsComponent,
    BreadcrumbItemDirective,
    BreadcrumbSeparatorDirective,
    MatButtonModule,
    UserMenuComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-shell.component.html',
  styleUrls: ['./admin-shell.component.css'],
})
export class AdminShellComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sub?: Subscription;

  // breadcrumb signal (Angular best practice)
  breadcrumbs = signal<{ label: string; url: string }[]>([]);

  // Signal para el estado del sidebar (contraído)
  sidebarCollapsed = signal(window.innerWidth <= 900);

  ngOnInit() {
    window.addEventListener('resize', this.onResize);
    this.sub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.buildBreadcrumbs());
    // initial build
    this.buildBreadcrumbs();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
    this.sub?.unsubscribe();
  }

  onResize = () => {
    this.sidebarCollapsed.set(window.innerWidth <= 900);
  };

  logout() {
    this.auth.logoutAll().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login']),
    });
  }

  private buildBreadcrumbs() {
    const crumbs: { label: string; url: string }[] = [];
    let current = this.route.root;
    let url = '';
    let skippedAdmin = false;

    while (current.firstChild) {
      current = current.firstChild;
      const routeConfig = current.routeConfig;
      if (!routeConfig) continue;
      const segment = routeConfig.path ?? '';
      if (!segment) continue;

      // Skip the top-level 'admin' segment to avoid duplicating the static root link
      if (!skippedAdmin && segment === 'admin') {
        skippedAdmin = true;
        continue;
      }

      // Build URL (without the top-level 'admin')
      const segForUrl = segment.replace(
        ':id',
        current.snapshot.params['id'] ?? ':id'
      );
      url += '/' + segForUrl;

      // If we're on a detail route like 'users/:id', inject parent list crumb first
      if (/^users\/:/.test(segment)) {
        crumbs.push({ label: 'Usuarios', url: '/admin/users' });
      }

      const label =
        (routeConfig.data && routeConfig.data['breadcrumb']) ||
        this.titleCase(segment.replace(':id', 'Detalle'));
      // Ensure all crumb URLs are rooted under /admin
      const fullUrl = '/admin' + url.replace(/^\/+admin\/?/, '/');
      crumbs.push({ label, url: fullUrl });
    }
    this.breadcrumbs.set(crumbs);
  }

  private titleCase(s: string) {
    return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
