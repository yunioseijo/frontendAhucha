import { Component, OnInit, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsersStore } from './data/users.store';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UsersService } from '@shared/api/users.service';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    MatIcon,
    MatDialogModule,
  ],
  styles: [`
    :host { display: block; }
    .filters { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 12px; }
    @media (min-width: 900px) { .filters { grid-template-columns: 1fr 200px 200px auto; align-items: end; } }
    table { width: 100%; border-collapse: collapse; }
    thead th { text-align: left; padding: 10px 12px; font-weight: 600; color:#6b7280; border-bottom: 1px solid #e5e7eb; }
    tbody td { padding: 12px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
    tbody tr:hover { background: #fafafa; }
    .status-badge { display:inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight:600; }
    .status-active { background:#dcfce7; color:#166534; }
    .status-inactive { background:#fee2e2; color:#991b1b; }
    .actions-cell { display:flex; align-items:center; gap:8px; }
    .icon-btn { width: 32px; height: 32px; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; border:1px solid #e5e7eb; cursor:pointer; background:#f9fafb; text-decoration:none; }
    .icon-btn.view { background:#f3f4f6; color:#374151; }
    .icon-btn.edit { background:#eff6ff; color:#2563eb; border-color:#bfdbfe; }
    .icon-btn.delete { background:#fef2f2; color:#dc2626; border-color:#fecaca; }
    .pagination { display:flex; align-items:center; gap: 8px; justify-content: flex-end; margin-top: 12px; }
  `],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title>Usuarios</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>Buscar</mat-label>
            <input matInput placeholder="Nombre o email" [(ngModel)]="search" (ngModelChange)="onFilters()" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Rol</mat-label>
            <mat-select [(ngModel)]="role" (selectionChange)="onFilters()">
              <mat-option [value]="''">Todos</mat-option>
              <mat-option value="user">user</mat-option>
              <mat-option value="admin">admin</mat-option>
              <mat-option value="super-user">super-user</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Estado</mat-label>
            <mat-select [(ngModel)]="status" (selectionChange)="onFilters()">
              <mat-option [value]="''">Todos</mat-option>
              <mat-option value="active">Activo</mat-option>
              <mat-option value="inactive">Inactivo</mat-option>
            </mat-select>
          </mat-form-field>
          <div>
            <button mat-stroked-button color="primary" (click)="toggleCreate()">{{ showCreate ? 'Cancelar' : 'Crear usuario' }}</button>
          </div>
        </div>

        @if (showCreate) {
          <mat-card appearance="outlined" style="margin-bottom:12px;">
            <mat-card-header>
              <mat-card-title>Nuevo usuario</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="createForm" (ngSubmit)="createUser()" class="filters">
                <mat-form-field appearance="outline">
                  <mat-label>Nombre completo</mat-label>
                  <input matInput formControlName="fullName" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Contraseña</mat-label>
                  <input matInput type="password" formControlName="password" />
                </mat-form-field>
                <div>
                  <button mat-raised-button color="primary" type="submit" [disabled]="createForm.invalid">Crear</button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        }

        <table>
          <thead>
            <tr><th>Nombre</th><th>Email</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            @for (u of list(); track u.id) {
              <tr>
                <td>{{u.fullName}}</td>
                <td>{{u.email}}</td>
                <td>
                  <span class="status-badge" [class.status-active]="u.isActive" [class.status-inactive]="!u.isActive">
                    {{ u.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <a class="icon-btn view" [routerLink]="['/admin/users', u.id]" title="Ver">
                    <mat-icon>visibility</mat-icon>
                  </a>
                  <a class="icon-btn edit" [routerLink]="['/admin/users', u.id]" title="Editar">
                    <mat-icon>edit</mat-icon>
                  </a>
                  <button class="icon-btn delete" type="button" (click)="deleteUser(u.id)" title="Eliminar">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <div class="pagination">
          <button mat-stroked-button (click)="prev()" [disabled]="offset===0">Anterior</button>
          <span>{{offset+1}}-{{math.min(offset+limit,total)}} de {{total}}</span>
          <button mat-stroked-button (click)="next()" [disabled]="offset+limit>=total">Siguiente</button>
        </div>
      </mat-card-content>
    </mat-card>
  `
})
export class UsersPage implements OnInit {
  private store = inject(UsersStore);
  private api = inject(UsersService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private syncTotal = effect(() => { this.total = this.store.total(); });

  limit = 10;
  offset = 0;
  total = 0;
  // filter inputs (bound via ngModel)
  search = '';
  role = '';
  status: '' | 'active' | 'inactive' = '';
  // server-side list passthrough
  list = computed(() => this.store.list());
  readonly math = Math;

  // create form
  showCreate = false;
  createForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit() { this.load(); }

  private buildFilters() {
    return {
      q: this.search?.trim() || undefined,
      role: (this.role || undefined) as 'admin' | 'super-user' | 'user' | undefined,
      isActive: this.status === '' ? undefined : this.status === 'active'
      // emailVerified not exposed in UI for now
    };
  }

  load() {
    this.store.load(this.limit, this.offset, this.buildFilters());
    this.total = this.store.total();
  }
  next() { this.offset = Math.min(this.offset + this.limit, Math.max(0, this.total - this.limit)); this.load(); }
  prev() { this.offset = Math.max(0, this.offset - this.limit); this.load(); }

  onFilters() {
    // Reset pagination on filter change and load from backend
    this.offset = 0;
    this.load();
  }

  toggleCreate() { this.showCreate = !this.showCreate; }
  createUser() {
    if (this.createForm.invalid) return;
    this.store.create(this.createForm.getRawValue(), this.limit, this.offset, this.buildFilters());
    this.showCreate = false;
    this.createForm.reset();
  }

  deleteUser(id: string) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Eliminar usuario',
          message: 'Esta acción no se puede deshacer. ¿Deseas eliminar al usuario?',
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
          variant: 'danger',
          icon: 'delete_forever',
        },
        autoFocus: false,
        restoreFocus: true,
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.api.remove(id).subscribe({ next: () => this.load() });
      });
  }
}
