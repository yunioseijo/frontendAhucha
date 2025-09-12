import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot.page.html',
  styleUrls: ['./forgot.page.css'],
})
export class ForgotPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  status: 'idle' | 'pending' | 'success' | 'error' = 'idle';
  message = '';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.status = 'pending';
    this.message = 'Enviando enlace...';
    this.auth.requestPasswordReset(this.form.getRawValue()).subscribe({
      next: () => {
        console.log('Password reset requested');
        this.loading = false;
        this.status = 'success';
        this.message =
          'Si el correo existe, enviamos un enlace para restablecer tu contraseña.';
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.loading = false;
        this.status = 'error';
        // Mensaje genérico para no exponer si existe o no el email, pero el usuario pidió feedback negativo
        this.message =
          e?.error?.message ||
          'No encontramos un usuario con ese correo o hubo un problema.';
        this.cdr.detectChanges();
      },
    });
  }
}
