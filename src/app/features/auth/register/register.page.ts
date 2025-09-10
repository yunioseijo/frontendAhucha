import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import {
  MatCard,
  MatCardHeader,
  MatCardTitle,
  MatCardSubtitle,
  MatCardContent,
} from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-register',
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
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatButton,
    MatIcon,
  ],
  styles: [
    `
      :host {
        display: block;
      }
      .auth-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .auth-card {
        width: 100%;
        max-width: 480px;
      }
      .auth-form mat-form-field {
        width: 100%;
        display: block;
        margin-bottom: 12px;
      }
      .actions {
        margin-top: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .error {
        margin-top: 8px;
        color: #c62828;
      }
    `,
  ],
  template: `
    <div class="auth-wrapper">
      <mat-card appearance="outlined" class="auth-card">
        <mat-card-header>
          <mat-card-title>Crear cuenta</mat-card-title>
          <mat-card-subtitle>Regístrate para comenzar</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
            <mat-form-field appearance="outline">
              <mat-label>Nombre completo</mat-label>
              <input matInput formControlName="fullName" autocomplete="name" />
              @if (form.controls.fullName.hasError('required')) {
              <mat-error>El nombre es requerido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input
                matInput
                type="email"
                formControlName="email"
                autocomplete="email"
              />
              @if (form.controls.email.hasError('required')) {
              <mat-error>El email es requerido</mat-error>
              } @if (form.controls.email.hasError('email')) {
              <mat-error>Formato de email inválido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Contraseña</mat-label>
              <input
                matInput
                [type]="hide ? 'password' : 'text'"
                formControlName="password"
                autocomplete="new-password"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hide = !hide"
                [attr.aria-label]="
                  hide ? 'Mostrar contraseña' : 'Ocultar contraseña'
                "
              >
                <mat-icon>{{
                  hide ? 'visibility_off' : 'visibility'
                }}</mat-icon>
              </button>
              @if (form.controls.password.hasError('required')) {
              <mat-error>La contraseña es requerida</mat-error>
              } @if (form.controls.password.hasError('minlength')) {
              <mat-error>Mínimo 6 caracteres</mat-error>
              }
            </mat-form-field>

            <div class="actions">
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="form.invalid || loading"
              >
                <mat-icon>person_add</mat-icon>
                <span>Crear cuenta</span>
              </button>
              <a mat-button routerLink="/auth/login"
                >¿Ya tienes cuenta? Inicia sesión</a
              >
            </div>

            @if (error) {
            <div class="error">{{ error }}</div>
            }
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class RegisterPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';
  hide = true;

  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.error = '';
    this.loading = true;
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () =>
        this.auth
          .loadMe()
          .subscribe({ next: () => this.router.navigate(['/']) }),
      error: () => {
        this.error = 'No se pudo registrar';
        this.loading = false;
      },
    });
  }
}
