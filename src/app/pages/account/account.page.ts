import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '@shared/api/users.service';
import { AuthService } from '@auth/services/auth.service';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatCardActions,
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatInput,
    MatButton,
    MatIcon,
    MatDivider,
  ],
  templateUrl: './account.page.html',
  styleUrl: './account.page.css'
})
export class AccountPage implements OnInit {
  private fb = inject(FormBuilder);
  users = inject(UsersService);
  auth = inject(AuthService);

  twoFactorCode = '';

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
    if (!this.auth.user()) {
      this.auth.loadMe().subscribe((u) => this.profileForm.patchValue({
        fullName: u.fullName ?? '',
        username: u.username ?? '',
        avatarUrl: u.avatarUrl ?? '',
        phone: u.phone ?? '',
        bio: u.bio ?? '',
        countryCode: u.countryCode ?? '',
        locale: u.locale ?? '',
        timezone: u.timezone ?? ''
      }));
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
  setup2FA() { this.auth.setup2FA().subscribe(); }
  enable2FA() { this.auth.enable2FA({ code: this.twoFactorCode }).subscribe(); }
  disable2FA() { this.auth.disable2FA({ code: this.twoFactorCode }).subscribe(); }
  logoutCurrent() { this.auth.logoutCurrent().subscribe(); }
  logoutAll() { this.auth.logoutAll().subscribe(); }
}
