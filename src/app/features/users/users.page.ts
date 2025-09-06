import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsersStore } from './data/users.store';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  template: `
    <h2>Usuarios</h2>

    <div class="toolbar">
      <div class="filters">
        <input placeholder="Buscar nombre o email" [(ngModel)]="search" (ngModelChange)="applyFilters()" />
        <select [(ngModel)]="role" (change)="applyFilters()">
          <option value="">Rol (todos)</option>
          <option value="user">user</option>
          <option value="admin">admin</option>
          <option value="super-user">super-user</option>
        </select>
        <select [(ngModel)]="status" (change)="applyFilters()">
          <option value="">Estado (todos)</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>
      <div class="spacer"></div>
      <button (click)="toggleCreate()">{{showCreate ? 'Cancelar' : 'Crear usuario'}}</button>
    </div>

    <form *ngIf="showCreate" [formGroup]="createForm" (ngSubmit)="createUser()" class="create-form">
      <input placeholder="Nombre completo" formControlName="fullName" />
      <input type="email" placeholder="Email" formControlName="email" />
      <input type="password" placeholder="Contraseña" formControlName="password" />
      <button type="submit" [disabled]="createForm.invalid">Crear</button>
    </form>

    <div class="pager">
      <button (click)="prev()" [disabled]="offset===0">Anterior</button>
      <button (click)="next()" [disabled]="offset+limit>=total">Siguiente</button>
      <span>{{offset+1}}-{{math.min(offset+limit,total)}} de {{total}}</span>
    </div>
    <table border="1" cellspacing="0" cellpadding="6">
      <thead><tr><th>Nombre</th><th>Email</th><th>Estado</th><th>Roles</th><th></th></tr></thead>
      <tbody>
        <tr *ngFor="let u of filtered">
          <td>{{u.fullName}}</td>
          <td>{{u.email}}</td>
          <td>{{u.isActive ? 'Activo':'Inactivo'}}</td>
          <td>{{u.roles.join(', ')}}</td>
          <td><a [routerLink]="['/admin/users', u.id]">ver</a></td>
        </tr>
      </tbody>
    </table>
  `
})
export class UsersPage implements OnInit {
  private store = inject(UsersStore);
  private fb = inject(FormBuilder);

  limit = 10;
  offset = 0;
  total = 0;
  data: any[] = [];
  filtered: any[] = [];
  readonly math = Math;

  // filters
  search = '';
  role = '';
  status: '' | 'active' | 'inactive' = '';

  // create form
  showCreate = false;
  createForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit() { this.load(); }

  load() {
    this.store.load(this.limit, this.offset);
    this.total = this.store.total();
    this.data = this.store.list();
    this.applyFilters();
  }
  next() { this.offset = Math.min(this.offset + this.limit, Math.max(0, this.total - this.limit)); this.load(); }
  prev() { this.offset = Math.max(0, this.offset - this.limit); this.load(); }

  applyFilters() {
    const query = this.search.trim().toLowerCase();
    this.filtered = (this.data || []).filter((u: any) => {
      const matchesText = !query || (u.fullName?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query));
      const matchesRole = !this.role || (u.roles || []).includes(this.role);
      const matchesStatus = !this.status || (this.status === 'active' ? u.isActive : !u.isActive);
      return matchesText && matchesRole && matchesStatus;
    });
  }

  toggleCreate() { this.showCreate = !this.showCreate; }
  createUser() {
    if (this.createForm.invalid) return;
    this.store.create(this.createForm.getRawValue(), this.limit, this.offset);
    this.showCreate = false;
    this.createForm.reset();
  }
}
