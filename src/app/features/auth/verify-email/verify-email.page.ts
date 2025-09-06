import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Verificar email</h2>
    <button (click)="send()">Enviar verificación</button>
    <hr />
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <label>Token <input formControlName="token" /></label>
      <button type="submit" [disabled]="form.invalid">Verificar</button>
    </form>
    <p *ngIf="ok" style="color:green">Email verificado.</p>
  `
})
export class VerifyEmailPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  ok = false;
  form = this.fb.nonNullable.group({ token: ['', [Validators.required]] });

  send() { this.auth.sendEmailVerification().subscribe(); }
  onSubmit() {
    if (this.form.invalid) return;
    this.auth.verifyEmail(this.form.getRawValue()).subscribe({ next: () => this.ok = true });
  }
}
