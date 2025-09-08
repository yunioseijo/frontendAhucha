import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UsersService } from '@shared/api/users.service';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatCardActions,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatCheckbox,
  ],
  styles: [`
    :host { display: block; }
    .grid { display: grid; gap: 12px; grid-template-columns: 1fr; }
    @media (min-width: 900px) { .grid { grid-template-columns: 1fr 1fr; } }
    mat-form-field { width: 100%; }
    .row { display: grid; grid-template-columns: 1fr; gap: 12px; }
    @media (min-width: 900px) { .row { grid-template-columns: 1fr 1fr; } }
    .actions { display:flex; gap: 8px; }
  `],
  template: `
    <ng-container *ngIf="form; else loadingTpl">
      <mat-card appearance="outlined" style="margin-bottom:12px;">
        <mat-card-header>
          <mat-card-title>Usuario</mat-card-title>
          <mat-card-subtitle>Editar datos básicos</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="save()" class="grid">
            <mat-form-field appearance="outline">
              <mat-label>Nombre completo</mat-label>
              <input matInput formControlName="fullName" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Usuario</mat-label>
              <input matInput formControlName="username" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Teléfono</mat-label>
              <input matInput formControlName="phone" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Bio</mat-label>
              <input matInput formControlName="bio" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>País</mat-label>
              <input matInput formControlName="countryCode" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Locale</mat-label>
              <input matInput formControlName="locale" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Zona horaria</mat-label>
              <input matInput formControlName="timezone" />
            </mat-form-field>
            <div class="actions">
              <button mat-raised-button color="primary" type="submit">Guardar</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <div class="row">
        <mat-card appearance="outlined">
          <mat-card-header>
            <mat-card-title>Estado</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <button mat-stroked-button color="primary" (click)="toggleStatus()">{{isActive ? 'Desactivar' : 'Activar'}}</button>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="outlined">
          <mat-card-header>
            <mat-card-title>Roles</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-checkbox [checked]="has('user')" (change)="toggleRole('user', $event)">user</mat-checkbox>
            <mat-checkbox [checked]="has('admin')" (change)="toggleRole('admin', $event)">admin</mat-checkbox>
            <mat-checkbox [checked]="has('super-user')" (change)="toggleRole('super-user', $event)">super-user</mat-checkbox>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card appearance="outlined" style="margin-top:12px;">
        <mat-card-header>
          <mat-card-title>Auditoría</mat-card-title>
          <mat-card-actions>
            <button mat-stroked-button (click)="loadAudit()">Recargar</button>
          </mat-card-actions>
        </mat-card-header>
        <mat-card-content>
          <ul>
            <li *ngFor="let a of audits">{{a.createdAt}} - {{a.action}}</li>
          </ul>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined" style="margin-top:12px;">
        <mat-card-header>
          <mat-card-title>Eliminar</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="actions">
            <button mat-raised-button color="warn" (click)="remove()">Eliminar (soft)</button>
            <button mat-stroked-button color="primary" (click)="restore()">Restaurar</button>
          </div>
        </mat-card-content>
      </mat-card>
    </ng-container>
    <ng-template #loadingTpl>
      <mat-card appearance="outlined"><mat-card-content>Cargando…</mat-card-content></mat-card>
    </ng-template>
  `
})
export class UserDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private users = inject(UsersService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  id!: string;
  form: any;
  roles: string[] = [];
  isActive = false;
  audits: any[] = [];

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.users.get(this.id).subscribe((u) => {
      this.roles = u.roles;
      this.isActive = u.isActive;
      this.form = this.fb.nonNullable.group({
        fullName: [u.fullName], email: [u.email], username: [u.username ?? ''], phone: [u.phone ?? ''], bio: [u.bio ?? ''], countryCode: [u.countryCode ?? ''], locale: [u.locale ?? ''], timezone: [u.timezone ?? '']
      });
      this.cdr.detectChanges();
    });
    this.loadAudit();
  }

  save() { this.users.update(this.id, this.form.getRawValue()).subscribe(); }
  toggleStatus() { this.users.updateStatus(this.id, { isActive: !this.isActive }).subscribe(u => { this.isActive = u.isActive; this.cdr.detectChanges(); }); }
  has(r: string) { return this.roles.includes(r); }
  toggleRole(r: string, ev: any) {
    const checked = ev.target.checked;
    const next = new Set(this.roles);
    if (checked) next.add(r); else next.delete(r);
    this.users.updateRoles(this.id, { roles: Array.from(next) as any }).subscribe(u => { this.roles = u.roles; this.cdr.detectChanges(); });
  }
  loadAudit() { this.users.audit(this.id, 10, 0).subscribe(a => { this.audits = a.data; this.cdr.detectChanges(); }); }
  remove() { this.users.remove(this.id).subscribe(); }
  restore() { this.users.restore(this.id).subscribe(); }
}
