import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <h2>Iniciar sesión</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <label>Email <input formControlName="email" type="email" /></label>
      <label>Contraseña <input formControlName="password" type="password" /></label>
      <label>Código 2FA (opcional) <input formControlName="twoFactorCode" /></label>
      <button type="submit" [disabled]="form.invalid || loading">Entrar</button>
      <a routerLink="/auth/forgot-password">¿Olvidaste tu contraseña?</a>
    </form>
    <p *ngIf="error" style="color:#c00">{{ error }}</p>
  `
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';

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
