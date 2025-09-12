import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '@shared/api/users.service';
import { AuthService } from '@auth/services/auth.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TwoFactorSetupComponent } from '@features/auth/two-factor-setup/two-factor-setup.component';
import { LoadingIndicatorComponent } from '@shared/ui/loading-indicator.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TwoFactorSetupComponent,
    LoadingIndicatorComponent,
  ],
  templateUrl: './account.page.html',
  styleUrl: './account.page.css'
})
export class AccountPage implements OnInit {
  private fb = inject(FormBuilder);
  users = inject(UsersService);
  auth = inject(AuthService);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);

  readonly defaultAvatar: SafeUrl = this.sanitizer.bypassSecurityTrustUrl(
    'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="#9ca3af">A</text></svg>`
      )
  );


  profileForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    username: [''],
    avatarUrl: [''],
    phone: [''],
    bio: [''],
    countryCode: [''],
    locale: [''],
    timezone: ['']
  });

  passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit() {
    // If there is no token at all, leave immediately
    if (!this.auth.accessToken) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.auth.user()) {
      this.auth.loadMe().subscribe({
        next: (u) => this.profileForm.patchValue({
          fullName: u.fullName ?? '',
          username: u.username ?? '',
          avatarUrl: u.avatarUrl ?? '',
          phone: u.phone ?? '',
          bio: u.bio ?? '',
          countryCode: u.countryCode ?? '',
          locale: u.locale ?? '',
          timezone: u.timezone ?? ''
        }),
        error: () => {
          // If we cannot load the current user (e.g., deleted account), log out and redirect
          this.auth.clearTokens();
          this.router.navigate(['/auth/login']);
        }
      });
    } else {
      const u = this.auth.user()!;
      this.profileForm.patchValue({
        fullName: u.fullName ?? '',
        username: u.username ?? '',
        avatarUrl: u.avatarUrl ?? '',
        phone: u.phone ?? '',
        bio: u.bio ?? '',
        countryCode: u.countryCode ?? '',
        locale: u.locale ?? '',
        timezone: u.timezone ?? ''
      });
    }
  }

  saveProfile() { this.users.updateMe(this.profileForm.getRawValue()).subscribe((u) => this.auth.loadMe().subscribe()); }
  changePassword() { this.users.changeMyPassword(this.passwordForm.getRawValue()).subscribe(); }
  logoutCurrent() {
    this.auth.logoutCurrent().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login'])
    });
  }
  logoutAll() {
    this.auth.logoutAll().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login'])
    });
  }
}
