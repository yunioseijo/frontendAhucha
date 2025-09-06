import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <h2>Registro</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <label>Nombre completo <input formControlName="fullName" /></label>
      <label>Email <input formControlName="email" type="email" /></label>
      <label>Contraseña <input formControlName="password" type="password" /></label>
      <button type="submit" [disabled]="form.invalid || loading">Crear cuenta</button>
    </form>
    <p>¿Ya tienes cuenta? <a routerLink="/auth/login">Inicia sesión</a></p>
    <p *ngIf="error" style="color:#c00">{{ error }}</p>
  `
})
export class RegisterPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';

  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.error = '';
    this.loading = true;
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => this.auth.loadMe().subscribe({ next: () => this.router.navigate(['/']) }),
      error: () => { this.error = 'No se pudo registrar'; this.loading = false; }
    });
  }
}
