import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UsersService } from '@shared/api/users.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Usuario</h2>
    <div *ngIf="form; else loadingTpl">
      <form [formGroup]="form" (ngSubmit)="save()">
        <label>Nombre completo <input formControlName="fullName" /></label>
        <label>Email <input formControlName="email" /></label>
        <label>Usuario <input formControlName="username" /></label>
        <label>Teléfono <input formControlName="phone" /></label>
        <label>Bio <input formControlName="bio" /></label>
        <label>País <input formControlName="countryCode" /></label>
        <label>Locale <input formControlName="locale" /></label>
        <label>Zona horaria <input formControlName="timezone" /></label>
        <button type="submit">Guardar</button>
      </form>
      <h3>Estado</h3>
      <button (click)="toggleStatus()">{{isActive ? 'Desactivar' : 'Activar'}}</button>

      <h3>Roles</h3>
      <label><input type="checkbox" [checked]="has('user')" (change)="toggleRole('user', $event)"/> user</label>
      <label><input type="checkbox" [checked]="has('admin')" (change)="toggleRole('admin', $event)"/> admin</label>
      <label><input type="checkbox" [checked]="has('super-user')" (change)="toggleRole('super-user', $event)"/> super-user</label>

      <h3>Auditoría</h3>
      <button (click)="loadAudit()">Recargar</button>
      <ul>
        <li *ngFor="let a of audits">{{a.createdAt}} - {{a.action}}</li>
      </ul>

      <h3>Eliminar</h3>
      <button (click)="remove()">Eliminar (soft)</button>
      <button (click)="restore()">Restaurar</button>
    </div>
    <ng-template #loadingTpl>Cargando...</ng-template>
  `
})
export class UserDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private users = inject(UsersService);
  private fb = inject(FormBuilder);

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
    });
    this.loadAudit();
  }

  save() { this.users.update(this.id, this.form.getRawValue()).subscribe(); }
  toggleStatus() { this.users.updateStatus(this.id, { isActive: !this.isActive }).subscribe(u => this.isActive = u.isActive); }
  has(r: string) { return this.roles.includes(r); }
  toggleRole(r: string, ev: any) {
    const checked = ev.target.checked;
    const next = new Set(this.roles);
    if (checked) next.add(r); else next.delete(r);
    this.users.updateRoles(this.id, { roles: Array.from(next) as any }).subscribe(u => this.roles = u.roles);
  }
  loadAudit() { this.users.audit(this.id, 10, 0).subscribe(a => this.audits = a.data); }
  remove() { this.users.remove(this.id).subscribe(); }
  restore() { this.users.restore(this.id).subscribe(); }
}
