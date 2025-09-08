import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Definir nueva contraseña</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <label>Token <input formControlName="token" /></label>
      <label>Nueva contraseña <input type="password" formControlName="newPassword" /></label>
      <button type="submit" [disabled]="form.invalid || loading">Guardar</button>
    </form>
    @if (ok) {
      <p style="color:green">Contraseña actualizada. Ya puedes iniciar sesión.</p>
    }
  `
})
export class ResetPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = false;
  ok = false;

  form = this.fb.nonNullable.group({
    token: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor() {
    const t = this.route.snapshot.queryParamMap.get('token');
    if (t) this.form.patchValue({ token: t });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.resetPassword(this.form.getRawValue()).subscribe({
      next: () => { this.ok = true; this.loading = false; setTimeout(() => this.router.navigate(['/auth/login']), 1000); },
      error: () => { this.loading = false; }
    });
  }
}
