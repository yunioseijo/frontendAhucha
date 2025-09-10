import { Component, OnInit, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsersStore } from './data/users.store';
 
import { UsersService } from '@shared/api/users.service';
import { ConfirmModalComponent } from '@shared/ui/confirm-modal.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    ConfirmModalComponent,
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
    <div class="card">
      <div class="card__title">Usuarios</div>
        <div class="filters">
          <div>
            <label for="search">Buscar</label>
            <input id="search" placeholder="Nombre o email" [(ngModel)]="search" (ngModelChange)="onFilters()" />
          </div>
          <div>
            <label for="role">Rol</label>
            <select id="role" [(ngModel)]="role" (change)="onFilters()">
              <option [ngValue]="''">Todos</option>
              <option value="user">user</option>
              <option value="admin">admin</option>
              <option value="super-user">super-user</option>
            </select>
          </div>
          <div>
            <label for="status">Estado</label>
            <select id="status" [(ngModel)]="status" (change)="onFilters()">
              <option [ngValue]="''">Todos</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
          <div>
            <button class="btn-ghost" (click)="toggleCreate()">{{ showCreate ? 'Cancelar' : 'Crear usuario' }}</button>
          </div>
        </div>

        @if (showCreate) {
          <div class="card" style="margin-bottom:12px;">
            <div class="card__title">Nuevo usuario</div>
              <form [formGroup]="createForm" (ngSubmit)="createUser()" class="filters">
                <div>
                  <label for="newName">Nombre completo</label>
                  <input id="newName" formControlName="fullName" />
                </div>
                <div>
                  <label for="newEmail">Email</label>
                  <input id="newEmail" type="email" formControlName="email" />
                </div>
                <div>
                  <label for="newPass">Contraseña</label>
                  <input id="newPass" type="password" formControlName="password" />
                </div>
                <div>
                  <button class="btn-primary" type="submit" [disabled]="createForm.invalid">Crear</button>
                </div>
              </form>
          </div>
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
                  <a class="icon-btn view" [routerLink]="['/admin/users', u.id]" title="Ver">👁️</a>
                  <a class="icon-btn edit" [routerLink]="['/admin/users', u.id]" title="Editar">✏️</a>
                  <button class="icon-btn delete" type="button" (click)="deleteUser(u.id)" title="Eliminar">🗑️</button>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <div class="pagination">
          <button class="btn-ghost" (click)="prev()" [disabled]="offset===0">Anterior</button>
          <span>{{offset+1}}-{{math.min(offset+limit,total)}} de {{total}}</span>
          <button class="btn-ghost" (click)="next()" [disabled]="offset+limit>=total">Siguiente</button>
        </div>
    </div>
    <app-confirm-modal
      [open]="showConfirm"
      title="Eliminar usuario"
      message="Esta acción no se puede deshacer. ¿Deseas eliminar al usuario?"
      confirmText="Eliminar"
      cancelText="Cancelar"
      (confirm)="onConfirmDelete()"
      (cancel)="showConfirm=false">
    </app-confirm-modal>
  `
})
export class UsersPage implements OnInit {
  private store = inject(UsersStore);
  private api = inject(UsersService);
  private fb = inject(FormBuilder);
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
  showConfirm = false;
  pendingDeleteId: string | null = null;
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
    this.pendingDeleteId = id;
    this.showConfirm = true;
  }
  onConfirmDelete() {
    if (!this.pendingDeleteId) return;
    const id = this.pendingDeleteId;
    this.pendingDeleteId = null;
    this.showConfirm = false;
    this.api.remove(id).subscribe({ next: () => this.load() });
  }
}
