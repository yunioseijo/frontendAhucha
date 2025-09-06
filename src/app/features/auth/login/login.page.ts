import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatCardActions,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatButton,
    MatIcon,
  ],
  styles: [`
    :host { display: block; }
    .auth-wrapper {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .auth-card { width: 100%; max-width: 420px; }
    .auth-form mat-form-field { width: 100%; display: block; margin-bottom: 12px; }
    .actions { margin-top: 8px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .error { margin-top: 8px; color: #c62828; }
  `],
  template: `
    <div class="auth-wrapper">
      <mat-card appearance="outlined" class="auth-card">
        <mat-card-header>
          <mat-card-title>Iniciar sesión</mat-card-title>
          <mat-card-subtitle>Accede a tu cuenta</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="username" />
              <mat-error *ngIf="form.controls.email.hasError('required')">El email es requerido</mat-error>
              <mat-error *ngIf="form.controls.email.hasError('email')">Formato de email inválido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Contraseña</mat-label>
              <input matInput [type]="hide ? 'password' : 'text'" formControlName="password" autocomplete="current-password" />
              <button mat-icon-button matSuffix type="button" (click)="hide = !hide" [attr.aria-label]="hide ? 'Mostrar contraseña' : 'Ocultar contraseña'">
                <mat-icon>{{ hide ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="form.controls.password.hasError('required')">La contraseña es requerida</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Código 2FA (opcional)</mat-label>
              <input matInput formControlName="twoFactorCode" autocomplete="one-time-code" />
            </mat-form-field>

            <div class="actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading">
                <mat-icon>login</mat-icon>
                <span>Entrar</span>
              </button>
              <a mat-button routerLink="/auth/forgot-password">¿Olvidaste tu contraseña?</a>
            </div>

            <div class="error" *ngIf="error">{{ error }}</div>
          </form>
        </mat-card-content>
        <mat-card-actions align="end">
          <span>¿No tienes cuenta?</span>
          <a mat-stroked-button color="primary" routerLink="/auth/register">Crear cuenta</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';
  hide = true;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    twoFactorCode: ['']
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.error = '';
    this.loading = true;
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.auth.loadMe().subscribe({ next: () => this.router.navigate(['/']) }),
      error: (e) => { this.error = 'Credenciales inválidas o 2FA requerido'; this.loading = false; }
    });
  }
}
