import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '@shared/api/users.service';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <h2>Mi cuenta</h2>
    <div *ngIf="auth.user() as u; else loadingTpl">
      <h3>Perfil</h3>
      <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
        <label>Nombre completo <input formControlName="fullName" /></label>
        <label>Usuario <input formControlName="username" /></label>
        <label>Avatar URL <input formControlName="avatarUrl" /></label>
        <label>Teléfono <input formControlName="phone" /></label>
        <label>Bio <input formControlName="bio" /></label>
        <label>País <input formControlName="countryCode" /></label>
        <label>Locale <input formControlName="locale" /></label>
        <label>Zona horaria <input formControlName="timezone" /></label>
        <button type="submit">Guardar</button>
      </form>

      <h3>Cambiar contraseña</h3>
      <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
        <label>Actual <input type="password" formControlName="currentPassword" /></label>
        <label>Nueva <input type="password" formControlName="newPassword" /></label>
        <button type="submit">Actualizar</button>
      </form>

      <h3>2FA</h3>
      <button (click)="setup2FA()">Configurar</button>
      <div>
        <input placeholder="Código" [(ngModel)]="twoFactorCode" />
        <button (click)="enable2FA()">Activar</button>
        <button (click)="disable2FA()">Desactivar</button>
      </div>

      <h3>Sesión</h3>
      <button (click)="logoutCurrent()">Cerrar sesión</button>
      <button (click)="logoutAll()">Cerrar todas</button>
    </div>
    <ng-template #loadingTpl> Cargando... </ng-template>
  `
})
export class AccountPage implements OnInit {
  private fb = inject(FormBuilder);
  protected users = inject(UsersService);
  protected auth = inject(AuthService);

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
