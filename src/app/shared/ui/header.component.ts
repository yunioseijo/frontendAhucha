import { Component, inject } from '@angular/core';
import { ADMIN_ROLES } from '@shared/models/roles';

import { UserMenuComponent } from '@core/layout/user-menu.component';
import { AuthService } from '@auth/services/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [UserMenuComponent, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  auth = inject(AuthService);

  get showAdminLink(): boolean {
    const roles = this.auth?.roles();
    return (
      Array.isArray(roles) &&
      roles.some((r) => ADMIN_ROLES.includes(r as (typeof ADMIN_ROLES)[number]))
    );
  }
}
