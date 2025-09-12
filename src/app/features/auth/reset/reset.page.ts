import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset.page.html',
  styleUrls: ['./reset.page.css']
})
export class ResetPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = false;
  ok = false;

  form = this.fb.nonNullable.group(
    {
      token: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: (group) => {
        const p = group.get('newPassword')?.value ?? '';
        const c = group.get('confirmPassword')?.value ?? '';
        return p && c && p !== c ? { passwordMismatch: true } : null;
      },
    }
  );

  constructor() {
    const t = this.route.snapshot.queryParamMap.get('token');
    if (t) this.form.patchValue({ token: t });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    const payload = {
      token: this.form.controls.token.value,
      newPassword: this.form.controls.newPassword.value,
    } as const;
    this.auth.resetPassword(payload).subscribe({
      next: () => { this.ok = true; this.loading = false; setTimeout(() => this.router.navigate(['/auth/login']), 1000); },
      error: () => { this.loading = false; }
    });
  }
}
