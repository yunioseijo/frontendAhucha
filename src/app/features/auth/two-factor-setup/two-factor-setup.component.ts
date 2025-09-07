import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@auth/services/auth.service';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { finalize, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-two-factor-setup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
  styleUrls: ['./two-factor-setup.component.css'],
  templateUrl: './two-factor-setup.component.html'
})
export class TwoFactorSetupComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  loadingSetup = false;
  loadingEnable = false;
  error = '';
  ok = false;

  secret = '';
  otpauth = '';

  form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(8)]]
  });

  get qrUrl(): string {
    return this.otpauth
      ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.otpauth)}`
      : '';
  }

  setup() {
    this.error = '';
    this.ok = false;
    this.loadingSetup = true;
    this.auth
      .setup2FA()
      .pipe(timeout(15000), finalize(() => { this.loadingSetup = false; this.cdr.detectChanges(); }))
      .subscribe({
      next: (res: any) => {
        this.secret = res?.secret ?? '';
        this.otpauth = res?.otpauth ?? '';
      },
      error: (e: any) => {
        const msg = (e?.error && (e.error.message || e.error.error)) || e?.message;
        this.error = msg || 'No se pudo generar el código 2FA';
      }
    });
  }

  enable() {
    if (this.form.invalid) return;
    this.error = '';
    this.ok = false;
    this.loadingEnable = true;
    const raw = this.form.controls.code.value ?? '';
    const code = String(raw).replace(/\D+/g, '').trim();
    this.auth
      .enable2FA({ code })
      .pipe(finalize(() => { this.loadingEnable = false; this.cdr.detectChanges(); }))
      .subscribe({
      next: () => {
        this.ok = true;
      },
      error: (e: any) => {
        const msg = (e?.error && (e.error.message || e.error.error)) || e?.message;
        this.error = msg || 'Código inválido o expirado';
      }
    });
  }
}
