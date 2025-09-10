import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { LoadingIndicatorComponent } from '@shared/ui/loading-indicator.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UsersService } from '@shared/api/users.service';
 

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingIndicatorComponent,
  ],
  styles: [`
    :host { display: block; }
    .grid { display: grid; gap: 12px; grid-template-columns: 1fr; }
    @media (min-width: 900px) { .grid { grid-template-columns: 1fr 1fr; } }
    .grid > div { width: 100%; }
    .row { display: grid; grid-template-columns: 1fr; gap: 12px; }
    @media (min-width: 900px) { .row { grid-template-columns: 1fr 1fr; } }
    .actions { display:flex; gap: 8px; }
  `],
  template: `
    @if (form) {
      <div class="card" style="margin-bottom:12px;">
        <div class="card__title">Usuario</div>
        <div class="card__subtitle">Editar datos básicos</div>
        <form [formGroup]="form" (ngSubmit)="save()" class="grid">
          <div>
            <label for="fullName">Nombre completo</label>
            <input id="fullName" formControlName="fullName" />
          </div>
          <div>
            <label for="email">Email</label>
            <input id="email" formControlName="email" />
          </div>
          <div>
            <label for="username">Usuario</label>
            <input id="username" formControlName="username" />
          </div>
          <div>
            <label for="phone">Teléfono</label>
            <input id="phone" formControlName="phone" />
          </div>
          <div>
            <label for="bio">Bio</label>
            <input id="bio" formControlName="bio" />
          </div>
          <div>
            <label for="countryCode">País</label>
            <input id="countryCode" formControlName="countryCode" />
          </div>
          <div>
            <label for="locale">Locale</label>
            <input id="locale" formControlName="locale" />
          </div>
          <div>
            <label for="timezone">Zona horaria</label>
            <input id="timezone" formControlName="timezone" />
          </div>
          <div class="actions">
            <button class="btn-primary" type="submit">Guardar</button>
          </div>
        </form>
      </div>

      <div class="row">
        <div class="card">
          <div class="card__title">Estado</div>
          <button class="btn-ghost" (click)="toggleStatus()">{{isActive ? 'Desactivar' : 'Activar'}}</button>
        </div>

        <div class="card">
          <div class="card__title">Roles</div>
          <label><input type="checkbox" [checked]="has('user')" (change)="toggleRole('user', $event)" /> user</label>
          <label><input type="checkbox" [checked]="has('admin')" (change)="toggleRole('admin', $event)" /> admin</label>
          <label><input type="checkbox" [checked]="has('super-user')" (change)="toggleRole('super-user', $event)" /> super-user</label>
        </div>
      </div>

      <div class="card" style="margin-top:12px;">
        <div class="card__title" style="display:flex; align-items:center; justify-content:space-between;">
          <span>Auditoría</span>
          <button class="btn-ghost" (click)="loadAudit()">Recargar</button>
        </div>
        <ul>
          @for (a of audits; track $index) {
            <li>{{a.createdAt}} - {{a.action}}</li>
          }
        </ul>
      </div>

      <div class="card" style="margin-top:12px;">
        <div class="card__title">Eliminar</div>
        <div class="actions">
          <button class="btn-primary" (click)="remove()">Eliminar (soft)</button>
          <button class="btn-ghost" (click)="restore()">Restaurar</button>
        </div>
      </div>
    } @else {
      <div class="card"><app-loading-indicator></app-loading-indicator></div>
    }
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
