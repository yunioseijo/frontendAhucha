import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Restablecer contraseña</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <label>Email <input formControlName="email" type="email" /></label>
      <button type="submit" [disabled]="form.invalid || loading">Enviar enlace</button>
    </form>
    @if (ok) {
      <p style="color:green">Si el correo existe, se envió el enlace.</p>
    }
  `
})
export class ForgotPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  loading = false;
  ok = false;

  form = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]] });

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.requestPasswordReset(this.form.getRawValue()).subscribe({
      next: () => { this.ok = true; this.loading = false; },
      error: () => { this.ok = true; this.loading = false; }
    });
  }
}
