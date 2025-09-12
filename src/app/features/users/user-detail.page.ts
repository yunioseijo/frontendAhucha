import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { LoadingIndicatorComponent } from '@shared/ui/loading-indicator.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UsersService } from '@shared/api/users.service';
import { AuthService } from '@auth/services/auth.service';
import { Router } from '@angular/router';
 

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingIndicatorComponent,
  ],
  templateUrl: './user-detail.page.html',
  styleUrls: ['./user-detail.page.css']
})
export class UserDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private users = inject(UsersService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(AuthService);
  private router = inject(Router);

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
  remove() {
    const deletingSelf = this.auth.user()?.id === this.id;
    this.users.remove(this.id).subscribe({
      next: () => {
        if (deletingSelf) {
          // If the current user removed themselves, end the session and go to login
          this.auth.clearTokens();
          this.router.navigate(['/auth/login']);
        }
      }
    });
  }
  restore() { this.users.restore(this.id).subscribe(); }
}
